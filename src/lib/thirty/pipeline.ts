import { randomUUID } from "node:crypto";
import type Anthropic from "@anthropic-ai/sdk";
import { captureServerEvent, type ReportEvent } from "@/lib/analytics/server";
import { getConfig, LIMITS, type ThirtyConfig } from "./config";
import {
  costUsd,
  getAnthropic,
  mapRunError,
  ModelOutputError,
  totals,
  type UsageRecord,
} from "./anthropic";
import { settleBudget, usdToMicros, type Reservation } from "./budget";
import { draftBlueprint, type DesignResult, type PreviousAttempt } from "./design";
import { errorMessage, RunError, type ErrorCode } from "./errors";
import { FALLBACK_NOTE, stepLabel, type RunEvent, type StepId, type StepStatus } from "./events";
import type { PageContent } from "./extract";
import { readSite, type FetchFailure, type ReadResult, type ReadSiteInput } from "./fetchSite";
import { refundGlobalRun, refundVisitorRun, releaseLock } from "./limits";
import { checkQuality, cleanText, normalizeBlueprint } from "./quality";
import { extractProfile, type ResearchResult } from "./research";
import type { NormalizedBlueprint, Profile, StoredBlueprint } from "./schema";
import { searchBrief, type SearchResult } from "./searchFallback";
import { makeSlug } from "./slug";
import { keys, type Store } from "./store";

export class RunEmitter {
  private readonly buffer: RunEvent[] = [];
  private readonly listeners = new Set<(event: RunEvent) => void>();
  private terminal = false;

  emit(event: RunEvent): void {
    if (this.terminal) return;
    if (event.t === "done" || event.t === "error") this.terminal = true;
    this.buffer.push(event);
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {}
    }
  }

  subscribe(listener: (event: RunEvent) => void): () => void {
    for (const event of this.buffer) {
      try {
        listener(event);
      } catch {
        return () => undefined;
      }
    }
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  get finished(): boolean {
    return this.terminal;
  }

  get events(): readonly RunEvent[] {
    return this.buffer;
  }
}

export type Stages = {
  readSite(input: ReadSiteInput, signal: AbortSignal): Promise<ReadResult>;
  searchBrief(host: string, signal: AbortSignal): Promise<SearchResult>;
  extractProfile(args: {
    host: string;
    pages: PageContent[];
    brief?: string;
    signal: AbortSignal;
  }): Promise<ResearchResult>;
  draftBlueprint(args: {
    profile: Profile;
    signal: AbortSignal;
    previous?: PreviousAttempt;
    onAgentName: (name: string) => void;
  }): Promise<DesignResult>;
};

export type Models = { research: string; blueprint: string; search: string };

export function liveStages(
  cfg: ThirtyConfig = getConfig(),
  client: Anthropic = getAnthropic()
): { stages: Stages; models: Models } {
  const models = { research: cfg.modelResearch, blueprint: cfg.modelBlueprint, search: cfg.modelBlueprint };
  return {
    models,
    stages: {
      readSite: (input, signal) => readSite(input, { signal, userAgent: cfg.userAgent }),
      searchBrief: (host, signal) => searchBrief({ client, model: models.search, host, signal }),
      extractProfile: (args) => extractProfile({ client, model: models.research, ...args }),
      draftBlueprint: (args) =>
        draftBlueprint({ client, model: models.blueprint, effort: cfg.effortBlueprint, ...args }),
    },
  };
}

export type RunContext = {
  runId: string;
  host: string;
  hostname: string;
  inputUrl: string;
  extraPath?: string;
  visitor: string;
  day: string;
  reservation: Reservation;
  requestStartedAt: number;
  analytics: {
    distinctId: string;
    sessionId?: string;
    context?: Record<string, string>;
  };
};

export type RunDeps = {
  store: Store;
  stages: Stages;
  models: Models;
  emitter: RunEmitter;
  now?: () => number;
  slugFor?: (host: string) => string;
  log?: (line: string) => void;
  report?: ReportEvent;
  mock?: boolean;
  deadlineMs?: number;
  minMsForDesignRetry?: number;
};

export type RunOutcome =
  | { ok: true; slug: string }
  | { ok: false; code: ErrorCode; message: string; retryAfterSec?: number };

const NEGATIVE_CACHE: ReadonlySet<ErrorCode> = new Set([
  "not_a_company",
  "not_enough_info",
  "unreachable",
  "unsafe",
  "declined",
]);

const REFUND_VISITOR: ReadonlySet<ErrorCode> = new Set([
  "upstream",
  "timeout",
  "quality",
  "internal",
  "unavailable",
  "live_disabled",
]);

type SearchFailure = Extract<SearchResult, { ok: false }>["reason"];

const NO_ANSWER: ReadonlySet<FetchFailure | "challenge"> = new Set(["connect", "tls", "timeout", "aborted"]);

export function fallbackFailure(reason: SearchFailure, siteAnswered: boolean): ErrorCode {
  if (reason === "tool_error") return "upstream";
  return siteAnswered ? "not_enough_info" : "unreachable";
}

class DnsUnreachable extends RunError {
  constructor() {
    super("unreachable", "dns");
  }
}

export function newRunId(): string {
  return randomUUID();
}

type RunState = {
  method: StoredBlueprint["source"]["method"];
  usedSearch: boolean;
  settled: boolean;
  spendUnknown: boolean;
  pagesRead: number;
  companyName: string | null;
};

type Run = {
  ctx: RunContext;
  deps: RunDeps;
  signal: AbortSignal;
  now: () => number;
  log: (line: string) => void;
  remaining: () => number;
  minRetryMs: number;
  usage: UsageRecord[];
  steps: Array<{ id: StepId; label: string; ms: number }>;
  stepStarts: Map<StepId, number>;
  state: RunState;
  step: (id: StepId, status: StepStatus, label?: string) => void;
  emit: (event: RunEvent) => void;
};

type SiteRead = { read: ReadResult; pages: PageContent[]; finalUrl: string | null };

type Company = StoredBlueprint["company"];

type Researched = { profile: Profile; company: Company };

function openRun(ctx: RunContext, deps: RunDeps, signal: AbortSignal, deadlineMs: number): Run {
  const now = deps.now ?? Date.now;
  const stepStarts = new Map<StepId, number>();
  const steps: Run["steps"] = [];
  const state: RunState = {
    method: "fetch",
    usedSearch: false,
    settled: false,
    spendUnknown: false,
    pagesRead: 0,
    companyName: null,
  };
  return {
    ctx,
    deps,
    signal,
    now,
    log: deps.log ?? ((line: string) => console.log(line)),
    remaining: () => deadlineMs - (now() - ctx.requestStartedAt),
    minRetryMs: deps.minMsForDesignRetry ?? LIMITS.minMsForDesignRetry,
    usage: [],
    steps,
    stepStarts,
    state,
    step: (id, status, label = stepLabel(id, ctx.host)) => {
      if (state.settled) return;
      if (status === "start") {
        stepStarts.set(id, now());
        deps.emitter.emit({ t: "step", id, status, label });
        return;
      }
      const startedAt = stepStarts.get(id) ?? now();
      const ms = Math.max(0, now() - startedAt);
      steps.push({ id, label, ms });
      deps.emitter.emit({ t: "step", id, status, label, ms });
    },
    emit: (event) => {
      if (!state.settled) deps.emitter.emit(event);
    },
  };
}

async function readStage(run: Run): Promise<SiteRead> {
  const { ctx, deps } = run;
  run.stepStarts.set("validate", ctx.requestStartedAt);
  deps.emitter.emit({ t: "step", id: "validate", status: "start", label: stepLabel("validate", ctx.host) });
  run.step("validate", "done");

  run.step("read", "start");
  const read = await deps.stages.readSite({ hostname: ctx.hostname, extraPath: ctx.extraPath }, run.signal);
  if (read.kind === "unresolvable") throw new DnsUnreachable();
  if (read.kind === "private") throw new RunError("blocked_host");
  if (read.kind === "parked") throw new RunError("not_a_company");
  if (read.kind !== "pages") {
    run.step("read", "skip");
    return { read, pages: [], finalUrl: null };
  }
  run.state.pagesRead = read.pages.length;
  for (const p of read.pages.slice(0, LIMITS.maxPages)) {
    run.emit({ t: "page", url: p.url, title: pageTitle(p) });
  }
  run.step("read", "done");
  return { read, pages: read.pages, finalUrl: read.finalUrl };
}

async function searchForBrief(run: Run, siteAnswered: boolean): Promise<string> {
  run.state.usedSearch = true;
  run.state.method = "search";
  run.emit({ t: "note", text: FALLBACK_NOTE });
  const result = await run.deps.stages.searchBrief(run.ctx.host, run.signal);
  run.usage.push(...result.usage);
  if (result.ok) return result.brief;
  if (result.reason === "stage_timeout") run.state.spendUnknown = true;
  throw new RunError(fallbackFailure(result.reason, siteAnswered));
}

async function extract(run: Run, pages: PageContent[], brief?: string): Promise<Profile> {
  try {
    const result = await run.deps.stages.extractProfile({ host: run.ctx.host, pages, brief, signal: run.signal });
    run.usage.push(result.usage);
    return result.profile;
  } catch (err) {
    if (err instanceof ModelOutputError) run.usage.push(err.usage);
    throw err;
  }
}

async function profileSite(run: Run, { read, pages }: SiteRead): Promise<Profile> {
  if (read.kind === "blocked") return extract(run, [], await searchForBrief(run, !NO_ANSWER.has(read.reason)));
  if (read.kind === "pages" && read.thin) return extract(run, pages, await searchForBrief(run, true));
  const profile = await extract(run, pages);
  if (profile.fit !== "thin") return profile;
  return extract(run, pages, await searchForBrief(run, true));
}

async function researchStage(run: Run, site: SiteRead): Promise<Researched> {
  run.step("research", "start");
  const profile = await profileSite(run, site);
  if (profile.fit === "parked" || profile.fit === "not_a_company") throw new RunError("not_a_company");
  if (profile.fit === "thin") throw new RunError("not_enough_info");
  if (profile.flags.adultOrIllegal) throw new RunError("unsafe");
  if (profile.flags.injectionAttempt) {
    run.log(JSON.stringify({ event: "thirty_injection_attempt", runId: run.ctx.runId, host: run.ctx.host }));
  }
  const company: Company = {
    name: cleanText(profile.companyName, 80) || run.ctx.host,
    oneLiner: cleanText(profile.oneLiner, 240),
    offerings: profile.offerings.map((o) => cleanText(o, 80)).filter(Boolean).slice(0, 12),
    customers: cleanText(profile.customers, 240),
  };
  run.state.companyName = company.name;
  run.emit({ t: "company", name: company.name, oneLiner: company.oneLiner });
  run.step("research", "done");
  return { profile, company };
}

type DraftAttempt = { blueprint: NormalizedBlueprint } | { failures: string[]; text: string | null };

async function draftOnce(run: Run, { profile, company }: Researched, previous?: PreviousAttempt): Promise<DraftAttempt> {
  try {
    const result = await run.deps.stages.draftBlueprint({
      profile,
      signal: run.signal,
      previous,
      onAgentName: (name) => run.emit({ t: "agent", name: cleanText(name, 60) }),
    });
    run.usage.push(result.usage);
    const normalized = normalizeBlueprint(result.blueprint);
    const gate = checkQuality(normalized, { companyName: company.name, offerings: company.offerings });
    return gate.ok ? { blueprint: normalized } : { failures: gate.failures, text: result.text };
  } catch (err) {
    if (!(err instanceof ModelOutputError)) throw err;
    run.usage.push(err.usage);
    if (err.reason === "refusal") throw new RunError("declined");
    return {
      failures: ["The previous draft was cut off or was not valid output. Keep every field concise."],
      text: null,
    };
  }
}

async function designStage(run: Run, researched: Researched): Promise<NormalizedBlueprint> {
  run.step("design", "start");
  const first = await draftOnce(run, researched);
  let result = first;
  if (!("blueprint" in first)) {
    if (run.remaining() < run.minRetryMs) throw new RunError("quality", first.failures.join(" "));
    run.emit({ t: "note", text: "The first draft was not specific enough. Redrafting." });
    result = await draftOnce(run, researched, { text: first.text, failures: first.failures });
  }
  if (!("blueprint" in result)) throw new RunError("quality", result.failures.join(" "));
  run.step("design", "done");
  return result.blueprint;
}

async function checkAndSave(
  run: Run,
  { pages, finalUrl }: SiteRead,
  { company }: Researched,
  blueprint: NormalizedBlueprint
): Promise<string | null> {
  const { ctx, deps, now } = run;
  run.step("check", "start");
  const slug = (deps.slugFor ?? makeSlug)(ctx.host);
  const checkMs = Math.max(0, now() - (run.stepStarts.get("check") ?? now()));
  const receiptSteps = [...run.steps, { id: "check" as const, label: stepLabel("check", ctx.host), ms: checkMs }];
  const t = totals(run.usage);
  const stored: StoredBlueprint = {
    v: 1,
    slug,
    createdAt: new Date(now()).toISOString(),
    kind: "run",
    source: {
      host: ctx.host,
      inputUrl: ctx.inputUrl,
      finalUrl,
      method: run.state.method,
      pages: pages.map((p) => ({ url: p.url, title: pageTitle(p) })),
    },
    company,
    blueprint,
    receipt: {
      totalMs: Math.max(0, now() - ctx.requestStartedAt),
      steps: receiptSteps,
      models: {
        research: deps.models.research,
        blueprint: deps.models.blueprint,
        ...(run.state.usedSearch ? { search: deps.models.search } : {}),
      },
      tokens: { input: t.input, output: t.output },
      webSearches: t.webSearches,
      estCostUsd: Math.round(costUsd(run.usage) * 1e6) / 1e6,
    },
  };
  if (run.state.settled) return null;
  await persist(deps.store, stored);
  run.step("check", "done");
  return slug;
}

async function runStages(run: Run): Promise<string | null> {
  const site = await readStage(run);
  const researched = await researchStage(run, site);
  const blueprint = await designStage(run, researched);
  return checkAndSave(run, site, researched, blueprint);
}

async function settleSpend(run: Run): Promise<{ actualUsd: number; chargedMicros: number }> {
  const { ctx, deps } = run;
  const actualUsd = costUsd(run.usage);
  if (run.signal.aborted) run.state.spendUnknown = true;
  const chargedMicros = run.state.spendUnknown
    ? Math.max(usdToMicros(actualUsd), ctx.reservation.reservedMicros)
    : usdToMicros(actualUsd);
  try {
    await settleBudget(deps.store, ctx.reservation, chargedMicros);
  } catch (err) {
    run.log(JSON.stringify({ event: "thirty_settle_failed", runId: ctx.runId, error: String(err) }));
  }
  try {
    await releaseLock(deps.store, ctx.host, ctx.runId);
  } catch (err) {
    run.log(JSON.stringify({ event: "thirty_unlock_failed", runId: ctx.runId, error: String(err) }));
  }
  return { actualUsd, chargedMicros };
}

async function finishFailure(run: Run, code: ErrorCode, failure: unknown): Promise<void> {
  const { ctx, deps } = run;
  try {
    if (NEGATIVE_CACHE.has(code)) {
      await deps.store.set(keys.negative(ctx.host), code, { ex: LIMITS.negTtlSec });
    }
    if (REFUND_VISITOR.has(code) || failure instanceof DnsUnreachable) {
      await refundVisitorRun(deps.store, ctx.visitor, ctx.day);
    }
    if (failure instanceof DnsUnreachable) await refundGlobalRun(deps.store, ctx.day);
  } catch (err) {
    run.log(JSON.stringify({ event: "thirty_finalize_failed", runId: ctx.runId, error: String(err) }));
  }
  if (code === "internal" && failure && !(failure instanceof RunError)) {
    console.error("[thirty] run failed", ctx.runId, failure);
  }
}

async function recordRun(run: Run, outcome: RunOutcome, spend: { actualUsd: number; chargedMicros: number }) {
  const { ctx, deps, now, state } = run;
  const t = totals(run.usage);
  const costRounded = Math.round(spend.actualUsd * 1e6) / 1e6;
  run.log(
    JSON.stringify({
      event: "thirty_run",
      runId: ctx.runId,
      slug: outcome.ok ? outcome.slug : null,
      host: ctx.host,
      method: state.method,
      totalMs: now() - ctx.requestStartedAt,
      tokens: { input: t.input, output: t.output },
      webSearches: t.webSearches,
      costUsd: costRounded,
      ...(state.spendUnknown ? { spendUnknown: true, budgetChargedUsd: spend.chargedMicros / 1e6 } : {}),
      outcome: outcome.ok ? "done" : outcome.code,
    })
  );
  await (deps.report ?? captureServerEvent)({
    event: "blueprint_run",
    distinctId: ctx.analytics.distinctId,
    sessionId: ctx.analytics.sessionId,
    properties: {
      ...ctx.analytics.context,
      outcome: outcome.ok ? "done" : outcome.code,
      host: ctx.host,
      slug: outcome.ok ? outcome.slug : null,
      company: state.companyName,
      method: state.method,
      total_ms: now() - ctx.requestStartedAt,
      cost_usd: costRounded,
      input_tokens: t.input,
      output_tokens: t.output,
      web_searches: t.webSearches,
      pages_read: state.pagesRead,
      spend_unknown: state.spendUnknown,
      mock: Boolean(deps.mock),
    },
    set: { last_blueprint_host: ctx.host },
    setOnce: { first_blueprint_host: ctx.host },
  }).catch(() => false);
}

export async function runPipeline(ctx: RunContext, deps: RunDeps): Promise<RunOutcome> {
  const deadlineMs = deps.deadlineMs ?? LIMITS.overallDeadlineMs;
  const controller = new AbortController();
  const run = openRun(ctx, deps, controller.signal, deadlineMs);
  const timer = setTimeout(() => controller.abort(new RunError("timeout")), Math.max(0, run.remaining()));

  const stagesDone = runStages(run);
  stagesDone.catch(() => undefined);
  const deadline = new Promise<never>((_, reject) => {
    controller.signal.addEventListener("abort", () => reject(new RunError("timeout")), { once: true });
  });

  let outcome: RunOutcome;
  let failure: unknown = null;
  try {
    const slug = await Promise.race([stagesDone, deadline]);
    outcome = slug ? { ok: true, slug } : { ok: false, code: "internal", message: errorMessage("internal") };
  } catch (err) {
    failure = err;
    const code = mapRunError(err, controller.signal.aborted);
    outcome = { ok: false, code, message: errorMessage(code, ctx.host) };
  } finally {
    run.state.settled = true;
    clearTimeout(timer);
  }

  const spend = await settleSpend(run);
  if (!outcome.ok) {
    await finishFailure(run, outcome.code, failure);
    deps.emitter.emit({ t: "error", code: outcome.code, message: outcome.message });
  } else {
    deps.emitter.emit({ t: "done", slug: outcome.slug });
  }
  await recordRun(run, outcome, spend);
  return outcome;
}

function pageTitle(p: PageContent): string {
  const title = cleanText(p.title || p.siteName, 120);
  if (title) return title;
  try {
    return new URL(p.url).pathname;
  } catch {
    return p.url;
  }
}

async function persist(store: Store, stored: StoredBlueprint): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await store.set(keys.blueprint(stored.slug), JSON.stringify(stored));
      await store.set(keys.domain(stored.source.host), stored.slug, { ex: LIMITS.domTtlSec });
      return;
    } catch (err) {
      lastError = err;
    }
  }
  console.error("[thirty] could not save blueprint", lastError);
  throw new RunError("internal", "store write failed");
}
