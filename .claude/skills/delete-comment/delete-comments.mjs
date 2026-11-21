import { readFileSync, writeFileSync } from "node:fs";

const [input] = process.argv.slice(2);
if (!input) {
  console.error("usage: node delete-comments.mjs <comments.json>   (entries from list-comments.mjs)");
  process.exit(2);
}

const blank = (s) => s !== undefined && s.trim() === "";
const byFile = new Map();
for (const c of JSON.parse(readFileSync(input, "utf8"))) {
  if (!byFile.has(c.file)) byFile.set(c.file, []);
  byFile.get(c.file).push(c);
}

let removed = 0;
const review = [];
for (const [file, list] of byFile) {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  const before = lines.length;
  list.sort((a, b) => b.line - a.line || b.start - a.start);
  for (const c of list) {
    if (src.slice(c.start, c.end) !== c.text) throw new Error(`${file}:${c.line} changed since it was listed; list again`);
    if (!c.ownLine) {
      const i = c.line - 1;
      const col = c.start - (src.lastIndexOf("\n", c.start - 1) + 1);
      const ln = lines[i];
      const head = ln.slice(0, col);
      const tail = ln.slice(col + c.text.length);
      lines[i] = head.trim() === "" ? head + tail.replace(/^\s+/, "") : (head.replace(/\s+$/, "") + tail).replace(/\s+$/, "");
      continue;
    }
    const a = c.line - 1;
    lines.splice(a, c.endLine - c.line + 1);
    const prev = lines[a - 1];
    const next = lines[a];
    if (a === 0 && blank(next)) lines.splice(a, 1);
    else if (blank(prev) && blank(next)) lines.splice(a, 1);
    else if (prev !== undefined && /[{([]\s*$/.test(prev) && blank(next)) lines.splice(a, 1);
    else if (blank(prev) && next !== undefined && /^\s*[})\]]/.test(next)) lines.splice(a - 1, 1);
    else if (prev !== undefined && next !== undefined && /\{\s*$/.test(prev) && /^\s*\}/.test(next)) {
      if (/(catch(\s*\([^)]*\))?|=>|\))\s*\{\s*$/.test(prev)) {
        lines[a - 1] = prev.replace(/\s*$/, "") + next.trim();
        lines.splice(a, 1);
        if (/\)\s*\{\}\s*else/.test(lines[a - 1])) review.push(`${file}:${a}: empty branch before else; invert the condition`);
      }
    }
  }
  removed += before - lines.length;
  writeFileSync(file, lines.join("\n"));
}

console.log(`deleted from ${byFile.size} files, ${removed} lines removed`);
for (const line of review) console.log(`review ${line}`);
