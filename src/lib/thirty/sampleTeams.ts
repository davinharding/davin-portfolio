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
