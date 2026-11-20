# PostHog observability: implementation spec

Branch: `feat/posthog-observability` (from `main` at `805cf73`).

## 1. What we are building

Usage observability for davin.io in PostHog, so the owner can see whether anyone uses the site, who they are (location, device, returning or new, and the company site they ask about), what they do, and which blueprint pages get created and viewed. It must never break or slow the site, and it must keep working when ad blockers, missing config, or PostHog itself fail.

## 2. Decisions already made

| Topic | Decision |
|---|---|
| Project | A dedicated PostHog project, "davin.io" (id 755579, US cloud). StageSnap keeps the "Default project". |
| Session replay | On, all inputs masked, console logs captured (project settings). |
| Client SDK | `posthog-js` pinned, loaded with a dynamic import from `src/instrumentation-client.ts`, so its ~120 KB (gzipped) stays out of every page's first-load bundle. `track()` queues up to 20 events until it arrives. PostHog's own bot filter drops headless and webdriver browsers. |
| Transport | Same-origin reverse proxy through Next rewrites at `/relay-dh/*`, so blockers that drop third-party analytics hosts do not drop events. Low traffic, so the Vercel data transfer for replays is acceptable. |
| Server events | A plain `fetch` to PostHog's capture endpoint with a 2s timeout. No `posthog-node`, no new server dependency. |
| Identity | No logins. The browser's PostHog distinct id and session id are sent with each run request, so the server event joins the same person and replay. Without JavaScript the server uses `visitor:<salted IP hash>`. Raw IPs are never sent from our server. |
| Environments | Every event carries `environment` (`production`, `preview`, `development`) so previews and local runs filter out. |
| Vercel Analytics | Kept. Custom events go through one helper that sends to both. |

### Non-goals

No consent banner, no user identification by email, no feature flags or experiments, no dashboards in code.

## 3. Files

```
src/instrumentation-client.ts     posthog.init + environment super property
src/lib/analytics/config.ts       client-safe: key, hosts, proxy path, environment
src/lib/analytics/track.ts        client: track(name, props) to PostHog and Vercel, never throws; analyticsIds()
src/lib/analytics/server.ts       server: captureServerEvent(), never throws, 2s timeout, no-op without key
next.config.js                    rewrites for /relay-dh, skipTrailingSlashRedirect
src/components/thirty/*           use track(); launcher sends ph_id and ph_session with the run
src/lib/thirty/handler.ts         reads and sanitizes ph_id / ph_session; cache hits emit blueprint_cache_hit
src/lib/thirty/pipeline.ts        every finished run emits blueprint_run (injected, so tests stub it)
.env.example                      NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST
```

## 4. Events

| Event | Where | Properties |
|---|---|---|
| `$pageview`, `$pageleave`, autocapture, replay | client SDK | standard, plus `environment` |
| `blueprint_started` | client | `input_host` (display guess of the typed host) |
| `blueprint_done` | client | `cached`, `seconds` bucket, `slug` |
| `blueprint_failed` | client | `code` |
| `example_opened` | client | `example` |
| `blueprint_cta_call` | client | `from` |
| `blueprint_run` | server, end of every fresh run | `outcome` (`done` or error code), `host`, `slug`, `company`, `method`, `total_ms`, `cost_usd`, `input_tokens`, `output_tokens`, `web_searches`, `pages_read`, `spend_unknown`, `mock`, `environment`, `$session_id`; person `$set: { last_blueprint_host }`, `$set_once: { first_blueprint_host }` |
| `blueprint_cache_hit` | server | `host`, `slug`, `form` (no-JS post), `environment`, `$session_id` |

Server events set `$geoip_disable: true`, so PostHog never places a visitor at the Vercel data center.

## 5. Usage paths

| ID | Path | Expected |
|---|---|---|
| UP-01 | Visitor lands on `/` | `$pageview` with `environment`, through `/relay-dh` |
| UP-02 | Client-side navigation (`/` to `/work`, to `/b/...`) | One `$pageview` per route change |
| UP-03 | Visitor runs a fresh host | Client `blueprint_started` and `blueprint_done`; server `blueprint_run` with the same distinct id and session id |
| UP-04 | Visitor repeats a drafted host | Client `blueprint_done{cached:true}`; server `blueprint_cache_hit` |
| UP-05 | A run fails (any code) | Client `blueprint_failed{code}`; server `blueprint_run{outcome:code}` when it was a fresh run |
| UP-06 | Visitor opens an example or Book a call | `example_opened` / `blueprint_cta_call` |
| UP-07 | Visitor has replay recorded | Replay exists for the session, inputs masked |
| UP-08 | No-JS form post | Server `blueprint_run` / `blueprint_cache_hit` with `visitor:<hash>` distinct id |
| UP-09 | Owner reads PostHog | Events, persons with geo, and replays visible in project 755579, filterable by `environment` |

## 6. Failure modes

| ID | Seam | Trigger | Handling | What the visitor sees | Verify |
|---|---|---|---|---|---|
| FM-01 | Key missing | No `NEXT_PUBLIC_POSTHOG_KEY` | Prevent: SDK not initialized, track() and server capture no-op | Nothing changes | Walk with no key: no `/relay-dh` requests, no errors |
| FM-02 | Ad blocker drops PostHog hosts | Blocked `*.posthog.com` | Prevent: same-origin proxy | Nothing | Block `*.posthog.com` in the browser; events still sent |
| FM-03 | PostHog down or slow | Capture endpoint errors or hangs | Degrade: client SDK queues and drops; server capture times out at 2s and is swallowed | Run and pages unaffected | Server capture pointed at a dead host: run finishes normally, within 2s of usual |
| FM-04 | Proxy path itself blocked | Request to `/relay-dh` fails | Degrade: SDK swallows | Nothing | Abort `/relay-dh/*` in the browser; no page errors |
| FM-05 | Spoofed or junk `ph_id` | Body with a 5 KB or script-like id | Prevent: accept only `[\w-]{1,128}`, else fallback id | Nothing | API test |
| FM-06 | Analytics throws inside the run flow | SDK not loaded, `track` throws | Prevent: every call wrapped | Run unaffected | Unit test + walk with SDK blocked |
| FM-07 | Server capture blocks the response | Slow PostHog | Prevent: capture runs after the terminal event, inside the run promise kept alive by `after()` | Stream ends on time | Timing check with a slow capture endpoint |
| FM-08 | Preview and local events pollute production numbers | Previews share the key | Mitigate: `environment` on every event | Nothing | Events show the right environment |
| FM-09 | PII leakage | IPs, input text | Prevent: replay masks inputs; server never sends IP; no emails | Nothing | Inspect payloads |
| FM-10 | Bundle bloat or slower first paint | SDK size | Mitigate: SDK initializes after hydration starts; replay recorder loads lazily from PostHog | Same speed | Compare build output |
| FM-11 | Double pageviews | SDK and manual capture | Prevent: only `capture_pageview: "history_change"` | Nothing | Count pageviews per navigation |

## 7. Tests

Unit: `server.ts` payload, no-op without key, swallowed errors and timeout; `track.ts` never throws; handler `ph_id` sanitizing and cache-hit event; pipeline emits `blueprint_run` with the right properties on success and failure. Verification: walk every row above against a production build with the real key (`environment=development`), reading the proxied payloads in the browser and the ingested events through the PostHog API; then repeat UP-01, UP-03, UP-07 on the Vercel preview and production.

## 8. Rollout

Vercel env: `NEXT_PUBLIC_POSTHOG_KEY` (Production and Preview). The key is a public project token, inlined at build time. `POSTHOG_HOST` (server-only, runtime) can override where server events go. After deploy, confirm production events in project 755579, then exclude the owner's own traffic with a test-account filter if wanted.
