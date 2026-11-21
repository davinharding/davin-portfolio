import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ESLint } = require("eslint");

const BASELINE = "comment-baseline.json";
const args = new Set(process.argv.slice(2));
const checkCss = args.has("--check-css");
const allowIncrease = args.has("--allow-increase");

const tracked = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { encoding: "utf8" })
  .split("\n")
  .filter((file) => file && existsSync(file));

function cssCounts() {
  const counts = {};
  for (const file of tracked.filter((f) => f.endsWith(".css"))) {
    const n = (readFileSync(file, "utf8").match(/\/\*[\s\S]*?\*\//g) || []).length;
    if (n) counts[file] = n;
  }
  return counts;
}

async function scriptCounts() {
  const eslint = new ESLint({
    extensions: [".ts", ".tsx", ".js", ".mjs", ".mts"],
    rulePaths: ["eslint-rules"],
    overrideConfig: { rules: { "no-comments": ["error", { baselineFile: null }] } },
  });
  const results = await eslint.lintFiles(["."]);
  const counts = {};
  for (const result of results) {
    const n = result.messages.filter((m) => m.ruleId === "no-comments").length;
    if (n) counts[result.filePath.slice(process.cwd().length + 1)] = n;
  }
  return counts;
}

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {};

if (checkCss) {
  const failures = [];
  const css = cssCounts();
  const files = new Set([...Object.keys(css), ...Object.keys(baseline).filter((f) => f.endsWith(".css"))]);
  for (const file of files) {
    const count = css[file] || 0;
    const allowed = baseline[file] || 0;
    if (count > allowed) failures.push(`${file}: ${count} comments, ${allowed} allowed (docs/adr/0001)`);
    if (count < allowed) failures.push(`${file}: ${count} comments, baseline allows ${allowed}; run npm run comments:baseline`);
  }
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  process.exit(0);
}

const next = { ...(await scriptCounts()), ...cssCounts() };
const increases = Object.entries(next).filter(([file, n]) => n > (baseline[file] || 0));
if (increases.length && !allowIncrease) {
  console.error("Refusing to raise the comment baseline (docs/adr/0001):");
  for (const [file, n] of increases) console.error(`  ${file}: ${baseline[file] || 0} -> ${n}`);
  console.error("Delete the new comments, or pass --allow-increase if raising it is deliberate.");
  process.exit(1);
}

const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(BASELINE, `${JSON.stringify(sorted, null, 2)}\n`);
const total = Object.values(sorted).reduce((sum, n) => sum + n, 0);
console.log(`${BASELINE}: ${total} comments allowed across ${Object.keys(sorted).length} files`);
