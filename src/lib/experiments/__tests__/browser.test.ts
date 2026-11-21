import { afterEach, describe, expect, it, vi } from "vitest";

const tracked = vi.hoisted(() => [] as Array<[string, unknown]>);
const posthogCallbacks = vi.hoisted(() => [] as Array<(ph: unknown) => void>);
vi.mock("@/lib/analytics/track", () => ({
  track: (name: string, props: unknown) => tracked.push([name, props]),
  onPostHog: (cb: (ph: unknown) => void) => posthogCallbacks.push(cb),
}));

import { assignmentMismatch, homeViewProps, reportHomeView } from "../browser";

afterEach(() => {
  tracked.length = 0;
  posthogCallbacks.length = 0;
  vi.unstubAllGlobals();
});

describe("homeViewProps", () => {
  it("marks a split view as an exposure with the flag property", () => {
    expect(homeViewProps("open-roles", { design: "open-roles", source: "ab" })).toEqual({
      home_variant: "open-roles",
      home_variant_source: "ab",
      "$feature/home-design": "open-roles",
    });
  });

  it("leaves the flag property off preview and pinned views", () => {
    for (const source of ["qa", "pin"] as const) {
      expect(homeViewProps("classic", { design: "classic", source })).toEqual({
        home_variant: "classic",
        home_variant_source: source,
      });
    }
  });

  it("reports an unknown source when the cookie is missing or names another design", () => {
    const unknown = { home_variant: "drafting-table", home_variant_source: "unknown" };
    expect(homeViewProps("drafting-table", null)).toEqual(unknown);
    expect(homeViewProps("drafting-table", { design: "open-roles", source: "ab" })).toEqual(unknown);
  });
});

describe("assignmentMismatch", () => {
  const served = { design: "open-roles", source: "ab" } as const;

  it("is quiet when PostHog agrees, has no answer, or the flag is off", () => {
    for (const evaluated of ["open-roles", undefined, null, false, true]) {
      expect(assignmentMismatch(served, evaluated)).toBeNull();
    }
  });

  it("reports a different variant from PostHog", () => {
    expect(assignmentMismatch(served, "drafting-table")).toEqual({ served: "open-roles", evaluated: "drafting-table" });
  });

  it("never applies to preview or pinned views", () => {
    expect(assignmentMismatch({ design: "open-roles", source: "qa" }, "drafting-table")).toBeNull();
    expect(assignmentMismatch({ design: "open-roles", source: "pin" }, "drafting-table")).toBeNull();
  });
});

describe("reportHomeView", () => {
  function fakePostHog(evaluated: unknown) {
    const registered: unknown[] = [];
    return {
      registered,
      register: (props: unknown) => registered.push(props),
      onFeatureFlags: (cb: () => void) => cb(),
      getFeatureFlag: vi.fn(() => evaluated),
    };
  }

  it("sends the view, registers the design for later events, and stays quiet when PostHog agrees", () => {
    vi.stubGlobal("document", { cookie: "dh_id=abc; dh_home=drafting-table.ab" });
    reportHomeView("drafting-table");
    expect(tracked).toEqual([
      ["home_viewed", { home_variant: "drafting-table", home_variant_source: "ab", "$feature/home-design": "drafting-table" }],
    ]);
    const ph = fakePostHog("drafting-table");
    for (const cb of posthogCallbacks) cb(ph);
    expect(ph.registered).toEqual([{ home_variant: "drafting-table", home_variant_source: "ab" }]);
    expect(ph.getFeatureFlag).toHaveBeenCalledWith("home-design", { send_event: false });
    expect(tracked).toHaveLength(1);
  });

  it("does not ask PostHog about the flag for a preview view", () => {
    vi.stubGlobal("document", { cookie: "dh_home=open-roles.qa" });
    reportHomeView("open-roles");
    const ph = fakePostHog("drafting-table");
    for (const cb of posthogCallbacks) cb(ph);
    expect(ph.getFeatureFlag).not.toHaveBeenCalled();
    expect(tracked).toEqual([["home_viewed", { home_variant: "open-roles", home_variant_source: "qa" }]]);
  });

  it("still reports the view when cookies cannot be read", () => {
    vi.stubGlobal("document", {
      get cookie(): string {
        throw new Error("SecurityError");
      },
    });
    expect(() => reportHomeView("classic")).not.toThrow();
    expect(tracked).toEqual([["home_viewed", { home_variant: "classic", home_variant_source: "unknown" }]]);
  });

  it("reports a disagreement with PostHog once", () => {
    vi.stubGlobal("document", { cookie: "dh_home=open-roles.ab" });
    reportHomeView("open-roles");
    reportHomeView("open-roles");
    const ph = fakePostHog("drafting-table");
    for (const cb of posthogCallbacks) cb(ph);
    expect(tracked.filter(([name]) => name === "home_variant_mismatch")).toEqual([
      ["home_variant_mismatch", { served: "open-roles", evaluated: "drafting-table" }],
    ]);
  });
});
