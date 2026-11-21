"use client";

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
