// Server-only. POST /api/blueprint: the cheap checks in order, then a run (or
// a cache hit, or a wait on someone else's run). Dependencies are injected so
// the whole flow is testable without a network, a model, or Redis.
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
  /** Keeps the function alive until the run settles (Next's `after`). */
  keepAlive: (work: Promise<unknown>) => void;
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
  return runPipeline(ctx, { store, stages, models, emitter });
}

export const defaultDeps: Omit<HandlerDeps, "keepAlive"> = {
  getStore,
  isLiveEnabled,
  isMockMode,
  isProduction,
  config: getConfig,
  startRun: defaultStartRun,
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

/**
 * Streams the emitter's events as NDJSON. A closed connection only detaches
 * this subscriber; the run itself carries on. `dropEarly` (mock `drop.test`)
 * closes the stream mid-run without a terminal event.
 */
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
        } catch {
          // Already closed by the client.
        }
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

type ParsedBody = { url: unknown; honeypot: string };

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
    const { url, website_confirm } = data as Record<string, unknown>;
    return { url, honeypot: typeof website_confirm === "string" ? website_confirm : "" };
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

/** Returns the slug if the host has a valid cached blueprint. */
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
      // The other run finished without a result we can use (for example a timeout).
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

export function createBlueprintHandler(deps: HandlerDeps) {
  return async function handle(request: Request): Promise<Response> {
    const requestStartedAt = deps.now();
    const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
    const mode: Mode = contentType.includes("application/x-www-form-urlencoded") ? "form" : "json";
    const fail = (code: ErrorCode, host?: string | null, retryAfterSec?: number) =>
      errorResponse(mode, code, host, retryAfterSec);

    // 1. Body
    if (mode === "json" && !contentType.includes("application/json")) return fail("bad_request");
    const body = await parseBody(request, mode);
    if (!body || typeof body.url !== "string") return fail("bad_request");

    // 2. Same origin
    const requestHost = requestHostOf(request);
    if (isCrossOrigin(request, requestHost)) return fail("bad_request");

    // 3. Honeypot
    if (body.honeypot.trim() !== "") return fail("bad_request");

    const cfg = deps.config();
    const mock = deps.isMockMode();
    const store = deps.getStore();
    const visitor = visitorId(clientIp(request.headers), cfg.ipSalt);
    const now = new Date(requestStartedAt);

    try {
      // 4. Flood guard
      if (store && !(await checkFlood(store, visitor, now))) {
        return fail("too_fast", null, Math.max(1, 60 - now.getUTCSeconds()));
      }

      // 5. Normalize
      const input = normalizeInput(body.url, { requestHost, allowTestTld: mock });
      if (!input.ok) return fail(input.code);
      const { host } = input;
      const trigger = mock ? mockTrigger(host) : null;
      const earlyMock = (c: ErrorCode) => trigger === c && MOCK_PRERUN_CODES.has(c);
      for (const c of ["bad_request", "invalid_url", "blocked_host", "platform_url", "self_url", "too_fast"] as const) {
        if (earlyMock(c)) return fail(c, host, c === "too_fast" ? 30 : undefined);
      }

      const fresh = !deps.isProduction() && new URL(request.url).searchParams.get("fresh") === "1";

      // 6. Positive cache
      if (store && !fresh) {
        const hit = await cachedSlug(store, host);
        if (hit) {
          if (mode === "form") return redirectToBlueprint(hit.slug);
          return ndjson([
            { t: "cached", slug: hit.slug, createdAt: hit.createdAt },
            { t: "done", slug: hit.slug },
          ]);
        }
        // 7. Negative cache
        const neg = await store.get(keys.negative(host));
        if (neg && isErrorCode(neg)) return fail(neg, host);
      }

      // 8. Live availability
      if (!deps.isLiveEnabled() || !store || earlyMock("live_disabled")) return fail("live_disabled", host);

      // 9. Store health: without the store we cannot enforce the budget.
      await store.get(keys.lock(host));
      if (earlyMock("unavailable")) return fail("unavailable", host);

      // 10. Per-visitor daily limit
      const day = utcDay(now);
      if (earlyMock("rate_limited")) return fail("rate_limited", host, secondsToUtcMidnight(now));
      const visitorTake = await takeVisitorRun(store, visitor, now, cfg.ipDailyRuns);
      if (!visitorTake.ok) return fail("rate_limited", host, visitorTake.retryAfterSec);

      // 11. Global daily cap, then the monthly budget
      const globalOk = !earlyMock("capacity") && (await takeGlobalRun(store, now, cfg.dailyRuns));
      if (!globalOk) {
        await refundVisitorRun(store, visitor, day);
        return fail("capacity", host);
      }
      const reservation = await reserveBudget(store, now, cfg.monthlyBudgetUsd);
      if (!reservation) {
        await refundVisitorRun(store, visitor, day);
        await refundGlobalRun(store, day);
        return fail("capacity", host);
      }

      // 12. Per-host lock
      const runId = newRunId();
      if (!(await acquireLock(store, host, runId))) {
        await refundVisitorRun(store, visitor, day);
        await refundGlobalRun(store, day);
        await releaseBudget(store, reservation);
        const waiting = waitForOtherRun(store, host, deps);
        if (mode === "form") {
          const result = await waiting;
          return result.kind === "cached" ? redirectToBlueprint(result.slug) : fail(result.code, host);
        }
        const emitter = new RunEmitter();
        emitter.emit({ t: "step", id: "validate", status: "done", label: stepLabel("validate", host), ms: 0 });
        emitter.emit({ t: "step", id: "read", status: "start", label: LOCK_WAIT_LABEL });
        void waiting.then((result) => {
          if (result.kind === "cached") {
            emitter.emit({ t: "cached", slug: result.slug, createdAt: result.createdAt });
            emitter.emit({ t: "done", slug: result.slug });
          } else {
            emitter.emit({ t: "error", code: result.code, message: errorMessage(result.code, host) });
          }
        });
        return streamEmitter(emitter);
      }

      // 13. Run
      const emitter = new RunEmitter();
      const ctx: RunContext = {
        runId,
        host,
        hostname: input.hostname,
        inputUrl: body.url.trim().slice(0, 2048),
        extraPath: input.extraPath,
        visitor,
        day,
        reservation,
        requestStartedAt,
      };
      const run = deps.startRun(ctx, emitter, store, mock).catch((err: unknown): RunOutcome => {
        console.error("[thirty] run crashed", err);
        if (!emitter.finished) {
          emitter.emit({ t: "error", code: "internal", message: errorMessage("internal") });
        }
        return { ok: false, code: "internal", message: errorMessage("internal") };
      });
      deps.keepAlive(run);

      if (mode === "form") {
        const outcome = await run;
        return outcome.ok ? redirectToBlueprint(outcome.slug) : fail(outcome.code, host);
      }
      return streamEmitter(emitter, trigger === "drop");
    } catch (err) {
      if (err instanceof StoreError) {
        console.error("[thirty] store unavailable before run", err.message);
        return fail("unavailable");
      }
      console.error("[thirty] handler failed", err);
      return fail("internal");
    }
  };
}
