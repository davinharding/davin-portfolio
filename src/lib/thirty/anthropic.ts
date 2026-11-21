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

export function getAnthropic(): Anthropic {
  client ??= new Anthropic();
  return client;
}

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

export class ModelOutputError extends Error {
  constructor(
    readonly reason: "refusal" | "max_tokens" | "parse" | "empty",
    readonly usage: UsageRecord | null
  ) {
    super(`Model output unusable: ${reason}`);
    this.name = "ModelOutputError";
  }
}

export function mapRunError(err: unknown, deadlineHit: boolean): ErrorCode {
  if (err instanceof RunError) return err.code;
  if (deadlineHit) return "timeout";
  if (err instanceof APIUserAbortError) return "timeout";
  if (err instanceof AuthenticationError || err instanceof PermissionDeniedError) {
    console.error("[thirty] Anthropic rejected our credentials; live runs need attention");
    return "live_disabled";
  }
  if (err instanceof RateLimitError) return "upstream";
  if (err instanceof InternalServerError) return "upstream";
  if (err instanceof APIConnectionError) return "upstream";
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
