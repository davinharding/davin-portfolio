// Server-only. Committed example blueprints, served without touching Redis.
import allbirds from "@/data/blueprints/example-allbirds.json";
import linear from "@/data/blueprints/example-linear.json";
import sweetgreen from "@/data/blueprints/example-sweetgreen.json";
import { parseStoredBlueprint, type StoredBlueprint } from "./schema";

// Parsed at module load: an invalid example fails the build, not a visitor.
const ALL: readonly StoredBlueprint[] = [allbirds, linear, sweetgreen].map((raw) =>
  parseStoredBlueprint(raw)
);

export type ExampleLink = { slug: string; name: string; label: string };

const LABELS: Record<string, string> = {
  "example-allbirds": "direct-to-consumer apparel",
  "example-linear": "B2B software",
  "example-sweetgreen": "multi-location restaurants",
};

export const EXAMPLE_LINKS: readonly ExampleLink[] = ALL.map((bp) => ({
  slug: bp.slug,
  name: bp.company.name,
  label: LABELS[bp.slug] ?? "",
}));

export function getExample(slug: string): StoredBlueprint | null {
  return ALL.find((bp) => bp.slug === slug) ?? null;
}

export function allExamples(): readonly StoredBlueprint[] {
  return ALL;
}
