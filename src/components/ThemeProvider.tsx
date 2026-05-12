"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from the class set by the inline boot script in <head>, so the
  // first render matches what the user actually sees (no flash, no mismatch).
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    // Briefly enable color transitions so theme toggles feel smooth
    root.classList.add("theme-transition");
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* storage may be unavailable (private mode, etc.) */
    }
    const t = window.setTimeout(
      () => root.classList.remove("theme-transition"),
      300
    );
    return () => window.clearTimeout(t);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
