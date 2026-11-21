# 0001. Code carries no comments; decisions live here

- **Status:** Accepted
- **Date:** 2026-11-21

## Context

An audit on 2026-11-21 found 612 comments (490 blocks once adjacent `//` lines are merged) across 104 files, taking up 737 lines. They sorted into four kinds:

| Kind | Blocks | What happened to them |
| --- | ---: | --- |
| Tautology: says what the code already says | 262 | Deleted |
| Stale: describes code that has changed | 4 | Deleted |
| Excuse: explains away a hacky implementation | 27 | Deleted; the hack is filed as an issue |
| Decision record: an important, non-obvious decision | 194 | Moved into ADRs 0002 to 0011 |
| Tool directive (`eslint-disable-*`, `@type`) | 3 | Kept |

Comments drift from the code without anything noticing. Excuse comments are worse: they make a workaround look settled, so the next change copies it.

## Decision

- Code carries no comments. Names, types and tests say what the code does. ADRs say why.
- A workaround that needs explaining gets a GitHub issue (label `tech-debt`), not a comment.
- Tool directives are allowed: `eslint-disable*`, `eslint-enable`, `@ts-expect-error`, `@ts-ignore`, `@ts-nocheck`, `@type` JSDoc in plain JS, triple-slash references, `prettier-ignore`.
- The `no-comments` ESLint rule (`eslint-rules/`, loaded with `--rulesdir`) enforces this with a ratchet. `comment-baseline.json` records how many comments each file may still hold. A file may never go above its number. When a file drops below its number, lint fails until the baseline is lowered with `npm run comments:baseline`, so the ceiling only goes down. Files missing from the baseline may hold none.
- `npm run comments:baseline` refuses to raise any count. A branch that must land with comments (for example one written before this rule) passes `--allow-increase` once, deliberately, and the ratchet takes over from there.
- CSS is checked by `node scripts/comment-baseline.mjs --check-css` as part of `npm run lint`, since ESLint does not read CSS.
- The `/delete-comment` skill repeats the audit for whatever the baseline still allows.

The baseline starts empty: this audit removed every comment. The excuse comments became issues [#9](https://github.com/davinharding/davin-portfolio/issues/9) to [#17](https://github.com/davinharding/davin-portfolio/issues/17) (label `tech-debt`).

## Consequences

- A reader looking for a "why" opens `docs/adr/` instead of the file. Each ADR's **Where** section names the files and symbols it covers.
- Adding a comment fails `npm run lint` in CI and in the editor.
- Writing a new ADR is the price of a non-obvious decision. That is intended.

## Where

- `eslint-rules/no-comments.js`, `.eslintrc.json`, `.vscode/settings.json` (`eslint.options.rulePaths`, so the editor runs the rule too)
- `scripts/comment-baseline.mjs`, `comment-baseline.json`, the `lint` and `comments:baseline` scripts in `package.json`
- `.claude/skills/delete-comment/SKILL.md`
