# 0011. Homepage designs share one run model and work without JavaScript

- **Status:** Accepted
- **Date:** 2026-11-21 (recorded from code comments)
- **Spec:** `docs/specs/home-design-experiment.md`, section 6

## Context

The homepage comes in several designs (Classic, Open roles, Drafting table), each prerendered (ADR 0003). They all run the same blueprint request and must fit a phone screen while a run is on it.

## Decision

**One run, many drawings**
- `useBlueprintRun` holds the run: the field's value, the request and its event stream, errors, cancel, focus and the timer. Designs differ only in how they draw that state.
- `runModel.ts` is the run as pure data (steps, how events change them, agent slots, shared copy), tested without a browser. Slots show four open roles until a fifth agent arrives, never more than a blueprint can hold.
- The client's "looks like a website" check mirrors the server's first rules for display only; the server stays the authority.
- Cancelling aborts the request and marks the run abandoned. The mark is read after every await, so nothing an abandoned run does reaches the screen. Without it the aborted stream would surface as "Lost the connection". Returning through the back-forward cache shows a fresh form for the same reason (FM-09).
- Focus moves to the field once the splash is gone (fine pointers only, without scrolling), and to the run's heading when a run starts. Under reduced motion the timer ticks once a second.

**Fits one screen**
- A `compact` Tailwind variant (`max-width: 639px` or `max-height: 820px`) covers phones and short windows. On compact screens the run console drops the reminder the form just gave and keeps each detail on one line.
- While the console is on screen the headline steps down. Classic's top padding keeps the heading fixed when the taller console replaces the form.
- The page background's accent glow follows the run through a `data-step` attribute; only CSS custom properties change.

**Without JavaScript, and before it loads**
- The form posts natively to `/api/blueprint`.
- The Drafting table renders both its wide and narrow drawings and CSS shows the one that fits, so the right drawing is there before JavaScript loads. Today's date fills in after mount so the prerendered page hydrates cleanly.
- The Open roles chart lists every example without JavaScript, since its buttons do nothing then.

**Design details**
- Open roles: with nothing typed the chart shows teams from the committed examples (`sampleTeams.ts`, derived so it never drifts from them). Once an address is typed it becomes the visitor's team with open roles that fill as agents are drafted. An error that points at the examples brings the samples back.
- Open roles' progress bars fill toward a cap over each step's usual length and only complete when the step reports done, since step lengths are not known ahead.
- Drafting table: the ink follows what has been typed, and a run inks all of it. The cursor's bright patch on the grid is written straight to CSS variables once per frame, so moving the mouse never re-renders. Which boxes show a human-gate mark is illustrative, since gate status is not known until the run ends.
- Drafting table on phones: the narrow drawing is drawn smaller, so its type is set larger. No text may render under 10 px in the narrowest container (a 360 px phone less 16 px gutters, 328 px). `drawingScale.ts` holds those numbers and a test checks the CSS against them (FM-25: text once rendered at 9.84 px).

**Shared copy and the social image**
- The homepage's words and metadata live in `homeCopy.ts`, shared by every design so link previews and search results are the same whichever design a visitor or crawler gets.
- The social preview image is served from `/social/home`, outside `/` and `/home/<design>`, so every design and the fallback share one URL the proxy never touches, and no other page inherits it.

## Where

- `src/components/thirty/useBlueprintRun.ts`, `runModel.ts`, `runControl.ts`, `RunConsole.tsx`, `UrlForm.tsx`
- `src/components/thirty/home/` (`BlueprintDrawing.tsx`, `DraftingTableContent.tsx`, `TeamChart.tsx`, `ClassicHome.tsx`, `drawingScale.ts`, `stepProgress.ts`)
- `src/lib/thirty/homeCopy.ts`, `sampleTeams.ts`, `src/app/social/home/opengraph-image.tsx`
- `tailwind.config.ts` (`compact`), `src/app/globals.css` (`.thirty-hero`, `.drafting-*`, `.team-slot`)
