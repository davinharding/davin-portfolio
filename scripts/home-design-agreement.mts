import { writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { assignVariant } from "../src/lib/experiments/homeDesign";
import { posthogIngestHost, posthogKey } from "../src/lib/analytics/config";

const args = process.argv.slice(2);
const write = args.includes("--write");
const [flagKey, countArg] = args.filter((a) => !a.startsWith("--"));
const count = Number(countArg ?? 200);

if (!flagKey || !Number.isInteger(count) || count < 1) {
  console.error("Usage: home-design-agreement.mts <flag-key> [count] [--write]");
  process.exit(2);
}
const apiKey = posthogKey();
if (!apiKey) {
  console.error("NEXT_PUBLIC_POSTHOG_KEY is not set.");
  process.exit(2);
}

async function posthogVariant(id: string): Promise<unknown> {
  const res = await fetch(`${posthogIngestHost()}/flags?v=2`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, distinct_id: id }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`PostHog flags endpoint returned ${res.status}`);
  const data = (await res.json()) as { flags?: Record<string, { enabled?: boolean; variant?: string | null }> };
  const flag = data.flags?.[flagKey];
  return flag?.enabled ? flag.variant ?? true : undefined;
}

const pairs: Array<[string, string]> = [];
const mismatches: Array<{ id: string; local: string; posthog: unknown }> = [];
const tally: Record<string, number> = {};

for (let done = 0; done < count; done += 20) {
  const ids = Array.from({ length: Math.min(20, count - done) }, () => randomUUID());
  const answers = await Promise.all(
    ids.map(async (id) => ({ id, local: await assignVariant(id, flagKey), posthog: await posthogVariant(id) }))
  );
  for (const a of answers) {
    tally[String(a.posthog)] = (tally[String(a.posthog)] ?? 0) + 1;
    if (a.posthog === a.local) pairs.push([a.id, a.local]);
    else mismatches.push(a);
  }
}

console.log(`Flag "${flagKey}": ${pairs.length} of ${count} ids agree. PostHog answered:`, tally);
if (mismatches.length > 0) {
  console.error("Disagreements (first 5):", mismatches.slice(0, 5));
  process.exit(1);
}

if (write) {
  const file = fileURLToPath(new URL("../src/lib/experiments/__tests__/posthogVectors.ts", import.meta.url));
  const rows = pairs.slice(0, 10).map(([id, variant]) => `    ["${id}", "${variant}"],`);
  writeFileSync(
    file,
    `// Answers from PostHog's own flags endpoint, captured by the agreement test in
// docs/specs/home-design-experiment.md (section 11.3). They pin assignVariant()
// to what PostHog computes. Written by scripts/home-design-agreement.mts.
export const POSTHOG_VECTORS: { flagKey: string; pairs: ReadonlyArray<readonly [id: string, variant: string]> } = {
  flagKey: "${flagKey}",
  pairs: [
${rows.join("\n")}
  ],
};
`
  );
  console.log(`Wrote ${rows.length} vectors to ${file}`);
}
