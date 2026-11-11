import { afterEach, describe, expect, it, vi } from "vitest";
import { getConfig, isLiveEnabled, isMockMode, priceFor } from "../config";
import { GuardedStore, MemoryStore, StoreError, type Store } from "../store";

describe("MemoryStore", () => {
  it("supports NX and expiry", async () => {
    let t = 0;
    const s = new MemoryStore(new Map(), () => t);
    expect(await s.set("k", "a", { nx: true, ex: 10 })).toBe(true);
    expect(await s.set("k", "b", { nx: true })).toBe(false);
    expect(await s.get("k")).toBe("a");
    t = 10_001;
    expect(await s.get("k")).toBeNull();
  });

  it("increments and keeps an existing expiry", async () => {
    let t = 0;
    const s = new MemoryStore(new Map(), () => t);
    await s.incr("n");
    await s.expire("n", 5);
    expect(await s.incrby("n", 4)).toBe(5);
    expect(await s.decr("n")).toBe(4);
    t = 6000;
    expect(await s.get("n")).toBeNull();
  });
});

describe("GuardedStore", () => {
  it("times out slow calls with a StoreError", async () => {
    const slow = { get: () => new Promise<string | null>(() => undefined) } as unknown as Store;
    await expect(new GuardedStore(slow, 20).get("k")).rejects.toBeInstanceOf(StoreError);
  });

  it("wraps failures in StoreError", async () => {
    const failing = { get: async () => Promise.reject(new Error("net")) } as unknown as Store;
    await expect(new GuardedStore(failing, 1000).get("k")).rejects.toBeInstanceOf(StoreError);
  });
});

describe("config", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("parses numbers defensively and clamps them", () => {
    vi.stubEnv("THIRTY_MONTHLY_BUDGET_USD", "lots");
    vi.stubEnv("THIRTY_DAILY_RUNS", "999999");
    vi.stubEnv("THIRTY_IP_DAILY_RUNS", "-4");
    vi.stubEnv("THIRTY_EFFORT_BLUEPRINT", "turbo");
    const cfg = getConfig();
    expect(cfg.monthlyBudgetUsd).toBe(10);
    expect(cfg.dailyRuns).toBe(1000);
    expect(cfg.ipDailyRuns).toBe(0);
    expect(cfg.effortBlueprint).toBe("low");
    expect(cfg.modelResearch).toBe("claude-haiku-5-5");
    expect(cfg.modelBlueprint).toBe("claude-sonnet-5-5");
  });

  it("decides live availability per request", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key-not-real");
    vi.stubEnv("THIRTY_LIVE", "on");
    vi.stubEnv("THIRTY_MOCK", "");
    expect(isLiveEnabled()).toBe(true);
    vi.stubEnv("THIRTY_LIVE", "off");
    expect(isLiveEnabled()).toBe(false);
    vi.stubEnv("THIRTY_LIVE", "on");
    vi.stubEnv("THIRTY_MONTHLY_BUDGET_USD", "0");
    expect(isLiveEnabled()).toBe(false);
  });

  it("disables live runs in production without Redis or a salt, and ignores mock mode there", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key-not-real");
    vi.stubEnv("THIRTY_MOCK", "1");
    vi.stubEnv("KV_REST_API_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("THIRTY_IP_SALT", "salt");
    expect(isMockMode()).toBe(false);
    expect(isLiveEnabled()).toBe(false);
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "t");
    expect(isLiveEnabled()).toBe(true);
    vi.stubEnv("THIRTY_IP_SALT", "");
    expect(isLiveEnabled()).toBe(false);
  });

  it("prices unknown models at the Opus rate", () => {
    expect(priceFor("claude-unknown")).toEqual(priceFor("claude-opus-5-5"));
  });
});
