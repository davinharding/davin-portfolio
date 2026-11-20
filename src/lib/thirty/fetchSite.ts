// Server-only. Guarded single-shot reads of a visitor-supplied site: manual
// redirects checked hop by hop, connect-time address checks, size and time caps.
import { Agent, fetch as undiciFetch } from "undici";
import { getConfig, LIMITS } from "./config";
import {
  capBundle,
  extractPage,
  isChallengePage,
  isParkedPage,
  selectSubpages,
  sniffMetaCharset,
  usableChars,
  type PageContent,
} from "./extract";
import { isIP } from "node:net";
import { BlockedAddressError, guardedLookup } from "./ssrf";
import { checkHost, checkUrlShape, type HostRuleOptions } from "./url";

export type FetchResponseLike = {
  status: number;
  headers: { get(name: string): string | null };
  body: ReadableStream<Uint8Array> | null;
};

export type FetchLike = (
  url: string,
  init: {
    method: "GET";
    redirect: "manual";
    headers: Record<string, string>;
    signal: AbortSignal;
  }
) => Promise<FetchResponseLike>;

export type FetchFailure =
  | "dns"
  | "connect"
  | "tls"
  | "timeout"
  | "aborted"
  | "http_status"
  | "content_type"
  | "redirect_platform"
  | "redirect_blocked"
  | "too_many_redirects"
  | "blocked_address";

export type FetchedPage =
  | {
      ok: true;
      finalUrl: string;
      status: number;
      contentType: string;
      body: string;
      truncated: boolean;
    }
  | { ok: false; reason: FetchFailure; status?: number };

const ACCEPTED_TYPES = ["text/html", "application/xhtml+xml", "text/plain"];

let sharedAgent: Agent | undefined;

/** undici fetch through an Agent whose DNS lookup enforces the address policy. */
export const guardedFetch: FetchLike = async (url, init) => {
  // net.connect skips `lookup` for an IP literal, so the address policy would
  // never run. Callers only pass hostnames; refuse literals here regardless.
  const literal = new URL(url).hostname.replace(/^\[|\]$/g, "");
  if (isIP(literal)) throw new BlockedAddressError(literal);
  sharedAgent ??= new Agent({
    connect: { lookup: guardedLookup as never, timeout: LIMITS.homepageTimeoutMs },
  });
  const res = await undiciFetch(url, { ...init, dispatcher: sharedAgent });
  return res as unknown as FetchResponseLike;
};

function errorCode(err: unknown): string | undefined {
  let e: unknown = err;
  for (let depth = 0; e && depth < 5; depth++) {
    const code = (e as { code?: unknown }).code;
    if (typeof code === "string") return code;
    e = (e as { cause?: unknown }).cause;
  }
  return undefined;
}

export function classifyFetchError(err: unknown, timedOut: boolean): FetchFailure {
  if (timedOut) return "timeout";
  const name = (err as { name?: string })?.name;
  if (name === "TimeoutError") return "timeout";
  if (name === "AbortError") return "aborted";
  const code = errorCode(err);
  if (code === "ESSRF") return "blocked_address";
  if (code === "ENOTFOUND" || code === "ENODATA") return "dns";
  if (code === "UND_ERR_CONNECT_TIMEOUT" || code === "ETIMEDOUT") return "timeout";
  if (
    code &&
    (code.startsWith("ERR_TLS") ||
      code.startsWith("CERT_") ||
      code.includes("CERT") ||
      code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
      code === "ERR_SSL_WRONG_VERSION_NUMBER" ||
      code.startsWith("ERR_SSL"))
  ) {
    return "tls";
  }
  return "connect";
}

function charsetFrom(contentType: string): string | null {
  const m = /charset\s*=\s*["']?([a-z0-9_.:-]+)/i.exec(contentType);
  return m ? m[1].toLowerCase() : null;
}

function decode(bytes: Uint8Array, contentType: string): string {
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, 2048));
  const label = charsetFrom(contentType) ?? sniffMetaCharset(head) ?? "utf-8";
  try {
    return new TextDecoder(label, { fatal: false }).decode(bytes);
  } catch {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }
}

/** Reads at most `cap` bytes, cancelling the stream at the cap. */
export async function readCapped(
  body: ReadableStream<Uint8Array> | null,
  cap: number
): Promise<{ bytes: Uint8Array; truncated: boolean }> {
  if (!body) return { bytes: new Uint8Array(0), truncated: false };
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  let truncated = false;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      const room = cap - total;
      if (value.byteLength >= room) {
        chunks.push(value.subarray(0, room));
        total += room;
        truncated = true;
        break;
      }
      chunks.push(value);
      total += value.byteLength;
    }
  } finally {
    if (truncated) await reader.cancel().catch(() => undefined);
    else reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  return { bytes, truncated };
}

export type FetchPageOptions = {
  timeoutMs: number;
  signal?: AbortSignal;
  fetchImpl?: FetchLike;
  userAgent?: string;
  hostRules?: HostRuleOptions;
  maxBytes?: number;
};

/** One GET with manual redirects (at most 4 hops), each hop re-checked. */
export async function fetchPage(startUrl: string, opts: FetchPageOptions): Promise<FetchedPage> {
  const fetchImpl = opts.fetchImpl ?? guardedFetch;
  const timeout = AbortSignal.timeout(opts.timeoutMs);
  const signal = opts.signal ? AbortSignal.any([opts.signal, timeout]) : timeout;
  const headers = {
    "User-Agent": opts.userAgent ?? getConfig().userAgent,
    Accept: "text/html,application/xhtml+xml",
    "Accept-Language": "en",
  };

  let url = startUrl;
  for (let hop = 0; hop <= LIMITS.maxRedirects; hop++) {
    let res: FetchResponseLike;
    try {
      res = await fetchImpl(url, { method: "GET", redirect: "manual", headers, signal });
    } catch (err) {
      return { ok: false, reason: classifyFetchError(err, timeout.aborted) };
    }

    if (res.status >= 300 && res.status < 400) {
      await res.body?.cancel().catch(() => undefined);
      const location = res.headers.get("location");
      if (!location) return { ok: false, reason: "http_status", status: res.status };
      if (hop === LIMITS.maxRedirects) return { ok: false, reason: "too_many_redirects" };
      let next: URL;
      try {
        next = new URL(location, url);
      } catch {
        return { ok: false, reason: "redirect_blocked" };
      }
      if (checkUrlShape(next)) return { ok: false, reason: "redirect_blocked" };
      const hostError = checkHost(next.hostname.toLowerCase(), opts.hostRules);
      // A redirect to a platform or login host means the site is not readable by a bot.
      if (hostError === "platform_url") return { ok: false, reason: "redirect_platform" };
      if (hostError) return { ok: false, reason: "redirect_blocked" };
      if (/\/(login|signin|sign-in|auth)(\/|$|\?)/i.test(next.pathname)) {
        return { ok: false, reason: "redirect_platform" };
      }
      next.hash = "";
      url = next.toString();
      continue;
    }

    if (res.status !== 200) {
      await res.body?.cancel().catch(() => undefined);
      return { ok: false, reason: "http_status", status: res.status };
    }

    const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
    if (!ACCEPTED_TYPES.some((t) => contentType.startsWith(t))) {
      await res.body?.cancel().catch(() => undefined);
      return { ok: false, reason: "content_type", status: res.status };
    }

    try {
      const { bytes, truncated } = await readCapped(res.body, opts.maxBytes ?? LIMITS.maxBodyBytes);
      return {
        ok: true,
        finalUrl: url,
        status: res.status,
        contentType,
        body: decode(bytes, contentType),
        truncated,
      };
    } catch (err) {
      return { ok: false, reason: classifyFetchError(err, timeout.aborted) };
    }
  }
  return { ok: false, reason: "too_many_redirects" };
}

export type ReadResult =
  | { kind: "pages"; pages: PageContent[]; finalUrl: string; thin: boolean }
  | { kind: "blocked"; reason: FetchFailure | "challenge" }
  | { kind: "parked"; finalUrl: string }
  | { kind: "unresolvable" }
  | { kind: "private" };

export type ReadSiteInput = { hostname: string; extraPath?: string };

export type ReadSiteOptions = {
  signal?: AbortSignal;
  fetchImpl?: FetchLike;
  hostRules?: HostRuleOptions;
  userAgent?: string;
};

function altHostname(hostname: string): string {
  return hostname.startsWith("www.") ? hostname.slice(4) : `www.${hostname}`;
}

/**
 * Reads the homepage plus up to three sub-pages. Never throws for site
 * problems; the result says which path the pipeline should take.
 */
export async function readSite(input: ReadSiteInput, opts: ReadSiteOptions = {}): Promise<ReadResult> {
  const stage = AbortSignal.timeout(LIMITS.readStageMs);
  const signal = opts.signal ? AbortSignal.any([opts.signal, stage]) : stage;
  const base = { signal, fetchImpl: opts.fetchImpl, hostRules: opts.hostRules, userAgent: opts.userAgent };
  const homeOpts = { ...base, timeoutMs: LIMITS.homepageTimeoutMs };

  let home = await fetchPage(`https://${input.hostname}/`, homeOpts);
  if (!home.ok && home.reason === "dns") {
    home = await fetchPage(`https://${altHostname(input.hostname)}/`, homeOpts);
    if (!home.ok && home.reason === "dns") return { kind: "unresolvable" };
  }
  if (!home.ok && (home.reason === "connect" || home.reason === "tls")) {
    // The host resolves but https failed at connect: try plain http once.
    const viaHttp = await fetchPage(`http://${input.hostname}/`, homeOpts);
    if (viaHttp.ok || viaHttp.reason === "blocked_address") home = viaHttp;
  }
  if (!home.ok) {
    if (home.reason === "blocked_address") return { kind: "private" };
    return { kind: "blocked", reason: home.reason };
  }

  const homePage = extractPage(home.body, home.finalUrl, home.contentType);
  if (isParkedPage(homePage)) return { kind: "parked", finalUrl: home.finalUrl };
  if (isChallengePage(homePage)) return { kind: "blocked", reason: "challenge" };

  const subUrls = selectSubpages(homePage.links, home.finalUrl, input.extraPath);
  const subResults = await Promise.all(
    subUrls.map((u) => fetchPage(u, { ...base, timeoutMs: LIMITS.subpageTimeoutMs }))
  );
  const subPages: PageContent[] = [];
  for (const r of subResults) {
    if (!r.ok) continue;
    const page = extractPage(r.body, r.finalUrl, r.contentType);
    if (isChallengePage(page) || page.text.length < 80) continue;
    if (subPages.some((p) => p.url === page.url) || page.url === homePage.url) continue;
    subPages.push(page);
  }

  const pages = capBundle([homePage, ...subPages]);
  const total = pages.reduce((n, p) => n + usableChars(p), 0);
  return {
    kind: "pages",
    pages,
    finalUrl: home.finalUrl,
    thin: total < LIMITS.minUsableChars,
  };
}
