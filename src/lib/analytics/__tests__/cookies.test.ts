import { describe, expect, it } from "vitest";
import { distinctIdFromPostHogCookie, posthogCookieName, readCookie } from "../cookies";

describe("cookie readers", () => {
  it("names posthog-js's cookie after the project key", () => {
    expect(posthogCookieName("phc_abc")).toBe("ph_phc_abc_posthog");
  });

  it("reads one cookie by exact name", () => {
    expect(readCookie("dh_id=abc; xdh_id=no; dh_id2=no", "dh_id")).toBe("abc");
    expect(readCookie("flag; dh_id=a=b", "dh_id")).toBe("a=b");
    expect(readCookie("other=1", "dh_id")).toBeUndefined();
    expect(readCookie(undefined, "dh_id")).toBeUndefined();
  });

  it("takes the distinct id out of posthog-js's cookie and nothing else", () => {
    const cookie = (state: unknown) => encodeURIComponent(JSON.stringify(state));
    expect(distinctIdFromPostHogCookie(cookie({ distinct_id: "0193-abc", $sesid: [1, "s"] }))).toBe("0193-abc");
    expect(distinctIdFromPostHogCookie(cookie({ distinct_id: "<script>alert(1)</script>" }))).toBeUndefined();
    expect(distinctIdFromPostHogCookie(cookie({ distinct_id: "x".repeat(200) }))).toBeUndefined();
    expect(distinctIdFromPostHogCookie(cookie({}))).toBeUndefined();
    expect(distinctIdFromPostHogCookie(cookie("text"))).toBeUndefined();
    expect(distinctIdFromPostHogCookie("%7Bnot-json")).toBeUndefined();
    expect(distinctIdFromPostHogCookie("%E0%A4%A")).toBeUndefined();
    expect(distinctIdFromPostHogCookie(undefined)).toBeUndefined();
    expect(distinctIdFromPostHogCookie("x".repeat(5000))).toBeUndefined();
  });
});
