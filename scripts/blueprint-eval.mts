// Compares two versions of the blueprint design stage on the same company profiles.
//
//   npx tsx scripts/blueprint-eval.mts --label new [--out DIR] [--key-from FILE] [--force] host1 host2 ...
//   npx tsx scripts/blueprint-eval.mts --judge [--out DIR] [--key-from FILE] [host ...]
//   npx tsx scripts/blueprint-eval.mts --summary [--out DIR]
//
// Run mode reads each site and extracts its Profile with the real read and
// research stages, caching it to <out>/<host>/profile.json so every variant sees
// the exact same profile. It then drafts a blueprint with the production model
// and effort, normalizes it, runs the gate once (no retry), and writes
// <out>/<host>/<label>.json. To get a baseline, run this same script from a
// checkout of the old code with another --label and the same --out.
//
// --judge asks a judge model, playing the paying decision maker, to score the
// agents of two labels (--compare A,B; default old,new) shown as "Blueprint A"
// and "Blueprint B" in a per-host random order. --summary writes
// <out>/summary.md for old,new and <out>/summary-<a>-vs-<b>.md otherwise.
//
// It never touches Redis or the store and never goes through the pipeline or
// the route handler. The only environment value it reads from --key-from
// (default .env.local) is ANTHROPIC_API_KEY. --cap (default 3) stops any paid
// call once the spend recorded under --out reaches that many US dollars.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { costUsd, ModelOutputError, toUsageRecord, type UsageRecord } from "../src/lib/thirty/anthropic";
import { getConfig } from "../src/lib/thirty/config";
import { draftBlueprint } from "../src/lib/thirty/design";
import { readSite } from "../src/lib/thirty/fetchSite";
import { checkQuality, cleanText, normalizeBlueprint } from "../src/lib/thirty/quality";
import { extractProfile } from "../src/lib/thirty/research";
import type { Profile } from "../src/lib/thirty/schema";
import { searchBrief } from "../src/lib/thirty/searchFallback";

const JUDGE_MODEL = "claude-opus-5-5";

// ---------- arguments ----------

const argv = process.argv.slice(2);
function option(name: string): string | undefined {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  const v = argv[i + 1];
  argv.splice(i, 2);
  return v;
}
function flag(name: string): boolean {
  const i = argv.indexOf(name);
  if (i === -1) return false;
  argv.splice(i, 1);
  return true;
}
const outDir = path.resolve(option("--out") ?? ".verify/blueprint-value/eval");
const label = option("--label");
const keyFrom = path.resolve(option("--key-from") ?? ".env.local");
const capUsd = Number(option("--cap") ?? 3);
const judgeMode = flag("--judge");
const compare = (option("--compare") ?? "old,new").split(",").map((s) => s.trim());
if (compare.length !== 2 || compare[0] === compare[1] || !compare.every((l) => /^[a-z0-9-]+$/.test(l))) {
  console.error("--compare takes two different labels, such as old,new2");
  process.exit(2);
}
const [baseLabel, candLabel] = compare;
const isDefaultPair = baseLabel === "old" && candLabel === "new";
const judgeName = isDefaultPair ? "judge" : `judge-${baseLabel}-vs-${candLabel}`;
const summaryName = isDefaultPair ? "summary.md" : `summary-${baseLabel}-vs-${candLabel}.md`;
const summaryMode = flag("--summary");
const force = flag("--force");
const hosts = argv.filter((a) => !a.startsWith("--")).map((h) => h.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""));

function usage(): never {
  console.error(
    "Usage: blueprint-eval.mts --label <name> [--out DIR] [--key-from FILE] [--cap USD] [--force] <host...>\n" +
      "       blueprint-eval.mts --judge [--compare A,B] [--out DIR] [--key-from FILE] [--cap USD] [host...]\n" +
      "       blueprint-eval.mts --summary [--compare A,B] [--out DIR]"
  );
  process.exit(2);
}
if (!summaryMode && !judgeMode && (!label || !/^[a-z0-9-]+$/.test(label) || hosts.length === 0)) usage();
if (label === "profile" || label?.startsWith("judge")) usage();

// ---------- files ----------

const hostDir = (host: string) => path.join(outDir, host);
const fileFor = (host: string, name: string) => path.join(hostDir(host), `${name}.json`);

function readJson<T>(file: string): T | null {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as T;
}
function writeJson(file: string, data: unknown) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}
function listHosts(): string[] {
  if (!existsSync(outDir)) return [];
  return readdirSync(outDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

type ProfileFile = {
  host: string;
  createdAt: string;
  method: "fetch" | "search";
  pages: string[];
  profile: Profile;
  usage: UsageRecord[];
  estCostUsd: number;
};

type Gate = { ok: boolean; failures: string[] };
type VariantFile = {
  host: string;
  label: string;
  createdAt: string;
  model: string;
  effort: string;
  ok: boolean;
  error: string | null;
  designMs: number;
  usage: UsageRecord | null;
  estCostUsd: number;
  gate: Gate | null;
  blueprint: ReturnType<typeof normalizeBlueprint> | null;
};

/** Everything already spent under --out, from the usage each file recorded. */
function spentSoFar(): number {
  let usd = 0;
  for (const host of listHosts()) {
    for (const f of readdirSync(hostDir(host))) {
      if (!f.endsWith(".json")) continue;
      const data = readJson<{ estCostUsd?: number }>(path.join(hostDir(host), f));
      usd += data?.estCostUsd ?? 0;
    }
  }
  return usd;
}
function guardSpend(next: string) {
  const spent = spentSoFar();
  if (spent >= capUsd) {
    console.error(`Stopping before ${next}: $${spent.toFixed(3)} recorded under ${outDir} reaches the $${capUsd} cap.`);
    process.exit(3);
  }
}

// ---------- key ----------

/** Puts ANTHROPIC_API_KEY, and nothing else, from the key file into the environment. */
function loadApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return;
  if (!existsSync(keyFrom)) {
    console.error(`ANTHROPIC_API_KEY is not set and ${keyFrom} does not exist.`);
    process.exit(2);
  }
  for (const line of readFileSync(keyFrom, "utf8").split(/\r?\n/)) {
    const m = /^\s*(?:export\s+)?ANTHROPIC_API_KEY\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    const value = m[1].replace(/^(['"])(.*)\1$/, "$2").trim();
    if (value) process.env.ANTHROPIC_API_KEY = value;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(`No ANTHROPIC_API_KEY line in ${keyFrom}.`);
    process.exit(2);
  }
}

// ---------- run mode ----------

async function getProfile(client: Anthropic, host: string): Promise<ProfileFile | null> {
  const cached = readJson<ProfileFile>(fileFor(host, "profile"));
  if (cached) return cached;

  guardSpend(`researching ${host}`);
  const cfg = getConfig();
  const signal = AbortSignal.timeout(60_000);
  const usage: UsageRecord[] = [];
  const read = await readSite({ hostname: host }, { signal, userAgent: cfg.userAgent });
  if (read.kind === "unresolvable" || read.kind === "private" || read.kind === "parked") {
    console.error(`  [${host}] cannot read the site: ${read.kind}`);
    return null;
  }
  const pages = read.kind === "pages" ? read.pages : [];
  const search = async (): Promise<string | undefined> => {
    const r = await searchBrief({ client, model: cfg.modelBlueprint, host, signal });
    usage.push(...r.usage);
    if (!r.ok) console.error(`  [${host}] search fallback failed: ${r.reason}`);
    return r.ok ? r.brief : undefined;
  };
  let method: ProfileFile["method"] = "fetch";
  let brief: string | undefined;
  if (read.kind === "blocked" || read.thin) {
    method = "search";
    brief = await search();
    if (!brief) return null;
  }
  let result = await extractProfile({ client, model: cfg.modelResearch, host, pages, brief, signal });
  usage.push(result.usage);
  if (result.profile.fit === "thin" && !brief) {
    method = "search";
    brief = await search();
    if (brief) {
      result = await extractProfile({ client, model: cfg.modelResearch, host, pages, brief, signal });
      usage.push(result.usage);
    }
  }
  const file: ProfileFile = {
    host,
    createdAt: new Date().toISOString(),
    method,
    pages: pages.map((p) => p.url),
    profile: result.profile,
    usage,
    estCostUsd: costUsd(usage),
  };
  const { fit, flags } = result.profile;
  if (fit !== "company" || flags.adultOrIllegal) {
    console.error(`  [${host}] profile is not usable (fit ${fit}); not caching it. Pick another host.`);
    writeJson(fileFor(host, "profile-rejected"), file);
    return null;
  }
  writeJson(fileFor(host, "profile"), file);
  console.log(`  [${host}] profile via ${method}, ${pages.length} pages, $${file.estCostUsd.toFixed(4)}`);
  return file;
}

/** The company fields the pipeline passes to the gate. */
function gateContext(profile: Profile) {
  return {
    companyName: cleanText(profile.companyName, 80),
    offerings: profile.offerings.map((o) => cleanText(o, 80)).filter(Boolean).slice(0, 12),
  };
}

async function runDesign(client: Anthropic, host: string, profile: Profile): Promise<VariantFile> {
  const cfg = getConfig();
  const base = {
    host,
    label: label!,
    createdAt: new Date().toISOString(),
    model: cfg.modelBlueprint,
    effort: cfg.effortBlueprint,
  };
  guardSpend(`drafting ${host} (${label})`);
  const started = performance.now();
  try {
    const result = await draftBlueprint({
      client,
      model: cfg.modelBlueprint,
      effort: cfg.effortBlueprint,
      profile,
      signal: new AbortController().signal,
    });
    const designMs = Math.round(performance.now() - started);
    const blueprint = normalizeBlueprint(result.blueprint);
    const gate = checkQuality(blueprint, gateContext(profile));
    return { ...base, ok: true, error: null, designMs, usage: result.usage, estCostUsd: costUsd([result.usage]), gate, blueprint };
  } catch (err) {
    const designMs = Math.round(performance.now() - started);
    const usage = err instanceof ModelOutputError ? err.usage : null;
    const error = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    // A failed call is still billed for what it streamed; err high when unknown.
    const estCostUsd = usage ? costUsd([usage]) : costUsd([{ model: cfg.modelBlueprint, input: 6000, output: 8000, webSearches: 0 }]);
    return { ...base, ok: false, error, designMs, usage, estCostUsd, gate: null, blueprint: null };
  }
}

async function runMode() {
  loadApiKey();
  const client = new Anthropic();
  const cfg = getConfig();
  console.log(`Label "${label}": ${cfg.modelBlueprint} at effort ${cfg.effortBlueprint}, writing to ${outDir}`);
  for (const host of hosts) {
    const existing = readJson<VariantFile>(fileFor(host, label!));
    if (existing?.ok && !force) {
      console.log(`  [${host}] ${label}.json exists; skipping (use --force to redo)`);
      continue;
    }
    const profileFile = await getProfile(client, host);
    if (!profileFile) continue;
    const out = await runDesign(client, host, profileFile.profile);
    if (existing && !existing.ok) {
      // Keep the failed attempt's cost on record so the spend total stays honest.
      writeJson(fileFor(host, `${label}-failed-${Date.now()}`), existing);
    }
    writeJson(fileFor(host, label!), out);
    const gate = out.gate ? (out.gate.ok ? "gate ok" : `gate FAILED: ${out.gate.failures.join(" ")}`) : `error: ${out.error}`;
    console.log(`  [${host}] ${label}: ${out.designMs}ms, $${out.estCostUsd.toFixed(4)}, ${gate}`);
  }
  console.log(`Recorded spend under ${outDir}: $${spentSoFar().toFixed(3)}`);
}

// ---------- judge mode ----------

const AgentScore = z.object({
  name: z.string(),
  payoffClear: z.number(),
  payoffSize: z.number(),
  recognisable: z.number(),
  finishedWork: z.boolean(),
  wouldPay: z.boolean(),
  reason: z.string(),
});
const JudgeSchema = z.object({
  blueprintA: z.array(AgentScore),
  blueprintB: z.array(AgentScore),
  preferred: z.enum(["A", "B"]),
  preferredWhy: z.string(),
});
type JudgeOutput = z.infer<typeof JudgeSchema>;

type JudgeFile = {
  host: string;
  createdAt: string;
  model: string;
  mapping: { A: string; B: string };
  scores: Record<string, JudgeOutput["blueprintA"]>;
  preferred: string;
  preferredWhy: string;
  usage: UsageRecord;
  estCostUsd: number;
};

const JUDGE_SYSTEM = `You are the person who would pay for an AI build at the company described in <company>: its owner, general manager, or the department head who holds the budget. You are practical, busy, and not technical. A consultant has sent you two alternative proposals, Blueprint A and Blueprint B, each a short list of AI agents they would build for you. Judge them as yourself, with your own money.

For every agent in both blueprints, in the order given, return:
- name: the agent's name exactly as given.
- payoffClear: 1 to 5. Could you repeat this agent's payoff to a business partner in one sentence? 1 means you cannot tell what you would get; 5 means you could say it in one breath.
- payoffSize: 1 to 5. Is the time or money it saves or makes significant for a business like yours? 1 means trivial or unclear; 5 means clearly worth a real budget line.
- recognisable: 1 to 5. Do you already know you have the problem it solves, without being persuaded? 1 means you would have to be talked into it; 5 means you feel it every week.
- finishedWork: true if it hands you or your staff finished work you would otherwise produce yourselves (a draft schedule, a priced quote, a reorder list, a reply ready to send); false if it only watches, forecasts, flags, summarises, or reports.
- wouldPay: true if you would pay to have this agent built and run.
- reason: one sentence, in your own voice, on the score.

Then say which blueprint you would rather buy (preferred, "A" or "B") and why in one or two sentences (preferredWhy). Judge only what is written. Do not reward length or polish for its own sake. Use whole numbers for the scores.`;

type ShownAgent = Record<string, unknown>;
type StoredAgent = NonNullable<VariantFile["blueprint"]>["agents"][number];

/** Name, role, what it does, and every payoff field the agent has. */
function showAgent(a: StoredAgent): ShownAgent {
  const shown: ShownAgent = { name: a.name, role: a.role };
  if (a.value) {
    shown.payoffKind = a.value.kind;
    shown.whoBenefits = a.value.who;
    shown.howItIsDoneToday = a.value.today;
    shown.howToSizeIt = a.value.sizing;
  }
  shown.expectedImpact = a.impact;
  shown.whatItDoes = a.does;
  return shown;
}

function companyBlock(p: Profile): string {
  return JSON.stringify(
    {
      name: p.companyName,
      oneLiner: p.oneLiner,
      offerings: p.offerings,
      customers: p.customers,
      businessModel: p.businessModel,
      operations: p.operations,
    },
    null,
    2
  );
}

const clampScore = (n: number) => Math.min(5, Math.max(1, Math.round(n)));

async function judgeHost(client: Anthropic, host: string): Promise<void> {
  const profileFile = readJson<ProfileFile>(fileFor(host, "profile"));
  const base = readJson<VariantFile>(fileFor(host, baseLabel));
  const cand = readJson<VariantFile>(fileFor(host, candLabel));
  if (!profileFile || !base?.blueprint || !cand?.blueprint) {
    console.log(`  [${host}] needs profile.json and successful ${baseLabel}.json and ${candLabel}.json; skipping`);
    return;
  }
  if (readJson(fileFor(host, judgeName)) && !force) {
    console.log(`  [${host}] ${judgeName}.json exists; skipping (use --force to redo)`);
    return;
  }
  guardSpend(`judging ${host}`);
  const mapping = Math.random() < 0.5 ? { A: baseLabel, B: candLabel } : { A: candLabel, B: baseLabel };
  const byLabel: Record<string, VariantFile> = { [baseLabel]: base, [candLabel]: cand };
  const agentsA = byLabel[mapping.A].blueprint!.agents;
  const agentsB = byLabel[mapping.B].blueprint!.agents;
  const content = `<company>
${companyBlock(profileFile.profile)}
</company>

<blueprint_a>
${JSON.stringify(agentsA.map(showAgent), null, 2)}
</blueprint_a>

<blueprint_b>
${JSON.stringify(agentsB.map(showAgent), null, 2)}
</blueprint_b>

Score every agent in Blueprint A, then every agent in Blueprint B, then pick one.`;

  const message = await client.messages.parse(
    {
      model: JUDGE_MODEL,
      max_tokens: 8000,
      system: JUDGE_SYSTEM,
      messages: [{ role: "user", content }],
      output_config: { format: zodOutputFormat(JudgeSchema), effort: "medium" },
    },
    { timeout: 180_000, maxRetries: 1 }
  );
  const usage = toUsageRecord(JUDGE_MODEL, message.usage);
  const parsed = message.parsed_output;
  if (!parsed) throw new Error(`Judge returned no parsed output for ${host} (stop ${message.stop_reason})`);
  const fix = (list: JudgeOutput["blueprintA"]) =>
    list.map((s) => ({ ...s, payoffClear: clampScore(s.payoffClear), payoffSize: clampScore(s.payoffSize), recognisable: clampScore(s.recognisable) }));
  const file: JudgeFile = {
    host,
    createdAt: new Date().toISOString(),
    model: JUDGE_MODEL,
    mapping,
    scores: { [mapping.A]: fix(parsed.blueprintA), [mapping.B]: fix(parsed.blueprintB) },
    preferred: parsed.preferred === "A" ? mapping.A : mapping.B,
    preferredWhy: parsed.preferredWhy,
    usage,
    estCostUsd: costUsd([usage]),
  };
  writeJson(fileFor(host, judgeName), file);
  console.log(`  [${host}] prefers ${file.preferred}; $${file.estCostUsd.toFixed(4)}`);
}

async function runJudge() {
  loadApiKey();
  const client = new Anthropic();
  for (const host of hosts.length ? hosts : listHosts()) await judgeHost(client, host);
  console.log(`Recorded spend under ${outDir}: $${spentSoFar().toFixed(3)}`);
}

// ---------- summary mode ----------

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
function median(xs: number[]): number {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const fmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "n/a");
const pct = (num: number, den: number) => (den ? `${Math.round((100 * num) / den)}% (${num}/${den})` : "n/a");

function writeSummary() {
  const pair = [baseLabel, candLabel];
  const lines: string[] = [`# Blueprint value eval: ${baseLabel} vs ${candLabel}`, ""];
  const times: Record<string, number[]> = { [baseLabel]: [], [candLabel]: [] };
  const scores: Record<string, JudgeOutput["blueprintA"]> = { [baseLabel]: [], [candLabel]: [] };
  let judged = 0;
  let preferCand = 0;
  const failures: Record<string, string[]> = { [baseLabel]: [], [candLabel]: [] };

  for (const host of listHosts()) {
    const profileFile = readJson<ProfileFile>(fileFor(host, "profile"));
    if (!profileFile) continue;
    lines.push(`## ${host} (${profileFile.profile.companyName})`, "");
    for (const variant of pair) {
      const v = readJson<VariantFile>(fileFor(host, variant));
      if (!v) {
        lines.push(`### ${variant}: not run`, "");
        continue;
      }
      times[variant].push(v.designMs);
      const gate = !v.ok ? `error (${v.error})` : v.gate?.ok ? "gate ok" : `gate failed: ${v.gate?.failures.join(" ")}`;
      if (!v.ok || !v.gate?.ok) failures[variant].push(`${host}: ${gate}`);
      lines.push(`### ${variant}: ${gate}; design ${(v.designMs / 1000).toFixed(1)}s; $${v.estCostUsd.toFixed(4)}`, "");
      if (!v.blueprint) continue;
      lines.push(`Headline: ${v.blueprint.headline}`, "");
      for (const a of v.blueprint.agents) {
        lines.push(`- **${a.name}**: ${a.impact}`);
        if (a.value) {
          lines.push(`  - kind: ${a.value.kind}; who: ${a.value.who}`);
          lines.push(`  - today: ${a.value.today}`);
          lines.push(`  - sizing: ${a.value.sizing}`);
        }
      }
      lines.push("", `First build: ${v.blueprint.firstBuild.agentName}. ${v.blueprint.firstBuild.why}`, "");
    }
    const judge = readJson<JudgeFile>(fileFor(host, judgeName));
    if (judge) {
      judged++;
      if (judge.preferred === candLabel) preferCand++;
      for (const variant of pair) scores[variant].push(...(judge.scores[variant] ?? []));
      lines.push(`Judge (A was ${judge.mapping.A}) prefers **${judge.preferred}**: ${judge.preferredWhy}`, "");
    }
  }

  const head = ["", `| | ${baseLabel} | ${candLabel} |`, "|---|---|---|"];
  const row = (name: string, f: (v: string) => string) => `| ${name} | ${f(baseLabel)} | ${f(candLabel)} |`;
  const avg = (key: "payoffClear" | "payoffSize" | "recognisable") => (v: string) => fmt(mean(scores[v].map((s) => s[key])));
  const share = (key: "finishedWork" | "wouldPay") => (v: string) => pct(scores[v].filter((s) => s[key]).length, scores[v].length);
  const totals = [
    "## Totals",
    ...head,
    row("Agents judged", (v) => String(scores[v].length)),
    row("payoffClear (1-5)", avg("payoffClear")),
    row("payoffSize (1-5)", avg("payoffSize")),
    row("recognisable (1-5)", avg("recognisable")),
    row("finishedWork", share("finishedWork")),
    row("wouldPay", share("wouldPay")),
    row("Design time median", (v) => `${fmt(median(times[v]) / 1000, 1)}s`),
    row("Design time max", (v) => `${fmt(Math.max(...times[v]) / 1000, 1)}s`),
    row("Gate failures or errors", (v) => String(failures[v].length)),
    "",
    `Hosts preferring ${candLabel}: ${preferCand} of ${judged} judged.`,
    "",
    `Recorded spend (research, both variants, judge, failed attempts): $${spentSoFar().toFixed(3)}`,
    "",
  ];
  for (const variant of pair) {
    if (failures[variant].length) totals.push(`${variant} gate failures or errors:`, ...failures[variant].map((f) => `- ${f}`), "");
  }
  lines.splice(2, 0, ...totals);
  writeFileSync(path.join(outDir, summaryName), lines.join("\n"));
  console.log(`Wrote ${path.join(outDir, summaryName)}`);
}

if (summaryMode) writeSummary();
else if (judgeMode) await runJudge();
else await runMode();
