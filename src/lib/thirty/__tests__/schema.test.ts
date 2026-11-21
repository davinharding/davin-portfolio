import { describe, expect, it } from "vitest";
import { getExample } from "../examples";
import { mockBlueprint } from "../mock";
import { migrate, ModelBlueprintSchema, NormalizedBlueprintSchema, parseStoredBlueprint } from "../schema";

const example = getExample("example-linear")!;

describe("stored blueprint parsing", () => {
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

describe("agent value case", () => {
  const agentShape = ModelBlueprintSchema.shape.agents.element.shape;

  it("asks the model for the payoff before the details, with role right after name", () => {
    expect(Object.keys(agentShape)).toEqual([
      "name",
      "role",
      "value",
      "impact",
      "trigger",
      "does",
      "tools",
      "humanGate",
      "evidence",
      "relatedProject",
    ]);
  });

  it("requires value from the model", () => {
    const { value: _value, ...legacy } = mockBlueprint("acme.test").agents[0];
    void _value;
    const bp = { ...mockBlueprint("acme.test"), agents: [legacy] };
    expect(ModelBlueprintSchema.safeParse(bp).success).toBe(false);
    expect(ModelBlueprintSchema.safeParse(mockBlueprint("acme.test")).success).toBe(true);
  });

  it("rejects an unknown value kind from the model", () => {
    const bp = mockBlueprint("acme.test");
    (bp.agents[0].value as { kind: string }).kind = "vibes";
    expect(ModelBlueprintSchema.safeParse(bp).success).toBe(false);
  });

  it("keeps value optional in the stored shape, so older blueprints still parse", () => {
    const { value: _value, ...legacy } = mockBlueprint("acme.test").agents[0];
    void _value;
    const bp = { ...mockBlueprint("acme.test"), agents: [legacy] };
    expect(NormalizedBlueprintSchema.safeParse(bp).success).toBe(true);
    expect(NormalizedBlueprintSchema.safeParse(mockBlueprint("acme.test")).success).toBe(true);
  });

  it("parses a stored blueprint whose agents carry a value case", () => {
    const stored = { ...example, blueprint: { ...example.blueprint, agents: mockBlueprint("acme.test").agents } };
    expect(parseStoredBlueprint(JSON.parse(JSON.stringify(stored))).blueprint.agents[0].value?.kind).toBe("grows_revenue");
  });
});
