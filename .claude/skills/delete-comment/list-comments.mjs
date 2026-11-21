import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(path.join(process.cwd(), "package.json"));
const { ESLint } = require("eslint");

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const out = outIndex >= 0 ? args.splice(outIndex, 2)[1] : null;
const targets = args.length ? args : ["."];

function lineStarts(src) {
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === "\n") starts.push(i + 1);
  return starts;
}

function describe(file, src, start, end) {
  const text = src.slice(start, end);
  const ls = src.lastIndexOf("\n", start - 1) + 1;
  let le = src.indexOf("\n", end);
  if (le < 0) le = src.length;
  const before = src.slice(ls, start);
  const after = src.slice(end, le);
  const jsx = /\{\s*$/.test(before) && /^\s*\}/.test(after);
  const ownLine = jsx
    ? /^\s*\{\s*$/.test(before) && /^\s*\}\s*$/.test(after)
    : before.trim() === "" && after.trim() === "";
  const line = src.slice(0, start).split("\n").length;
  const endLine = line + text.split("\n").length - 1;
  const lines = src.split("\n");
  const context = ownLine ? (lines[endLine] ?? "").trim() : lines[line - 1].trim();
  return { file, start, end, line, endLine, ownLine, jsx, text, context };
}

const eslint = new ESLint({
  extensions: [".ts", ".tsx", ".js", ".mjs", ".mts"],
  rulePaths: ["eslint-rules"],
  overrideConfig: { rules: { "no-comments": ["error", { baselineFile: null }] } },
});

const comments = [];
for (const result of await eslint.lintFiles(targets)) {
  const hits = result.messages.filter((m) => m.ruleId === "no-comments");
  if (!hits.length) continue;
  const file = path.relative(process.cwd(), result.filePath).split(path.sep).join("/");
  const src = readFileSync(result.filePath, "utf8");
  const starts = lineStarts(src);
  for (const m of hits) {
    comments.push(describe(file, src, starts[m.line - 1] + m.column - 1, starts[m.endLine - 1] + m.endColumn - 1));
  }
}

const css = execFileSync("git", ["ls-files", "-co", "--exclude-standard", "--", ...targets], { encoding: "utf8" })
  .split("\n")
  .filter((f) => f.endsWith(".css") && existsSync(f));
for (const file of css) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/\/\*[\s\S]*?\*\//g)) comments.push(describe(file, src, m.index, m.index + m[0].length));
}

comments.sort((a, b) => a.file.localeCompare(b.file) || a.start - b.start);
let block = 0;
comments.forEach((c, i) => {
  const prev = comments[i - 1];
  const joins =
    prev &&
    prev.file === c.file &&
    prev.ownLine &&
    c.ownLine &&
    prev.text.startsWith("//") &&
    c.text.startsWith("//") &&
    c.line === prev.endLine + 1;
  if (!joins) block++;
  c.id = i + 1;
  c.block = block;
});

const json = JSON.stringify(comments, null, 1);
if (out) writeFileSync(out, json);
else process.stdout.write(json + "\n");
const ownLines = comments.reduce((sum, c) => sum + (c.ownLine ? c.endLine - c.line + 1 : 0), 0);
console.error(`${comments.length} comments in ${block} blocks, ${ownLines} comment-only lines, ${new Set(comments.map((c) => c.file)).size} files`);
