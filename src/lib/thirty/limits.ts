// Server-only. Visitor identity, flood guard, daily limits, and per-host locks.
import { createHash } from "node:crypto";
import { LIMITS } from "./config";
import { keys, type Store } from "./store";

const TWO_DAYS = 48 * 3600;

export function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10).replace(/-/g, "");
}

export function utcMonth(now: Date): string {
  return now.toISOString().slice(0, 7);
}

export function utcMinute(now: Date): string {
  return now.toISOString().slice(0, 16).replace(/[-:T]/g, "");
}

export function secondsToUtcMidnight(now: Date): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

/** The client IP from Vercel's headers; `unknown` when none is present. */
export function clientIp(headers: Headers): string {
  const vercel = headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return "unknown";
}

/** Salted hash; the raw IP is never stored or logged. */
export function visitorId(ip: string, salt: string): string {
  return createHash("sha256").update(salt + ip).digest("hex").slice(0, 32);
}

/** True when the visitor is within the per-minute request allowance. */
export async function checkFlood(store: Store, visitor: string, now: Date): Promise<boolean> {
  const key = keys.visitorMinute(visitor, utcMinute(now));
  const count = await store.incr(key);
  if (count === 1) await store.expire(key, 120);
  return count <= LIMITS.floodPerMinute;
}

async function takeCounted(store: Store, key: string, limit: number): Promise<boolean> {
  const count = await store.incr(key);
  if (count === 1) await store.expire(key, TWO_DAYS);
  if (count > limit) {
    await store.decr(key);
    return false;
  }
  return true;
}

export type TakeResult = { ok: true } | { ok: false; retryAfterSec: number };

export async function takeVisitorRun(
  store: Store,
  visitor: string,
  now: Date,
  limit: number
): Promise<TakeResult> {
  const ok = await takeCounted(store, keys.visitorDay(visitor, utcDay(now)), limit);
  return ok ? { ok: true } : { ok: false, retryAfterSec: secondsToUtcMidnight(now) };
}

export async function refundVisitorRun(store: Store, visitor: string, day: string): Promise<void> {
  await store.decr(keys.visitorDay(visitor, day));
}

export async function takeGlobalRun(store: Store, now: Date, cap: number): Promise<boolean> {
  return takeCounted(store, keys.day(utcDay(now)), cap);
}

export async function refundGlobalRun(store: Store, day: string): Promise<void> {
  await store.decr(keys.day(day));
}

export async function acquireLock(store: Store, host: string, runId: string): Promise<boolean> {
  return store.set(keys.lock(host), runId, { nx: true, ex: LIMITS.lockTtlSec });
}

/** Releases the lock only if this run still holds it. */
export async function releaseLock(store: Store, host: string, runId: string): Promise<void> {
  const holder = await store.get(keys.lock(host));
  if (holder === runId) await store.del(keys.lock(host));
}
