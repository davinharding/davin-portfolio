// Server-only. The agent teams from the committed example blueprints, for the
// Open roles design's chart. Derived, so the homepage never drifts from the examples.
import { allExamples } from "./examples";

export type SampleTeam = {
  slug: string;
  company: string;
  agents: { name: string; gated: boolean }[];
};

export function sampleTeams(): SampleTeam[] {
  return allExamples().map((bp) => ({
    slug: bp.slug,
    company: bp.company.name,
    agents: bp.blueprint.agents.map((a) => ({ name: a.name, gated: a.humanGate.required })),
  }));
}
