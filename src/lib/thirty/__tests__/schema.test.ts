import { describe, expect, it } from "vitest";
import { getExample } from "../examples";
import { parseStoredBlueprint, UnsupportedVersionError } from "../schema";

describe("stored blueprint parsing", () => {
  const example = getExample("example-linear")!;

  it("accepts a valid stored blueprint", () => {
    expect(parseStoredBlueprint(JSON.parse(JSON.stringify(example))).slug).toBe("example-linear");
  });

  it("names the version when a record is from another schema version", () => {
    expect(() => parseStoredBlueprint({ ...example, v: 2 })).toThrow(UnsupportedVersionError);
    expect(() => parseStoredBlueprint({ ...example, v: 2 })).toThrow(/version 2; this build reads v1/);
    const { v: _v, ...unversioned } = example;
    expect(() => parseStoredBlueprint(unversioned)).toThrow(/version undefined/);
  });

  it("rejects records that fail validation, so the page shows its error state", () => {
    expect(() => parseStoredBlueprint({ ...example, blueprint: { headline: 42 } })).toThrow();
    expect(() => parseStoredBlueprint({ ...example, v: 99 })).toThrow();
    expect(() => parseStoredBlueprint(null)).toThrow();
  });
});
