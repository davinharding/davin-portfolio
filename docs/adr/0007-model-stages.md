# 0007. Model stages see untrusted text as data and are checked by a deterministic gate

- **Status:** Accepted
- **Date:** 2026-11-21 (recorded from code comments)
- **Spec:** `docs/specs/thirty-seconds.md`, sections 7.2 to 8.5

## Context

A run reads a stranger's website and asks models to describe the company and design an agent team for it. The website text is untrusted, model output can be malformed, and whatever the page shows visitors appears under Davin's name.

## Decision

**Stages**
- Research extracts a structured profile from the site text. Design drafts the blueprint and sees only that structured profile, never the raw site.
- When the site will not load for a bot, one hosted web-search call writes a plain-text brief, which goes through the same research step.
- The design call is streamed so agent names can be shown as they are written. Agent names are found in partial JSON by `name` followed by `role`, which tools never have, so tool names are not picked up. A malformed escape mid-stream is ignored: the final parse is the authority. Progress display can never fail the run.

**Untrusted text**
- Scraped text is neutralized so it cannot close the prompt's delimiters or open new tags.
- Blog indexes and posts are skipped when picking sub-pages; they rarely describe the business.

**Structured output and the gate**
- The model writes fields in schema order, so `AgentSchema` puts the payoff (`value`, `impact`) before the details, and `role` directly after `name`, which `findAgentNames` relies on. A test pins the order.
- The model-facing Zod schemas carry no numeric or length limits, because structured outputs support only a subset of JSON Schema. `quality.ts` enforces limits instead.
- The SDK is given a plain JSON schema (`jsonSchemaFormat`), never the auto-parsing format, so it never throws on model output. `readStructuredOutput` checks `stop_reason` first (`refusal`, `max_tokens`), then parses the text with the Zod schema (`empty`, `parse`). Every failure is a `ModelOutputError` that carries the call's real usage, so the spend reaches budget settlement (ADR 0006).
- Only a real refusal becomes `declined`, which is negative-cached. A truncated or malformed answer is our problem, so it maps to `internal` and the visitor is refunded.
- Normalization repairs and never fails. The quality gate after it is deterministic. Design gets one retry when the gate fails and time allows.

**Errors**
- Errors map to visitor-facing codes, most specific SDK class first, because several SDK classes inherit from each other.
- The search stage's own time limit counts as a failed fallback; the run's overall deadline and provider errors propagate to the pipeline. When the server pauses a long tool loop, the request is resent once with its turn appended.
- A failed search fallback: a search tool error is transient (retry). Otherwise a site that answered but could not be researched is "could not read enough", never "no website here". A search that runs past its stage limit counts as not enough to go on: on bot-blocked sites it tends to run long every time, and each retry would cost about as much again.

**Evaluating prompt changes**
- `scripts/blueprint-eval.mts` compares two versions of the design stage on the same companies. Run mode reads each site and extracts its profile once with the real stages, caching it under `--out`, so every variant drafts from the same profile. It then drafts with the production model and effort, normalizes, runs the gate once with no retry, and writes `<out>/<host>/<label>.json`. A baseline is made by running the same script from a checkout of the old code with another `--label` and the same `--out`.
- `--judge` has a judge model, playing the paying decision maker, score the agents of two labels (`--compare A,B`, default `old,new`) shown as "Blueprint A" and "Blueprint B" in a random order per host. `--summary` writes the comparison as markdown.
- It never touches Redis, the store, the pipeline or the route handler. It reads only `ANTHROPIC_API_KEY` from `--key-from` (default `.env.local`).
- `--cap` (default $3) stops any paid call once the spend recorded under `--out` reaches it. A failed call is still billed for what it streamed, so its cost is recorded too, estimated high when usage is unknown, and the total stays honest.

**Portfolio links in blueprints**
- `projectCatalog.ts` holds hand-written summaries of relevant published projects. It is separate from `projectData.ts` (which imports images) so scripts and tests can load it. Summaries restate only what `projectData.ts` says.
- The design model sees only catalog keys and pattern summaries. Visitors see only the fixed `relevance` text, never model-written claims about Davin's work.
- Catalog keys resolve only to projects that are still published; anything else is dropped on the page.

## Consequences

- Prompt injection in a site's text can at worst produce an odd profile, which the gate then checks.
- Raising limits means changing `quality.ts`, not the schema.

## Where

- `src/lib/thirty/research.ts`, `design.ts`, `searchFallback.ts`, `prompts.ts`
- `src/lib/thirty/schema.ts`, `quality.ts`, `extract.ts`, `anthropic.ts` (`jsonSchemaFormat`, `readStructuredOutput`, `ModelOutputError`, `mapRunError`)
- `src/lib/thirty/pipeline.ts` (`fallbackFailure`)
- `src/lib/thirty/projectCatalog.ts`, `src/components/thirty/BlueprintView.tsx`
- `scripts/blueprint-eval.mts`
