"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { playThemeFx } from "@/lib/themeFx";
import {
  THEME_COLORS,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

type Origin = { x: number; y: number };

type ThemeContextType = {
  /** What the visitor chose: follow the OS, or force light/dark. */
  preference: ThemePreference;
  /** The theme actually on screen. */
  theme: ResolvedTheme;
  /** `origin` (viewport px) is where the day/night reveal starts from. */
  setPreference: (next: ThemePreference, origin?: Origin) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

const LIGHT_QUERY = "(prefers-color-scheme: light)";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

function systemTheme(): ResolvedTheme {
  return window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage may be unavailable (private mode, etc.) */
  }
  return "system";
}

function writePreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* storage may be unavailable (private mode, etc.) */
  }
}

function paintTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
  // Keep the mobile browser chrome in step with a manual override, too
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", THEME_COLORS[theme]));
}

// Plain cross-fade of colors, for OS-driven changes and older browsers.
function fadeToTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  paintTheme(theme);
  window.setTimeout(() => root.classList.remove("theme-transition"), 300);
}

// Day spreads out from `origin` as a circle (or night does), via the View
// Transitions API. The CSS half lives in globals.css under "Day/night reveal".
function revealTheme(theme: ResolvedTheme, origin: Origin, commit: () => void) {
  const root = document.documentElement;
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y)
  );
  root.style.setProperty("--theme-x", `${origin.x}px`);
  root.style.setProperty("--theme-y", `${origin.y}px`);
  root.style.setProperty("--theme-r", `${radius}px`);
  root.dataset.themeTransition = theme === "light" ? "day" : "night";

  const transition = (document as ViewTransitionDocument).startViewTransition!(
    () => {
      flushSync(commit);
      paintTheme(theme);
      // Added inside the update so it lives in the revealed layer
      playThemeFx(theme, origin, radius);
    }
  );
  transition.finished.finally(() => {
    delete root.dataset.themeTransition;
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Server-safe defaults; the inline boot script in <head> has already painted
  // the right theme, and we sync to it on mount. Nothing on first paint
  // depends on these values (the logo and icon key off the html class).
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [theme, setTheme] = useState<ResolvedTheme>("dark");
  const themeRef = useRef<ResolvedTheme>("dark");

  useEffect(() => {
    const current = document.documentElement.classList.contains("light")
      ? "light"
      : "dark";
    themeRef.current = current;
    setTheme(current);
    setPreferenceState(readPreference());
  }, []);

  // Follow the OS live while the visitor hasn't picked a theme themselves
  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia(LIGHT_QUERY);
    const onChange = () => {
      const next = systemTheme();
      if (next === themeRef.current) return;
      themeRef.current = next;
      setTheme(next);
      fadeToTheme(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback(
    (next: ThemePreference, origin?: Origin) => {
      setPreferenceState(next);
      writePreference(next);

      const target = next === "system" ? systemTheme() : next;
      if (target === themeRef.current) return;
      themeRef.current = target;

      const canReveal =
        origin &&
        typeof (document as ViewTransitionDocument).startViewTransition ===
          "function" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (canReveal) {
        revealTheme(target, origin, () => setTheme(target));
      } else {
        setTheme(target);
        fadeToTheme(target);
      }
    },
    []
  );

  const value = useMemo(
    () => ({ preference, theme, setPreference }),
    [preference, theme, setPreference]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
