import { describe, expect, it } from "vitest";
import { allExamples } from "../examples";
import { mockBlueprint } from "../mock";
import { ARRAY_CAPS, CAPS, checkQuality, cleanText, normalizeBlueprint } from "../quality";
import type { ModelBlueprint } from "../schema";

const ctx = { companyName: "Acme", offerings: ["ShopFloor Scheduler", "ToolCrib Subscriptions", "Rush Quote Desk"] };

function base(): ModelBlueprint {
  return mockBlueprint("acme.test");
}

describe("cleanText", () => {
  it("trims, collapses whitespace, and strips markup and control characters", () => {
    expect(cleanText("  a\n\n b\u0000c <b>bold</b> <script>x</script> ", 100)).toBe("a b c bold x");
    expect(cleanText("1 < 2 > 0", 100)).toBe("1 2 0");
  });

  it("caps length at a word boundary with an ellipsis", () => {
    const out = cleanText("word ".repeat(100), 60);
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.endsWith("…")).toBe(true);
  });

  it("returns an empty string for non-strings", () => {
    expect(cleanText(undefined, 10)).toBe("");
    expect(cleanText(5, 10)).toBe("");
  });
});

describe("normalizeBlueprint", () => {
  it("caps every field and array", () => {
    const long = "x".repeat(1000);
    const raw = base();
    const agent = { ...raw.agents[0], name: long, role: long, trigger: long, evidence: long, impact: long };
    agent.does = Array(10).fill(long);
    agent.tools = Array(10).fill({ name: "Tool", access: "read", system: "System" });
    raw.agents = Array(8)
      .fill(null)
      .map((_, i) => ({ ...agent, name: `${long}${i}` }));
    raw.headline = long;
    raw.nonObvious = long;
    raw.caveats = Array(9).fill(long);
    raw.firstBuild = { agentName: "nobody", why: long, scope: Array(9).fill(long) };
    const n = normalizeBlueprint(raw);
    expect(n.agents).toHaveLength(ARRAY_CAPS.agents);
    const a = n.agents[0];
    expect(a.name.length).toBeLessThanOrEqual(CAPS.name);
    expect(a.role.length).toBeLessThanOrEqual(CAPS.role);
    expect(a.trigger.length).toBeLessThanOrEqual(CAPS.trigger);
    expect(a.evidence.length).toBeLessThanOrEqual(CAPS.evidence);
    expect(a.impact.length).toBeLessThanOrEqual(CAPS.impact);
    expect(a.does).toHaveLength(ARRAY_CAPS.does);
    expect(a.does[0].length).toBeLessThanOrEqual(CAPS.bullet);
    expect(a.tools).toHaveLength(ARRAY_CAPS.tools);
    expect(n.headline.length).toBeLessThanOrEqual(CAPS.headline);
    expect(n.nonObvious.length).toBeLessThanOrEqual(CAPS.nonObvious);
    expect(n.caveats).toHaveLength(ARRAY_CAPS.caveats);
    expect(n.caveats[0].length).toBeLessThanOrEqual(CAPS.caveat);
    expect(n.firstBuild.scope).toHaveLength(ARRAY_CAPS.scope);
  });

  it("drops empty items and points firstBuild at the first agent when it matches none", () => {
    const raw = base();
    raw.agents[0].does = ["", "  ", "Real action", "<p></p>"];
    raw.caveats = ["", "kept"];
    raw.firstBuild.agentName = "Unknown Agent";
    const n = normalizeBlueprint(raw);
    expect(n.agents[0].does).toEqual(["Real action"]);
    expect(n.caveats).toEqual(["kept"]);
    expect(n.firstBuild.agentName).toBe(n.agents[0].name);
  });

  it("matches firstBuild case-insensitively", () => {
    const raw = base();
    raw.firstBuild.agentName = "toolcrib reorder planner";
    expect(normalizeBlueprint(raw).firstBuild.agentName).toBe("ToolCrib Reorder Planner");
  });

  it("coerces an unknown related project to none", () => {
    const raw = base() as unknown as { agents: Array<{ relatedProject: string }> };
    raw.agents[0].relatedProject = "made-up-project";
    expect(normalizeBlueprint(raw as unknown as ModelBlueprint).agents[0].relatedProject).toBe("none");
  });
});

describe("checkQuality", () => {
  const gate = (mutate: (bp: ModelBlueprint) => void, context = ctx) => {
    const raw = base();
    mutate(raw);
    return checkQuality(normalizeBlueprint(raw), context);
  };

  it("passes a grounded blueprint", () => {
    expect(gate(() => undefined)).toEqual({ ok: true, failures: [] });
  });

  it("fails with fewer than three agents", () => {
    const r = gate((bp) => (bp.agents = bp.agents.slice(0, 2)));
    expect(r.ok).toBe(false);
    expect(r.failures.join()).toMatch(/at least 3/);
  });

  it("fails on duplicate names", () => {
    const r = gate((bp) => (bp.agents[1].name = bp.agents[0].name.toUpperCase()));
    expect(r.failures.join()).toMatch(/distinct/);
  });

  it("fails without evidence", () => {
    expect(gate((bp) => (bp.agents[2].evidence = "")).failures.join()).toMatch(/no evidence/);
  });

  it("fails with fewer than two actions", () => {
    expect(gate((bp) => (bp.agents[1].does = ["one"])).failures.join()).toMatch(/at least 2 concrete/);
  });

  it("fails without tools", () => {
    expect(gate((bp) => (bp.agents[0].tools = [])).failures.join()).toMatch(/at least 1 tool/);
  });

  it("fails when no agent has a human gate", () => {
    const r = gate((bp) => bp.agents.forEach((a) => (a.humanGate.required = false)));
    expect(r.failures.join()).toMatch(/human approval gate/);
  });

  it("fails when not grounded in the company name or two offerings", () => {
    const r = checkQuality(normalizeBlueprint(base()), { companyName: "Globex", offerings: ["Hyperwidget", "Rush Quote Desk"] });
    expect(r.failures.join()).toMatch(/does not mention/);
  });

  it("passes on two offerings even without the company name", () => {
    const r = checkQuality(normalizeBlueprint(base()), {
      companyName: "Globex",
      offerings: ["ShopFloor Scheduler", "ToolCrib Subscriptions"],
    });
    expect(r.ok).toBe(true);
  });

  it.each([
    ["a URL", "See https://acme.com for details"],
    ["a www host", "Visit www.acme.com today"],
    ["a domain path", "Open acme.com/pricing"],
    ["an email", "Write to sales@acme.com"],
    ["a phone number", "Call (555) 123-4567"],
  ])("fails when a field contains %s", (_label, text) => {
    expect(gate((bp) => (bp.agents[0].impact = text)).failures.join()).toMatch(/URL, an email/);
  });
});

describe("committed examples", () => {
  it.each(allExamples().map((e) => [e.slug, e] as const))("%s passes normalization unchanged and the gate", (_slug, example) => {
    const normalized = normalizeBlueprint(example.blueprint);
    expect(normalized).toEqual(example.blueprint);
    expect(checkQuality(normalized, { companyName: example.company.name, offerings: example.company.offerings })).toEqual({
      ok: true,
      failures: [],
    });
    expect(example.kind).toBe("example");
    expect(example.receipt).toBeNull();
    expect(example.source.method).toBe("curated");
    expect(example.blueprint.agents.length).toBeGreaterThanOrEqual(3);
  });
});

describe("human gate label", () => {
  it("drops a repeated label the page already prints", async () => {
    const { normalizeBlueprint } = await import("../quality");
    const raw = {
      headline: "h",
      agents: [
        {
          name: "A",
          role: "r",
          trigger: "t",
          does: ["one", "two"],
          tools: [{ name: "x", access: "read", system: "y" }],
          humanGate: { required: false, detail: "Runs unattended: it only reads exports." },
          evidence: "e",
          impact: "i",
          relatedProject: "none",
        },
      ],
      firstBuild: { agentName: "A", why: "w", scope: ["s"] },
      nonObvious: "n",
      caveats: [],
    };
    const out = normalizeBlueprint(raw as never);
    expect(out.agents[0].humanGate.detail).toBe("It only reads exports.");
  });
});
