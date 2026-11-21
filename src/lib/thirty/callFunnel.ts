import type { HomeDesign } from "@/lib/experiments/homeDesign";
import { isValidSlug } from "./slugFormat";

export const CALENDLY_URL = "https://calendly.com/davinharding/1-on-1-discovery-call";
export const CALENDLY_ORIGIN = "https://calendly.com";

const SLUG_PARAM = "b";

export function callPath(slug?: string): string {
  return slug && isValidSlug(slug) ? `/call?${SLUG_PARAM}=${slug}` : "/call";
}

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

export function calendlyUtm(design: HomeDesign | null, slug?: string): CalendlyUtm {
  return {
    utmSource: "davin.io",
    utmMedium: "thirty-seconds",
    utmCampaign: "home-design",
    utmContent: design ?? "none",
    utmTerm: slug ?? "",
  };
}

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

export function callEventProps(slug?: string): Record<string, string> {
  return slug ? { blueprint_slug: slug } : {};
}

const ONCE_PER_PAGE: ReadonlySet<CallEvent> = new Set(["call_calendar_viewed", "call_booked"]);

export function createCallTracker(
  report: (event: CallEvent, props: Record<string, string>) => void,
  slug?: string
): (origin: string, data: unknown) => void {
  const reported = new Set<CallEvent>();
  return (origin, data) => {
    if (origin !== CALENDLY_ORIGIN || !data || typeof data !== "object") return;
    const name = (data as { event?: unknown }).event;
    const event = typeof name === "string" ? CALL_EVENTS[name] : undefined;
    if (!event) return;
    if (ONCE_PER_PAGE.has(event)) {
      if (reported.has(event)) return;
      reported.add(event);
    }
    report(event, callEventProps(slug));
  };
}
