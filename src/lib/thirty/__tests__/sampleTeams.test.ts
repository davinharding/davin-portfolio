import { describe, expect, it } from "vitest";
import { allExamples } from "../examples";
import { ARRAY_CAPS } from "../quality";
import { sampleTeams } from "../sampleTeams";

describe("sampleTeams", () => {
  it("has one team per committed example, in the same order", () => {
    expect(sampleTeams().map((t) => t.slug)).toEqual(allExamples().map((bp) => bp.slug));
  });

  it("carries each agent's name and whether a person approves its actions", () => {
    for (const [i, team] of sampleTeams().entries()) {
      const example = allExamples()[i];
      expect(team.company).toBe(example.company.name);
      expect(team.agents).toEqual(
        example.blueprint.agents.map((a) => ({ name: a.name, gated: a.humanGate.required }))
      );
      expect(team.agents.length).toBeGreaterThanOrEqual(1);
      expect(team.agents.length).toBeLessThanOrEqual(ARRAY_CAPS.agents);
    }
  });
});
