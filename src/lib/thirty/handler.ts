import { captureServerEvent, type ReportEvent } from "@/lib/analytics/server";
import { sanitizeAnalyticsId } from "@/lib/analytics/config";
import { homeEventProps, readHomeAssignment } from "@/lib/experiments/homeDesign";
import { getConfig, isLiveEnabled, isMockMode, isProduction, LIMITS, type ThirtyConfig } from "./config";
import { releaseBudget, reserveBudget } from "./budget";
import { errorMessage, errorStatus, isErrorCode, sorryParam, type ErrorCode } from "./errors";
import { LOCK_WAIT_LABEL, stepLabel, type RunEvent } from "./events";
import {
  acquireLock,
  checkFlood,
  clientIp,
  refundGlobalRun,
  refundVisitorRun,
  secondsToUtcMidnight,
  takeGlobalRun,
  takeVisitorRun,
  utcDay,
  visitorId,
} from "./limits";
import { MOCK_MODELS, MOCK_PRERUN_CODES, mockStages, mockTrigger } from "./mock";
import { liveStages, newRunId, RunEmitter, runPipeline, type RunContext, type RunOutcome } from "./pipeline";
import { parseStoredBlueprint } from "./schema";
import { getStore, keys, StoreError, type Store } from "./store";
import { normalizeInput } from "./url";

export type HandlerDeps = {
  getStore: () => Store | null;
  isLiveEnabled: () => boolean;
  isMockMode: () => boolean;
  isProduction: () => boolean;
  config: () => ThirtyConfig;
  startRun: (ctx: RunContext, emitter: RunEmitter, store: Store, mock: boolean) => Promise<RunOutcome>;
  keepAlive: (work: Promise<unknown>) => void;
  report: ReportEvent;
  now: () => number;
  sleep: (ms: number) => Promise<void>;
  lockPollMs: number;
  lockWaitMs: number;
};

export function defaultStartRun(
  ctx: RunContext,
  emitter: RunEmitter,
  store: Store,
  mock: boolean
): Promise<RunOutcome> {
  const { stages, models } = mock
    ? { stages: mockStages(ctx.host, getConfig().mockMs), models: MOCK_MODELS }
    : liveStages();
  return runPipeline(ctx, { store, stages, models, emitter, mock });
}

export const defaultDeps: Omit<HandlerDeps, "keepAlive"> = {
  getStore,
  isLiveEnabled,
  isMockMode,
  isProduction,
  config: getConfig,
  startRun: defaultStartRun,
  report: captureServerEvent,
  now: Date.now,
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  lockPollMs: LIMITS.lockPollMs,
  lockWaitMs: LIMITS.lockWaitMs,
};

const NO_STORE = { "Cache-Control": "no-store" };

const STREAM_HEADERS = {
  "Content-Type": "application/x-ndjson; charset=utf-8",
  "Cache-Control": "no-store, no-transform",
  "X-Accel-Buffering": "no",
};

export function methodNotAllowed(): Response {
  return new Response(JSON.stringify({ error: { code: "bad_request", message: "Use POST." } }), {
    status: 405,
    headers: { ...NO_STORE, Allow: "POST", "Content-Type": "application/json" },
  });
}

type Mode = "json" | "form";

function errorResponse(mode: Mode, code: ErrorCode, host?: string | null, retryAfterSec?: number): Response {
  if (mode === "form") {
    return new Response(null, { status: 303, headers: { ...NO_STORE, Location: `/sorry/${sorryParam(code)}` } });
  }
  const headers: Record<string, string> = { ...NO_STORE, "Content-Type": "application/json" };
  if (retryAfterSec) headers["Retry-After"] = String(retryAfterSec);
  return new Response(
    JSON.stringify({
      error: { code, message: errorMessage(code, host), ...(retryAfterSec ? { retryAfterSec } : {}) },
    }),
    { status: errorStatus(code), headers }
  );
}

function redirectToBlueprint(slug: string): Response {
  return new Response(null, { status: 303, headers: { ...NO_STORE, Location: `/b/${slug}` } });
}

function ndjson(events: RunEvent[]): Response {
  return new Response(events.map((e) => JSON.stringify(e)).join("\n") + "\n", {
    status: 200,
    headers: STREAM_HEADERS,
  });
}

function streamEmitter(emitter: RunEmitter, dropEarly = false): Response {
  const encoder = new TextEncoder();
  let cleanup = () => undefined as void;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      let lastWrite = Date.now();
      let unsubscribe: (() => void) | null = null;
      const ping = setInterval(() => {
        if (Date.now() - lastWrite >= 5000) write({ t: "ping" });
      }, 1000);
      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(ping);
        unsubscribe?.();
        try {
          controller.close();
        } catch {}
      };
      cleanup = close;
      const write = (event: RunEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
          lastWrite = Date.now();
        } catch {
          close();
        }
      };
      unsubscribe = emitter.subscribe((event) => {
        const terminal = event.t === "done" || event.t === "error";
        if (dropEarly && (terminal || event.t === "agent")) return close();
        write(event);
        if (terminal) close();
      });
      if (closed) unsubscribe();
    },
    cancel() {
      cleanup();
    },
  });
  return new Response(stream, { status: 200, headers: STREAM_HEADERS });
}

type ParsedBody = {
  url: unknown;
  honeypot: string;
  phId?: string;
  phSession?: string;
};

async function parseBody(request: Request, mode: Mode): Promise<ParsedBody | null> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > LIMITS.requestBodyMaxBytes) return null;
  let text: string;
  try {
    text = await request.text();
  } catch {
    return null;
  }
  if (new TextEncoder().encode(text).byteLength > LIMITS.requestBodyMaxBytes) return null;
  if (mode === "json") {
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return null;
    }
    if (!data || typeof data !== "object") return null;
    const { url, website_confirm, ph_id, ph_session } = data as Record<string, unknown>;
    return {
      url,
      honeypot: typeof website_confirm === "string" ? website_confirm : "",
      phId: sanitizeAnalyticsId(ph_id),
      phSession: sanitizeAnalyticsId(ph_session),
    };
  }
  const params = new URLSearchParams(text);
  return { url: params.get("url"), honeypot: params.get("website_confirm") ?? "" };
}

function requestHostOf(request: Request): string {
  return (request.headers.get("host") ?? new URL(request.url).host).toLowerCase();
}

function isCrossOrigin(request: Request, requestHost: string): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return true;
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host.toLowerCase() !== requestHost;
    } catch {
      return true;
    }
  }
  return false;
}

async function cachedSlug(store: Store, host: string): Promise<{ slug: string; createdAt: string } | null> {
  const slug = await store.get(keys.domain(host));
  if (!slug) return null;
  const raw = await store.get(keys.blueprint(slug));
  if (!raw) return null;
  try {
    const bp = parseStoredBlueprint(JSON.parse(raw));
    return { slug: bp.slug, createdAt: bp.createdAt };
  } catch (err) {
    console.error("[thirty] cached blueprint failed validation", slug, err);
    return null;
  }
}

type WaitOutcome =
  | { kind: "cached"; slug: string; createdAt: string }
  | { kind: "error"; code: ErrorCode };

async function waitForOtherRun(store: Store, host: string, deps: HandlerDeps): Promise<WaitOutcome> {
  const deadline = deps.now() + deps.lockWaitMs;
  while (deps.now() < deadline) {
    await deps.sleep(deps.lockPollMs);
    try {
      const hit = await cachedSlug(store, host);
      if (hit) return { kind: "cached", ...hit };
      const neg = await store.get(keys.negative(host));
      if (neg && isErrorCode(neg)) return { kind: "error", code: neg };
      const holder = await store.get(keys.lock(host));
      if (!holder) {
        const late = await cachedSlug(store, host);
        if (late) return { kind: "cached", ...late };
        return { kind: "error", code: "timeout" };
      }
    } catch {
      return { kind: "error", code: "unavailable" };
    }
  }
  return { kind: "error", code: "timeout" };
}

type Fail = (code: ErrorCode, host?: string | null, retryAfterSec?: number) => Response;

type Accepted = {
  mode: Mode;
  fail: Fail;
  url: string;
  body: ParsedBody;
  requestHost: string;
};

type Visit = Accepted & {
  request: Request;
  deps: HandlerDeps;
  cfg: ThirtyConfig;
  mock: boolean;
  store: Store | null;
  visitor: string;
  analytics: RunContext["analytics"];
  now: Date;
  requestStartedAt: number;
};

type Target = {
  host: string;
  hostname: string;
  extraPath?: string;
  trigger: ReturnType<typeof mockTrigger>;
  earlyMock: (code: ErrorCode) => boolean;
};

type Quota = { day: string; reservation: NonNullable<Awaited<ReturnType<typeof reserveBudget>>> };

type Hold = { adopt: (work: Promise<unknown>) => void; release: () => void };

const EARLY_MOCK_CODES = ["bad_request", "invalid_url", "blocked_host", "platform_url", "self_url", "too_fast"] as const;

async function readRequest(request: Request): Promise<Response | Accepted> {
  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  const mode: Mode = contentType.includes("application/x-www-form-urlencoded") ? "form" : "json";
  const fail: Fail = (code, host, retryAfterSec) => errorResponse(mode, code, host, retryAfterSec);

  if (mode === "json" && !contentType.includes("application/json")) return fail("bad_request");
  const body = await parseBody(request, mode);
  if (!body || typeof body.url !== "string") return fail("bad_request");

  const requestHost = requestHostOf(request);
  if (isCrossOrigin(request, requestHost)) return fail("bad_request");
  if (body.honeypot.trim() !== "") return fail("bad_request");

  return { mode, fail, url: body.url, body, requestHost };
}

function openVisit(request: Request, accepted: Accepted, deps: HandlerDeps, requestStartedAt: number): Visit {
  const cfg = deps.config();
  const visitor = visitorId(clientIp(request.headers), cfg.ipSalt);
  const home = readHomeAssignment(request.headers.get("cookie"));
  return {
    ...accepted,
    request,
    deps,
    cfg,
    mock: deps.isMockMode(),
    store: deps.getStore(),
    visitor,
    analytics: {
      distinctId: accepted.body.phId ?? `visitor:${visitor}`,
      sessionId: accepted.body.phSession,
      context: home ? homeEventProps(home) : undefined,
    },
    now: new Date(requestStartedAt),
    requestStartedAt,
  };
}

async function guardFlood(v: Visit): Promise<Response | null> {
  if (!v.store || (await checkFlood(v.store, v.visitor, v.now))) return null;
  return v.fail("too_fast", null, Math.max(1, 60 - v.now.getUTCSeconds()));
}

function normalizeTarget(v: Visit): Response | Target {
  const input = normalizeInput(v.url, { requestHost: v.requestHost, allowTestTld: v.mock });
  if (!input.ok) return v.fail(input.code);
  const { host } = input;
  const trigger = v.mock ? mockTrigger(host) : null;
  const earlyMock = (c: ErrorCode) => trigger === c && MOCK_PRERUN_CODES.has(c);
  for (const c of EARLY_MOCK_CODES) {
    if (earlyMock(c)) return v.fail(c, host, c === "too_fast" ? 30 : undefined);
  }
  return { host, hostname: input.hostname, extraPath: input.extraPath, trigger, earlyMock };
}

function reportInBackground(deps: HandlerDeps, event: Parameters<ReportEvent>[0]): void {
  try {
    deps.keepAlive(deps.report(event));
  } catch (err) {
    console.error("[thirty] could not keep the analytics event alive", err);
  }
}

async function serveFromCache(v: Visit, t: Target): Promise<Response | null> {
  const fresh = !v.deps.isProduction() && new URL(v.request.url).searchParams.get("fresh") === "1";
  if (!v.store || fresh) return null;

  const hit = await cachedSlug(v.store, t.host);
  if (hit) {
    reportInBackground(v.deps, {
      event: "blueprint_cache_hit",
      distinctId: v.analytics.distinctId,
      sessionId: v.analytics.sessionId,
      properties: { ...v.analytics.context, host: t.host, slug: hit.slug, form: v.mode === "form" },
    });
    if (v.mode === "form") return redirectToBlueprint(hit.slug);
    return ndjson([
      { t: "cached", slug: hit.slug, createdAt: hit.createdAt },
      { t: "done", slug: hit.slug },
    ]);
  }

  const neg = await v.store.get(keys.negative(t.host));
  return neg && isErrorCode(neg) ? v.fail(neg, t.host) : null;
}

async function requireLiveStore(v: Visit, t: Target): Promise<Response | Store> {
  if (!v.deps.isLiveEnabled() || !v.store || t.earlyMock("live_disabled")) return v.fail("live_disabled", t.host);
  await v.store.get(keys.lock(t.host));
  if (t.earlyMock("unavailable")) return v.fail("unavailable", t.host);
  return v.store;
}

function holdOpen(keepAlive: HandlerDeps["keepAlive"]): Hold | null {
  let resolve!: (value?: unknown) => void;
  const held = new Promise<unknown>((r) => {
    resolve = r;
  });
  try {
    keepAlive(held);
  } catch (err) {
    console.error("[thirty] cannot keep a run alive past the response; refusing to start one", err);
    return null;
  }
  return { adopt: (work) => resolve(work), release: () => resolve(undefined) };
}

async function takeQuota(v: Visit, t: Target, store: Store): Promise<Response | Quota> {
  const day = utcDay(v.now);
  if (t.earlyMock("rate_limited")) return v.fail("rate_limited", t.host, secondsToUtcMidnight(v.now));
  const visitorTake = await takeVisitorRun(store, v.visitor, v.now, v.cfg.ipDailyRuns);
  if (!visitorTake.ok) return v.fail("rate_limited", t.host, visitorTake.retryAfterSec);

  const globalOk = !t.earlyMock("capacity") && (await takeGlobalRun(store, v.now, v.cfg.dailyRuns));
  if (!globalOk) {
    await refundVisitorRun(store, v.visitor, day);
    return v.fail("capacity", t.host);
  }
  const reservation = await reserveBudget(store, v.now, v.cfg.monthlyBudgetUsd);
  if (!reservation) {
    await refundVisitorRun(store, v.visitor, day);
    await refundGlobalRun(store, day);
    return v.fail("capacity", t.host);
  }
  return { day, reservation };
}

async function refundQuota(v: Visit, store: Store, quota: Quota): Promise<void> {
  await refundVisitorRun(store, v.visitor, quota.day);
  await refundGlobalRun(store, quota.day);
  await releaseBudget(store, quota.reservation);
}

async function waitBehindOtherRun(v: Visit, t: Target, store: Store, hold: Hold): Promise<Response> {
  const waiting = waitForOtherRun(store, t.host, v.deps);
  hold.adopt(waiting);
  if (v.mode === "form") {
    const result = await waiting;
    return result.kind === "cached" ? redirectToBlueprint(result.slug) : v.fail(result.code, t.host);
  }
  const emitter = new RunEmitter();
  emitter.emit({ t: "step", id: "validate", status: "done", label: stepLabel("validate", t.host), ms: 0 });
  emitter.emit({ t: "step", id: "read", status: "start", label: LOCK_WAIT_LABEL });
  void waiting.then((result) => {
    if (result.kind === "cached") {
      emitter.emit({ t: "cached", slug: result.slug, createdAt: result.createdAt });
      emitter.emit({ t: "done", slug: result.slug });
    } else {
      emitter.emit({ t: "error", code: result.code, message: errorMessage(result.code, t.host) });
    }
  });
  return streamEmitter(emitter);
}

async function startLiveRun(v: Visit, t: Target, store: Store, quota: Quota, runId: string, hold: Hold): Promise<Response> {
  const emitter = new RunEmitter();
  const ctx: RunContext = {
    runId,
    host: t.host,
    hostname: t.hostname,
    inputUrl: v.url.trim().slice(0, 2048),
    extraPath: t.extraPath,
    visitor: v.visitor,
    day: quota.day,
    reservation: quota.reservation,
    requestStartedAt: v.requestStartedAt,
    analytics: v.analytics,
  };
  const run = v.deps.startRun(ctx, emitter, store, v.mock).catch((err: unknown): RunOutcome => {
    console.error("[thirty] run crashed", err);
    if (!emitter.finished) {
      emitter.emit({ t: "error", code: "internal", message: errorMessage("internal") });
    }
    return { ok: false, code: "internal", message: errorMessage("internal") };
  });
  hold.adopt(run);

  if (v.mode === "form") {
    const outcome = await run;
    return outcome.ok ? redirectToBlueprint(outcome.slug) : v.fail(outcome.code, t.host);
  }
  return streamEmitter(emitter, t.trigger === "drop");
}

async function runHeld(v: Visit, t: Target, store: Store, hold: Hold): Promise<Response> {
  const quota = await takeQuota(v, t, store);
  if (quota instanceof Response) return quota;

  const runId = newRunId();
  if (!(await acquireLock(store, t.host, runId))) {
    await refundQuota(v, store, quota);
    return waitBehindOtherRun(v, t, store, hold);
  }
  return startLiveRun(v, t, store, quota, runId, hold);
}

async function checkAndRun(v: Visit): Promise<Response> {
  const flooded = await guardFlood(v);
  if (flooded) return flooded;

  const target = normalizeTarget(v);
  if (target instanceof Response) return target;

  const cached = await serveFromCache(v, target);
  if (cached) return cached;

  const store = await requireLiveStore(v, target);
  if (store instanceof Response) return store;

  const hold = holdOpen(v.deps.keepAlive);
  if (!hold) return v.fail("unavailable", target.host);
  try {
    return await runHeld(v, target, store, hold);
  } finally {
    hold.release();
  }
}

export function createBlueprintHandler(deps: HandlerDeps) {
  return async function handle(request: Request): Promise<Response> {
    const requestStartedAt = deps.now();
    const accepted = await readRequest(request);
    if (accepted instanceof Response) return accepted;

    const visit = openVisit(request, accepted, deps, requestStartedAt);
    try {
      return await checkAndRun(visit);
    } catch (err) {
      if (err instanceof StoreError) {
        console.error("[thirty] store unavailable before run", err.message);
        return visit.fail("unavailable");
      }
      console.error("[thirty] handler failed", err);
      return visit.fail("internal");
    }
  };
}
