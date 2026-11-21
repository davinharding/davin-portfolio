# 0008. Blueprints are immutable, cached briefly, and examples never touch Redis

- **Status:** Accepted
- **Date:** 2026-11-21 (recorded from code comments)
- **Spec:** `docs/specs/thirty-seconds.md`, sections 4.5 and 10.4

## Context

Each run produces a blueprint stored in Upstash Redis and shown at `/b/<slug>`. The production Redis is shared, so local runs must stay away from it. Three example blueprints are committed to the repo.

## Decision

**Store**
- One small key-value interface sits over Upstash Redis, with an in-memory implementation for local development and tests. Values stay raw strings and JSON is parsed by the caller (`automaticDeserialization: false`).
- Every store call has a timeout and failures become `StoreError`.
- Which store: in-memory in mock mode (so local mock runs never write fixtures or use up the daily cap in the shared Redis), Upstash when its env exists, in-memory outside production, otherwise none, which disables live runs.
- The store lives in module state on `globalThis`, so it survives dev hot reloads and is shared between the API route and page renders in one server process.

**Blueprint pages**
- Blueprints are immutable, so the raw stored value is cached for 5 minutes and repeat views skip Redis. Errors are not cached.
- `/b/[slug]` renders per request (`force-dynamic`) so a store outage reaches `error.tsx`. An ISR page whose first render throws is served as a bare 500 instead.
- A missing blueprint returns null (404). A store failure or invalid stored data throws `BlueprintUnavailableError`, which the error boundary turns into a retry page.
- `/b/` stays crawlable in `robots.ts` so crawlers can read each page's `noindex` tag and drop it.
- A company's host or name can be one long unbroken word (a 60-character subdomain), so the page uses `overflow-wrap: anywhere` and never scrolls sideways.

**Examples**
- The example blueprints are committed files, served without touching Redis. They are parsed at module load, so an invalid example fails the build rather than a visitor.
- The `example-` slug prefix is reserved for them; generated slugs that would start with it are prefixed with `x-`.
- `npm run thirty:examples [-- <name>]` regenerates them through the real pipeline. It needs only `ANTHROPIC_API_KEY`; an in-memory store stands in for Redis.

**Admin**
- `npm run thirty:admin -- get <slug> | delete <slug> | stats` works against the production store and needs the Redis env vars.

## Consequences

- Deleting a blueprint can take up to 5 minutes to disappear from its page.
- Running anything with the Redis env set talks to production.

## Where

- `src/lib/thirty/store.ts`, `blueprints.ts`, `examples.ts`, `slug.ts`, `config.ts` (`hasStore`)
- `src/app/b/[slug]/page.tsx`, `src/app/robots.ts`, `src/components/thirty/BlueprintView.tsx`
- `scripts/thirty-examples.mts`, `scripts/thirty-admin.mts`
