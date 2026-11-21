import type { StepId } from "@/lib/thirty/events";
import type { ConsoleStepStatus } from "../runModel";

export const EXPECTED_STEP_MS: Record<StepId, number> = {
  validate: 1_000,
  read: 5_000,
  research: 5_000,
  design: 15_000,
  check: 3_000,
};

export const SHORT_STEP_LABEL: Record<StepId, string> = {
  validate: "Check",
  read: "Read",
  research: "Research",
  design: "Design",
  check: "Review",
};

const ACTIVE_CAP = 0.9;

export function stepFill(status: ConsoleStepStatus, msInStep: number, expectedMs: number): number {
  if (status === "done" || status === "failed") return 1;
  if (status !== "active" || expectedMs <= 0 || !Number.isFinite(msInStep)) return 0;
  return Math.max(0, Math.min(ACTIVE_CAP, msInStep / expectedMs));
}
