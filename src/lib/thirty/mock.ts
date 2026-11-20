// Server-only. Mock mode (THIRTY_MOCK=1, never in production): the real
// orchestrator, store, limits, lock, and budget, with these stages standing in
// for the network and the model. `<code>.test` hosts trigger specific outcomes.
import { ModelOutputError, type UsageRecord } from "./anthropic";
import { isErrorCode, RunError, type ErrorCode } from "./errors";
import type { PageContent } from "./extract";
import type { Models, Stages } from "./pipeline";
import type { ModelBlueprint, Profile } from "./schema";

export const MOCK_MODELS: Models = {
  research: "mock-research",
  blueprint: "mock-blueprint",
  search: "mock-search",
};

/** The error code a mock host asks for, if any (`not-a-company.test` → `not_a_company`). */
export function mockTrigger(host: string): ErrorCode | "slow" | "fallback" | "drop" | null {
  if (!host.endsWith(".test")) return null;
  const label = host.slice(0, -".test".length).split(".").pop() ?? "";
  if (label === "slow" || label === "fallback" || label === "drop") return label;
  const code = label.replace(/-/g, "_");
  return isErrorCode(code) ? code : null;
}

/** Codes the API route returns before the run starts, at the check where they occur. */
export const MOCK_PRERUN_CODES: ReadonlySet<ErrorCode> = new Set([
  "bad_request",
  "invalid_url",
  "blocked_host",
  "platform_url",
  "self_url",
  "too_fast",
  "live_disabled",
  "unavailable",
  "rate_limited",
  "capacity",
]);

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason ?? new Error("aborted"));
    const t = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(signal.reason ?? new Error("aborted"));
      },
      { once: true }
    );
  });
}

const ZERO = (model: string): UsageRecord => ({ model, input: 0, output: 0, webSearches: 0 });

function companyName(host: string): string {
  const stem = host.split(".")[0] ?? host;
  return stem
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function mockPages(hostname: string): PageContent[] {
  const page = (path: string, title: string, text: string): PageContent => ({
    url: `https://${hostname}${path}`,
    title,
    description: "",
    siteName: "",
    ogDescription: "",
    headings: [],
    text,
    links: [],
  });
  return [
    page("/", `${companyName(hostname)} | Workshop tools for small manufacturers`, "Mock homepage text."),
    page("/products", "Products", "Mock products text."),
    page("/pricing", "Pricing", "Mock pricing text."),
    page("/about", "About us", "Mock about text."),
  ];
}

export function mockProfile(host: string): Profile {
  const name = companyName(host);
  return {
    companyName: name,
    oneLiner: `${name} sells workshop scheduling software and replacement tooling to small machine shops.`,
    offerings: ["ShopFloor Scheduler", "ToolCrib Subscriptions", "Rush Quote Desk"],
    customers: "Independent machine shops and contract manufacturers with 5 to 50 machinists.",
    businessModel: "Monthly ShopFloor Scheduler subscriptions plus recurring ToolCrib tooling orders.",
    operations: [
      "Quotes for rush jobs are requested through a web form",
      "ToolCrib ships replacement inserts on a monthly cycle",
      "Integrates with QuickBooks for invoicing",
    ],
    signals: ["Hiring two customer success managers", "Ships to the US and Canada"],
    language: "English",
    fit: "company",
    flags: { adultOrIllegal: false, injectionAttempt: false },
  };
}

export function mockBlueprint(host: string): ModelBlueprint {
  const name = companyName(host);
  return {
    headline: `${name} can turn rush quotes and ToolCrib reorders from inbox work into approved, same-day decisions.`,
    agents: [
      {
        name: "Rush Quote Drafter",
        role: "Drafts a priced quote for every Rush Quote Desk request using past jobs with similar materials and tolerances.",
        trigger: "When a Rush Quote Desk form is submitted",
        does: [
          "Matches the request to past jobs by material, tolerance, and quantity",
          "Drafts a quote with machine hours, tooling, and margin",
          "Flags requests outside the shop's listed capabilities",
        ],
        tools: [
          { name: "Quote form submissions", access: "read", system: "Website form inbox" },
          { name: "Past job history", access: "read", system: "ShopFloor Scheduler" },
          { name: "Quote draft", access: "write", system: "QuickBooks estimates" },
        ],
        humanGate: {
          required: true,
          detail: "Every quote is sent only after an estimator approves the price and lead time.",
        },
        evidence: "The site routes rush jobs through the Rush Quote Desk form and invoices through QuickBooks.",
        impact: "Rush requests get a reviewed price the same day instead of waiting in a shared inbox.",
        relatedProject: "apparelmagic-agents",
      },
      {
        name: "ToolCrib Reorder Planner",
        role: "Proposes each customer's next ToolCrib shipment from their scheduled jobs.",
        trigger: "Every Monday at 06:00, before the monthly ToolCrib cycle closes",
        does: [
          "Reads the next month of scheduled jobs per customer",
          "Estimates insert wear by material and machine hours",
          "Drafts an adjusted ToolCrib order for review",
        ],
        tools: [
          { name: "Scheduled jobs", access: "read", system: "ShopFloor Scheduler" },
          { name: "Subscription orders", access: "write", system: "ToolCrib order system" },
        ],
        humanGate: {
          required: true,
          detail: "Changes over 20 percent of a customer's usual order wait for account manager approval.",
        },
        evidence: "ToolCrib Subscriptions ship replacement inserts monthly to shops that also use ShopFloor Scheduler.",
        impact: "Customers stop running out of inserts mid-job, and over-shipping drops.",
        relatedProject: "vitals-health-agent",
      },
      {
        name: "Onboarding Health Watcher",
        role: "Watches new ShopFloor Scheduler accounts for signs they are stuck and briefs customer success.",
        trigger: "Every weekday at 08:00",
        does: [
          "Reads activity for accounts in their first 60 days",
          "Writes a short internal brief on stalled accounts",
        ],
        tools: [{ name: "Account activity", access: "read", system: "ShopFloor Scheduler" }],
        humanGate: {
          required: false,
          detail: "Read-only; it writes an internal brief and never contacts customers.",
        },
        evidence: "The company is hiring two customer success managers, which suggests onboarding load.",
        impact: "The new customer success hires spend their time on the accounts that need them.",
        relatedProject: "openclaw-ops",
      },
    ],
    firstBuild: {
      agentName: "Rush Quote Drafter",
      why: "Every quote already gets a human review, so a draft saves time without adding risk.",
      scope: [
        "Read Rush Quote Desk submissions",
        "Match against the last year of jobs",
        "Draft a quote for estimator approval",
      ],
    },
    nonObvious: `Because ${name} sells both the scheduler and the tooling, the schedule predicts tool wear before the customer notices it.`,
    caveats: ["This is a mock run; the profile and blueprint are fixtures."],
  };
}

function genericBlueprint(): ModelBlueprint {
  return {
    headline: "AI can help this business grow.",
    agents: [
      {
        name: "Support Bot",
        role: "Answers questions.",
        trigger: "On demand",
        does: ["Answers questions"],
        tools: [],
        humanGate: { required: false, detail: "" },
        evidence: "",
        impact: "Better support.",
        relatedProject: "none",
      },
    ],
    firstBuild: { agentName: "Support Bot", why: "It is easy.", scope: [] },
    nonObvious: "Customers like fast answers.",
    caveats: [],
  };
}

/** Stage implementations with realistic delays; `totalMs` spreads across the run. */
export function mockStages(host: string, totalMs: number): Stages {
  const trigger = mockTrigger(host);
  const scale = trigger === "slow" ? 40_000 / Math.max(1, totalMs) : 1;
  const d = (fraction: number) => Math.round(totalMs * fraction * scale);

  return {
    async readSite(input, signal) {
      await sleep(d(0.25), signal);
      if (trigger === "unreachable") return { kind: "unresolvable" };
      if (trigger === "fallback") return { kind: "blocked", reason: "challenge" };
      const pages = mockPages(input.hostname);
      return {
        kind: "pages",
        pages,
        finalUrl: pages[0].url,
        thin: trigger === "not_enough_info",
      };
    },
    async searchBrief(_host, signal) {
      await sleep(d(0.15), signal);
      if (trigger === "not_enough_info") {
        return { ok: false, reason: "too_short", usage: [ZERO(MOCK_MODELS.search)] };
      }
      return { ok: true, brief: "Mock research brief.", usage: [ZERO(MOCK_MODELS.search)] };
    },
    async extractProfile(args) {
      await sleep(d(0.25), args.signal);
      const profile = mockProfile(host);
      if (trigger === "not_a_company") profile.fit = "not_a_company";
      if (trigger === "unsafe") profile.flags.adultOrIllegal = true;
      return { profile, usage: ZERO(MOCK_MODELS.research) };
    },
    async draftBlueprint(args) {
      if (trigger === "declined") {
        await sleep(d(0.1), args.signal);
        throw new ModelOutputError("refusal", ZERO(MOCK_MODELS.blueprint));
      }
      if (trigger === "upstream" || trigger === "timeout") {
        await sleep(d(0.15), args.signal);
        throw new RunError(trigger);
      }
      if (trigger === "internal") {
        await sleep(d(0.1), args.signal);
        throw new Error("Mock internal failure");
      }
      const blueprint = trigger === "quality" ? genericBlueprint() : mockBlueprint(host);
      const per = d(0.45) / blueprint.agents.length;
      for (const agent of blueprint.agents) {
        await sleep(per, args.signal);
        args.onAgentName(agent.name);
      }
      return { blueprint, usage: ZERO(MOCK_MODELS.blueprint), text: JSON.stringify(blueprint) };
    },
  };
}
