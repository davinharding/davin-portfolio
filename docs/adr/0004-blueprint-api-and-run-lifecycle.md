# 0004. A blueprint run outlives the request and streams NDJSON

- **Status:** Accepted
- **Date:** 2026-11-21 (recorded from code comments)
- **Spec:** `docs/specs/thirty-seconds.md`, sections 5 and 8.6

## Context

`POST /api/blueprint` turns a company website into an agent blueprint. A run costs money from its first model call, takes up to a minute, and visitors close tabs.

## Decision

**Request flow**
- The handler runs the cheap checks first, in a fixed order, and nothing before the run costs money: body, same origin, honeypot, flood guard, normalize, positive cache, negative cache, live availability, store health, keep-alive, per-visitor daily limit, global daily cap then monthly budget, per-host lock, then the run. A request can also end as a cache hit or as a wait on someone else's run for the same host.
- `handle()` is a short chain of named steps (`readRequest`, `guardFlood`, `normalizeTarget`, `serveFromCache`, `requireLiveStore`, `holdOpen`, `takeQuota`, `waitBehindOtherRun` / `startLiveRun`). Each returns either a `Response`, which ends the request, or the value the next step needs. The order lives in `checkAndRun` and `runHeld`.
- Without a store the budget cannot be enforced, so a store failure stops the request before the run.
- The form carries a honeypot field real visitors never see or fill; a filled one is a bad request.
- The form posts natively to `/api/blueprint` when JavaScript has not loaded, so the API has a JSON mode and a form mode.

**The run outlives the connection**
- The run owns its own deadline and is never tied to the visitor's connection. The money is spent either way, so the result is kept and cached.
- The route hands the run to Next's `after()`, which keeps the function alive until the run settles.
- The keep-alive is registered before any quota or budget is taken: `holdOpen` hands `after()` a promise that the run (or the wait on another run) later settles, and that early refusals release. If `after()` cannot be registered, the request fails closed with `unavailable` before anything is spent, because a function that is not kept alive can be frozen mid-run with its money already gone. Analytics events are the exception: losing one is acceptable, so a failed keep-alive there is only logged.
- `RunEmitter` buffers events so a subscriber that attaches late still sees the whole run. A closed connection only detaches that subscriber, and a closed or broken subscriber can never affect the run.

**Streaming**
- `src/lib/thirty/events.ts` is the NDJSON contract between the API route and the browser. It is client-safe.

**Configuration**
- `config.ts` reads the environment on every call, so tests and a Vercel env change picked up by a fresh function instance see current values.
- Whether a live run may start is decided per request, so the kill switch works without a redeploy.

**Testability and mock mode**
- The handler's dependencies are injected, so the whole flow is testable without a network, a model, or Redis. The four stages (read site, search brief, extract profile, draft blueprint) are injectable too.
- Mock mode (`THIRTY_MOCK=1`, never in production) runs the real orchestrator, store, limits, lock and budget, with stand-in stages for the network and the model. `<code>.test` hosts trigger specific outcomes (`not-a-company.test` gives `not_a_company`), `drop.test` closes the stream mid-run without a terminal event, and `five-agents.test` gives the largest blueprint to exercise the widest layouts. Mock mode needs no API key and accepts `.test` hosts.

## Consequences

- A visitor who leaves still gets a cached blueprint if they come back.
- Reordering the checks changes what costs money. Keep the cheapest and least revealing checks first.

## Where

- `src/app/api/blueprint/route.ts`
- `src/lib/thirty/handler.ts`, `pipeline.ts` (`RunEmitter`, `runPipeline`, `Stages`), `events.ts`, `config.ts`, `mock.ts`
- `src/components/thirty/UrlForm.tsx`
