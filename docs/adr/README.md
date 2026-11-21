# Architecture decision records

This folder holds the non-obvious decisions behind the code. The code itself carries no comments (see [ADR 0001](0001-no-code-comments.md)). When something in the code looks odd, look here first.

| ADR | Decision |
| --- | --- |
| [0001](0001-no-code-comments.md) | Code carries no comments; decisions live here |
| [0002](0002-analytics-pipeline.md) | Analytics go through a same-origin PostHog relay and never affect the page |
| [0003](0003-homepage-design-experiment.md) | The proxy assigns the homepage design with PostHog's own hash |
| [0004](0004-blueprint-api-and-run-lifecycle.md) | A blueprint run outlives the request and streams NDJSON |
| [0005](0005-fetching-visitor-supplied-sites.md) | Visitor-supplied sites are fetched behind a connect-time address policy |
| [0006](0006-spend-and-visitor-limits.md) | Spend is reserved up front, settled after, and always errs high |
| [0007](0007-model-stages.md) | Model stages see untrusted text as data and are checked by a deterministic gate |
| [0008](0008-blueprint-storage-and-pages.md) | Blueprints are immutable, cached briefly, and examples never touch Redis |
| [0009](0009-theme-and-splash-before-first-paint.md) | Theme and splash are decided before first paint, in CSS and an inline script |
| [0010](0010-portfolio-pages.md) | Portfolio pages are static, drafts are reachable but hidden |
| [0011](0011-homepage-designs.md) | Homepage designs share one run model and work without JavaScript |

## Writing a new one

Copy the shape of an existing record: **Status**, **Context**, **Decision**, **Consequences**, and **Where** (files and symbols, never line numbers). Number it with the next free number. When a decision is reversed, mark the old record `Superseded by NNNN` instead of editing history.

The [`/delete-comment`](../../.claude/skills/delete-comment/SKILL.md) skill moves comments into these records.
