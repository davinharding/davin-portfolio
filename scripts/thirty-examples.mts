// Regenerates the committed example blueprints through the real pipeline.
// Needs ANTHROPIC_API_KEY only (an in-memory store stands in for Redis).
//   npm run thirty:examples              all three
//   npm run thirty:examples -- linear    one of them
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { liveStages, newRunId, RunEmitter, runPipeline } from "../src/lib/thirty/pipeline";
import { parseStoredBlueprint } from "../src/lib/thirty/schema";
import { checkQuality } from "../src/lib/thirty/quality";
import { keys, MemoryStore } from "../src/lib/thirty/store";
import { normalizeInput } from "../src/lib/thirty/url";

const EXAMPLES: Record<string, string> = {
  allbirds: "allbirds.com",
  linear: "linear.app",
  sweetgreen: "sweetgreen.com",
};

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set.");
  process.exit(1);
}

const only = process.argv.slice(2).filter(Boolean);
const names = only.length ? only : Object.keys(EXAMPLES);
const outDir = path.resolve(process.cwd(), "src/data/blueprints");
let failed = 0;

for (const name of names) {
  const url = EXAMPLES[name];
  if (!url) {
    console.error(`Unknown example "${name}". Choose from: ${Object.keys(EXAMPLES).join(", ")}`);
    failed++;
    continue;
  }
  const input = normalizeInput(url);
  if (!input.ok) throw new Error(`${url} failed input rules: ${input.code}`);

  const store = new MemoryStore();
  const emitter = new RunEmitter();
  emitter.subscribe((e) => {
    if (e.t === "step") console.log(`  [${name}] ${e.id} ${e.status}${e.ms !== undefined ? ` ${e.ms}ms` : ""}`);
    if (e.t === "agent") console.log(`  [${name}] agent: ${e.name}`);
    if (e.t === "note") console.log(`  [${name}] ${e.text}`);
  });
  const { stages, models } = liveStages();
  const outcome = await runPipeline(
    {
      runId: newRunId(),
      host: input.host,
      hostname: input.hostname,
      inputUrl: url,
      extraPath: input.extraPath,
      visitor: "script",
      day: "script",
      reservation: { monthKey: "script", reservedMicros: 0 },
      requestStartedAt: Date.now(),
    },
    { store, stages, models, emitter, slugFor: () => `example-${name}` }
  );
  if (!outcome.ok) {
    console.error(`  [${name}] failed: ${outcome.code}`);
    failed++;
    continue;
  }
  const raw = await store.get(keys.blueprint(outcome.slug));
  const stored = parseStoredBlueprint(JSON.parse(raw ?? "null"));
  const example = { ...stored, kind: "example" as const };
  const gate = checkQuality(example.blueprint, { companyName: example.company.name, offerings: example.company.offerings });
  if (!gate.ok) console.warn(`  [${name}] gate warnings: ${gate.failures.join(" ")}`);
  const file = path.join(outDir, `example-${name}.json`);
  await writeFile(file, JSON.stringify(example, null, 2) + "\n");
  console.log(
    `  [${name}] wrote ${path.relative(process.cwd(), file)} (${example.receipt?.totalMs}ms, $${example.receipt?.estCostUsd.toFixed(4)})`
  );
}

process.exit(failed ? 1 : 0);
