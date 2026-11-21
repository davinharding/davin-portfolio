# 0009. Theme and splash are decided before first paint, in CSS and an inline script

- **Status:** Accepted
- **Date:** 2026-11-21 (recorded from code comments)

## Context

The site has a light and a dark theme, an animated splash, and a day/night reveal when the theme changes. Pages are prerendered, so React does not know the visitor's theme until it hydrates.

## Decision

**Theme on first paint**
- An inline script in `<head>` (`themeBootScript`) applies the theme before first paint: the saved choice, else the OS setting. No flash of the wrong theme.
- Only an explicit light or dark choice is stored; no key means "follow the OS". The old `theme` key was written on every visit (always "dark"), so only a stored "light" is carried over.
- `localStorage` may be unavailable (private mode); reads and writes fail quietly.
- The React provider starts from server-safe defaults and syncs on mount. Nothing on first paint depends on them: the header renders both logos and the `light` class on `<html>` picks one, and the sun/moon icon is driven by the same class. No hydration swap.
- The OS setting is followed live until the visitor picks a theme. A manual choice also updates the mobile browser chrome colour.

**Theme changes**
- A manual change spreads out as a circle from the toggle (View Transitions API), with a glowing horizon on its edge and stars for night. The decorative layer is added inside the transition's update so it lives in the revealed layer.
- OS-driven changes and older browsers get a plain colour cross-fade, transitioning only theme-affected surfaces rather than every node.
- The menu's choice is applied once the menu has finished closing, so it is not frozen mid-fade in the snapshot the reveal starts from.

**Splash**
- The splash is server-rendered and CSS-driven, so it plays from first paint. Its colours mirror `public/logo.svg` and `logo-light.svg`, so the mark lands on the header logo unchanged.
- `LoadingAnimation.tsx` only measures where the mark must land, so it ends exactly on the header logo.
- A CSS failsafe animation reveals the page even if the script never runs. If hydration is so slow that the failsafe has started, the script lets it finish rather than restarting with a dock.
- Repeat visits in a session skip the splash (the boot script adds `loader-done`), and so do visitors who prefer reduced motion. No failsafe animation means CSS is hiding the splash.

**React's script-tag warning**
- React logs a dev-only "Encountered a script tag" warning for these inline scripts, though they run correctly from the SSR HTML. `SilenceScriptWarning` filters it. This is a workaround, tracked in [#9](https://github.com/davinharding/davin-portfolio/issues/9).

## Consequences

- The boot script is a string in `src/lib/theme.ts` and is not type-checked.
- Anything that differs by theme must key off the `html.light` class, not React state, to be right on first paint.

## Where

- `src/lib/theme.ts`, `src/lib/themeFx.ts`, `src/app/layout.tsx`
- `src/components/ThemeProvider.tsx`, `ThemeToggle.tsx`, `ThemeIcon.tsx`, `Header.tsx`, `LoadingAnimation.tsx`, `SilenceScriptWarning.tsx`
- `src/app/globals.css` (`.splash*`, `.theme-*`, `.theme-fx*`)
