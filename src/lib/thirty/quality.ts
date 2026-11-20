// Server-only. Normalization (repair, never fail) and the deterministic gate.
import { PROJECT_KEYS } from "./projectCatalog";
import type { ModelBlueprint, NormalizedBlueprint } from "./schema";

export const CAPS = {
  name: 60,
  role: 200,
  trigger: 160,
  bullet: 220,
  evidence: 300,
  impact: 240,
  headline: 220,
  nonObvious: 500,
  caveat: 220,
  toolName: 80,
  toolSystem: 80,
  gateDetail: 300,
  agentName: 60,
} as const;

export const ARRAY_CAPS = { agents: 5, does: 4, tools: 6, scope: 5, caveats: 5 } as const;

const CONTROL = new RegExp("[\\u0000-\\u0008\\u000B-\\u001F\\u007F-\\u009F\\u200B-\\u200F\\u2028-\\u202E\\u2060-\\u206F]", "g");

/** Trims, strips control characters and angle-bracket markup, collapses whitespace, caps length. */
/** The page prefixes "Needs approval." / "Runs unattended.", so drop a repeat of that label. */
function stripGateLabel(detail: string): string {
  const rest = detail.replace(/^(runs unattended|needs approval)\s*[:.,;-]*\s*/i, "");
  if (rest === detail || rest === "") return detail;
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

export function cleanText(value: unknown, cap: number): string {
  if (typeof value !== "string") return "";
  let s = value
    .replace(CONTROL, " ")
    .replace(/<\/?[a-z!][^<>]*>/gi, " ")
    .replace(/[<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length > cap) {
    const cut = s.slice(0, cap - 1);
    const lastSpace = cut.lastIndexOf(" ");
    s = `${(lastSpace > cap * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.-]+$/, "")}…`;
  }
  return s;
}

function cleanList(values: unknown, cap: number, maxItems: number): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((v) => cleanText(v, cap))
    .filter(Boolean)
    .slice(0, maxItems);
}

const RELATED = new Set<string>([...PROJECT_KEYS, "none"]);

export function normalizeBlueprint(raw: ModelBlueprint): NormalizedBlueprint {
  const agents = (Array.isArray(raw.agents) ? raw.agents : [])
    .map((a) => ({
      name: cleanText(a?.name, CAPS.name),
      role: cleanText(a?.role, CAPS.role),
      trigger: cleanText(a?.trigger, CAPS.trigger),
      does: cleanList(a?.does, CAPS.bullet, ARRAY_CAPS.does),
      tools: (Array.isArray(a?.tools) ? a.tools : [])
        .map((t) => ({
          name: cleanText(t?.name, CAPS.toolName),
          access: t?.access === "write" ? ("write" as const) : ("read" as const),
          system: cleanText(t?.system, CAPS.toolSystem),
        }))
        .filter((t) => t.name)
        .slice(0, ARRAY_CAPS.tools),
      humanGate: {
        required: Boolean(a?.humanGate?.required),
        detail: stripGateLabel(cleanText(a?.humanGate?.detail, CAPS.gateDetail)),
      },
      evidence: cleanText(a?.evidence, CAPS.evidence),
      impact: cleanText(a?.impact, CAPS.impact),
      relatedProject: (RELATED.has(a?.relatedProject) ? a.relatedProject : "none") as
        ModelBlueprint["agents"][number]["relatedProject"],
    }))
    .filter((a) => a.name)
    .slice(0, ARRAY_CAPS.agents);

  const wanted = cleanText(raw.firstBuild?.agentName, CAPS.agentName);
  const match = agents.find((a) => a.name.toLowerCase() === wanted.toLowerCase());
  const firstBuildName = match?.name ?? agents[0]?.name ?? "";

  return {
    headline: cleanText(raw.headline, CAPS.headline),
    agents,
    firstBuild: {
      agentName: firstBuildName,
      why: cleanText(raw.firstBuild?.why, CAPS.bullet),
      scope: cleanList(raw.firstBuild?.scope, CAPS.bullet, ARRAY_CAPS.scope),
    },
    nonObvious: cleanText(raw.nonObvious, CAPS.nonObvious),
    caveats: cleanList(raw.caveats, CAPS.caveat, ARRAY_CAPS.caveats),
  };
}

/** Every string in the blueprint, for grounding and contact-detail checks. */
export function blueprintStrings(bp: NormalizedBlueprint): string[] {
  const out: string[] = [bp.headline, bp.nonObvious, bp.firstBuild.agentName, bp.firstBuild.why];
  out.push(...bp.firstBuild.scope, ...bp.caveats);
  for (const a of bp.agents) {
    out.push(a.name, a.role, a.trigger, a.evidence, a.impact, a.humanGate.detail, ...a.does);
    for (const t of a.tools) out.push(t.name, t.system);
  }
  return out;
}

const URL_RE = /\bhttps?:\/\/|\bwww\.[a-z0-9-]+\.[a-z]{2,}|\b[a-z0-9-]+\.[a-z]{2,}\/[^\s]*/i;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const PHONE_RE = /(?:\+\d{1,3}[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/;

const NAME_NOISE = new Set(["inc", "inc.", "corp", "llc", "ltd", "company", "group", "limited", "the"]);

function significantTokens(phrase: string): string[] {
  return phrase
    .toLowerCase()
    .split(/[^a-z0-9À-ɏ]+/)
    .filter((t) => t.length >= 4 && !NAME_NOISE.has(t));
}

function phraseAppears(phrase: string, haystack: string): boolean {
  const tokens = significantTokens(phrase);
  if (tokens.length === 0) {
    const p = phrase.trim().toLowerCase();
    return p.length > 0 && haystack.includes(p);
  }
  return tokens.every((t) => haystack.includes(t));
}

export type GateInput = { companyName: string; offerings: string[] };
export type GateResult = { ok: boolean; failures: string[] };

export function checkQuality(bp: NormalizedBlueprint, ctx: GateInput): GateResult {
  const failures: string[] = [];

  if (bp.agents.length < 3) failures.push(`Only ${bp.agents.length} agents; at least 3 are required.`);
  const names = bp.agents.map((a) => a.name.toLowerCase());
  if (new Set(names).size !== names.length) failures.push("Two agents share a name; names must be distinct.");

  for (const a of bp.agents) {
    if (!a.evidence) failures.push(`Agent "${a.name}" has no evidence from the profile.`);
    if (a.does.length < 2) failures.push(`Agent "${a.name}" needs at least 2 concrete actions in "does".`);
    if (a.tools.length < 1) failures.push(`Agent "${a.name}" needs at least 1 tool.`);
  }

  if (!bp.agents.some((a) => a.humanGate.required)) {
    failures.push("No agent has a human approval gate; at least one write action must be gated.");
  }

  const strings = blueprintStrings(bp);
  const haystack = strings.join(" \n ").toLowerCase();
  const nameHit = phraseAppears(ctx.companyName, haystack);
  const offeringHits = new Set(
    ctx.offerings.filter((o) => o.trim() && phraseAppears(o, haystack)).map((o) => o.toLowerCase())
  );
  if (!nameHit && offeringHits.size < 2) {
    failures.push(
      "The blueprint does not mention the company by name or at least two of its named offerings."
    );
  }

  if (strings.some((s) => URL_RE.test(s) || EMAIL_RE.test(s) || PHONE_RE.test(s))) {
    failures.push("A field contains a URL, an email address, or a phone number; remove them.");
  }

  return { ok: failures.length === 0, failures };
}
