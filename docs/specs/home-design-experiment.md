# Homepage design experiment: implementation spec

Branch: `feat/home-design-experiment` (from `main` at `b2d6774`). Status: approved 2026-11-20.

## 1. What we are building

Two new designs of the Thirty Seconds homepage, "Open roles" and "Drafting table", built as real pages from the prototypes in `docs/prototypes/thirty-home/`, and an A/B test that splits visitors between them and measures which one moves more people toward booking a call.

Three consequences drive most decisions:

1. **The page a visitor gets is decided before any HTML is sent.** A design that swaps after load would flash, and the homepage is about to be shared widely. So the split happens in `src/proxy.ts`, with no network call, and each design stays a static page.
2. **The site decides who sees what. PostHog measures.** The proxy uses the same hash PostHog uses for multivariate flags, on the same visitor id, so PostHog's own evaluation agrees with what was served. The page never waits on PostHog and works when PostHog is blocked or down.
3. **Booked calls will be rare.** The funnel is instrumented to the booking itself, but the experiment also needs a metric with enough volume to reach a conclusion.

## 2. Decisions already made

| # | Topic | Decision | Reason |
|---|---|---|---|
| D1 | Arms | Two: `open-roles` and `drafting-table`, 50/50. No control arm. | Davin chose these two. The current page has one day of data, so it is not a meaningful baseline. |
| D2 | Current design | Kept as `classic`. Not in the experiment. It is the fallback if the proxy fails, the page behind `/sorry/<code>`, and a value `HOME_DESIGN` can pin. | It shipped today and is verified. Keeping it costs nothing. |
| D3 | Where the split happens | `src/proxy.ts` rewrites `/` to `/home/<design>`. Both are prerendered. | No flash, no layout shift, works without JavaScript, no per-request rendering. |
| D4 | Assignment | Deterministic: PostHog's multivariate hash on the visitor id (section 5.2). No call to PostHog at request time. | Zero added latency, and no dependency on PostHog being reachable. |
| D5 | Visitor id | First-party cookie `dh_id`. posthog-js is bootstrapped with it, so the PostHog distinct id and the id the proxy hashed are the same string. | This is what makes PostHog's evaluation agree with the served design. |
| D6 | Bucketing | User-id (distinct id) bucketing, `ensure_experience_continuity: false`. | The site has no login, so a visitor's distinct id never changes. Persistence cannot be combined with bootstrapping. |
| D7 | Exposure | Custom exposure event `home_viewed`, filtered to `home_variant_source = ab` and `environment = production`. The event carries `$feature/home-design`. | The design is chosen at the proxy, including on link prefetch, well before anyone sees it. The exposure is the moment the homepage is on screen. |
| D8 | Primary metrics | Two: started a blueprint (`blueprint_started`) and booked a call (`call_booked`). | See 10.3. Starts have the volume to decide the test. Bookings are the goal and are reported, but will likely stay directional. |
| D9 | Booking signal | Calendly's embed messages, captured in the browser on `/call`. No Calendly API or webhook. | No new account, secret, or paid plan. |
| D10 | Preview links | `/?variant=<design>` forces a design for the browser session and marks that visitor as internal. Forced views are never exposures. | Lets Davin look at and demo either design without polluting results. |
| D11 | Ending the test | Set `HOME_DESIGN=<winner>` in Vercel and redeploy. Later, delete the losing component. | Ending a test is a deliberate act. A redeploy is one click. |
| D12 | `/sorry/<code>` | Unchanged, uses the classic launcher. | It is the no-JavaScript error landing. Out of scope. |
| D13 | Consent | No banner, as today. The new cookies hold a random id and a design name. | Matches the standing decision in `posthog-observability.md`. |
| D14 | Prototypes | `docs/prototypes/thirty-home/` is committed as the visual reference for this spec. | The spec points at it for look and motion. |

### Non-goals

No server-side booking confirmation from Calendly. No third arm. No changes to the blueprint page beyond the call link. No changes to the run pipeline, limits, or copy of error messages. No consent banner. No PostHog session-replay changes.

## 3. Ground rules for the implementer

- Stack: Next.js 16.2.6 (App Router), React 18.3, TypeScript, Tailwind 3.4, posthog-js 1.447.3, react-calendly 4.4, vitest. Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` before writing the proxy. In Next 16 the file is `proxy.ts`, not `middleware.ts`, and it runs on the Node.js runtime.
- Reuse, do not reinvent: `track()` and `analyticsIds()` in `src/lib/analytics/track.ts`, `sanitizeAnalyticsId()` and `analyticsEnvironment()` in `src/lib/analytics/config.ts`, `captureServerEvent()` in `src/lib/analytics/server.ts`, `cn()` in `src/lib/utils.ts`, `Button`, `RunConsole`, `ExampleLinks`, the `org-chart__*` styles in `globals.css`, `stepLabel` and `STEP_ORDER` in `src/lib/thirty/events.ts`, `ERRORS` in `src/lib/thirty/errors.ts`, `allExamples()` in `src/lib/thirty/examples.ts`.
- The prototypes are the visual reference. Port their markup and CSS. Do not port their simulated run, CDN scripts, stand-in header and footer, or the prototype switcher.
- Analytics must never throw into the page or block rendering. Every new call follows the existing wrap-and-swallow pattern.
- `.env.local` points at the production Redis. Run every walk in mock mode with the Redis variables blanked, as the existing `verify-*` launch configs do.
- Do not push, open a PR, deploy, or launch the experiment in PostHog. Commit on the feature branch in small commits with the repo's `Area: Summary` style. No attribution lines.
- Gates: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all green.

## 4. Routes, files, interfaces

### 4.1 Routes

| Route | Type | Behavior |
|---|---|---|
| `/` | Static page, behind the proxy | The proxy rewrites it to `/home/<design>`. If the proxy does not run or fails, `src/app/page.tsx` renders the classic design. |
| `/home/[variant]` | Static, `generateStaticParams` for `open-roles`, `drafting-table`, `classic`; `dynamicParams = false` | Reached only through the rewrite. A direct request is redirected to `/` by the proxy. |
| `/call` | Static | Accepts `?b=<slug>`. Tracks Calendly events. |
| `POST /api/blueprint` | Unchanged contract | Server events gain the visitor's design from the `dh_home` cookie. |

### 4.2 Files

New:

| File | Responsibility |
|---|---|
| `src/proxy.ts` | Matcher for `/` and `/home/:path*`. Calls `decideHome`, applies the result (rewrite or redirect, cookies, header). Wraps everything in try/catch and falls back to `NextResponse.next()`. |
| `src/lib/experiments/homeDesign.ts` | Client-safe constants and pure helpers: flag key, design keys, cookie names, `isDesign`, `isExperimentArm`, `assignVariant`, `parseHomeCookie`, `formatHomeCookie`, `readDesignMode`, `distinctIdFromPostHogCookie`. |
| `src/lib/experiments/decide.ts` | `decideHome(input): HomeDecision`. Pure. No Next imports, so it is unit-tested directly. |
| `src/lib/experiments/browser.ts` | Client: `readHomeAssignment(cookieString)`, `reportHomeView(design)`, `checkAssignment()`. |
| `src/lib/experiments/__tests__/*.test.ts` | Tests in section 11. |
| `src/app/home/[variant]/page.tsx` | Picks the design component. Shared metadata with canonical `/`. |
| `src/lib/thirty/homeCopy.ts` | `HEADLINE`, `TITLE`, `DESCRIPTION`, `homeMetadata` (moved out of `src/app/page.tsx`). |
| `src/lib/thirty/sampleTeams.ts` | Server: `sampleTeams()` derives `{ slug, company, agents: { name, gated }[] }` from `allExamples()`. No agent names hardcoded in components. |
| `src/components/thirty/useBlueprintRun.ts` | The run state machine, extracted from `BlueprintLauncher`: phases, fetch and stream, watchdog, errors, cancel, focus, timer, stage `data-step`. |
| `src/components/thirty/UrlForm.tsx` | The form, honeypot, error block with next-step buttons, and help line, extracted from `BlueprintLauncher`. |
| `src/components/thirty/home/HomeStage.tsx` | The `data-thirty-stage` section, headline, `LegacyHashRedirect`, and `HomeView`. |
| `src/components/thirty/home/HomeView.tsx` | Client. Calls `reportHomeView(design)` once on mount. Renders nothing. |
| `src/components/thirty/home/ClassicHome.tsx` | Today's layout, composed from the pieces above. |
| `src/components/thirty/home/OpenRolesHome.tsx`, `TeamChart.tsx`, `RunStrip.tsx` | The Open roles design (6.2). |
| `src/components/thirty/home/DraftingTableHome.tsx`, `BlueprintDrawing.tsx` | The Drafting table design (6.3). |

Changed:

| File | Change |
|---|---|
| `src/app/page.tsx` | Renders `ClassicHome` with `homeMetadata`. |
| `src/components/thirty/BlueprintLauncher.tsx` | Becomes `useBlueprintRun` + `UrlForm` + `RunConsole` + `ExampleLinks`. Rendered output is unchanged. |
| `src/components/Header.tsx`, `HeaderFooter.tsx` | The home link's `aria-current` comes from the `page` prop, not `usePathname()` (FM-12). The "Book a Call" links call `track("blueprint_cta_call", { from: "header" })`. |
| `src/instrumentation-client.ts` | Bootstraps posthog-js from the cookies (5.4). |
| `src/lib/analytics/track.ts` | Adds `onPostHog(cb)`: runs `cb` with the SDK now or when it loads. Never throws. |
| `src/lib/thirty/handler.ts` | Reads `dh_home` from the request cookies, validates it, and adds the design properties to `blueprint_run` and `blueprint_cache_hit`. |
| `src/components/thirty/CallCta.tsx`, `BlueprintView.tsx` | The call link becomes `/call?b=<slug>`. |
| `src/app/call/CalendlyEmbed.tsx` | Calendly listeners, UTM values, fallback link (6.4). |
| `src/app/globals.css` | Styles for both designs, ported from the prototypes. |
| `.env.example`, `README.md`, `.claude/launch.json` | `HOME_DESIGN`, a short section on the experiment, and the launch configs in section 11. |

### 4.3 Cookies

All are first-party, `Path=/`, `SameSite=Lax`, `Secure` in production, readable by script.

| Cookie | Value | Lifetime | Set by |
|---|---|---|---|
| `dh_id` | Visitor id, `[A-Za-z0-9_-]{1,128}` | 1 year, refreshed on each visit to `/` | Proxy |
| `dh_home` | `<design>.<source>`, source is `ab`, `pin`, or `qa` | 1 year | Proxy |
| `dh_force` | A design key | Session | Proxy, from `?variant=` |
| `dh_internal` | `1` | 1 year | Proxy, from any valid `?variant=` |

### 4.4 Environment

`HOME_DESIGN`: `ab` (default) or a design key. `ab` runs the split. A design key serves that design to everyone. Any other value is treated as `ab` and logged once with `console.warn`. Read on every request.

### 4.5 Proxy contract

Response header on every request the proxy handles for `/`: `x-home-design: <design>.<source>`.

`decideHome` input: `{ pathname, searchParams, cookies: { dh_id, dh_force, posthog }, mode, newId }`. Output: `{ kind: "rewrite", design, source, id }`, `{ kind: "redirect", to, setForce?, clearForce?, internal? }`, or `{ kind: "pass" }`.

## 5. Behavior: assignment and measurement

### 5.1 Proxy decision, in order

1. Path starts with `/home/`: redirect 307 to `/`, keeping the query string.
2. Path is not exactly `/`: pass.
3. Query has `variant`:
   - A design key: set `dh_force` and `dh_internal`, redirect 307 to `/` with `variant` removed and every other parameter kept.
   - `auto`: clear `dh_force`, redirect the same way. `dh_internal` stays.
   - Anything else, or repeated: ignore the parameter and continue.
4. Visitor id: `dh_id` if it passes `sanitizeAnalyticsId`; else the `distinct_id` inside PostHog's `ph_<key>_posthog` cookie if it passes; else a new `crypto.randomUUID()`.
5. Design and source: `dh_force` if valid, source `qa`; else `HOME_DESIGN` if it is a design key, source `pin`; else `assignVariant(id)`, source `ab`.
6. Rewrite to `/home/<design>`. Set `dh_id` and `dh_home`. Set `x-home-design`.

### 5.2 `assignVariant(id)`

PostHog's multivariate hash, as published in its Node SDK (`packages/core/src/featureFlagLocalEvaluation.ts`):

```
h = sha1("home-design." + id + "variant")          // hex
x = parseInt(h.slice(0, 15), 16) / 0xfffffffffffffff
x < 0.5 ? "open-roles" : "drafting-table"
```

Uses Web Crypto (`crypto.subtle.digest("SHA-1", …)`), which exists in the proxy runtime and the browser. The variant order and the 50/50 split are constants in `homeDesign.ts` and must match the flag in PostHog (FM-15).

### 5.3 Events

| Event | Where | Properties |
|---|---|---|
| `home_viewed` | Client, once per mount of the homepage | `home_variant`, `home_variant_source`; when source is `ab`, also `$feature/home-design: <design>` |
| `home_variant_mismatch` | Client, at most once per page load | `served`, `evaluated`. Sent when source is `ab` and PostHog's loaded value for the flag is a string that differs from the served design. |
| `sample_team_selected` | Client, Open roles | `team` (example slug) |
| `example_opened` | Client, existing | adds `via`: `links` or `chart` |
| `blueprint_cta_call` | Client, existing | `from` gains `header` |
| `call_calendar_viewed` | Client, `/call`, Calendly `event_type_viewed` | `blueprint_slug` if present |
| `call_time_selected` | Client, `/call`, Calendly `date_and_time_selected` | same |
| `call_booked` | Client, `/call`, Calendly `event_scheduled`, at most once per page load | same. Calendly's event and invitee URIs are not sent. |
| `call_link_opened` | Client, `/call`, fallback link | same |
| `blueprint_run`, `blueprint_cache_hit` | Server, existing | add `home_variant`, `home_variant_source`, and `$feature/home-design` when source is `ab` |

Every client event also carries the super properties `home_variant` and `home_variant_source` once the visitor has seen the homepage.

### 5.4 Client bootstrap (`instrumentation-client.ts`)

- If `dh_id` is valid: `bootstrap.distinctID = dh_id`.
- If `dh_home` parses and its source is `ab`: `bootstrap.featureFlags = { "home-design": design }`.
- If `dh_home` parses: `posthog.register({ home_variant, home_variant_source })`.
- If `dh_internal` is `1`: `posthog.setInternalOrTestUser()`. The project's existing test-account filter (cohort 744540, person property `$internal_or_test_user`) then excludes that person.
- A visitor whose first page is not `/` has no `dh_id` yet. posthog-js mints its own id. On their first request for `/` the proxy adopts that id from PostHog's cookie (5.1 step 4), so the person stays the same.

### 5.5 `reportHomeView(design)`

Reads `dh_home`. If it is missing or its design differs from the rendered one (cookies blocked), sends `home_viewed` with source `unknown` and no `$feature/` property. Otherwise registers the super properties, sends `home_viewed`, and, through `onPostHog`, runs `checkAssignment()` after flags load. Nothing here is cancelled when the component unmounts, so a visitor who submits fast is still recorded.

## 6. Behavior: the pages

All three designs share: `HeaderFooter page="index" fitViewport`, the headline from `homeCopy.ts`, the stage glow driven by `data-step`, the headline shrink during a run, focus rules (field focused on load for fine pointers, console or strip heading focused on start, field focused after cancel or error), the honeypot, the native form post for visitors without JavaScript, and reduced-motion handling. Each must fit the run on one screen at 375×812 and 1280×800.

### 6.1 Run states (all designs)

The hook exposes `phase`: `idle`, `submitting`, `running`, `navigating`, `error`. Each design renders these the same way the classic page does unless stated below.

| State | Trigger | Shared behavior |
|---|---|---|
| idle | Load, cancel, back-forward restore | Form and the design's idle content |
| submitting, running | Submit accepted | Form replaced by the design's run view, timer ticking, Cancel available |
| navigating | `done` event | Status line "Blueprint ready." or "Already drafted that one. Opening it.", no Cancel, route change after 700 ms (500 ms cached) |
| error | Any error code, `lost`, `offline` | Form returns with the error block, retry note, and the buttons `ERRORS[code].next` names |

### 6.2 Open roles

Reference: `docs/prototypes/thirty-home/03-open-roles.html`. Centered headline, form, then the team chart.

| Chart mode | When | Top node | Slots | Row above the chart |
|---|---|---|---|---|
| sample | Field empty, not running | Company name, "A team I drafted earlier" | That example's agents, dashed border, each a link to the example blueprint; gate badge where `humanGate.required` | "Teams I drafted earlier:" with one button per example (`aria-pressed`), and "Open the <company> blueprint" |
| yours | Field has text, not running | The typed host once it looks like a website, else "Your team"; "Approves every gated action" | Four dashed "Open role" slots | "Four open roles at <host>. Press Enter and my agents fill them." |
| run | submitting, running, navigating | Host; the company one-liner once the `company` event arrives | Filled slots for each `agent` event in order, the next slot "Drafting…" while the design step is active, the rest "Open role" | "<n> of <slots> roles filled." |

- Sample mode rotates to the next example every 4.2 s. Rotation stops while the pointer or focus is inside the chart, after a button is clicked, while the tab is hidden, and under reduced motion.
- Slot count is `max(4, agents so far)`, capped at 5 (the schema maximum). A fifth agent adds a fifth slot.
- During a run the form is replaced by `RunStrip`: heading "Drafting a blueprint for <host>", timer, five labeled bars (Check, Read, Research, Design, Review), a live status line with the active step's label and latest detail, and Cancel. A done step's bar is full. The active step's bar fills toward 90% over its expected time (1, 5, 5, 15, 3 seconds) and completes when the step does. Skipped steps are dimmed and struck through. A failed step is red.
- Gate status is not streamed during a run, so run-mode slots say "Drafted", not gated or unattended.
- When an error's next steps include `examples`, the chart shows sample mode regardless of the field, and the row's lead text is "These show the same thing:".
- Below `md` the slots are a two-column grid with no connector rail.
- Without JavaScript: the chart renders the first example, and a `<noscript>` list links all three example blueprints.

### 6.3 Drafting table

Reference: `docs/prototypes/thirty-home/02-drafting-table.html`. Two columns from `lg`: headline, form, and example links on the left; the drawing on the right. One column below `lg`, drawing under the form.

- Paper: a 24 px grid with 120 px major lines over the whole stage. On fine pointers a 280 px circle of brighter grid follows the cursor, written to CSS variables inside `requestAnimationFrame`, never through React state. On coarse pointers the bright circle is fixed behind the drawing. A coordinate readout shows only on hover-capable screens from `lg`.
- Drawing (`BlueprintDrawing`): every line is drawn twice, a dashed construction line and a solid ink line over it. Ink progress `p` is `max(0.14, min(1, typed characters / 12))` while idle and `1` during a run. Each path inks across its own window of `p`, in the order root, stem, bus, drops, agent boxes, tools, gates, callouts, title block.
- Two layouts. Wide (container at least 640 px): the prototype's layout, columns computed for 4 or 5 agents. Narrow: root, a two-column grid of agent boxes, and the title block, in a viewBox sized so no text renders below 10 px at 343 px wide. The callouts, tools, and notes are omitted in the narrow layout.
- Labels: the root shows the typed host in capitals once it looks like a website. Agent boxes show "AGENT 0n / OPEN ROLE", then "DRAFTING" on the next box while the design step is active, then the agent's name over two lines with "DRAFTED". A line longer than the box is cut with an ellipsis.
- Title block cells: PROJECT, CLIENT (host), DATE, DRAWN BY, TIME (elapsed during a run, else "ABOUT 30 S"), CHECKED (`NOT YET` idle, `PENDING` running, `IN REVIEW` during the check step, `PASSED` on navigating), SHEET. DATE is filled after mount so the prerendered HTML matches on hydration.
- During a run the left column shows the existing `RunConsole`. Below `sm` the drawing is hidden while a run is on screen so the console fits.
- The drawing is `role="img"` with a text alternative. The console remains the live region.
- Without JavaScript: the drawing renders at `p = 0.14` and the form posts natively.

### 6.4 `/call`

- `CalendlyEmbed` reads `b` from `window.location.search` after mount, keeps it only if it passes `isValidSlug`, and reads the visitor's design from `dh_home`.
- `useCalendlyEventListener` maps Calendly's messages to the events in 5.3. `call_booked` fires once per page load.
- Calendly UTM values: `utmSource: "davin.io"`, `utmMedium: "thirty-seconds"`, `utmCampaign: "home-design"`, `utmContent: <design or "none">`, `utmTerm: <slug or "">`. Davin then sees in Calendly which design and which blueprint each booking came from.
- Under the embed, always visible: "Calendar not loading? Open the booking page in a new tab." linking to the same Calendly URL with the same UTM values.

## 7. Usage paths

| ID | Who and entry | Steps | Expected |
|---|---|---|---|
| UP-01 | New visitor, `GET /` | Load | One of the two designs, no flash of another. `Set-Cookie` for `dh_id` and `dh_home=<design>.ab`. `x-home-design` header. Design equals `assignVariant(dh_id)`. |
| UP-02 | Returning visitor | Load again, new session | Same design. |
| UP-03 | Open roles, idle | Watch, click a team button, click a slot | Chart rotates, then pins. `sample_team_selected`. The slot opens the example blueprint and sends `example_opened{via: chart}`. |
| UP-04 | Open roles, run | Type a host, Enter | Chart becomes four open roles as soon as text is typed. Run strip progresses, slots fill by agent, top node shows the one-liner, then `/b/<slug>`. |
| UP-05 | Drafting table, idle | Move the cursor, type slowly | Bright grid follows the cursor. Ink advances with each character and is complete at 12. Root shows the host. |
| UP-06 | Drafting table, run | Enter | Console in the left column. Agent boxes fill, title block shows time and CHECKED states, then `/b/<slug>`. |
| UP-07 | Either design, cached host | Submit a host drafted before | "Already drafted that one. Opening it." then the blueprint. |
| UP-08 | Either design, cancel | Start, click Cancel | Back to idle with the typed host kept and the field focused. |
| UP-09 | Either design, error | Submit `rate-limited.test`, `quality.test`, `not-a-company.test`, `unreachable.test` | The classic error copy and buttons. Open roles shows sample teams when `examples` is a next step. Retry works. |
| UP-10 | Exposure | Load the homepage with PostHog reachable | One `home_viewed` with `home_variant`, `home_variant_source: ab`, and `$feature/home-design` equal to the served design. Later events carry `home_variant`. |
| UP-11 | Funnel to a call | Run, open the blueprint, click "Book a call to build the first one" | `/call?b=<slug>`. `blueprint_cta_call{from: blueprint}`. Calendly loads with the UTM values. |
| UP-12 | Booking | Pick a time and schedule in Calendly | `call_calendar_viewed`, `call_time_selected`, `call_booked`, each with `home_variant` and `blueprint_slug`. |
| UP-13 | Header call link | Click "Book a Call" on the homepage | `blueprint_cta_call{from: header}`, `/call`. |
| UP-14 | No JavaScript | Load either design, submit the form | The design renders. The form posts and lands on the blueprint or `/sorry/<code>`. |
| UP-15 | Keyboard only | Tab through either design, run, cancel | Visible focus, logical order, every control reachable, focus moves as in 6. |
| UP-16 | Phone, 375×812 | Idle and run on both designs | No horizontal scroll. The run fits one screen. |
| UP-17 | Light theme, reduced motion | Both designs | Legible in light. No rotation, shimmer, or ink animation under reduced motion. |
| UP-18 | Client-side return | From `/b/<slug>` click the logo or "Run another" | Same design, no full reload, one new `home_viewed`. |
| UP-19 | First page is not `/` | Land on `/b/example-linear`, then go home | The proxy adopts PostHog's id. One person in PostHog. The design equals `assignVariant` of that id. |
| UP-20 | Owner preview | Open `/?variant=drafting-table&utm_source=x` | Redirect to `/?utm_source=x`. Drafting table served with source `qa`. `home_viewed` has no `$feature/` property. The person is marked internal. `/?variant=auto` returns to the split. |
| UP-21 | Pin a winner | Run with `HOME_DESIGN=open-roles` | Everyone gets Open roles, source `pin`, no `$feature/` property on `home_viewed`. |
| UP-22 | Direct internal path | `GET /home/open-roles` | 307 to `/`. |
| UP-23 | Server events | Run a fresh host and a cached host | `blueprint_run` and `blueprint_cache_hit` carry the design properties. |
| UP-24 | Old anchors | `/#projects` on either design | Redirects to `/work#projects`. |
| UP-25 | Link preview | Fetch `/` with no cookies, twice | Same title, description, canonical, and Open Graph tags whichever design is returned. |
| UP-26 | Two tabs | Open `/` in two tabs | Same design in both. |
| UP-27 | Owner reads results | Open the experiment and dashboard in PostHog | Exposures per design, both primary metrics, the funnel by design, and the mismatch count are visible. |
| UP-28 | `/sorry/<code>` | Open `/sorry/rate-limited` | Unchanged classic launcher. |

## 8. Failure modes and seams

| ID | Seam | Trigger | Impact if unhandled | Handling | What the visitor sees | How to verify |
|---|---|---|---|---|---|---|
| FM-01 | Input | `?variant=` with junk, an unknown key, 5 KB, or repeated | Bad cookie, wrong page | Prevent: only exact design keys or `auto` are honored | The normal assigned design | `decide` unit test; walk `/?variant=<script>` |
| FM-02 | Input | Tampered `dh_id` (script, 5 KB), `dh_force`, `dh_home` | Junk ids in PostHog, crash | Prevent: each cookie is validated; an invalid `dh_id` is replaced, invalid others ignored | Normal page | Unit tests; walk with edited cookies |
| FM-03 | Input | PostHog cookie is not JSON or has no `distinct_id` | Proxy throws | Prevent: parse in try/catch, fall through to a new id | Normal page | Unit test |
| FM-04 | Dependency | PostHog blocked, SDK chunk never loads | Page breaks or waits | Prevent: nothing on the page awaits analytics; `track()` queues and drops | Normal page, run works | Walk with `/relay-dh/*` aborted |
| FM-05 | Dependency | PostHog `/flags` slow or failing | Exposure lost or late | Prevent: `home_viewed` does not wait for flags; only the mismatch check does | Nothing | Walk with `/relay-dh/flags*` delayed 10 s: `home_viewed` still sent at once |
| FM-06 | Dependency | Calendly iframe blocked or slow | Dead end at the last funnel step | Degrade gracefully: the fallback link is always under the embed | Spinner plus a working link | Walk with `calendly.com` blocked |
| FM-07 | Security | A page script posts a fake `calendly.event_scheduled` message | False `call_booked` | Prevent: only messages whose origin is `https://calendly.com` count. Confirm react-calendly checks the origin; if it does not, add the check in the handler. | Nothing | Walk: `window.postMessage` a fake event, expect no `call_booked` |
| FM-08 | Concurrency | Two tabs, same visitor | Different designs | Prevent: assignment is a pure function of the cookie id | Same design | UP-26 |
| FM-09 | Concurrency | Back-forward cache restores the homepage mid-run | Stale run view | Recover: existing `pageshow` reset stays in the hook | A fresh form | Walk on both designs |
| FM-10 | Concurrency | Link prefetch of `/` from another page | Counted as a view | Prevent: exposure is the client `home_viewed`, sent only on mount | Nothing | Hover the logo on `/work`: cookies set, no `home_viewed` |
| FM-11 | Concurrency | Double submit, Enter held | Two runs | Prevent: existing `busyRef` guard stays in the hook | One run | Walk on both designs |
| FM-12 | Rendering | Header reads `usePathname()`; the prerendered path is `/home/<design>` | Hydration mismatch on the home link | Prevent: `aria-current` from the `page` prop | Nothing | Console clean on load of both designs |
| FM-13 | Identity | Cookies cleared, or a second device | Same person in both designs | Accept: PostHog sees a new person; the experiment excludes anyone exposed to both | Possibly the other design | Documented |
| FM-14 | Identity | Cookies blocked entirely | A new id and maybe a new design per load; client cannot read `dh_home` | Degrade: page works; `home_viewed` is sent with source `unknown` and no `$feature/` property, so the view is not an exposure | A design, possibly changing between loads | Walk with cookies disabled |
| FM-15 | Config drift | Someone edits the flag's split, order, or keys in PostHog | PostHog's evaluation disagrees with the site | Detect: `home_variant_mismatch` and a dashboard tile; the exposure still reports what was served. Runbook: never edit the flag; change the code. | Nothing | Agreement test (11.3); mismatch tile reads 0 |
| FM-16 | Config | `HOME_DESIGN` unset, empty, or junk | Wrong page for everyone | Prevent: anything but a design key means `ab`; one `console.warn` | The split | Launch config with `HOME_DESIGN=garbage` |
| FM-17 | Config | `HOME_DESIGN` pinned while the experiment is still running | Pinned views counted as exposures | Prevent: pinned views have source `pin`, which the exposure filter excludes | The pinned design | UP-21, inspect the event |
| FM-18 | Runtime | The proxy throws (crypto missing, unexpected input) | 500 on the homepage | Self-heal: catch, `NextResponse.next()`, classic page, no cookies | The classic design | Unit test with a throwing `decide`; walk with an injected fault flag in mock mode |
| FM-19 | Security | `GET /home//evil.com` or a crafted query | Open redirect | Prevent: redirect targets are built as `new URL("/", request.url)` plus filtered parameters | Redirect to `/` | Unit test; walk |
| FM-20 | Caching | A shared cache stores one visitor's design for another | Wrong design, skewed split | Prevent: the proxy runs on every request and rewrites to per-design static assets. Confirm no `s-maxage` on the `/` response. | Nothing | Two cookie jars, two ids chosen to hash to different designs, alternate requests |
| FM-21 | Bots | Crawlers and unfurlers request `/` | Fake exposures | Prevent: no JavaScript means no `home_viewed`; PostHog drops headless browsers | Either design, same metadata | UP-25 |
| FM-22 | Data | An example blueprint has 1 to 5 agents, or a long name | Broken chart | Prevent: the chart renders what exists; names wrap with `break-words` | A shorter or longer row | Unit test on `sampleTeams`; walk with a long-name fixture |
| FM-23 | Rendering | A real run returns 5 agents, or 1 | Layout overflow, or empty slots at the end | Prevent: 5 slots or columns when a fifth arrives; leftover open slots are fine because the page navigates | Clean layout | Mock host `five-agents.test` and `one-agent.test` (11.2) |
| FM-24 | Rendering | Host of 60+ characters | Overflow in the top node, drawing, strip | Prevent: `break-all` in HTML, ellipsis in SVG | Wrapped or cut text | Walk with a 63-character host |
| FM-25 | Rendering | 360 px wide, 200% zoom, light theme | Clipped or unreadable | Prevent: layouts in 6.2 and 6.3 | Usable page | Walk both designs at 360, 375, 768, 1280 in both themes |
| FM-26 | Time | A run passes 30 seconds | The strip's bars sit at 90%; visitor thinks it hung | Degrade gracefully: the active bar holds at 90% and the existing "Taking a little longer than usual." line shows in both run views | The note | Mock host `slow.test` |
| FM-27 | Run errors | Each error code, `lost`, `offline`, stream drop | A design shows a dead end | Recover: both designs render the shared `UrlForm` error block | The classic error copy and buttons | UP-09 plus `drop.test`, offline toggle |
| FM-28 | Privacy | Design cookies or Calendly UTM leak personal data | PII in analytics | Prevent: cookies hold a random id and a design key; UTM holds the design and the blueprint slug; Calendly URIs are never sent | Nothing | Inspect payloads |
| FM-29 | Operations | Preview and local traffic counted in results | Polluted experiment | Prevent: exposure filter `environment = production`; localhost persons are marked internal by posthog-js defaults | Nothing | Local `home_viewed` shows `environment: development` |
| FM-30 | Operations | Bundle growth, or `/` turning dynamic | Slower landing page | Prevent: designs are static; posthog-js stays lazy | Same speed | Build output: `/` and `/home/[variant]` static; first-load JS of each design within 15 kB of today's `/` |
| FM-31 | Analytics | `call_booked` fires twice (Calendly re-posts, React strict mode) | Inflated conversions | Prevent: a ref guard, once per page load | Nothing | Walk; unit test of the guard |
| FM-32 | Analytics | Visitor books by the fallback link in a new tab | Booking not captured | Accept and expose: `call_link_opened` is tracked; the UTM values still attribute the booking inside Calendly | Calendly in a new tab | Walk |

## 9. Errors

No new server error codes. The run's codes, statuses, and copy stay in `src/lib/thirty/errors.ts`, and both designs render them through `UrlForm`.

New visitor-facing copy:

| Where | Copy |
|---|---|
| `/call`, under the embed | "Calendar not loading? Open the booking page in a new tab." |
| Open roles, yours mode | "Four open roles at <host>. Press Enter and my agents fill them." |
| Open roles, error with examples | "These show the same thing:" |

## 10. Limits, cost, security, and the experiment itself

### 10.1 Cost and limits

No new spend. Runs keep their existing per-visitor, daily, and monthly caps. Sharing the site widely will hit `THIRTY_DAILY_RUNS` (40) and the $10 monthly budget quickly; both designs then show the existing "live runs are paused" error with the examples. Raising those caps is Davin's call before sharing and is listed in the handoff.

### 10.2 Security and privacy

Covered by FM-01, FM-02, FM-07, FM-19, FM-20, FM-28. No secrets are added. The proxy performs no fetch.

### 10.3 Sample size

The site has one day of data, so there is no baseline. For 80% power at 95% confidence:

| Metric | Difference to detect | Visitors needed per design |
|---|---|---|
| Started a blueprint | 30% vs 40% | about 350 |
| Started a blueprint | 30% vs 35% | about 1,400 |
| Booked a call | 1% vs 2% | about 2,300 |

So "started a blueprint" can decide the test with roughly 700 to 2,800 visitors in total. "Booked a call" needs several thousand and should be read as a direction, alongside the per-booking attribution in Calendly.

### 10.4 PostHog objects (project 755579)

Created during the build, as a draft. Launching is a ship step that needs Davin's go.

| Object | Definition |
|---|---|
| Experiment | "Homepage design: Open roles vs Drafting table". Hypothesis in the description. Flag key `home-design`. Variants in this order: `open-roles` 50, `drafting-table` 50. Rollout 100%. `ensure_experience_continuity: false`. |
| Exposure | Custom event `home_viewed` with `home_variant_source = ab` and `environment = production`. Test accounts filtered. Visitors seen in both designs are excluded. |
| Primary metrics | Funnel, exposure to `blueprint_started`. Funnel, exposure to `call_booked`. |
| Secondary metrics | Funnels from exposure to: `blueprint_done`; `example_opened`; `$pageview` with `$pathname = /call`; `call_time_selected`. |
| Dashboard tiles, added to "Thirty Seconds" (2389633) | Homepage funnel by design (`home_viewed`, `blueprint_started`, `blueprint_done`, `/call` pageview, `call_booked`, broken down by `home_variant`). Homepage views by design per day. Assignment mismatches. Calls booked by design and `utm_source`. All filtered to production and source `ab`. |

New events are not ingested until the build runs, so metric creation uses `allow_unknown_events: true`.

## 11. Test plan

### 11.1 Unit tests (vitest, no network)

| Test file | Covers |
|---|---|
| `experiments/__tests__/homeDesign.test.ts` | `assignVariant` against an independent `node:crypto` implementation for 1,000 ids and against fixed vectors captured from PostHog (11.3); split within 46 to 54% over 10,000 ids; cookie parse and format round trip; junk inputs (FM-02, FM-03); `readDesignMode` (FM-16). |
| `experiments/__tests__/decide.test.ts` | Every branch of 5.1: new visitor, returning, adoption of PostHog's id, `?variant=` valid, `auto`, junk, repeated (FM-01), pin (FM-17), `/home/*` redirect and crafted paths (FM-19), other paths pass, other query parameters survive the redirect. |
| `experiments/__tests__/browser.test.ts` | `readHomeAssignment` from cookie strings; `reportHomeView` properties for `ab`, `qa`, `pin`, missing cookie (FM-14); mismatch decision (FM-15); nothing throws when the SDK is absent (FM-04). |
| `thirty/__tests__/handler.test.ts` (extended) | Design properties on `blueprint_run` and `blueprint_cache_hit`; tampered `dh_home` is dropped (FM-02). |
| `thirty/__tests__/sampleTeams.test.ts` | Teams derive from the committed examples; 1 to 5 agents (FM-22). |
| `components/thirty/__tests__/runStrip.test.ts` | The pure bar-fill function: done, active under and over the expected time (FM-26), skipped, failed. |
| `app/call/__tests__/calendly.test.ts` | Slug validation for `?b=`, UTM values, once-only guard (FM-31). |

Verify-only rows, with the reason: FM-04 to FM-12, FM-20, FM-21, FM-24, FM-25, FM-30 need a browser, a build, or network faults.

### 11.2 Mock and fault hooks to build

| Hook | Purpose |
|---|---|
| `?variant=<design>` | Reach either design on demand (D10). |
| `HOME_DESIGN` | Pin and junk-value walks. |
| Mock hosts `five-agents.test`, `one-agent.test` in `src/lib/thirty/mock.ts` | FM-23. Mock mode only. |
| `HOME_PROXY_FAULT=1`, honored only when `isMockMode()` | Makes the proxy throw, to walk FM-18. |
| Launch configs `verify-home` (mock, Redis blanked, port 3320), `verify-home-pin` (`HOME_DESIGN=open-roles`, 3321), `verify-home-junk` (`HOME_DESIGN=garbage`, 3322), `verify-home-fault` (`HOME_PROXY_FAULT=1`, 3323) | One server per configuration. |

### 11.3 Agreement test against PostHog

Before relying on the hash: create a temporary flag `home-design-selftest` with the same two variants at 50/50, request PostHog's `/flags` endpoint for 200 random ids, and compare each answer with the local function called with that flag key. All 200 must match. Save 10 of the pairs as the fixed vectors in the unit test, then delete the temporary flag. If any pair differs, stop and report: the fallback design is a flag whose conditions read a person property set by the site, which removes the dependency on the hash.

## 12. Acceptance

- Gates green: lint, typecheck, tests, build.
- Build output shows `/` and `/home/[variant]` as static, and the proxy present.
- `verify-feature` walks UP-01 to UP-28 and FM-01 to FM-32 with evidence, on both designs where a row says so.
- The agreement test passes 200 of 200.
- The PostHog experiment exists as a draft with the metrics in 10.4, and the dashboard tiles exist.

## 13. Rollout and runbook

1. Merge and deploy with `HOME_DESIGN` unset. The split starts with the deploy.
2. On production, check `x-home-design` on `/`, both designs through `/?variant=`, and one `home_viewed` in PostHog with `environment: production`.
3. Launch the experiment in PostHog. Views before the launch are ignored by the analysis.
4. Share the bare URL, with UTM parameters per channel (`?utm_source=linkedin`). Never share a `?variant=` link for traffic: those visitors are forced and excluded.
5. Read results in the experiment view and the dashboard. Watch the mismatch tile; it should stay at zero.
6. To end: end the experiment in PostHog, set `HOME_DESIGN=<winner>` in Vercel (Production), redeploy. Later, delete the losing design and its key.
7. To roll back at any point: set `HOME_DESIGN=classic` and redeploy, or revert the merge.

Never edit the `home-design` flag's variants or split in PostHog. The site does not read them.

## 14. Handoff notes the builder must write

- The result of the agreement test, with the count.
- Whether react-calendly checks the message origin, and what was done if not (FM-07).
- First-load JS for `/` before and after, per design.
- The PostHog experiment and dashboard links, and the experiment's resolved exposure configuration as PostHog reports it back.
- Anything in the prototypes that was changed on purpose in the port.
- Open items for Davin: run caps before sharing (10.1), and the launch step.
