import { describe, expect, it } from "vitest";
import { getExample } from "../examples";
import { migrate, parseStoredBlueprint } from "../schema";

describe("stored blueprint parsing", () => {
  const example = getExample("example-linear")!;

  it("accepts a valid stored blueprint", () => {
    expect(parseStoredBlueprint(JSON.parse(JSON.stringify(example))).slug).toBe("example-linear");
  });

  it("passes v1 through migrate unchanged", () => {
    expect(migrate(example)).toEqual(example);
  });

  it("rejects records that fail validation, so the page shows its error state", () => {
    expect(() => parseStoredBlueprint({ ...example, blueprint: { headline: 42 } })).toThrow();
    expect(() => parseStoredBlueprint({ ...example, v: 99 })).toThrow();
    expect(() => parseStoredBlueprint(null)).toThrow();
  });
});
