// Client-safe. The last step of the funnel: the Calendly embed on /call. Carries
// the visitor's homepage design and blueprint into Calendly, and turns Calendly's
// embed messages into analytics events.
import type { HomeDesign } from "@/lib/experiments/homeDesign";
import { isValidSlug } from "./slugFormat";

export const CALENDLY_URL = "https://calendly.com/davinharding/1-on-1-discovery-call";
/** Embed messages are trusted only from here. */
export const CALENDLY_ORIGIN = "https://calendly.com";

const SLUG_PARAM = "b";

/** The call page, remembering which blueprint the visitor came from. */
export function callPath(slug?: string): string {
  return slug && isValidSlug(slug) ? `/call?${SLUG_PARAM}=${slug}` : "/call";
}

/** The blueprint slug in the call page's query string, if it is a real one. */
export function blueprintSlugFromSearch(search: string): string | undefined {
  const slug = new URLSearchParams(search).get(SLUG_PARAM);
  return slug && isValidSlug(slug) ? slug : undefined;
}

export type CalendlyUtm = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
};

/** Shown with each booking in Calendly: which design and which blueprint led to it. */
export function calendlyUtm(design: HomeDesign | null, slug?: string): CalendlyUtm {
  return {
    utmSource: "davin.io",
    utmMedium: "thirty-seconds",
    utmCampaign: "home-design",
    utmContent: design ?? "none",
    utmTerm: slug ?? "",
  };
}

/** The booking page as a plain link, for when the embed does not load. */
export function calendlyLink(utm: CalendlyUtm): string {
  const url = new URL(CALENDLY_URL);
  url.searchParams.set("utm_source", utm.utmSource);
  url.searchParams.set("utm_medium", utm.utmMedium);
  url.searchParams.set("utm_campaign", utm.utmCampaign);
  url.searchParams.set("utm_content", utm.utmContent);
  if (utm.utmTerm) url.searchParams.set("utm_term", utm.utmTerm);
  return url.toString();
}

export type CallEvent = "call_calendar_viewed" | "call_time_selected" | "call_booked";

const CALL_EVENTS: Record<string, CallEvent> = {
  "calendly.event_type_viewed": "call_calendar_viewed",
  "calendly.date_and_time_selected": "call_time_selected",
  "calendly.event_scheduled": "call_booked",
};

/** The properties every call event carries. */
export function callEventProps(slug?: string): Record<string, string> {
  return slug ? { blueprint_slug: slug } : {};
}

/**
 * Returns a handler for window messages. It reports Calendly's own messages and
 * nothing else, and reports a booking at most once however often it is announced.
 * Calendly's event and invitee links are never passed on.
 */
export function createCallTracker(
  report: (event: CallEvent, props: Record<string, string>) => void,
  slug?: string
): (origin: string, data: unknown) => void {
  let booked = false;
  return (origin, data) => {
    if (origin !== CALENDLY_ORIGIN || !data || typeof data !== "object") return;
    const name = (data as { event?: unknown }).event;
    const event = typeof name === "string" ? CALL_EVENTS[name] : undefined;
    if (!event) return;
    if (event === "call_booked") {
      if (booked) return;
      booked = true;
    }
    report(event, callEventProps(slug));
  };
}
