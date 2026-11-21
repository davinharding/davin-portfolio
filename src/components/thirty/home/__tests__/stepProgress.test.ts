import { describe, expect, it } from "vitest";
import { STEP_ORDER } from "@/lib/thirty/events";
import { EXPECTED_STEP_MS, SHORT_STEP_LABEL, stepFill } from "../stepProgress";

describe("stepFill", () => {
  it("is empty before a step starts and for a skipped step", () => {
    expect(stepFill("pending", 0, 5000)).toBe(0);
    expect(stepFill("pending", 9000, 5000)).toBe(0);
    expect(stepFill("skipped", 3000, 5000)).toBe(0);
  });

  it("fills in proportion while the step is active", () => {
    expect(stepFill("active", 0, 5000)).toBe(0);
    expect(stepFill("active", 2500, 5000)).toBe(0.5);
  });

  it("holds at 90% when a step runs past its usual length", () => {
    expect(stepFill("active", 5000, 5000)).toBe(0.9);
    expect(stepFill("active", 60_000, 5000)).toBe(0.9);
  });

  it("is full once the step is done or has failed", () => {
    expect(stepFill("done", 10, 5000)).toBe(1);
    expect(stepFill("failed", 10, 5000)).toBe(1);
  });

  it("never returns a value outside 0 to 1", () => {
    for (const ms of [-500, Number.NaN, Number.POSITIVE_INFINITY]) {
      const fill = stepFill("active", ms, 5000);
      expect(fill).toBeGreaterThanOrEqual(0);
      expect(fill).toBeLessThanOrEqual(1);
    }
    expect(stepFill("active", 100, 0)).toBe(0);
  });

  it("has a length and a label for every step", () => {
    for (const id of STEP_ORDER) {
      expect(EXPECTED_STEP_MS[id]).toBeGreaterThan(0);
      expect(SHORT_STEP_LABEL[id]).toBeTruthy();
    }
  });
});
