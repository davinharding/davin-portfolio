import { describe, expect, it } from "vitest";
import {
  findProjectBySegment,
  projectPath,
  projects,
  type Project,
} from "../projectData";

const named = (name: string): Project => ({ ...projects[0], name });

const segmentOf = (name: string) => projectPath(name).slice("/portfolio/".length);

describe("findProjectBySegment", () => {
  it.each(projects.map((p) => [p.name]))("resolves the URL of %s", (name) => {
    expect(findProjectBySegment(segmentOf(name))?.name).toBe(name);
  });

  const tricky = [
    "Spaces and Words",
    "R&D",
    "C++ Tools",
    "100% Uptime",
    "Literal %41 Escape",
    "50%25 Off",
  ].map(named);

  it.each(tricky.map((p) => [p.name]))(
    "resolves %s from its encoded segment and from the raw name",
    (name) => {
      expect(findProjectBySegment(segmentOf(name), tricky)?.name).toBe(name);
      expect(findProjectBySegment(name, tricky)?.name).toBe(name);
    }
  );

  it("returns undefined for an unknown name or a malformed escape", () => {
    expect(findProjectBySegment("Nope")).toBeUndefined();
    expect(findProjectBySegment("%E0%A4%A")).toBeUndefined();
  });
});
