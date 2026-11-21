import {
  analyticsEnvironment,
  POSTHOG_PROXY_PATH,
  POSTHOG_UI_HOST,
  posthogKey,
  sanitizeAnalyticsId,
} from "@/lib/analytics/config";
import { setPostHog } from "@/lib/analytics/track";
import { readCookie } from "@/lib/analytics/cookies";
import { HOME_COOKIES, HOME_FLAG_KEY, readHomeAssignment } from "@/lib/experiments/homeDesign";

const key = posthogKey();
if (key) {
  import("posthog-js")
    .then(({ default: posthog }) => {
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
        defaults: "2026-08-30",
        person_profiles: "always",
        capture_pageleave: true,
        session_recording: { maskAllInputs: true },
      });
      posthog.register({
        environment: analyticsEnvironment(),
        ...(home ? { home_variant: home.design, home_variant_source: home.source } : {}),
      });
      if (readCookie(cookies, HOME_COOKIES.internal) === "1") posthog.setInternalOrTestUser();
      setPostHog(posthog);
    })
    .catch(() => {});
}
