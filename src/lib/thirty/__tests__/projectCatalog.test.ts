import { describe, expect, it } from "vitest";
import { getPublishedProjects } from "@/data/projectData";
import { PROJECT_CATALOG, PROJECT_KEYS } from "../projectCatalog";

describe("project catalog", () => {
  const published = new Set(getPublishedProjects().map((p) => p.name));

  it.each(PROJECT_CATALOG.map((e) => [e.key, e.projectName] as const))(
    "%s points at a published project (%s)",
    (_key, name) => {
      expect(published.has(name)).toBe(true);
    }
  );

  it("has one entry per key with a summary and a relevance line", () => {
    expect(PROJECT_CATALOG.map((e) => e.key)).toEqual([...PROJECT_KEYS]);
    for (const e of PROJECT_CATALOG) {
      expect(e.summary.length).toBeGreaterThan(40);
      expect(e.relevance.length).toBeGreaterThan(20);
    }
  });
});
