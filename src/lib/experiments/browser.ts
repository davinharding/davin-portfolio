import { onPostHog, track } from "@/lib/analytics/track";
import {
  HOME_FLAG_KEY,
  homeEventProps,
  readHomeAssignment,
  type HomeAssignment,
  type HomeDesign,
} from "./homeDesign";

export function homeViewProps(design: HomeDesign, assignment: HomeAssignment | null): Record<string, string> {
  if (!assignment || assignment.design !== design) {
    return { home_variant: design, home_variant_source: "unknown" };
  }
  return homeEventProps(assignment);
}

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
  } catch {}
  const served = assignment?.design === design ? assignment : null;
  const props = homeViewProps(design, served);

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
