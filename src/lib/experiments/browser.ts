// Client-only. Tells PostHog which homepage design a visitor saw. The view event is
// the experiment's exposure, so it is sent as soon as the page is on screen and
// never waits on PostHog's own flag evaluation.
import { onPostHog, track } from "@/lib/analytics/track";
import {
  HOME_FLAG_KEY,
  homeEventProps,
  readHomeAssignment,
  type HomeAssignment,
  type HomeDesign,
} from "./homeDesign";

/**
 * The properties of `home_viewed` for the design on screen. A missing or stale
 * assignment cookie (cookies blocked) is reported as source "unknown" with no flag
 * property, so that view is not counted as an exposure.
 */
export function homeViewProps(design: HomeDesign, assignment: HomeAssignment | null): Record<string, string> {
  if (!assignment || assignment.design !== design) {
    return { home_variant: design, home_variant_source: "unknown" };
  }
  return homeEventProps(assignment);
}

/**
 * PostHog evaluates the flag too. If its answer is a variant other than the one
 * served, the flag was edited in PostHog or the ids diverged: worth knowing about.
 */
export function assignmentMismatch(
  served: HomeAssignment,
  evaluated: unknown
): { served: string; evaluated: string } | null {
  if (served.source !== "ab") return null;
  if (typeof evaluated !== "string" || evaluated === served.design) return null;
  return { served: served.design, evaluated };
}

let mismatchReported = false;

export function reportHomeView(design: HomeDesign): void {
  let assignment: HomeAssignment | null = null;
  try {
    assignment = readHomeAssignment(document.cookie);
  } catch {
    // Cookie access can be denied outright; the view is still reported.
  }
  // The cookie names the design on screen unless cookies are blocked or stale.
  const served = assignment?.design === design ? assignment : null;
  const props = homeViewProps(design, served);

  // Later events (a run, the call page, a booking) carry the design too.
  onPostHog((posthog) => {
    posthog.register({ home_variant: props.home_variant, home_variant_source: props.home_variant_source });
  });
  track("home_viewed", props);

  if (!served || served.source !== "ab") return;
  onPostHog((posthog) => {
    posthog.onFeatureFlags(() => {
      if (mismatchReported) return;
      const mismatch = assignmentMismatch(served, posthog.getFeatureFlag(HOME_FLAG_KEY, { send_event: false }));
      if (!mismatch) return;
      mismatchReported = true;
      track("home_variant_mismatch", mismatch);
    });
  });
}
