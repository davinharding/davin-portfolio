// Server-only. Client construction, usage accounting, and SDK error mapping.
import Anthropic, {
  APIConnectionError,
  APIUserAbortError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  PermissionDeniedError,
  RateLimitError,
  APIError,
} from "@anthropic-ai/sdk";
import { priceFor, WEB_SEARCH_USD } from "./config";
import { RunError, type ErrorCode } from "./errors";

let client: Anthropic | undefined;

/** One shared client; `new Anthropic()` reads ANTHROPIC_API_KEY. */
export function getAnthropic(): Anthropic {
  client ??= new Anthropic();
  return client;
}

/** The subset of the SDK's Usage object we account for. */
export type UsageLike = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  server_tool_use?: { web_search_requests?: number | null } | null;
};

export type UsageRecord = {
  model: string;
  input: number;
  output: number;
  webSearches: number;
};

/** Cache reads and writes are counted at the plain input rate so the estimate errs high. */
export function toUsageRecord(model: string, usage: UsageLike | null | undefined): UsageRecord {
  const u = usage ?? {};
  return {
    model,
    input:
      (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0),
    output: u.output_tokens ?? 0,
    webSearches: u.server_tool_use?.web_search_requests ?? 0,
  };
}

export function costUsd(records: UsageRecord[]): number {
  let usd = 0;
  for (const r of records) {
    const price = priceFor(r.model);
    usd += (r.input * price.input + r.output * price.output) / 1_000_000;
    usd += r.webSearches * WEB_SEARCH_USD;
  }
  return usd;
}

export function totals(records: UsageRecord[]) {
  return records.reduce(
    (acc, r) => ({
      input: acc.input + r.input,
      output: acc.output + r.output,
      webSearches: acc.webSearches + r.webSearches,
    }),
    { input: 0, output: 0, webSearches: 0 }
  );
}

/** Thrown by a stage when the model returned an unusable response. */
export class ModelOutputError extends Error {
  constructor(
    readonly reason: "refusal" | "max_tokens" | "parse" | "empty",
    readonly usage: UsageRecord | null
  ) {
    super(`Model output unusable: ${reason}`);
    this.name = "ModelOutputError";
  }
}

/**
 * Maps any error thrown during a run to a visitor-facing code. Most specific
 * class first: several SDK classes inherit from each other.
 */
export function mapRunError(err: unknown, deadlineHit: boolean): ErrorCode {
  if (err instanceof RunError) return err.code;
  if (deadlineHit) return "timeout";
  if (err instanceof APIUserAbortError) return "timeout";
  if (err instanceof AuthenticationError || err instanceof PermissionDeniedError) {
    console.error("[thirty] Anthropic rejected our credentials; live runs need attention");
    return "live_disabled";
  }
  if (err instanceof RateLimitError) return "upstream";
  if (err instanceof InternalServerError) return "upstream"; // includes 529 overloaded
  if (err instanceof APIConnectionError) return "upstream"; // includes connection timeouts
  if (err instanceof BadRequestError) {
    console.error("[thirty] Anthropic rejected the request shape:", err.message);
    return "internal";
  }
  if (err instanceof APIError) {
    if (err.status === 529 || (err.status ?? 0) >= 500) return "upstream";
    console.error("[thirty] Anthropic API error", err.status, err.message);
    return "internal";
  }
  if (err instanceof ModelOutputError) {
    return err.reason === "refusal" ? "declined" : "internal";
  }
  const name = (err as { name?: string })?.name;
  if (name === "AbortError" || name === "TimeoutError") return "timeout";
  return "internal";
}
