import { describe, expect, it } from "vitest";
import { monthSpendMicros, releaseBudget, reserveBudget, settleBudget } from "../budget";
import {
  acquireLock,
  checkFlood,
  clientIp,
  refundVisitorRun,
  releaseLock,
  secondsToUtcMidnight,
  takeGlobalRun,
  takeVisitorRun,
  utcDay,
  visitorId,
} from "../limits";
import { keys, MemoryStore } from "../store";

const at = (iso: string) => new Date(iso);

describe("visitor identity", () => {
  it("prefers Vercel's header, then x-real-ip, then x-forwarded-for", () => {
    expect(clientIp(new Headers({ "x-vercel-forwarded-for": "1.1.1.1", "x-real-ip": "2.2.2.2" }))).toBe("1.1.1.1");
    expect(clientIp(new Headers({ "x-real-ip": "2.2.2.2", "x-forwarded-for": "3.3.3.3" }))).toBe("2.2.2.2");
    expect(clientIp(new Headers({ "x-forwarded-for": "3.3.3.3, 4.4.4.4" }))).toBe("3.3.3.3");
    expect(clientIp(new Headers())).toBe("unknown");
  });

  it("hashes with the salt and never returns the IP", () => {
    const id = visitorId("1.2.3.4", "salt");
    expect(id).toMatch(/^[0-9a-f]{32}$/);
    expect(id).not.toContain("1.2.3.4");
    expect(visitorId("1.2.3.4", "other")).not.toBe(id);
  });
});

describe("limits", () => {
  it("allows ten requests a minute, then refuses", async () => {
    const store = new MemoryStore();
    const now = at("2026-11-11T10:00:30Z");
    for (let i = 0; i < 10; i++) expect(await checkFlood(store, "v", now)).toBe(true);
    expect(await checkFlood(store, "v", now)).toBe(false);
    expect(await checkFlood(store, "v", at("2026-11-11T10:01:00Z"))).toBe(true);
  });

  it("counts fresh runs atomically and gives back the over-limit increment", async () => {
    const store = new MemoryStore();
    const now = at("2026-11-11T22:00:00Z");
    for (let i = 0; i < 3; i++) expect((await takeVisitorRun(store, "v", now, 3)).ok).toBe(true);
    const fourth = await takeVisitorRun(store, "v", now, 3);
    expect(fourth).toEqual({ ok: false, retryAfterSec: 7200 });
    expect(await store.get(keys.visitorDay("v", "20261111"))).toBe("3");
  });

  it("refunds a run", async () => {
    const store = new MemoryStore();
    const now = at("2026-11-11T10:00:00Z");
    for (let i = 0; i < 3; i++) await takeVisitorRun(store, "v", now, 3);
    await refundVisitorRun(store, "v", utcDay(now));
    expect((await takeVisitorRun(store, "v", now, 3)).ok).toBe(true);
  });

  it("resets on the next UTC day", async () => {
    const store = new MemoryStore();
    for (let i = 0; i < 3; i++) await takeVisitorRun(store, "v", at("2026-11-11T23:59:00Z"), 3);
    expect((await takeVisitorRun(store, "v", at("2026-11-12T00:00:01Z"), 3)).ok).toBe(true);
  });

  it("caps global runs per day", async () => {
    const store = new MemoryStore();
    const now = at("2026-11-11T10:00:00Z");
    expect(await takeGlobalRun(store, now, 2)).toBe(true);
    expect(await takeGlobalRun(store, now, 2)).toBe(true);
    expect(await takeGlobalRun(store, now, 2)).toBe(false);
    expect(await store.get(keys.day("20261111"))).toBe("2");
  });

  it("computes seconds to UTC midnight", () => {
    expect(secondsToUtcMidnight(at("2026-11-11T23:59:30Z"))).toBe(30);
  });

  it("locks a host once and releases only for the holder", async () => {
    const store = new MemoryStore();
    expect(await acquireLock(store, "acme.com", "run-1")).toBe(true);
    expect(await acquireLock(store, "acme.com", "run-2")).toBe(false);
    await releaseLock(store, "acme.com", "run-2");
    expect(await store.get(keys.lock("acme.com"))).toBe("run-1");
    await releaseLock(store, "acme.com", "run-1");
    expect(await acquireLock(store, "acme.com", "run-2")).toBe(true);
  });

  it("lets a lock expire after 100 seconds", async () => {
    let t = 0;
    const store = new MemoryStore(new Map(), () => t);
    await acquireLock(store, "acme.com", "run-1");
    t = 99_000;
    expect(await acquireLock(store, "acme.com", "run-2")).toBe(false);
    t = 100_001;
    expect(await acquireLock(store, "acme.com", "run-2")).toBe(true);
  });
});

describe("budget", () => {
  const now = at("2026-11-11T10:00:00Z");

  it("reserves, then settles to the actual spend", async () => {
    const store = new MemoryStore();
    const r = await reserveBudget(store, now, 10);
    expect(r).toEqual({ monthKey: "2026-11", reservedMicros: 150_000 });
    expect(await monthSpendMicros(store, now)).toBe(150_000);
    await settleBudget(store, r!, 42_000);
    expect(await monthSpendMicros(store, now)).toBe(42_000);
  });

  it("settles upward when a run costs more than the reservation", async () => {
    const store = new MemoryStore();
    const r = await reserveBudget(store, now, 10);
    await settleBudget(store, r!, 200_000);
    expect(await monthSpendMicros(store, now)).toBe(200_000);
  });

  it("releases a reservation", async () => {
    const store = new MemoryStore();
    const r = await reserveBudget(store, now, 10);
    await releaseBudget(store, r!);
    expect(await monthSpendMicros(store, now)).toBe(0);
  });

  it("refuses and undoes a reservation that would pass the cap", async () => {
    const store = new MemoryStore();
    await store.set(keys.budget("2026-11"), String(9_900_000));
    expect(await reserveBudget(store, now, 10)).toBeNull();
    expect(await monthSpendMicros(store, now)).toBe(9_900_000);
  });

  it("starts fresh in a new month", async () => {
    const store = new MemoryStore();
    await store.set(keys.budget("2026-11"), String(10_000_000));
    expect(await reserveBudget(store, now, 10)).toBeNull();
    expect(await reserveBudget(store, at("2026-12-01T00:00:00Z"), 10)).toEqual({
      monthKey: "2026-12",
      reservedMicros: 150_000,
    });
  });

  it("treats a zero budget as no runs", async () => {
    expect(await reserveBudget(new MemoryStore(), now, 0)).toBeNull();
  });
});
