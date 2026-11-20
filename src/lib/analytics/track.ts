// Client-side event capture. Sends to PostHog (once its SDK has loaded) and
// Vercel Analytics. Analytics must never affect the page, so nothing here throws.
import type { PostHog } from "posthog-js";
import { track as vercelTrack } from "@vercel/analytics";

export type TrackProps = Record<string, string | number | boolean | null>;

// posthog-js is loaded lazily by instrumentation-client, so it stays out of the
// first-load bundle. Events tracked before it arrives wait here.
const MAX_PENDING = 20;
let posthog: PostHog | null = null;
const pending: Array<[string, TrackProps | undefined]> = [];

export function setPostHog(instance: PostHog): void {
  posthog = instance;
  for (const [name, props] of pending.splice(0)) capture(name, props);
}

function capture(name: string, props?: TrackProps): void {
  try {
    posthog?.capture(name, props);
  } catch {
    // Ignore: analytics is best effort.
  }
}

export function track(name: string, props?: TrackProps): void {
  if (posthog) capture(name, props);
  else if (pending.length < MAX_PENDING) pending.push([name, props]);
  try {
    vercelTrack(name, props);
  } catch {
    // Ignore: analytics is best effort.
  }
}

/** The browser's PostHog ids, sent with a run so server events join the same person and replay. */
export function analyticsIds(): { ph_id?: string; ph_session?: string } {
  if (!posthog) return {};
  try {
    return { ph_id: posthog.get_distinct_id(), ph_session: posthog.get_session_id() };
  } catch {
    return {};
  }
}
