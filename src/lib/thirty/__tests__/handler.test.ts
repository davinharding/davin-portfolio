import { beforeEach, describe, expect, it, vi } from "vitest";
import { getConfig } from "../config";
import type { RunEvent } from "../events";
import { createBlueprintHandler, methodNotAllowed, type HandlerDeps } from "../handler";
import { MOCK_MODELS, mockStages } from "../mock";
import { runPipeline } from "../pipeline";
import { keys, MemoryStore, StoreError, type Store } from "../store";

let store: MemoryStore;
let pending: Promise<unknown>[];
let startRun: ReturnType<typeof vi.fn>;
let reported: Array<Parameters<HandlerDeps["report"]>[0]>;

function makeDeps(overrides: Partial<HandlerDeps> = {}, cfg: Partial<ReturnType<typeof getConfig>> = {}): HandlerDeps {
  return {
    getStore: () => store,
    isLiveEnabled: () => true,
    isMockMode: () => true,
    isProduction: () => false,
    config: () => ({ ...getConfig(), ipSalt: "salt", ...cfg }),
    startRun: startRun as unknown as HandlerDeps["startRun"],
    keepAlive: (p) => pending.push(p),
    report: async (e) => {
      reported.push(e);
      return true;
    },
    now: Date.now,
    sleep: (ms) => new Promise((r) => setTimeout(r, Math.min(ms, 5))),
    lockPollMs: 5,
    lockWaitMs: 2000,
    ...overrides,
  };
}

beforeEach(() => {
  store = new MemoryStore();
  pending = [];
  reported = [];
  startRun = vi.fn((ctx, emitter, s: Store) =>
    runPipeline(ctx, {
      store: s,
      stages: mockStages(ctx.host, 30),
      models: MOCK_MODELS,
      emitter,
      log: () => undefined,
      report: async (e) => {
        reported.push(e);
        return true;
      },
    })
  );
});

type ReqInit = { ip?: string; headers?: Record<string, string>; query?: string };

function jsonReq(body: unknown, init: ReqInit = {}) {
  return new Request(`http://localhost:3100/api/blueprint${init.query ?? ""}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "localhost:3100",
      "x-forwarded-for": init.ip ?? "1.2.3.4",
      ...init.headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function formReq(fields: Record<string, string>, init: ReqInit = {}) {
  return new Request("http://localhost:3100/api/blueprint", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      host: "localhost:3100",
      "sec-fetch-site": "same-origin",
      "x-forwarded-for": init.ip ?? "1.2.3.4",
      ...init.headers,
    },
    body: new URLSearchParams(fields).toString(),
  });
}

async function events(res: Response): Promise<RunEvent[]> {
  const text = await res.text();
  return text
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as RunEvent);
}

async function errorOf(res: Response) {
  return ((await res.json()) as { error: { code: string; message: string; retryAfterSec?: number } }).error;
}

describe("method and body checks", () => {
  it("returns 405 with Allow for other methods", () => {
    const res = methodNotAllowed();
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
  });

  it.each([
    ["unparseable JSON", jsonReq("{nope")],
    ["missing url", jsonReq({})],
    ["non-string url", jsonReq({ url: 5 })],
    ["oversize body", jsonReq({ url: "acme.com", pad: "x".repeat(5000) })],
    ["cross-site fetch", jsonReq({ url: "acme.com" }, { headers: { "sec-fetch-site": "cross-site" } })],
    ["foreign origin", jsonReq({ url: "acme.com" }, { headers: { origin: "https://evil.example" } })],
    ["honeypot", jsonReq({ url: "acme.com", website_confirm: "bot" })],
  ])("rejects %s as bad_request", async (_name, req) => {
    const res = await createBlueprintHandler(makeDeps())(req);
    expect(res.status).toBe(400);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect((await errorOf(res)).code).toBe("bad_request");
    expect(startRun).not.toHaveBeenCalled();
  });

  it("accepts a same-origin Origin header", async () => {
    const res = await createBlueprintHandler(makeDeps())(
      jsonReq({ url: "acme.test" }, { headers: { origin: "http://localhost:3100", "sec-fetch-site": "same-origin" } })
    );
    expect(res.status).toBe(200);
  });
});

describe("input and cheap checks", () => {
  it("returns validation errors as JSON, and as a redirect for form posts", async () => {
    const handle = createBlueprintHandler(makeDeps());
    const json = await handle(jsonReq({ url: "linkedin.com/company/acme" }));
    expect(json.status).toBe(400);
    expect((await errorOf(json)).code).toBe("platform_url");

    const form = await handle(formReq({ url: "http://127.0.0.1" }));
    expect(form.status).toBe(303);
    expect(form.headers.get("location")).toBe("/sorry/blocked-host");
  });

  it("refuses this site's own host", async () => {
    const res = await createBlueprintHandler(makeDeps())(
      jsonReq({ url: "https://www.preview-site.com/" }, { headers: { host: "preview-site.com" } })
    );
    expect((await errorOf(res)).code).toBe("self_url");
  });

  it("flood-guards more than ten requests a minute", async () => {
    const handle = createBlueprintHandler(makeDeps());
    for (let i = 0; i < 10; i++) await handle(jsonReq({ url: "nope" }));
    const res = await handle(jsonReq({ url: "nope" }));
    expect(res.status).toBe(429);
    const err = await errorOf(res);
    expect(err.code).toBe("too_fast");
    expect(err.retryAfterSec).toBeGreaterThan(0);
  });

  it("returns live_disabled when live runs are off", async () => {
    const res = await createBlueprintHandler(makeDeps({ isLiveEnabled: () => false }))(jsonReq({ url: "acme.test" }));
    expect(res.status).toBe(503);
    expect((await errorOf(res)).code).toBe("live_disabled");
  });

  it("fails closed with unavailable when the store errors", async () => {
    const broken = new MemoryStore();
    broken.incr = async () => {
      throw new StoreError("down");
    };
    const quiet = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const res = await createBlueprintHandler(makeDeps({ getStore: () => broken }))(jsonReq({ url: "acme.test" }));
    quiet.mockRestore();
    expect(res.status).toBe(503);
    expect((await errorOf(res)).code).toBe("unavailable");
  });
});

describe("runs", () => {
  it("streams a run as NDJSON ending in done, then serves the cache without a run", async () => {
    const handle = createBlueprintHandler(makeDeps());
    const res = await handle(jsonReq({ url: "acme.test" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/x-ndjson; charset=utf-8");
    expect(res.headers.get("cache-control")).toBe("no-store, no-transform");
    expect(res.headers.get("x-accel-buffering")).toBe("no");
    const evs = await events(res);
    expect(evs[0]).toMatchObject({ t: "step", id: "validate" });
    const last = evs[evs.length - 1];
    expect(last.t).toBe("done");
    expect(pending).toHaveLength(1);
    await Promise.all(pending);

    const again = await handle(jsonReq({ url: "https://www.acme.test/" }));
    const cached = await events(again);
    expect(cached.map((e) => e.t)).toEqual(["cached", "done"]);
    expect(startRun).toHaveBeenCalledTimes(1);
    const counts = [...(store as unknown as { map: Map<string, { value: string }> }).map.entries()]
      .filter(([k]) => k.startsWith("rl:d:"))
      .map(([, v]) => v.value);
    expect(counts).toEqual(["1"]);
  });

  it("attributes runs and cache hits to the browser's PostHog ids, ignoring junk ids", async () => {
    const handle = createBlueprintHandler(makeDeps());
    const run = await handle(jsonReq({ url: "acme.test", ph_id: "019a-browser", ph_session: "019a-session" }));
    await events(run);
    await Promise.all(pending);
    expect(reported.find((e) => e.event === "blueprint_run")).toMatchObject({
      distinctId: "019a-browser",
      sessionId: "019a-session",
      properties: { outcome: "done", host: "acme.test" },
    });

    const hit = await handle(jsonReq({ url: "acme.test", ph_id: "<script>alert(1)</script>", ph_session: 7 }));
    await events(hit);
    await Promise.all(pending);
    const cacheHit = reported.find((e) => e.event === "blueprint_cache_hit");
    expect(cacheHit).toMatchObject({ properties: { host: "acme.test", form: false } });
    expect(cacheHit?.distinctId).toMatch(/^visitor:[0-9a-f]{32}$/);
    expect(cacheHit?.sessionId).toBeUndefined();
  });

  it("adds the visitor's homepage design to run and cache-hit events, and drops a tampered cookie", async () => {
    const handle = createBlueprintHandler(makeDeps());
    const cookie = { cookie: "other=1; dh_home=drafting-table.ab; dh_id=abc" };
    await events(await handle(jsonReq({ url: "acme.test" }, { headers: cookie })));
    await Promise.all(pending);
    expect(reported.find((e) => e.event === "blueprint_run")?.properties).toMatchObject({
      home_variant: "drafting-table",
      home_variant_source: "ab",
      "$feature/home-design": "drafting-table",
      outcome: "done",
    });

    await events(await handle(jsonReq({ url: "acme.test" }, { headers: { cookie: "dh_home=open-roles.qa" } })));
    await Promise.all(pending);
    const hit = reported.find((e) => e.event === "blueprint_cache_hit")?.properties;
    expect(hit).toMatchObject({ home_variant: "open-roles", home_variant_source: "qa", host: "acme.test" });
    expect(hit).not.toHaveProperty("$feature/home-design");

    reported.length = 0;
    await events(await handle(jsonReq({ url: "acme.test" }, { headers: { cookie: "dh_home=<script>.ab" } })));
    await Promise.all(pending);
    expect(reported[0]?.properties).not.toHaveProperty("home_variant");
  });

  it("form posts fall back to the salted visitor hash for analytics", async () => {
    await createBlueprintHandler(makeDeps())(formReq({ url: "acme.test" }));
    const run = reported.find((e) => e.event === "blueprint_run");
    expect(run?.distinctId).toMatch(/^visitor:[0-9a-f]{32}$/);
    expect(JSON.stringify(run)).not.toContain("1.2.3.4");
  });

  it("form posts wait for the run and redirect to the blueprint", async () => {
    const res = await createBlueprintHandler(makeDeps())(formReq({ url: "acme.test" }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toMatch(/^\/b\/acme-test-[a-z2-7]{8}$/);
  });

  it("form posts redirect to /sorry for a run failure", async () => {
    const res = await createBlueprintHandler(makeDeps())(formReq({ url: "not-a-company.test" }));
    expect(res.headers.get("location")).toBe("/sorry/not-a-company");
  });

  it("serves a negative-cache hit without a run", async () => {
    const handle = createBlueprintHandler(makeDeps());
    const first = await events(await handle(jsonReq({ url: "not-a-company.test" })));
    expect(first[first.length - 1]).toMatchObject({ t: "error", code: "not_a_company" });
    await Promise.all(pending);
    const second = await handle(jsonReq({ url: "not-a-company.test" }));
    expect(second.status).toBe(422);
    expect(await errorOf(second)).toMatchObject({ code: "not_a_company", message: expect.stringContaining("not-a-company.test") });
    expect(startRun).toHaveBeenCalledTimes(1);
  });

  it("limits a visitor to three fresh runs, and cache hits still work after that", async () => {
    const handle = createBlueprintHandler(makeDeps());
    for (const host of ["a.test", "b.test", "c.test"]) {
      await events(await handle(jsonReq({ url: host })));
    }
    await Promise.all(pending);
    const fourth = await handle(jsonReq({ url: "d.test" }));
    expect(fourth.status).toBe(429);
    const err = await errorOf(fourth);
    expect(err.code).toBe("rate_limited");
    expect(err.retryAfterSec).toBeGreaterThan(0);
    const cached = await events(await handle(jsonReq({ url: "a.test" })));
    expect(cached.map((e) => e.t)).toEqual(["cached", "done"]);
    const other = await handle(jsonReq({ url: "d.test" }, { ip: "9.9.9.9" }));
    expect(other.status).toBe(200);
  });

  it("refunds the visitor when the run fails for reasons not theirs", async () => {
    const handle = createBlueprintHandler(makeDeps({}, { ipDailyRuns: 1 }));
    await events(await handle(jsonReq({ url: "upstream.test" })));
    await Promise.all(pending);
    const next = await handle(jsonReq({ url: "acme.test" }));
    expect(next.status).toBe(200);
  });

  it("returns capacity at the global daily cap and refunds the visitor", async () => {
    const handle = createBlueprintHandler(makeDeps({}, { dailyRuns: 1 }));
    await events(await handle(jsonReq({ url: "a.test" })));
    const res = await handle(jsonReq({ url: "b.test" }, { ip: "5.5.5.5" }));
    expect(res.status).toBe(503);
    expect((await errorOf(res)).code).toBe("capacity");
    const visitorKeys = [...(store as unknown as { map: Map<string, { value: string }> }).map.entries()].filter(([k]) =>
      k.startsWith("rl:d:")
    );
    expect(visitorKeys.map(([, v]) => v.value).sort()).toEqual(["0", "1"]);
  });

  it("returns capacity when the monthly budget cannot cover a reservation", async () => {
    const res = await createBlueprintHandler(makeDeps({}, { monthlyBudgetUsd: 0.1 }))(jsonReq({ url: "a.test" }));
    expect((await errorOf(res)).code).toBe("capacity");
  });

  it("drafts a host again when its cached blueprint predates the value case, and keeps the old page", async () => {
    const handle = createBlueprintHandler(makeDeps());
    await events(await handle(jsonReq({ url: "acme.test" })));
    await Promise.all(pending);
    const oldSlug = (await store.get(keys.domain("acme.test")))!;
    const current = JSON.parse((await store.get(keys.blueprint(oldSlug)))!);
    const legacy = {
      ...current,
      blueprint: {
        ...current.blueprint,
        agents: current.blueprint.agents.map(({ value: _value, ...a }: { value: unknown }) => a),
      },
    };
    await store.set(keys.blueprint(oldSlug), JSON.stringify(legacy));

    pending = [];
    const evs = await events(await handle(jsonReq({ url: "acme.test" }, { ip: "5.6.7.8" })));
    await Promise.all(pending);
    expect(evs.map((e) => e.t)).not.toContain("cached");
    expect(evs[evs.length - 1].t).toBe("done");
    expect(startRun).toHaveBeenCalledTimes(2);
    const newSlug = await store.get(keys.domain("acme.test"));
    expect(newSlug).not.toBe(oldSlug);
    expect(JSON.parse((await store.get(keys.blueprint(newSlug!)))!).blueprint.agents[0].value).toBeTruthy();
    expect(JSON.parse((await store.get(keys.blueprint(oldSlug)))!)).toEqual(legacy);

    const third = await events(await handle(jsonReq({ url: "acme.test" }, { ip: "9.9.9.9" })));
    expect(third.map((e) => e.t)).toEqual(["cached", "done"]);
  });

  it("waits on another run's lock, then resolves from its result without a second run", async () => {
    const handle = createBlueprintHandler(makeDeps());
    await store.set(keys.lock("acme.test"), "someone-else", { ex: 100 });
    const resP = handle(jsonReq({ url: "acme.test" }));
    setTimeout(async () => {
      const other = await createBlueprintHandler(makeDeps())(formReq({ url: "seed.test" }, { ip: "7.7.7.7" }));
      const slug = other.headers.get("location")!.replace("/b/", "");
      const bp = JSON.parse((await store.get(keys.blueprint(slug)))!);
      await store.set(keys.blueprint("acme-test-zzzzzzzz"), JSON.stringify({ ...bp, slug: "acme-test-zzzzzzzz" }));
      await store.set(keys.domain("acme.test"), "acme-test-zzzzzzzz");
    }, 10);
    const evs = await events(await resP);
    expect(evs[1]).toMatchObject({ t: "step", label: expect.stringContaining("already running") });
    expect(evs.slice(-2)).toEqual([
      expect.objectContaining({ t: "cached", slug: "acme-test-zzzzzzzz" }),
      { t: "done", slug: "acme-test-zzzzzzzz" },
    ]);
    expect(startRun).toHaveBeenCalledTimes(1);
    const budget = Number(await store.get(keys.budget(new Date().toISOString().slice(0, 7))));
    expect(budget).toBe(0);
  });

  it("drop.test closes the stream without a terminal event while the run still caches", async () => {
    const handle = createBlueprintHandler(makeDeps());
    const evs = await events(await handle(jsonReq({ url: "drop.test" })));
    expect(evs.some((e) => e.t === "done" || e.t === "error")).toBe(false);
    await Promise.all(pending);
    const again = await events(await handle(jsonReq({ url: "drop.test" })));
    expect(again.map((e) => e.t)).toEqual(["cached", "done"]);
  });

  it("?fresh=1 skips the caches outside production only", async () => {
    const handle = createBlueprintHandler(makeDeps());
    await events(await handle(jsonReq({ url: "acme.test" })));
    await Promise.all(pending);
    const fresh = await events(await handle(jsonReq({ url: "acme.test" }, { query: "?fresh=1" })));
    expect(fresh[0].t).toBe("step");
    await Promise.all(pending);

    const prod = createBlueprintHandler(makeDeps({ isProduction: () => true }));
    const cached = await events(await prod(jsonReq({ url: "acme.test" }, { query: "?fresh=1", ip: "8.8.4.4" })));
    expect(cached.map((e) => e.t)).toEqual(["cached", "done"]);
  });

  it.each([
    ["rate-limited.test", 429, "rate_limited"],
    ["capacity.test", 503, "capacity"],
    ["live-disabled.test", 503, "live_disabled"],
    ["unavailable.test", 503, "unavailable"],
  ])("mock host %s returns %s before a run", async (host, status, code) => {
    const res = await createBlueprintHandler(makeDeps())(jsonReq({ url: host }));
    expect(res.status).toBe(status);
    expect((await errorOf(res)).code).toBe(code);
    expect(startRun).not.toHaveBeenCalled();
  });

  it.each(["timeout", "quality", "unreachable", "upstream", "declined", "unsafe", "not-enough-info", "internal"])(
    "mock host %s.test ends with that error event",
    async (label) => {
      const quiet = vi.spyOn(console, "error").mockImplementation(() => undefined);
      const evs = await events(await createBlueprintHandler(makeDeps())(jsonReq({ url: `${label}.test` })));
      quiet.mockRestore();
      const last = evs[evs.length - 1];
      expect(last).toMatchObject({ t: "error", code: label.replace(/-/g, "_") });
      expect(evs.filter((e) => e.t === "error")).toHaveLength(1);
    }
  );

  it("refuses a run before taking quota or budget when it cannot be kept alive", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const noAfter = () => {
      throw new Error("after() called outside a request scope");
    };
    const res = await createBlueprintHandler(makeDeps({ keepAlive: noAfter }))(jsonReq({ url: "acme.test" }));
    quiet.mockRestore();
    expect(res.status).toBe(503);
    expect((await errorOf(res)).code).toBe("unavailable");
    expect(startRun).not.toHaveBeenCalled();
    const spent = [...(store as unknown as { map: Map<string, unknown> }).map.keys()].filter(
      (k) => k.startsWith("rl:d:") || k.startsWith("day:") || k.startsWith("budget:") || k.startsWith("lock:")
    );
    expect(spent).toEqual([]);
  });

  it("still serves a cache hit when the analytics event cannot be kept alive", async () => {
    const handle = createBlueprintHandler(makeDeps());
    await events(await handle(jsonReq({ url: "acme.test" })));
    await Promise.all(pending);
    const quiet = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const noAfter = () => {
      throw new Error("after() called outside a request scope");
    };
    const hit = await createBlueprintHandler(makeDeps({ keepAlive: noAfter }))(jsonReq({ url: "acme.test" }));
    quiet.mockRestore();
    expect((await events(hit)).map((e) => e.t)).toEqual(["cached", "done"]);
  });

  it("keeps the function alive until the run settles, and releases it on an early refusal", async () => {
    const handle = createBlueprintHandler(makeDeps({}, { ipDailyRuns: 1 }));
    await events(await handle(jsonReq({ url: "acme.test" })));
    expect(pending).toHaveLength(1);
    expect(await pending[0]).toMatchObject({ ok: true });

    const refused = await handle(jsonReq({ url: "other.test" }));
    expect(refused.status).toBe(429);
    expect(pending).toHaveLength(2);
    await expect(pending[1]).resolves.toBeUndefined();
  });

  it("fallback.test takes the search path", async () => {
    const evs = await events(await createBlueprintHandler(makeDeps())(jsonReq({ url: "fallback.test" })));
    expect(evs).toContainEqual(expect.objectContaining({ t: "note", text: expect.stringContaining("Searching the web") }));
    expect(evs[evs.length - 1].t).toBe("done");
  });
});
