import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModelOutputError, type UsageRecord } from "../anthropic";
import { reserveBudget } from "../budget";
import { RunError, type ErrorCode } from "../errors";
import type { RunEvent } from "../events";
import type { PageContent } from "../extract";
import { acquireLock, takeGlobalRun, takeVisitorRun } from "../limits";
import { mockBlueprint, mockProfile } from "../mock";
import { RunEmitter, runPipeline, type RunContext, type Stages } from "../pipeline";
import type { Profile } from "../schema";
import { keys, MemoryStore } from "../store";

const HOST = "acme.com";
const NOW = new Date("2026-11-11T10:00:00Z");
const MODELS = { research: "claude-haiku-5-5", blueprint: "claude-sonnet-5-5", search: "claude-sonnet-5-5" };

const usage = (model: string, input = 1000, output = 500, webSearches = 0): UsageRecord => ({
  model,
  input,
  output,
  webSearches,
});

function page(path: string, title: string): PageContent {
  return {
    url: `https://acme.com${path}`,
    title,
    description: "",
    siteName: "",
    ogDescription: "",
    headings: [],
    text: "text ".repeat(200),
    links: [],
  };
}

function profile(overrides: Partial<Profile> = {}): Profile {
  return { ...mockProfile("acme.com"), ...overrides };
}

function happyStages(overrides: Partial<Stages> = {}): Stages {
  return {
    readSite: vi.fn(async () => ({
      kind: "pages" as const,
      pages: [page("/", "Acme"), page("/about", "About")],
      finalUrl: "https://acme.com/",
      thin: false,
    })),
    searchBrief: vi.fn(async () => ({ ok: true as const, brief: "A brief", usage: [usage(MODELS.search, 5000, 800, 2)] })),
    extractProfile: vi.fn(async () => ({ profile: profile(), usage: usage(MODELS.research) })),
    draftBlueprint: vi.fn(async ({ onAgentName }) => {
      const bp = mockBlueprint("acme.com");
      for (const a of bp.agents) onAgentName(a.name);
      return { blueprint: bp, usage: usage(MODELS.blueprint, 3000, 2500), text: JSON.stringify(bp) };
    }),
    ...overrides,
  };
}

let store: MemoryStore;
let ctx: RunContext;
let logs: string[];

async function setup() {
  store = new MemoryStore();
  logs = [];
  await takeVisitorRun(store, "visitor", NOW, 3);
  await takeGlobalRun(store, NOW, 40);
  const reservation = await reserveBudget(store, NOW, 10);
  await acquireLock(store, HOST, "run-1");
  ctx = {
    runId: "run-1",
    host: HOST,
    hostname: HOST,
    inputUrl: "acme.com",
    visitor: "visitor",
    day: "20261111",
    reservation: reservation!,
    requestStartedAt: Date.now(),
  };
}

async function run(stages: Stages, extra: Partial<Parameters<typeof runPipeline>[1]> = {}) {
  const emitter = new RunEmitter();
  const events: RunEvent[] = [];
  emitter.subscribe((e) => events.push(e));
  const outcome = await runPipeline(ctx, {
    store,
    stages,
    models: MODELS,
    emitter,
    slugFor: () => "acme-com-abcdefgh",
    log: (l) => logs.push(l),
    ...extra,
  });
  return { outcome, events, emitter };
}

const terminals = (events: RunEvent[]) => events.filter((e) => e.t === "done" || e.t === "error");
const budget = async () => Number(await store.get(keys.budget("2026-11")));
const visitorCount = async () => Number(await store.get(keys.visitorDay("visitor", "20261111")));
const dayCount = async () => Number(await store.get(keys.day("20261111")));

beforeEach(setup);

describe("runPipeline happy path", () => {
  it("emits steps in order, saves the blueprint, settles the budget, and releases the lock", async () => {
    const { outcome, events } = await run(happyStages());
    expect(outcome).toEqual({ ok: true, slug: "acme-com-abcdefgh" });
    const shape = events.map((e) => (e.t === "step" ? `${e.id}:${e.status}` : e.t));
    expect(shape).toEqual([
      "validate:start",
      "validate:done",
      "read:start",
      "page",
      "page",
      "read:done",
      "research:start",
      "company",
      "research:done",
      "design:start",
      "agent",
      "agent",
      "agent",
      "design:done",
      "check:start",
      "check:done",
      "done",
    ]);
    expect(terminals(events)).toHaveLength(1);

    const saved = JSON.parse((await store.get(keys.blueprint("acme-com-abcdefgh")))!);
    expect(saved.kind).toBe("run");
    expect(saved.source).toMatchObject({ host: HOST, method: "fetch", pages: [{ title: "Acme" }, { title: "About" }] });
    expect(saved.receipt.models).toEqual({ research: MODELS.research, blueprint: MODELS.blueprint });
    expect(saved.receipt.tokens).toEqual({ input: 4000, output: 3000 });
    expect(saved.receipt.steps.map((s: { id: string }) => s.id)).toEqual(["validate", "read", "research", "design", "check"]);
    // Haiku 1000 in / 500 out + Sonnet 3000 in / 2500 out
    const expected = (1000 * 0.1 + 500 * 0.5 + 3000 * 2 + 2500 * 10) / 1e6;
    expect(saved.receipt.estCostUsd).toBeCloseTo(expected, 6);

    expect(await store.get(keys.domain(HOST))).toBe("acme-com-abcdefgh");
    expect(await store.get(keys.lock(HOST))).toBeNull();
    expect(await budget()).toBe(Math.round(expected * 1e6));
    expect(await visitorCount()).toBe(1);

    const line = JSON.parse(logs.find((l) => l.includes('"thirty_run"'))!);
    expect(line).toMatchObject({ slug: "acme-com-abcdefgh", host: HOST, outcome: "done", method: "fetch" });
    expect(JSON.stringify(line)).not.toMatch(/visitor|ip/i);
  });

  it("takes the search fallback when the site blocks bots", async () => {
    const stages = happyStages({
      readSite: vi.fn(async () => ({ kind: "blocked" as const, reason: "challenge" as const })),
    });
    const { outcome, events } = await run(stages);
    expect(outcome.ok).toBe(true);
    expect(events).toContainEqual(expect.objectContaining({ t: "step", id: "read", status: "skip" }));
    expect(events).toContainEqual({ t: "note", text: expect.stringContaining("Searching the web") });
    expect(stages.extractProfile).toHaveBeenCalledWith(expect.objectContaining({ pages: [], brief: "A brief" }));
    const saved = JSON.parse((await store.get(keys.blueprint("acme-com-abcdefgh")))!);
    expect(saved.source.method).toBe("search");
    expect(saved.source.pages).toEqual([]);
    expect(saved.receipt.webSearches).toBe(2);
    expect(saved.receipt.models.search).toBe(MODELS.search);
  });

  it("searches once and re-extracts when the profile is thin", async () => {
    const extract = vi
      .fn()
      .mockResolvedValueOnce({ profile: profile({ fit: "thin" }), usage: usage(MODELS.research) })
      .mockResolvedValueOnce({ profile: profile(), usage: usage(MODELS.research) });
    const stages = happyStages({ extractProfile: extract });
    const { outcome } = await run(stages);
    expect(outcome.ok).toBe(true);
    expect(stages.searchBrief).toHaveBeenCalledTimes(1);
    expect(extract).toHaveBeenCalledTimes(2);
  });

  it("retries the design once when the gate fails, sending the failures", async () => {
    const good = mockBlueprint("acme.com");
    const bad = { ...good, agents: good.agents.slice(0, 2) };
    const draft = vi
      .fn()
      .mockResolvedValueOnce({ blueprint: bad, usage: usage(MODELS.blueprint), text: "{first}" })
      .mockResolvedValueOnce({ blueprint: good, usage: usage(MODELS.blueprint), text: "{second}" });
    const { outcome } = await run(happyStages({ draftBlueprint: draft }));
    expect(outcome.ok).toBe(true);
    expect(draft).toHaveBeenCalledTimes(2);
    expect(draft.mock.calls[1][0].previous).toEqual({ text: "{first}", failures: [expect.stringMatching(/at least 3/)] });
  });

  it("a subscriber that throws does not break the run", async () => {
    const emitter = new RunEmitter();
    emitter.subscribe(() => {
      throw new Error("closed stream");
    });
    const outcome = await runPipeline(ctx, {
      store,
      stages: happyStages(),
      models: MODELS,
      emitter,
      slugFor: () => "acme-com-abcdefgh",
      log: () => undefined,
    });
    expect(outcome.ok).toBe(true);
    expect(await store.get(keys.domain(HOST))).toBe("acme-com-abcdefgh");
  });
});

type FailureCase = {
  code: ErrorCode;
  stages: () => Stages;
  negative: boolean;
  refund: boolean;
  refundDay?: boolean;
};

const failureCases: FailureCase[] = [
  {
    code: "unreachable",
    stages: () => happyStages({ readSite: vi.fn(async () => ({ kind: "unresolvable" as const })) }),
    negative: true,
    refund: true,
    refundDay: true,
  },
  {
    code: "unreachable",
    stages: () =>
      happyStages({
        readSite: vi.fn(async () => ({ kind: "blocked" as const, reason: "timeout" as const })),
        searchBrief: vi.fn(async () => ({ ok: false as const, reason: "no_company" as const, usage: [] })),
      }),
    negative: true,
    refund: false,
  },
  {
    code: "not_enough_info",
    stages: () =>
      happyStages({
        readSite: vi.fn(async () => ({ kind: "pages" as const, pages: [page("/", "Acme")], finalUrl: "https://acme.com/", thin: true })),
        searchBrief: vi.fn(async () => ({ ok: false as const, reason: "too_short" as const, usage: [] })),
      }),
    negative: true,
    refund: false,
  },
  {
    code: "not_a_company",
    stages: () => happyStages({ readSite: vi.fn(async () => ({ kind: "parked" as const, finalUrl: "https://acme.com/" })) }),
    negative: true,
    refund: false,
  },
  {
    code: "not_a_company",
    stages: () =>
      happyStages({
        extractProfile: vi.fn(async () => ({ profile: profile({ fit: "not_a_company" }), usage: usage(MODELS.research) })),
      }),
    negative: true,
    refund: false,
  },
  {
    code: "unsafe",
    stages: () =>
      happyStages({
        extractProfile: vi.fn(async () => ({
          profile: profile({ flags: { adultOrIllegal: true, injectionAttempt: false } }),
          usage: usage(MODELS.research),
        })),
      }),
    negative: true,
    refund: false,
  },
  {
    code: "declined",
    stages: () =>
      happyStages({
        draftBlueprint: vi.fn(async () => {
          throw new ModelOutputError("refusal", usage(MODELS.blueprint, 100, 10));
        }),
      }),
    negative: true,
    refund: false,
  },
  {
    code: "quality",
    stages: () =>
      happyStages({
        draftBlueprint: vi.fn(async () => {
          const bp = mockBlueprint("acme.com");
          return { blueprint: { ...bp, agents: bp.agents.slice(0, 1) }, usage: usage(MODELS.blueprint), text: "{}" };
        }),
      }),
    negative: false,
    refund: true,
  },
  {
    code: "upstream",
    stages: () =>
      happyStages({
        extractProfile: vi.fn(async () => {
          throw new RunError("upstream");
        }),
      }),
    negative: false,
    refund: true,
  },
  {
    code: "internal",
    stages: () =>
      happyStages({
        draftBlueprint: vi.fn(async () => {
          throw new Error("boom");
        }),
      }),
    negative: false,
    refund: true,
  },
  {
    code: "blocked_host",
    stages: () => happyStages({ readSite: vi.fn(async () => ({ kind: "private" as const })) }),
    negative: false,
    refund: false,
  },
];

describe("runPipeline failures", () => {
  it.each(failureCases.map((c, i) => [`${c.code} #${i}`, c] as const))("%s", async (_name, c) => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { outcome, events } = await run(c.stages());
    errSpy.mockRestore();
    expect(outcome).toMatchObject({ ok: false, code: c.code });
    const term = terminals(events);
    expect(term).toHaveLength(1);
    expect(term[0]).toMatchObject({ t: "error", code: c.code });
    expect(events[events.length - 1]).toBe(term[0]);
    expect(await store.get(keys.lock(HOST))).toBeNull();
    expect(await store.get(keys.domain(HOST))).toBeNull();
    // The reservation is replaced by the actual spend, never left open.
    expect(await budget()).toBeLessThan(150_000);
    expect(await store.get(keys.negative(HOST))).toBe(c.negative ? c.code : null);
    expect(await visitorCount()).toBe(c.refund ? 0 : 1);
    expect(await dayCount()).toBe(c.refundDay ? 0 : 1);
  });

  it("does not retry the design when too little time remains", async () => {
    const draft = vi.fn(async () => {
      const bp = mockBlueprint("acme.com");
      return { blueprint: { ...bp, agents: bp.agents.slice(0, 1) }, usage: usage(MODELS.blueprint), text: "{}" };
    });
    const { outcome } = await run(happyStages({ draftBlueprint: draft }), { minMsForDesignRetry: 120_000 });
    expect(outcome).toMatchObject({ ok: false, code: "quality" });
    expect(draft).toHaveBeenCalledTimes(1);
  });

  it("ends with timeout at the overall deadline, even if a stage ignores the signal", async () => {
    const stages = happyStages({ draftBlueprint: vi.fn(() => new Promise<never>(() => undefined)) });
    const { outcome, events } = await run(stages, { deadlineMs: 80 });
    expect(outcome).toMatchObject({ ok: false, code: "timeout" });
    expect(terminals(events)).toHaveLength(1);
    expect(await store.get(keys.lock(HOST))).toBeNull();
    expect(await visitorCount()).toBe(0);
  });

  it("a late stage cannot save after the deadline", async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((r) => (release = r));
    const stages = happyStages({
      draftBlueprint: vi.fn(async () => {
        await gate;
        const bp = mockBlueprint("acme.com");
        return { blueprint: bp, usage: usage(MODELS.blueprint), text: "{}" };
      }),
    });
    const { outcome, emitter } = await run(stages, { deadlineMs: 50 });
    expect(outcome).toMatchObject({ code: "timeout" });
    release();
    await new Promise((r) => setTimeout(r, 20));
    expect(await store.get(keys.domain(HOST))).toBeNull();
    expect(emitter.events.filter((e) => e.t === "done")).toHaveLength(0);
  });

  it("maps a store failure while saving to internal after retries", async () => {
    const setSpy = vi.spyOn(store, "set").mockRejectedValue(new Error("down"));
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { outcome } = await run(happyStages());
    errSpy.mockRestore();
    expect(outcome).toMatchObject({ ok: false, code: "internal" });
    expect(setSpy.mock.calls.filter(([k]) => String(k).startsWith("bp:"))).toHaveLength(3);
  });
});
