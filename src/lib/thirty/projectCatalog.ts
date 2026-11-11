// Hand-written summaries of agent-relevant published projects. Kept separate
// from projectData.ts (which imports images) so scripts and tests can load it.
// Summaries and relevance lines restate only what projectData.ts says.
// Visitors see only `relevance`, never model-written claims about this work.

export const PROJECT_KEYS = [
  "apparelmagic-agents",
  "vibecation",
  "stagesnap",
  "openclaw-ops",
  "vitals-health-agent",
  "ai-designer",
  "mission-control",
  "file-explorer",
] as const;

export type ProjectKey = (typeof PROJECT_KEYS)[number];

export type CatalogEntry = {
  key: ProjectKey;
  projectName: string;
  /** For the model: the agent pattern this project demonstrates. */
  summary: string;
  /** Shown to visitors next to the link. Fixed text. */
  relevance: string;
};

export const PROJECT_CATALOG: readonly CatalogEntry[] = [
  {
    key: "apparelmagic-agents",
    projectName: "ApparelMagic AI Agents",
    summary:
      "Configurable agents inside an apparel ERP that run scheduled, queue-based jobs, call purpose-built tools over inventory, sales, finance, and product-development data, draft bulk emails and reports, and put permission and approval gates in front of anything that writes back to the system.",
    relevance:
      "Scheduled ERP agents with purpose-built data tools and approval gates on every write.",
  },
  {
    key: "vibecation",
    projectName: "Vibecation",
    summary:
      "A consumer product that reads a public Instagram grid with a vision model to produce a traveler profile and destination matches in about 30 seconds, sells a paid itinerary through Stripe, and runs a chat agent that edits the itinerary within a per-trip message budget.",
    relevance:
      "Public-data analysis into a personalized result, plus a budgeted chat agent that edits a paid itinerary.",
  },
  {
    key: "stagesnap",
    projectName: "StageSnap",
    summary:
      "A generative image pipeline that detects the room type in a real estate photo, applies one of several staging modes, optionally upscales, runs jobs concurrently, streams live progress to the client, and bills by usage through Stripe.",
    relevance:
      "A multi-model image pipeline with concurrent jobs, live progress, and usage-based billing.",
  },
  {
    key: "openclaw-ops",
    projectName: "OpenClaw Multi-Agent Ops",
    summary:
      "A self-hosted team of an orchestrator agent plus specialists for engineering, QA, research, outreach, and content, coordinated through a task board, chat channels, and around two dozen cron jobs, with a QA agent verifying work against artifacts, exec allowlists, and alerting instead of silent fallbacks.",
    relevance:
      "An orchestrator delegating to specialist agents through a task board, with a QA agent checking work before it counts.",
  },
  {
    key: "vitals-health-agent",
    projectName: "Vitals Health Agent",
    summary:
      "A coaching agent that pulls wearable and scale data from several APIs on a schedule into one daily log, logs input from text and voice notes, runs scheduled check-ins against targets, refuses to report stale data as current, and collaborates with a second agent through a scoped relay with config-enforced privacy.",
    relevance:
      "Scheduled data pulls from several APIs into one source of truth, with checks that refuse to report stale data.",
  },
  {
    key: "ai-designer",
    projectName: "AI Designer",
    summary:
      "A conversational design tool for fashion teams that turns natural-language prompts into garment visualizations through guided or advanced modes, locks branding controls, and attaches draft catalog metadata so approved designs can move into the ERP.",
    relevance:
      "Conversational generation that produces draft catalog records a team approves before they enter the ERP.",
  },
  {
    key: "mission-control",
    projectName: "Clawvin Mission Control",
    summary:
      "A Kanban board and live event feed where agents authenticate with their own keys to create, claim, move, and comment on tasks through a REST API, pushed to every client over WebSockets, so humans and agents share one auditable record of delegated work.",
    relevance:
      "A shared task board where agents file, claim, and update work through an API, so every handoff is auditable.",
  },
  {
    key: "file-explorer",
    projectName: "Clawvin File Explorer",
    summary:
      "A read-only web viewer for the documents agents produce, such as plans, reports, and checklists, with a file tree, markdown preview, search, and a switcher across agent workspaces that also exposes each agent's memory for audit.",
    relevance:
      "A read-only view of what agents produce and remember, so their output is easy to review.",
  },
];

export function getCatalogEntry(key: string): CatalogEntry | undefined {
  return PROJECT_CATALOG.find((entry) => entry.key === key);
}

/** The catalog as the design step sees it: keys and pattern summaries only. */
export function catalogForPrompt(): string {
  return PROJECT_CATALOG.map((e) => `- ${e.key}: ${e.summary}`).join("\n");
}
