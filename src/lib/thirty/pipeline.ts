// Server-only. Runs one blueprint from site read to stored result, emitting
// progress events. The run owns its own deadline and is never tied to the
// visitor's connection: the money is spent either way, so the result is kept.
import { randomUUID } from "node:crypto";
import type Anthropic from "@anthropic-ai/sdk";
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
import { readSite, type ReadResult, type ReadSiteInput } from "./fetchSite";
import { refundGlobalRun, refundVisitorRun, releaseLock } from "./limits";
import { checkQuality, cleanText, normalizeBlueprint } from "./quality";
import { extractProfile, type ResearchResult } from "./research";
import type { NormalizedBlueprint, Profile, StoredBlueprint } from "./schema";
import { searchBrief, type SearchResult } from "./searchFallback";
import { makeSlug } from "./slug";
import { keys, type Store } from "./store";

/** Buffers events so a subscriber that attaches late still sees the whole run. */
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
      } catch {
        // A closed or broken subscriber must never affect the run.
      }
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

/** The four model and network stages, injectable so tests and mock mode can replace them. */
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
  /** UTC day the visitor and global counts were taken on, for refunds. */
  day: string;
  reservation: Reservation;
  /** When the request arrived; the overall deadline counts from here. */
  requestStartedAt: number;
};

export type RunDeps = {
  store: Store;
  stages: Stages;
  models: Models;
  emitter: RunEmitter;
  now?: () => number;
  slugFor?: (host: string) => string;
  log?: (line: string) => void;
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

/** Failures that are not the visitor's doing give the run back. */
const REFUND_VISITOR: ReadonlySet<ErrorCode> = new Set([
  "upstream",
  "timeout",
  "quality",
  "internal",
  "unavailable",
  "live_disabled",
]);

/** DNS-level unreachable never counts against anyone. */
class DnsUnreachable extends RunError {
  constructor() {
    super("unreachable", "dns");
  }
}

export function newRunId(): string {
  return randomUUID();
}

export async function runPipeline(ctx: RunContext, deps: RunDeps): Promise<RunOutcome> {
  const now = deps.now ?? Date.now;
  const log = deps.log ?? ((line: string) => console.log(line));
  const deadlineMs = deps.deadlineMs ?? LIMITS.overallDeadlineMs;
  const minRetryMs = deps.minMsForDesignRetry ?? LIMITS.minMsForDesignRetry;
  const { store, stages, models, emitter } = deps;

  const controller = new AbortController();
  const signal = controller.signal;
  const remaining = () => deadlineMs - (now() - ctx.requestStartedAt);
  const timer = setTimeout(() => controller.abort(new RunError("timeout")), Math.max(0, remaining()));

  const usage: UsageRecord[] = [];
  const steps: Array<{ id: StepId; label: string; ms: number }> = [];
  let method: StoredBlueprint["source"]["method"] = "fetch";
  let usedSearch = false;
  let settled = false;
  let slug: string | null = null;

  const stepStarts = new Map<StepId, number>();
  const step = (id: StepId, status: StepStatus, label = stepLabel(id, ctx.host)) => {
    if (settled) return;
    if (status === "start") {
      stepStarts.set(id, now());
      emitter.emit({ t: "step", id, status, label });
      return;
    }
    const startedAt = stepStarts.get(id) ?? now();
    const ms = Math.max(0, now() - startedAt);
    steps.push({ id, label, ms });
    emitter.emit({ t: "step", id, status, label, ms });
  };
  const emit = (event: RunEvent) => {
    if (!settled) emitter.emit(event);
  };

  const runSearch = async (): Promise<string | null> => {
    usedSearch = true;
    emit({ t: "note", text: FALLBACK_NOTE });
    const result = await stages.searchBrief(ctx.host, signal);
    usage.push(...result.usage);
    return result.ok ? result.brief : null;
  };

  const research = async (pages: PageContent[], brief?: string): Promise<Profile> => {
    const result = await stages.extractProfile({ host: ctx.host, pages, brief, signal });
    usage.push(result.usage);
    return result.profile;
  };

  const body = async (): Promise<void> => {
    stepStarts.set("validate", ctx.requestStartedAt);
    emitter.emit({ t: "step", id: "validate", status: "start", label: stepLabel("validate", ctx.host) });
    step("validate", "done");

    // Read
    step("read", "start");
    const read = await stages.readSite({ hostname: ctx.hostname, extraPath: ctx.extraPath }, signal);
    let pages: PageContent[] = [];
    let finalUrl: string | null = null;
    if (read.kind === "unresolvable") throw new DnsUnreachable();
    if (read.kind === "private") throw new RunError("blocked_host");
    if (read.kind === "parked") throw new RunError("not_a_company");
    if (read.kind === "pages") {
      pages = read.pages;
      finalUrl = read.finalUrl;
      for (const p of pages.slice(0, LIMITS.maxPages)) {
        emit({ t: "page", url: p.url, title: pageTitle(p) });
      }
      step("read", "done");
    } else {
      step("read", "skip");
    }

    // Research
    step("research", "start");
    let profile: Profile;
    if (read.kind === "blocked") {
      method = "search";
      const brief = await runSearch();
      if (!brief) throw new RunError("unreachable");
      profile = await research([], brief);
    } else if (read.kind === "pages" && read.thin) {
      method = "search";
      const brief = await runSearch();
      if (!brief) throw new RunError("not_enough_info");
      profile = await research(pages, brief);
    } else {
      profile = await research(pages);
      if (profile.fit === "thin") {
        method = "search";
        const brief = await runSearch();
        if (!brief) throw new RunError("not_enough_info");
        profile = await research(pages, brief);
      }
    }
    if (profile.fit === "parked" || profile.fit === "not_a_company") throw new RunError("not_a_company");
    if (profile.fit === "thin") throw new RunError("not_enough_info");
    if (profile.flags.adultOrIllegal) throw new RunError("unsafe");
    if (profile.flags.injectionAttempt) {
      log(JSON.stringify({ event: "thirty_injection_attempt", runId: ctx.runId, host: ctx.host }));
    }
    const company = {
      name: cleanText(profile.companyName, 80) || ctx.host,
      oneLiner: cleanText(profile.oneLiner, 240),
      offerings: profile.offerings.map((o) => cleanText(o, 80)).filter(Boolean).slice(0, 12),
      customers: cleanText(profile.customers, 240),
    };
    emit({ t: "company", name: company.name, oneLiner: company.oneLiner });
    step("research", "done");

    // Design, with one retry when the gate fails and time allows
    step("design", "start");
    let blueprint: NormalizedBlueprint | null = null;
    let previous: PreviousAttempt | undefined;
    for (let attempt = 0; attempt < 2 && !blueprint; attempt++) {
      let failures: string[];
      let text: string | null = null;
      try {
        const result = await stages.draftBlueprint({
          profile,
          signal,
          previous,
          onAgentName: (name) => emit({ t: "agent", name: cleanText(name, 60) }),
        });
        usage.push(result.usage);
        text = result.text;
        const normalized = normalizeBlueprint(result.blueprint);
        const gate = checkQuality(normalized, { companyName: company.name, offerings: company.offerings });
        if (gate.ok) {
          blueprint = normalized;
          break;
        }
        failures = gate.failures;
      } catch (err) {
        if (!(err instanceof ModelOutputError)) throw err;
        if (err.usage) usage.push(err.usage);
        if (err.reason === "refusal") throw new RunError("declined");
        failures = ["The previous draft was cut off or was not valid output. Keep every field concise."];
      }
      if (attempt === 0 && remaining() >= minRetryMs) {
        previous = { text, failures };
        emit({ t: "note", text: "The first draft was not specific enough. Redrafting." });
        continue;
      }
      throw new RunError("quality", failures.join(" "));
    }
    if (!blueprint) throw new RunError("quality");
    step("design", "done");

    // Check and save
    step("check", "start");
    const newSlug = (deps.slugFor ?? makeSlug)(ctx.host);
    const stored: StoredBlueprint = {
      v: 1,
      slug: newSlug,
      createdAt: new Date(now()).toISOString(),
      kind: "run",
      source: {
        host: ctx.host,
        inputUrl: ctx.inputUrl,
        finalUrl,
        method,
        pages: pages.map((p) => ({ url: p.url, title: pageTitle(p) })),
      },
      company,
      blueprint,
      receipt: null,
    };
    // Close the check step before the receipt so its duration is included.
    const checkMs = Math.max(0, now() - (stepStarts.get("check") ?? now()));
    const receiptSteps = [...steps, { id: "check" as const, label: stepLabel("check", ctx.host), ms: checkMs }];
    const t = totals(usage);
    stored.receipt = {
      totalMs: Math.max(0, now() - ctx.requestStartedAt),
      steps: receiptSteps,
      models: {
        research: models.research,
        blueprint: models.blueprint,
        ...(usedSearch ? { search: models.search } : {}),
      },
      tokens: { input: t.input, output: t.output },
      webSearches: t.webSearches,
      estCostUsd: Math.round(costUsd(usage) * 1e6) / 1e6,
    };
    if (settled) return;
    await persist(store, stored);
    slug = newSlug;
    step("check", "done");
  };

  const bodyPromise = body();
  bodyPromise.catch(() => undefined);
  const deadline = new Promise<never>((_, reject) => {
    signal.addEventListener("abort", () => reject(new RunError("timeout")), { once: true });
  });

  let outcome: RunOutcome;
  let failure: unknown = null;
  try {
    await Promise.race([bodyPromise, deadline]);
    outcome = slug ? { ok: true, slug } : { ok: false, code: "internal", message: errorMessage("internal") };
  } catch (err) {
    failure = err;
    const code = mapRunError(err, signal.aborted);
    outcome = { ok: false, code, message: errorMessage(code, ctx.host) };
  } finally {
    settled = true;
    clearTimeout(timer);
  }

  const actualUsd = costUsd(usage);
  try {
    await settleBudget(store, ctx.reservation, usdToMicros(actualUsd));
  } catch (err) {
    log(JSON.stringify({ event: "thirty_settle_failed", runId: ctx.runId, error: String(err) }));
  }
  try {
    await releaseLock(store, ctx.host, ctx.runId);
  } catch (err) {
    log(JSON.stringify({ event: "thirty_unlock_failed", runId: ctx.runId, error: String(err) }));
  }

  if (!outcome.ok) {
    const code = outcome.code;
    try {
      if (NEGATIVE_CACHE.has(code)) {
        await store.set(keys.negative(ctx.host), code, { ex: LIMITS.negTtlSec });
      }
      if (REFUND_VISITOR.has(code) || failure instanceof DnsUnreachable) {
        await refundVisitorRun(store, ctx.visitor, ctx.day);
      }
      if (failure instanceof DnsUnreachable) await refundGlobalRun(store, ctx.day);
    } catch (err) {
      log(JSON.stringify({ event: "thirty_finalize_failed", runId: ctx.runId, error: String(err) }));
    }
    if (code === "internal" && failure && !(failure instanceof RunError)) {
      console.error("[thirty] run failed", ctx.runId, failure);
    }
    emitter.emit({ t: "error", code, message: outcome.message });
  } else {
    emitter.emit({ t: "done", slug: outcome.slug });
  }

  const t = totals(usage);
  log(
    JSON.stringify({
      event: "thirty_run",
      runId: ctx.runId,
      slug: outcome.ok ? outcome.slug : null,
      host: ctx.host,
      method,
      totalMs: now() - ctx.requestStartedAt,
      tokens: { input: t.input, output: t.output },
      webSearches: t.webSearches,
      costUsd: Math.round(actualUsd * 1e6) / 1e6,
      outcome: outcome.ok ? "done" : outcome.code,
    })
  );
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

/** Saves the blueprint and the host cache entry, retrying twice before giving up. */
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
