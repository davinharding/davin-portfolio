---
name: delete-comment
description: Audit code comments and remove them under the no-comments policy (docs/adr/0001). Sorts every comment as tautology, stale, excuse or decision record; deletes tautologies and stale ones, files a GitHub issue for each excuse's hack, moves decision records into docs/adr, then lowers comment-baseline.json. Use when the user says /delete-comment, "delete comments", "comment audit", "ratchet the comment baseline", or the no-comments lint rule fails.
---

# /delete-comment

Comments are not allowed in this repo (`docs/adr/0001-no-code-comments.md`). `comment-baseline.json` lists files that may still hold some. The `no-comments` ESLint rule (`eslint-rules/no-comments.js`) and `node scripts/comment-baseline.mjs --check-css` hold each file at or below its count. This skill takes the counts down.

Arguments, optional: paths or globs to audit. Default: every file the baseline still allows, plus any file the lint rule flags.

## 1. Inventory

```bash
node .claude/skills/delete-comment/list-comments.mjs --out /tmp/comments.json [paths...]
```

This prints one entry per comment: `file`, `line`, `endLine`, `ownLine`, `jsx`, `text`, `context` (the code line it sits on or above), `id` and `block`. Adjacent `//` lines share a `block`, so judge blocks, not lines. Tool directives (`eslint-disable*`, `@ts-expect-error`, `@type`, triple-slash, `prettier-ignore`) are never listed; leave them.

Write the inventory to your scratchpad, not the repo.

## 2. Categorise every block

Read each block with enough surrounding code to judge it. Open the file whenever `context` is not enough.

| Category | Test | Action |
| --- | --- | --- |
| **Tautology** | Says what the names, types, or code already say. Section labels in JSX (`{/* Links */}`), JSDoc that restates a signature, "Respect reduced motion" above a reduced-motion check. | Delete |
| **Stale** | Describes code that is no longer true: wrong counts, renamed or removed things, a doc comment orphaned above the wrong function, a label over unused CSS. Check the claim against the code before calling it stale. | Delete. Mention any dead code it exposed in the PR. |
| **Excuse** | Justifies a workaround: "defensive", "should not happen", "fixes", "hack", a monkeypatch, numbered step labels in a function too long to read, swallowing an error to cover a design gap, `!important` overrides. | Delete, and file an issue for the hack (step 4) |
| **Decision record** | An important, non-obvious *why* that would change how someone edits the code: security rules, cost rules, ordering that matters, why the obvious approach was rejected, cross-file contracts. | Move into an ADR (step 3), then delete |

When in doubt between tautology and decision record, ask: would a competent engineer editing this code make a mistake without it? If not, it is a tautology. Numbers in a comment that repeat a constant are tautologies.

Record the category for each block in your scratchpad. Report the counts at the end.

## 3. Decision records into ADRs

- Read `docs/adr/README.md` and the existing records first. Add to the ADR that already covers the area (append to **Decision** and **Where**). Start a new numbered ADR only for a new area, and add it to the README index.
- Write each decision as a plain statement with its reason. Name files and symbols in **Where**, never line numbers.
- Fix anything the comment got wrong while you move it, such as an old route name.

## 4. Excuses into issues

One issue per hack, not per comment: group comments that excuse the same workaround.

```bash
gh issue create --label tech-debt --title "<Area>: <what to fix>" --body-file <file>
```

The body needs: the file and symbol; the comment's text, quoted, since the comment is about to be deleted; what the hack does and why it is a problem; a suggested fix; `Found by /delete-comment (docs/adr/0001).` Create the `tech-debt` label if it is missing. Filing issues publishes to GitHub, so file only what this audit found.

## 5. Delete

Put the entries to delete (every category, all four delete) in a JSON array and run:

```bash
node .claude/skills/delete-comment/delete-comments.mjs /tmp/delete.json
```

It removes own-line comments with their lines, trims trailing ones, drops the blank line a removal would double, and collapses a comment-only `catch {}` body. It refuses if a file changed since the inventory. For every `review` line it prints, rewrite the code by hand: an `if (x) {} else` becomes `if (!x)`. Do not run Prettier over whole files; this repo is not Prettier-clean, and doing so would bury the change.

## 6. Ratchet down and verify

```bash
npm run comments:baseline
```

This lowers the counts. It refuses to raise any; only pass `--allow-increase` if the user asks for it.

Then all of these must pass:

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm test
```

```bash
npm run build
```

Scan `git diff` for leftover blank-line or whitespace oddities.

## 7. Report

Tell the user:
- how many blocks went into each category
- the ADRs added or extended
- the issues filed, with links
- the lines removed (`git diff --shortstat`)
- what the baseline still allows
