import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  assignVariant,
  EXPERIMENT_ARMS,
  formatHomeCookie,
  HOME_DESIGNS,
  homeEventProps,
  parseHomeCookie,
  readDesignMode,
  readHomeAssignment,
} from "../homeDesign";
import { POSTHOG_VECTORS } from "./posthogVectors";

function reference(id: string, flagKey = "home-design"): string {
  const hex = createHash("sha1").update(`${flagKey}.${id}variant`).digest("hex").slice(0, 15);
  const value = Number(BigInt(`0x${hex}`)) / Number(BigInt("0xfffffffffffffff"));
  return value < 0.5 ? "open-roles" : "drafting-table";
}

describe("assignVariant", () => {
  it("matches an independent implementation for 1,000 ids", async () => {
    for (let i = 0; i < 1000; i++) {
      const id = `0193f2a0-${i.toString(16).padStart(4, "0")}-7abc-8def-${(i * 7919).toString(16).padStart(12, "0")}`;
      expect(await assignVariant(id)).toBe(reference(id));
    }
  });

  it("matches what PostHog's flags endpoint returned for the same ids", async () => {
    expect(POSTHOG_VECTORS.pairs.length).toBeGreaterThanOrEqual(10);
    for (const [id, variant] of POSTHOG_VECTORS.pairs) {
      expect(await assignVariant(id, POSTHOG_VECTORS.flagKey)).toBe(variant);
    }
  });

  it("is stable for an id and splits close to 50/50", async () => {
    expect(await assignVariant("visitor-a")).toBe(await assignVariant("visitor-a"));
    const counts: Record<string, number> = {};
    for (let i = 0; i < 10_000; i++) {
      const arm = await assignVariant(`id-${i}`);
      counts[arm] = (counts[arm] ?? 0) + 1;
    }
    for (const arm of EXPERIMENT_ARMS) {
      expect(counts[arm.key]).toBeGreaterThan(4600);
      expect(counts[arm.key]).toBeLessThan(5400);
    }
  });

  it("keeps the arms summing to 100", () => {
    expect(EXPERIMENT_ARMS.reduce((sum, arm) => sum + arm.percent, 0)).toBe(100);
  });
});

describe("the dh_home cookie", () => {
  it("round-trips every design and source", () => {
    for (const design of HOME_DESIGNS) {
      for (const source of ["ab", "pin", "qa"] as const) {
        expect(parseHomeCookie(formatHomeCookie({ design, source }))).toEqual({ design, source });
      }
    }
  });

  it("rejects junk", () => {
    for (const raw of [undefined, null, 7, "", "open-roles", "open-roles.", "nope.ab", "open-roles.xx", "open-roles.ab.extra", "<script>.ab", "a".repeat(5000)]) {
      expect(parseHomeCookie(raw)).toBeNull();
    }
  });

  it("is read from a cookie string", () => {
    expect(readHomeAssignment("a=1; dh_home=drafting-table.qa; b=2")).toEqual({ design: "drafting-table", source: "qa" });
    expect(readHomeAssignment("dh_home=garbage")).toBeNull();
    expect(readHomeAssignment("")).toBeNull();
    expect(readHomeAssignment(null)).toBeNull();
  });
});

describe("homeEventProps", () => {
  it("adds the flag property only for the split", () => {
    expect(homeEventProps({ design: "open-roles", source: "ab" })).toEqual({
      home_variant: "open-roles",
      home_variant_source: "ab",
      "$feature/home-design": "open-roles",
    });
    for (const source of ["pin", "qa"] as const) {
      expect(homeEventProps({ design: "open-roles", source })).toEqual({
        home_variant: "open-roles",
        home_variant_source: source,
      });
    }
  });
});

describe("readDesignMode", () => {
  it("runs the split unless a design is named", () => {
    expect(readDesignMode(undefined)).toEqual({ mode: "ab", invalid: false });
    expect(readDesignMode("")).toEqual({ mode: "ab", invalid: false });
    expect(readDesignMode(" AB ")).toEqual({ mode: "ab", invalid: false });
    expect(readDesignMode("classic")).toEqual({ mode: "classic", invalid: false });
    expect(readDesignMode("Open-Roles")).toEqual({ mode: "open-roles", invalid: false });
  });

  it("treats anything else as the split and says so", () => {
    expect(readDesignMode("garbage")).toEqual({ mode: "ab", invalid: true });
  });
});
