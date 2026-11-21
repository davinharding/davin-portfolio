# 0002. Analytics go through a same-origin PostHog relay and never affect the page

- **Status:** Accepted
- **Date:** 2026-11-21 (recorded from code comments)

## Context

The site measures the homepage experiment and the call funnel in PostHog, and also sends Vercel Analytics. Ad blockers drop third-party analytics hosts. posthog-js weighs about 120 KB gzipped. Server events come from Vercel's machines, not the visitor's.

## Decision

**Transport**
- PostHog is reached through a same-origin rewrite at `POSTHOG_PROXY_PATH` (`/relay-dh`), so blockers that drop third-party hosts keep the events.
- `skipTrailingSlashRedirect` is on because PostHog's API paths end in a slash, and redirecting them breaks capture.
- Server events go straight to PostHog's ingest host. `POSTHOG_HOST` (server-only, read at runtime) overrides the build-time value.
- The project key is a public token: it can send events but never read them, so it is fine in client bundles. It is read at call time so tests can change it; Next inlines it in client bundles anyway.

**Loading**
- posthog-js loads from `instrumentation-client` in a separate chunk, so it never competes with the first render. Events tracked before it arrives wait in a small queue (`MAX_PENDING`). When the SDK arrives, waiting callbacks run first so anything they register is on the queued events.
- PostHog's `defaults` setting includes pageviews on client-side navigation (`history_change`).
- Anonymous visitors get person profiles (`person_profiles: "always"`), so location, device and the company site asked about are visible.

**Never affect the page**
- Nothing in the analytics path throws. Every SDK call, the lazy import, and server capture swallow errors: analytics is best effort.
- Server capture gives up after 2 seconds and runs after the run's terminal event, so a slow or failing PostHog never delays the stream.
- `$geoip_disable` is set on server events, because the request IP is Vercel's and would place every visitor in a data center.

**Identity and tagging**
- Every event carries an environment tag, so preview and local traffic filter out of production numbers.
- PostHog distinct and session ids are UUID-like; anything else is ignored (`sanitizeAnalyticsId`).
- The browser sends its PostHog ids with a run, so server events join the same person and replay. Without JavaScript there is no browser id; the salted IP hash stands in, never the raw IP.
- Server events carry the visitor's homepage design so they line up with the experiment (ADR 0003).
- Regenerating example blueprints is not visitor traffic, so `scripts/thirty-examples.mts` reports nothing.

**Call funnel (Calendly on `/call`)**
- The blueprint and homepage design that led to `/call` are read after mount: the page is prerendered and both live in the browser (the query string and a cookie).
- The design and blueprint are passed to Calendly as UTM values, so each booking shows what led to it.
- Window messages are trusted only from `https://calendly.com`. Only Calendly's own messages are reported, and Calendly's event and invitee links are never passed on.
- The calendar view and the booking are reported at most once per page load, because Calendly announces both more than once (the calendar view twice on load).

## Consequences

- Analytics failures are silent by design. A broken PostHog shows up as missing data, not as errors on the page.
- Changing the relay path means changing both `next.config.js` and `POSTHOG_PROXY_PATH`.

## Where

- `next.config.js` (`skipTrailingSlashRedirect`, `rewrites`)
- `src/instrumentation-client.ts`
- `src/lib/analytics/config.ts`, `cookies.ts`, `server.ts`, `track.ts`
- `src/lib/thirty/callFunnel.ts`, `src/app/call/CalendlyEmbed.tsx`
- `src/lib/thirty/handler.ts` (visitor attribution), `src/lib/thirty/pipeline.ts` (run-end report)
- `scripts/thirty-examples.mts`
