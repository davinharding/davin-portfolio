// Server-only. Reads the environment on every call so tests (and a Vercel env
// change picked up by a fresh function instance) see current values.

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

const EFFORTS: readonly Effort[] = ["low", "medium", "high", "xhigh", "max"];

export const DEFAULT_MODEL_RESEARCH = "claude-haiku-5-5";
export const DEFAULT_MODEL_BLUEPRINT = "claude-sonnet-5-5";
export const DEFAULT_USER_AGENT = "Mozilla/5.0 (compatible; BlueprintBot/1.0)";

/** USD per million tokens. */
export const PRICES: Record<string, { input: number; output: number }> = {
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
  "claude-sonnet-5-5": { input: 2.0, output: 10.0 },
  "claude-opus-5-5": { input: 4.0, output: 20.0 },
};
/** Unknown models are priced at the most expensive known rate so estimates err high. */
const FALLBACK_PRICE = PRICES["claude-opus-5-5"];
export const WEB_SEARCH_USD = 0.01;

/** Budget reservation taken at run start, in micro-dollars ($0.15). */
export const RESERVE_MICROS = 150_000;

export const LIMITS = {
  overallDeadlineMs: 60_000,
  readStageMs: 10_000,
  homepageTimeoutMs: 8_000,
  subpageTimeoutMs: 5_000,
  researchTimeoutMs: 15_000,
  searchStageMs: 20_000,
  designStageMs: 35_000,
  minMsForDesignRetry: 20_000,
  checkStageMs: 2_000,
  maxBodyBytes: 1_500_000,
  maxRedirects: 4,
  maxPages: 4,
  pageCharCap: 12_000,
  bundleCharCap: 30_000,
  minUsableChars: 600,
  minBriefChars: 400,
  lockTtlSec: 100,
  lockPollMs: 1_500,
  lockWaitMs: 60_000,
  floodPerMinute: 10,
  domTtlSec: 604_800,
  negTtlSec: 86_400,
  storeTimeoutMs: 3_000,
  requestBodyMaxBytes: 4_096,
} as const;

export function priceFor(model: string): { input: number; output: number } {
  return PRICES[model] ?? FALLBACK_PRICE;
}

function readNumber(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function readString(raw: string | undefined, fallback: string): string {
  const v = raw?.trim();
  return v ? v : fallback;
}

export function isProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export function isMockMode(): boolean {
  return process.env.THIRTY_MOCK === "1" && !isProduction();
}

export function hasRedisEnv(): boolean {
  const e = process.env;
  return Boolean(
    (e.KV_REST_API_URL && e.KV_REST_API_TOKEN) ||
      (e.UPSTASH_REDIS_REST_URL && e.UPSTASH_REDIS_REST_TOKEN)
  );
}

/** A store exists when Redis is configured, or outside production (in-memory). */
export function hasStore(): boolean {
  return hasRedisEnv() || !isProduction();
}

export function getConfig() {
  const e = process.env;
  const effortRaw = readString(e.THIRTY_EFFORT_BLUEPRINT, "low") as Effort;
  return {
    modelResearch: readString(e.THIRTY_MODEL_RESEARCH, DEFAULT_MODEL_RESEARCH),
    modelBlueprint: readString(e.THIRTY_MODEL_BLUEPRINT, DEFAULT_MODEL_BLUEPRINT),
    effortBlueprint: EFFORTS.includes(effortRaw) ? effortRaw : ("low" as Effort),
    monthlyBudgetUsd: readNumber(e.THIRTY_MONTHLY_BUDGET_USD, 10, 0, 500),
    dailyRuns: Math.floor(readNumber(e.THIRTY_DAILY_RUNS, 40, 0, 1000)),
    ipDailyRuns: Math.floor(readNumber(e.THIRTY_IP_DAILY_RUNS, 3, 0, 1000)),
    userAgent: readString(e.THIRTY_USER_AGENT, DEFAULT_USER_AGENT),
    ipSalt: e.THIRTY_IP_SALT ?? "",
    mockMs: Math.floor(readNumber(e.THIRTY_MOCK_MS, 6000, 0, 120_000)),
  };
}

export type ThirtyConfig = ReturnType<typeof getConfig>;

/**
 * Whether a fresh run may start. Availability is decided per request so the
 * kill switch works without a redeploy. Mock mode needs no API key.
 */
export function isLiveEnabled(): boolean {
  const e = process.env;
  if ((e.THIRTY_LIVE ?? "on").trim().toLowerCase() === "off") return false;
  const cfg = getConfig();
  if (cfg.monthlyBudgetUsd <= 0) return false;
  if (!isMockMode() && !e.ANTHROPIC_API_KEY) return false;
  if (!hasStore()) return false;
  if (isProduction() && !cfg.ipSalt) return false;
  return true;
}
