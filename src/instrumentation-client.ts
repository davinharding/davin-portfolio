// Runs in the browser before the app hydrates (Next.js instrumentation-client).
// posthog-js (~120 KB gzipped) loads in a separate chunk so it never competes
// with the first render.
import { analyticsEnvironment, POSTHOG_PROXY_PATH, POSTHOG_UI_HOST, posthogKey } from "@/lib/analytics/config";
import { setPostHog } from "@/lib/analytics/track";

const key = posthogKey();
if (key) {
  import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: POSTHOG_PROXY_PATH,
        ui_host: POSTHOG_UI_HOST,
        // Includes pageviews on client-side navigation ("history_change").
        defaults: "2026-08-30",
        // Anonymous visitors get profiles, so "who" (location, device, company site asked about) is visible.
        person_profiles: "always",
        capture_pageleave: true,
        session_recording: { maskAllInputs: true },
      });
      posthog.register({ environment: analyticsEnvironment() });
      setPostHog(posthog);
    })
    .catch(() => {
      // Analytics must never break the page (blocked chunk, offline).
    });
}
