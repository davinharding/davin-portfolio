import { describe, expect, it, vi } from "vitest";
import {
  blueprintSlugFromSearch,
  CALENDLY_ORIGIN,
  calendlyLink,
  calendlyUtm,
  callPath,
  createCallTracker,
} from "../callFunnel";

describe("the call page's blueprint context", () => {
  it("links to the call page with a real slug, and without anything else", () => {
    expect(callPath("example-linear")).toBe("/call?b=example-linear");
    expect(callPath()).toBe("/call");
    expect(callPath("../../etc")).toBe("/call");
    expect(callPath("a b")).toBe("/call");
  });

  it("reads back only a well-formed slug", () => {
    expect(blueprintSlugFromSearch("?b=acme-com-abcd2345")).toBe("acme-com-abcd2345");
    expect(blueprintSlugFromSearch("?b=example-linear&utm_source=x")).toBe("example-linear");
    for (const search of ["", "?b=", "?b=<script>", "?b=UPPER", `?b=${"a".repeat(200)}`, "?x=example-linear", "?b=a%20b"]) {
      expect(blueprintSlugFromSearch(search)).toBeUndefined();
    }
  });
});

describe("Calendly attribution", () => {
  it("carries the design and the blueprint", () => {
    expect(calendlyUtm("drafting-table", "acme-com-abcd2345")).toEqual({
      utmSource: "davin.io",
      utmMedium: "thirty-seconds",
      utmCampaign: "home-design",
      utmContent: "drafting-table",
      utmTerm: "acme-com-abcd2345",
    });
    expect(calendlyUtm(null)).toMatchObject({ utmContent: "none", utmTerm: "" });
  });

  it("builds the same attribution into the plain link", () => {
    const link = new URL(calendlyLink(calendlyUtm("open-roles", "example-linear")));
    expect(link.origin + link.pathname).toBe("https://calendly.com/davinharding/1-on-1-discovery-call");
    expect(Object.fromEntries(link.searchParams)).toEqual({
      utm_source: "davin.io",
      utm_medium: "thirty-seconds",
      utm_campaign: "home-design",
      utm_content: "open-roles",
      utm_term: "example-linear",
    });
    expect(new URL(calendlyLink(calendlyUtm(null))).searchParams.has("utm_term")).toBe(false);
  });
});

describe("createCallTracker", () => {
  const message = (event: string) => ({ event, payload: { event: { uri: "https://calendly.com/secret" } } });

  it("maps Calendly's messages to events, with the blueprint", () => {
    const report = vi.fn();
    const handle = createCallTracker(report, "example-linear");
    handle(CALENDLY_ORIGIN, message("calendly.event_type_viewed"));
    handle(CALENDLY_ORIGIN, message("calendly.date_and_time_selected"));
    handle(CALENDLY_ORIGIN, message("calendly.event_scheduled"));
    expect(report.mock.calls).toEqual([
      ["call_calendar_viewed", { blueprint_slug: "example-linear" }],
      ["call_time_selected", { blueprint_slug: "example-linear" }],
      ["call_booked", { blueprint_slug: "example-linear" }],
    ]);
    expect(JSON.stringify(report.mock.calls)).not.toContain("secret");
  });

  it("reports a booking once however often Calendly announces it", () => {
    const report = vi.fn();
    const handle = createCallTracker(report);
    for (let i = 0; i < 3; i++) handle(CALENDLY_ORIGIN, message("calendly.event_scheduled"));
    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith("call_booked", {});
  });

  it("ignores messages from any other origin", () => {
    const report = vi.fn();
    const handle = createCallTracker(report);
    for (const origin of ["https://www.davin.io", "https://calendly.com.evil.example", "http://calendly.com", "null", ""]) {
      handle(origin, message("calendly.event_scheduled"));
    }
    expect(report).not.toHaveBeenCalled();
  });

  it("ignores other events and malformed data", () => {
    const report = vi.fn();
    const handle = createCallTracker(report);
    for (const data of [null, undefined, "calendly.event_scheduled", 7, {}, { event: 7 }, message("calendly.page_height"), message("calendly.profile_page_viewed")]) {
      handle(CALENDLY_ORIGIN, data);
    }
    expect(report).not.toHaveBeenCalled();
  });
});
