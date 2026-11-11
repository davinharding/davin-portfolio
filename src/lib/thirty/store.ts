// Server-only. One small key-value interface over Upstash Redis, with an
// in-memory implementation for local development and tests.
import { Redis } from "@upstash/redis";
import { hasRedisEnv, isProduction, LIMITS } from "./config";

export type SetOptions = { ex?: number; nx?: boolean };

export interface Store {
  get(key: string): Promise<string | null>;
  /** Returns false when `nx` is set and the key already exists. */
  set(key: string, value: string, opts?: SetOptions): Promise<boolean>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  incrby(key: string, by: number): Promise<number>;
  decr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
}

export class StoreError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "StoreError";
  }
}

type Entry = { value: string; expiresAt: number | null };

export class MemoryStore implements Store {
  constructor(
    private readonly map: Map<string, Entry> = new Map(),
    private readonly now: () => number = Date.now
  ) {}

  private live(key: string): Entry | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt !== null && entry.expiresAt <= this.now()) {
      this.map.delete(key);
      return undefined;
    }
    return entry;
  }

  async get(key: string) {
    return this.live(key)?.value ?? null;
  }

  async set(key: string, value: string, opts: SetOptions = {}) {
    if (opts.nx && this.live(key)) return false;
    this.map.set(key, {
      value,
      expiresAt: opts.ex ? this.now() + opts.ex * 1000 : null,
    });
    return true;
  }

  async del(key: string) {
    this.map.delete(key);
  }

  async incrby(key: string, by: number) {
    const entry = this.live(key);
    const next = (entry ? Number(entry.value) || 0 : 0) + by;
    this.map.set(key, { value: String(next), expiresAt: entry?.expiresAt ?? null });
    return next;
  }

  async incr(key: string) {
    return this.incrby(key, 1);
  }

  async decr(key: string) {
    return this.incrby(key, -1);
  }

  async expire(key: string, seconds: number) {
    const entry = this.live(key);
    if (entry) entry.expiresAt = this.now() + seconds * 1000;
  }

  /** Test helper. */
  clear() {
    this.map.clear();
  }
}

export class UpstashStore implements Store {
  constructor(private readonly redis: Redis) {}

  static fromEnv(): UpstashStore {
    const e = process.env;
    const url = e.KV_REST_API_URL && e.KV_REST_API_TOKEN ? e.KV_REST_API_URL : e.UPSTASH_REDIS_REST_URL;
    const token =
      e.KV_REST_API_URL && e.KV_REST_API_TOKEN ? e.KV_REST_API_TOKEN : e.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) throw new StoreError("Redis environment is not configured");
    // Values stay raw strings; we parse JSON ourselves.
    return new UpstashStore(new Redis({ url, token, automaticDeserialization: false }));
  }

  async get(key: string) {
    const v = await this.redis.get<string>(key);
    return v === null || v === undefined ? null : String(v);
  }

  async set(key: string, value: string, opts: SetOptions = {}) {
    let result: unknown;
    if (opts.ex && opts.nx) result = await this.redis.set(key, value, { ex: opts.ex, nx: true });
    else if (opts.ex) result = await this.redis.set(key, value, { ex: opts.ex });
    else if (opts.nx) result = await this.redis.set(key, value, { nx: true });
    else result = await this.redis.set(key, value);
    return result !== null;
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async incr(key: string) {
    return this.redis.incr(key);
  }

  async incrby(key: string, by: number) {
    return this.redis.incrby(key, by);
  }

  async decr(key: string) {
    return this.redis.decr(key);
  }

  async expire(key: string, seconds: number) {
    await this.redis.expire(key, seconds);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, op: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new StoreError(`Store ${op} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout])
    .catch((err: unknown) => {
      throw err instanceof StoreError ? err : new StoreError(`Store ${op} failed`, { cause: err });
    })
    .finally(() => clearTimeout(timer));
}

/** Wraps every call with a timeout and normalizes failures to StoreError. */
export class GuardedStore implements Store {
  constructor(
    private readonly inner: Store,
    private readonly timeoutMs: number = LIMITS.storeTimeoutMs
  ) {}
  get(key: string) {
    return withTimeout(this.inner.get(key), this.timeoutMs, "get");
  }
  set(key: string, value: string, opts?: SetOptions) {
    return withTimeout(this.inner.set(key, value, opts), this.timeoutMs, "set");
  }
  del(key: string) {
    return withTimeout(this.inner.del(key), this.timeoutMs, "del");
  }
  incr(key: string) {
    return withTimeout(this.inner.incr(key), this.timeoutMs, "incr");
  }
  incrby(key: string, by: number) {
    return withTimeout(this.inner.incrby(key, by), this.timeoutMs, "incrby");
  }
  decr(key: string) {
    return withTimeout(this.inner.decr(key), this.timeoutMs, "decr");
  }
  expire(key: string, seconds: number) {
    return withTimeout(this.inner.expire(key, seconds), this.timeoutMs, "expire");
  }
}

// Module state survives dev hot reloads and is shared between the API route
// and page renders in one server process.
const globalForStore = globalThis as unknown as {
  __thirtyMemoryMap?: Map<string, Entry>;
  __thirtyStore?: Store | null;
};

/**
 * Returns the configured store: Upstash when its env exists, the in-memory
 * store outside production, otherwise null (live runs are then disabled).
 */
export function getStore(): Store | null {
  if (globalForStore.__thirtyStore !== undefined) return globalForStore.__thirtyStore;
  let store: Store | null = null;
  if (hasRedisEnv()) store = new GuardedStore(UpstashStore.fromEnv());
  else if (!isProduction()) {
    globalForStore.__thirtyMemoryMap ??= new Map();
    store = new GuardedStore(new MemoryStore(globalForStore.__thirtyMemoryMap));
  }
  globalForStore.__thirtyStore = store;
  return store;
}

/** Test hook: replace (or reset with undefined) the process-wide store. */
export function setStoreForTesting(store: Store | null | undefined) {
  globalForStore.__thirtyStore = store;
}

export const keys = {
  blueprint: (slug: string) => `bp:${slug}`,
  domain: (host: string) => `dom:${host}`,
  negative: (host: string) => `neg:${host}`,
  lock: (host: string) => `lock:${host}`,
  visitorDay: (visitor: string, day: string) => `rl:d:${visitor}:${day}`,
  visitorMinute: (visitor: string, minute: string) => `rl:m:${visitor}:${minute}`,
  day: (day: string) => `day:${day}`,
  budget: (month: string) => `budget:${month}`,
};
