// Runs in the browser before the app hydrates (Next.js instrumentation-client).
// posthog-js (~120 KB gzipped) loads in a separate chunk so it never competes
// with the first render.
import {
  analyticsEnvironment,
  POSTHOG_PROXY_PATH,
  POSTHOG_UI_HOST,
  posthogKey,
  sanitizeAnalyticsId,
} from "@/lib/analytics/config";
import { setPostHog } from "@/lib/analytics/track";
import { HOME_COOKIES, HOME_FLAG_KEY, readCookie, readHomeAssignment } from "@/lib/experiments/homeDesign";

const key = posthogKey();
if (key) {
  import("posthog-js")
    .then(({ default: posthog }) => {
      // The proxy gave this visitor an id and a homepage design (src/proxy.ts).
      // Starting posthog-js from the same id and design keeps PostHog's own
      // evaluation of the flag in step with what was served.
      const cookies = document.cookie;
      const visitorId = sanitizeAnalyticsId(readCookie(cookies, HOME_COOKIES.id));
      const home = readHomeAssignment(cookies);
      posthog.init(key, {
        bootstrap: {
          ...(visitorId ? { distinctID: visitorId } : {}),
          ...(home?.source === "ab" ? { featureFlags: { [HOME_FLAG_KEY]: home.design } } : {}),
        },
        api_host: POSTHOG_PROXY_PATH,
        ui_host: POSTHOG_UI_HOST,
        // Includes pageviews on client-side navigation ("history_change").
        defaults: "2026-08-30",
        // Anonymous visitors get profiles, so "who" (location, device, company site asked about) is visible.
        person_profiles: "always",
        capture_pageleave: true,
        session_recording: { maskAllInputs: true },
      });
      posthog.register({
        environment: analyticsEnvironment(),
        ...(home ? { home_variant: home.design, home_variant_source: home.source } : {}),
      });
      // Anyone who has used a `?variant=` preview link is kept out of the results.
      if (readCookie(cookies, HOME_COOKIES.internal) === "1") posthog.setInternalOrTestUser();
      setPostHog(posthog);
    })
    .catch(() => {
      // Analytics must never break the page (blocked chunk, offline).
    });
}
