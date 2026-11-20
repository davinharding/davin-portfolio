import { describe, expect, it } from "vitest";
import { MAX_AGENTS } from "@/lib/thirty/events";
import { agentSlots, applyRunEvent, DEFAULT_AGENT_SLOTS, displayHost, initialSteps, looksLikeWebsite } from "../runModel";

const at = (ms: number) => () => ms;

describe("applyRunEvent", () => {
  it("starts a step, marks the pending steps before it done, and records when it started", () => {
    const steps = applyRunEvent(initialSteps("acme.com"), { t: "step", id: "research", status: "start", label: "Researching acme.com" }, at(4200));
    expect(steps.map((s) => s.status)).toEqual(["done", "done", "active", "pending", "pending"]);
    expect(steps[2]).toMatchObject({ label: "Researching acme.com", startedAt: 4200 });
  });

  it("finishes, skips and fails steps", () => {
    let steps = initialSteps("acme.com");
    steps = applyRunEvent(steps, { t: "step", id: "read", status: "done", label: "Read" }, at(0));
    steps = applyRunEvent(steps, { t: "step", id: "research", status: "skip", label: "Research" }, at(0));
    steps = applyRunEvent(steps, { t: "step", id: "design", status: "fail", label: "Design" }, at(0));
    expect(steps.map((s) => s.status)).toEqual(["pending", "done", "skipped", "failed", "pending"]);
  });

  it("files details under the step they belong to", () => {
    let steps = initialSteps("acme.com");
    for (let i = 0; i < 6; i++) steps = applyRunEvent(steps, { t: "page", url: `https://acme.com/${i}`, title: `Page ${i}` }, at(0));
    steps = applyRunEvent(steps, { t: "company", name: "Acme", oneLiner: "Makes tools" }, at(0));
    steps = applyRunEvent(steps, { t: "agent", name: "Quote Drafter" }, at(0));
    steps = applyRunEvent(steps, { t: "agent", name: "Quote Drafter" }, at(0));
    steps = applyRunEvent(steps, { t: "note", text: "Redrafting." }, at(0));
    const by = Object.fromEntries(steps.map((s) => [s.id, s.details]));
    expect(by.read).toHaveLength(4);
    expect(by.research).toEqual(["Acme: Makes tools", "Redrafting."]);
    expect(by.design).toEqual(["Quote Drafter"]);
  });

  it("leaves the steps untouched for events that change nothing", () => {
    const steps = initialSteps("acme.com");
    expect(applyRunEvent(steps, { t: "ping" }, at(0))).toBe(steps);
    expect(applyRunEvent([], { t: "step", id: "read", status: "start", label: "Read" }, at(0))).toEqual([]);
  });
});

describe("agentSlots", () => {
  const idle = { busy: false, designing: false, teamComplete: false };
  const states = (slots: ReturnType<typeof agentSlots>) => slots.map((s) => s.state);

  it("shows four open slots outside a run", () => {
    expect(states(agentSlots([], idle))).toEqual(["open", "open", "open", "open"]);
    expect(DEFAULT_AGENT_SLOTS).toBe(4);
  });

  it("fills slots in order and marks the next one while the design step runs", () => {
    const slots = agentSlots(["A", "B"], { busy: true, designing: true, teamComplete: false });
    expect(slots).toEqual([{ name: "A", state: "drafted" }, { name: "B", state: "drafted" }, { state: "drafting" }, { state: "open" }]);
  });

  it("marks the unfilled slot not needed once the team is complete", () => {
    expect(states(agentSlots(["A", "B", "C"], { busy: true, designing: false, teamComplete: true }))).toEqual(["drafted", "drafted", "drafted", "unused"]);
  });

  it("grows to five slots for a fifth agent and never beyond the schema's limit", () => {
    expect(agentSlots(["A", "B", "C", "D", "E"], { busy: true, designing: true, teamComplete: false })).toHaveLength(5);
    expect(agentSlots(["A", "B", "C", "D", "E", "F"], idle)).toHaveLength(MAX_AGENTS);
  });
});

describe("typed address helpers", () => {
  it("recognises a website and shows its host", () => {
    expect(looksLikeWebsite("acme")).toBe(false);
    expect(looksLikeWebsite("https://www.Acme.com/about")).toBe(true);
    expect(displayHost("https://www.Acme.com/about")).toBe("acme.com");
    expect(displayHost("   ")).toBe("your site");
  });
});
