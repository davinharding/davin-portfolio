// Client-safe: the NDJSON event contract between the API route and the launcher.
import type { ErrorCode } from "./errors";

export type StepId = "validate" | "read" | "research" | "design" | "check";

export type StepStatus = "start" | "done" | "skip" | "fail";

export type RunEvent =
  | { t: "step"; id: StepId; status: StepStatus; label: string; ms?: number }
  | { t: "page"; url: string; title: string }
  | { t: "company"; name: string; oneLiner: string }
  | { t: "note"; text: string }
  | { t: "agent"; name: string }
  | { t: "cached"; slug: string; createdAt: string }
  | { t: "done"; slug: string }
  | { t: "error"; code: ErrorCode; message: string; retryAfterSec?: number }
  | { t: "ping" };

export type TerminalEvent = Extract<RunEvent, { t: "done" } | { t: "error" }>;

export const STEP_ORDER: readonly StepId[] = ["validate", "read", "research", "design", "check"];

export function stepLabel(id: StepId, host: string): string {
  switch (id) {
    case "validate":
      return "Checking the address";
    case "read":
      return `Reading ${host}`;
    case "research":
      return "Working out what the company does";
    case "design":
      return "Designing the agent team";
    case "check":
      return "Checking the blueprint";
  }
}

export const LOCK_WAIT_LABEL = "Someone is already running this one. Waiting for it.";
export const FALLBACK_NOTE = "The site would not load for a bot. Searching the web instead.";
