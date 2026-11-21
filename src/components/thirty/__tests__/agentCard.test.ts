import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { mockBlueprint } from "@/lib/thirty/mock";
import type { NormalizedAgent } from "@/lib/thirty/schema";
import { AgentCard } from "../AgentCard";

function render(agent: NormalizedAgent): string {
  return renderToStaticMarkup(createElement(AgentCard, { agent, index: 0, related: null, isFirstBuild: false }));
}

const withValue = mockBlueprint("acme.test").agents[0];
const { value: _value, ...legacy } = withValue;
void _value;

describe("AgentCard", () => {
  it("leads with the payoff when the agent has a value case", () => {
    const html = render(withValue);
    expect(html).toContain("Grows revenue");
    expect(html).toContain("Who it helps");
    expect(html).toContain("How this is usually done today");
    expect(html).toContain("How to size it");
    expect(html).toContain(withValue.value.who);
    expect(html).not.toContain("Expected impact");
    expect(html.indexOf(withValue.impact)).toBeLessThan(html.indexOf("Trigger"));
    expect(html.indexOf("How to size it")).toBeLessThan(html.indexOf("Trigger"));
    expect(html.split(withValue.impact)).toHaveLength(2);
  });

  it("renders an agent stored before the value case exactly as before", () => {
    const html = render(legacy);
    expect(html).toContain("Expected impact");
    expect(html).toContain(legacy.impact);
    expect(html.indexOf("Trigger")).toBeLessThan(html.indexOf(legacy.impact));
    for (const label of ["Saves time", "Cuts cost", "Grows revenue", "Who it helps", "How this is usually done today", "How to size it"]) {
      expect(html).not.toContain(label);
    }
  });
});
