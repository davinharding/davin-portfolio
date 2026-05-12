"use client";

// React 19 logs a dev-only console warning for any <script> tag rendered
// through React, even though our inline FOUC-prevention theme script and
// JSON-LD <script> in app/layout.tsx execute correctly from SSR HTML.
//
// There is no per-tag suppression in React 19 (see
// https://github.com/pacocoursey/next-themes/issues/385), so we filter just
// this one warning, only in development. Production console output is
// untouched.

declare global {
  interface Window {
    __davinScriptWarningPatched?: boolean;
  }
}

if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV !== "production" &&
  !window.__davinScriptWarningPatched
) {
  window.__davinScriptWarningPatched = true;
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const first = args[0];
    if (
      typeof first === "string" &&
      first.includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export default function SilenceScriptWarning() {
  return null;
}
