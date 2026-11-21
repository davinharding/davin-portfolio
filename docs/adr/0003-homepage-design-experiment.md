# 0003. The proxy assigns the homepage design with PostHog's own hash

- **Status:** Accepted
- **Date:** 2026-11-21 (recorded from code comments)
- **Spec:** `docs/specs/home-design-experiment.md`

## Context

The homepage has several designs under test. Assigning them in the browser would flash the wrong design and make every view wait on PostHog. Assigning them per request on the server would give up prerendering.

## Decision

**The site assigns, PostHog measures**
- `src/proxy.ts` runs before every page. On `/` it picks the visitor's design and rewrites to that design's prerendered page under `/home/<design>`, so nothing flashes and nothing renders per request.
- `assignVariant()` is PostHog's own multivariate hash (posthog-js, `packages/core/src/featureFlagLocalEvaluation.ts`): `sha1("<flag>.<id>variant")`, with the first 15 hex digits divided by `0xfffffffffffffff` to land in [0, 1), then matched against the arms' cumulative split. It runs on the same visitor id posthog-js is bootstrapped with, so PostHog's evaluation of the flag agrees with what was served without the page ever calling PostHog.
- `EXPERIMENT_ARMS` must match the flag in PostHog in both order and split, because the hash walks the arms cumulatively. Never change one side without the other. `classic` is the fallback and is not in the experiment.
- `scripts/home-design-agreement.mts <flag-key> [count] [--write]` asks PostHog's flags endpoint about `count` random ids (default 200) and compares each answer with `assignVariant()`. `--write` saves ten pairs to `__tests__/posthogVectors.ts`, which pin the unit test to what PostHog computes. The flag must be an active multivariate flag with the same variants and split as `EXPERIMENT_ARMS`. The script sends no events and creates no persons. The unit test also checks the Web Crypto version against an independent BigInt/`node:crypto` implementation.

**Identity**
- On any page other than `/`, the proxy only gives a new visitor their id (`dh_id`), so posthog-js starts from the same id the homepage will later hash. Without this, the header's prefetch of `/` could mint a second id that later replaced posthog-js's own (UP-19, FM-33).
- `instrumentation-client` bootstraps posthog-js from that id and the served design.

**Routes**
- `/home/<design>` pages exist only as rewrite targets. Direct requests for any `/home/*` path, dotted or not, are redirected back to `/`. Redirect targets are always this site's root, so a crafted path or query cannot redirect elsewhere.
- The proxy matches page routes only: not the API, Next's own files, the PostHog relay, generated images, or anything with a file extension.
- `src/app/page.tsx` renders the classic design. It is what visitors get if the proxy does not run or throws: the homepage must load regardless.
- The header marks the current page from a prop, not the path, because the path differs between server (`/home/<design>`) and browser (`/`).

**Caching**
- Any response that sets a visitor id or depends on their cookies is `Cache-Control: private, no-cache`. The prerendered page behind the rewrite says it can be cached for a year; a shared cache must not keep one visitor's response.

**Measurement**
- `home_viewed` is the exposure event. It is sent as soon as the page is on screen and never waits on PostHog's flag evaluation.
- PostHog reads the exposure's variant from `$feature/<flag>`. Only `ab` assignments set it, so pinned (`HOME_DESIGN`) and preview (`?variant=`) views are not counted as exposures.
- A missing or stale assignment cookie (cookies blocked) is reported as source `unknown` with no flag property. Cookie access can be denied outright; the view is still reported.
- If PostHog's own evaluation names a different variant than the one served, `home_variant_mismatch` is sent: the flag was edited in PostHog or the ids diverged.
- Later events (a run, the call page, a booking) carry the design too.
- Anyone who has used a `?variant=` preview link gets `dh_internal` and is marked as an internal user, so they are excluded from results. `?variant=auto` drops a forced design.

**Testing**
- The proxy's decision is a pure function (`decide.ts`), so every branch is unit-tested without Next. `src/proxy.ts` only applies it.
- `HOME_PROXY_FAULT=1` makes the proxy throw, to verify the fallback. It only works in mock mode, which never runs in production.

## Consequences

- PostHog's flag is a mirror of the code, not a control panel. Editing it in PostHog breaks agreement (FM-15).
- A change to posthog-js's hashing would silently split the two; the agreement script and fixed vectors catch it.

## Where

- `src/proxy.ts`, `src/lib/experiments/decide.ts`, `homeDesign.ts`, `browser.ts`
- `src/lib/experiments/__tests__/` (`posthogVectors.ts`, `homeDesign.test.ts`, `decide.test.ts`)
- `scripts/home-design-agreement.mts`
- `src/app/page.tsx`, `src/app/home/[variant]/page.tsx`, `src/components/thirty/home/ClassicHome.tsx`
- `src/components/Header.tsx`, `src/instrumentation-client.ts`
