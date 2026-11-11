// Input normalization and host rules (spec section 6). Pure; no Node APIs.

export type NormalizeErrorCode = "invalid_url" | "blocked_host" | "platform_url" | "self_url";

export type NormalizedInput = {
  /** Hostname without a leading `www.`; the cache key. */
  host: string;
  /** The hostname as entered (may keep `www.`). */
  hostname: string;
  /** Always `https://<hostname>/`. */
  startUrl: string;
  /** A non-root path the visitor supplied, read as an extra page. */
  extraPath?: string;
};

export type NormalizeResult =
  | ({ ok: true } & NormalizedInput)
  | { ok: false; code: NormalizeErrorCode };

export type HostRuleOptions = {
  /** The current request host, which counts as this site. */
  requestHost?: string | null;
  /** Mock mode accepts `.test` hosts so every UI path can be exercised. */
  allowTestTld?: boolean;
};

const MAX_INPUT = 2048;

const BLOCKED_SUFFIXES = [
  "local",
  "localhost",
  "internal",
  "lan",
  "home",
  "corp",
  "test",
  "example",
  "invalid",
  "onion",
];

const SELF_HOSTS = ["davin.io", "www.davin.io"];

/** Hosts (and their subdomains) where the visitor does not own the page. */
export const PLATFORM_HOSTS = [
  "linkedin.com",
  "facebook.com",
  "fb.com",
  "instagram.com",
  "x.com",
  "twitter.com",
  "tiktok.com",
  "youtube.com",
  "youtu.be",
  "github.com",
  "gitlab.com",
  "medium.com",
  "reddit.com",
  "pinterest.com",
  "docs.google.com",
  "drive.google.com",
  "apps.apple.com",
  "play.google.com",
  "etsy.com",
  "ebay.com",
  "yelp.com",
  "crunchbase.com",
  "wikipedia.org",
  "linktr.ee",
  "bit.ly",
  "t.co",
  "tinyurl.com",
  "goo.gl",
  "lnkd.in",
];

function matchesHostOrSubdomain(hostname: string, base: string): boolean {
  return hostname === base || hostname.endsWith(`.${base}`);
}

/** `google.com`, `google.co.uk`, `www.google.de`, and Amazon storefronts in any country. */
function isCountryVariantPlatform(hostname: string): boolean {
  const bare = hostname.replace(/^www\./, "");
  return /^(google|amazon)\.[a-z.]+$/.test(bare);
}

export function isPlatformHost(hostname: string): boolean {
  return (
    PLATFORM_HOSTS.some((base) => matchesHostOrSubdomain(hostname, base)) ||
    isCountryVariantPlatform(hostname)
  );
}

export function isIpLiteral(hostname: string): boolean {
  if (hostname.startsWith("[") || hostname.includes(":")) return true;
  // The URL parser canonicalizes numeric forms (0x7f.1, 2130706433) to dotted quads.
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function isSelfHost(hostname: string, requestHost?: string | null): boolean {
  if (SELF_HOSTS.includes(hostname)) return true;
  const req = requestHost?.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
  if (req && (hostname === req || hostname === `www.${req}` || `www.${hostname}` === req)) {
    return true;
  }
  if (hostname.endsWith(".vercel.app")) {
    if (hostname.startsWith("davin-portfolio")) return true;
    const deployments = [
      process.env.VERCEL_URL,
      process.env.VERCEL_BRANCH_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
    ];
    if (deployments.some((d) => d && d.toLowerCase() === hostname)) return true;
  }
  return false;
}

/**
 * Host rules shared by the input check and every redirect hop. `hostname` must
 * already be lowercased by the URL parser (IDNs arrive as punycode).
 */
export function checkHost(
  rawHostname: string,
  opts: HostRuleOptions = {}
): NormalizeErrorCode | null {
  const hostname = rawHostname.replace(/\.$/, "");
  if (!hostname) return "invalid_url";
  if (isIpLiteral(hostname)) return "blocked_host";
  // After the URL parser, a real hostname is ASCII letters, digits, dots, and hyphens.
  if (!/^[a-z0-9.-]+$/.test(hostname)) return "invalid_url";
  if (hostname.length > 253) return "invalid_url";
  const labels = hostname.split(".");
  if (labels.some((l) => l.length === 0 || l.length > 63)) return "invalid_url";
  if (labels.length < 2) return "blocked_host";
  const tld = labels[labels.length - 1];
  if (tld === "test" && opts.allowTestTld) {
    // Mock-mode trigger hosts; nothing is fetched for them.
  } else if (BLOCKED_SUFFIXES.includes(tld)) {
    return "blocked_host";
  }
  if (isSelfHost(hostname, opts.requestHost)) return "self_url";
  if (isPlatformHost(hostname)) return "platform_url";
  return null;
}

/** Scheme and port rules for a parsed URL. */
export function checkUrlShape(url: URL): "invalid_url" | null {
  if (url.protocol !== "http:" && url.protocol !== "https:") return "invalid_url";
  if (url.username || url.password) return "invalid_url";
  if (url.port && url.port !== "80" && url.port !== "443") return "invalid_url";
  return null;
}

const TRAILING_PUNCT = /[.,;:!?)]+$/;
const SURROUNDING = /^["'`<(“‘]+|["'`>”’]+$/g;

function clean(token: string): string {
  let prev = "";
  let s = token;
  while (s !== prev) {
    prev = s;
    s = s.trim().replace(SURROUNDING, "").replace(TRAILING_PUNCT, "");
  }
  return s;
}

export function normalizeInput(raw: unknown, opts: HostRuleOptions = {}): NormalizeResult {
  if (typeof raw !== "string") return { ok: false, code: "invalid_url" };
  let s = raw.trim();
  if (s.length === 0 || s.length > MAX_INPUT) return { ok: false, code: "invalid_url" };
  s = clean(s);
  if (/\s/.test(s)) {
    const token = s.split(/\s+/).find((t) => t.includes("."));
    if (!token) return { ok: false, code: "invalid_url" };
    s = clean(token);
  }
  if (!s) return { ok: false, code: "invalid_url" };

  const email = /^[^\s@/:]+@([^\s@/]+)$/.exec(s);
  if (email) s = email[1];

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) {
    // Has an explicit scheme; validated below.
  } else {
    const schemeLike = /^([a-z][a-z0-9+.-]*):/i.exec(s);
    // `javascript:`, `mailto:`, `data:` have no dot before the colon;
    // `acme.com:8080` does and is a host with a port.
    if (schemeLike && !schemeLike[1].includes(".")) return { ok: false, code: "invalid_url" };
    s = `https://${s}`;
  }

  let url: URL;
  try {
    url = new URL(s);
  } catch {
    return { ok: false, code: "invalid_url" };
  }
  const shape = checkUrlShape(url);
  if (shape) return { ok: false, code: shape };

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  const hostError = checkHost(hostname, opts);
  if (hostError) return { ok: false, code: hostError };

  const host = hostname.replace(/^www\./, "");
  const path = url.pathname;
  const extraPath = path && path !== "/" ? path : undefined;
  return {
    ok: true,
    host,
    hostname,
    startUrl: `https://${hostname}/`,
    ...(extraPath ? { extraPath } : {}),
  };
}
