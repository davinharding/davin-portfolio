// The run as data: its steps, how stream events change them, the agent slots the
// homepage designs draw, and the copy every run view shares. Pure, so it is tested
// without a browser; useBlueprintRun holds the state and the views draw it.
import { MAX_AGENTS, STEP_ORDER, stepLabel, type RunEvent, type StepId } from "@/lib/thirty/events";

export type ConsoleStepStatus = "pending" | "active" | "done" | "skipped" | "failed";

export type ConsoleStep = {
  id: StepId;
  label: string;
  status: ConsoleStepStatus;
  details: string[];
  /** How far into the run the step became active, in milliseconds. */
  startedAt?: number;
};

/** After this long the run views say it is taking longer than usual. */
export const SLOW_RUN_MS = 30_000;
export const SLOW_RUN_NOTE = "Taking a little longer than usual.";
export const RUN_PROMISE = "About 30 seconds. Reads your public site, nothing else.";

/** Mirrors the server's first rules; the server stays the authority. */
export function looksLikeWebsite(raw: string): boolean {
  const s = raw.trim();
  if (!s || s.length > 2048) return false;
  return s.split(/\s+/).some((t) => /[^.\s]\.[^.\s]/.test(t));
}

/** A display guess until the server's step labels arrive. */
export function displayHost(raw: string): string {
  let s = raw.trim().split(/\s+/).find((t) => t.includes(".")) ?? raw.trim();
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").replace(/^[^@/]*@/, "");
  s = s.split(/[/?#:]/)[0] ?? s;
  return s.toLowerCase().replace(/^www\./, "").replace(/[.,;:!?)]+$/, "") || "your site";
}

export function initialSteps(host: string): ConsoleStep[] {
  return STEP_ORDER.map((id) => ({ id, label: stepLabel(id, host), status: "pending", details: [] }));
}

/**
 * The steps after one stream event. Returns `prev` itself when the event changes
 * nothing. `msSinceStart` is read only when a step starts.
 */
export function applyRunEvent(prev: ConsoleStep[], event: RunEvent, msSinceStart: () => number): ConsoleStep[] {
  const next = prev.map((s) => ({ ...s, details: [...s.details] }));
  const find = (id: string) => next.find((s) => s.id === id);
  const active = () => next.find((s) => s.status === "active");
  switch (event.t) {
    case "step": {
      const step = find(event.id);
      if (!step) return prev;
      step.label = event.label;
      if (event.status === "start") {
        for (const s of next) {
          if (STEP_ORDER.indexOf(s.id) < STEP_ORDER.indexOf(event.id) && s.status === "pending") {
            s.status = "done";
          }
        }
        step.status = "active";
        step.startedAt = msSinceStart();
      } else {
        step.status = event.status === "done" ? "done" : event.status === "skip" ? "skipped" : "failed";
      }
      return next;
    }
    case "page": {
      const read = find("read");
      if (read && read.details.length < 4) read.details.push(event.title);
      return next;
    }
    case "company": {
      const research = find("research");
      if (research) research.details.push(event.oneLiner ? `${event.name}: ${event.oneLiner}` : event.name);
      return next;
    }
    case "note": {
      const target = active() ?? find("research");
      if (target) target.details.push(event.text);
      return next;
    }
    case "agent": {
      const design = find("design");
      if (design && !design.details.includes(event.name)) design.details.push(event.name);
      return next;
    }
    default:
      return prev;
  }
}

/** Open slots shown before the run says how many agents there are. */
export const DEFAULT_AGENT_SLOTS = 4;

export type AgentSlot = { name?: string; state: "drafted" | "drafting" | "open" | "unused" };

/**
 * One entry per agent slot in the homepage designs: four until a fifth agent
 * arrives, never more than a blueprint can hold. Outside a run every slot is open.
 */
export function agentSlots(
  agents: readonly string[],
  run: { busy: boolean; designing: boolean; teamComplete: boolean }
): AgentSlot[] {
  const count = Math.min(MAX_AGENTS, Math.max(DEFAULT_AGENT_SLOTS, agents.length));
  return Array.from({ length: count }, (_, i): AgentSlot => {
    const name = run.busy ? agents[i] : undefined;
    if (name) return { name, state: "drafted" };
    if (run.busy && run.teamComplete) return { state: "unused" };
    if (run.busy && run.designing && i === agents.length) return { state: "drafting" };
    return { state: "open" };
  });
}
