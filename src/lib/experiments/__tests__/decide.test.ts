import { describe, expect, it } from "vitest";
import { decideHome, type HomeDecisionInput } from "../decide";
import { assignVariant } from "../homeDesign";

function decide(overrides: Partial<Omit<HomeDecisionInput, "searchParams">> & { search?: string } = {}) {
  const { search = "", ...rest } = overrides;
  return decideHome({
    pathname: "/",
    searchParams: new URLSearchParams(search),
    cookies: {},
    mode: "ab",
    newId: () => "fresh-id",
    ...rest,
  });
}

const posthogCookie = (distinctId: string) => encodeURIComponent(JSON.stringify({ distinct_id: distinctId }));

describe("decideHome: who gets which design", () => {
  it("gives a new visitor a fresh id and the design that id hashes to", async () => {
    expect(await decide()).toEqual({
      kind: "rewrite",
      id: "fresh-id",
      design: await assignVariant("fresh-id"),
      source: "ab",
    });
  });

  it("keeps a returning visitor on the same design", async () => {
    const first = await decide({ cookies: { id: "visitor-1" } });
    const second = await decide({ cookies: { id: "visitor-1" } });
    expect(first).toEqual(second);
    expect(first).toMatchObject({ kind: "rewrite", id: "visitor-1", source: "ab" });
  });

  it("adopts the id posthog-js already gave a visitor whose first page was not the homepage", async () => {
    expect(await decide({ cookies: { posthog: posthogCookie("ph-existing") } })).toMatchObject({
      kind: "rewrite",
      id: "ph-existing",
      design: await assignVariant("ph-existing"),
    });
  });

  it("prefers its own id cookie over posthog-js's", async () => {
    expect(await decide({ cookies: { id: "mine", posthog: posthogCookie("theirs") } })).toMatchObject({ id: "mine" });
  });

  it("replaces a tampered id cookie", async () => {
    for (const id of ["<script>alert(1)</script>", "x".repeat(5000), "a b", ""]) {
      expect(await decide({ cookies: { id } })).toMatchObject({ kind: "rewrite", id: "fresh-id" });
    }
  });

  it("falls through a posthog cookie that is not usable", async () => {
    for (const posthog of ["%7Bnot-json", posthogCookie("<bad id>"), encodeURIComponent("{}")]) {
      expect(await decide({ cookies: { posthog } })).toMatchObject({ kind: "rewrite", id: "fresh-id" });
    }
  });

  it("serves a pinned design to everyone, marked as pinned", async () => {
    for (const mode of ["open-roles", "drafting-table", "classic"] as const) {
      expect(await decide({ mode, cookies: { id: "visitor-1" } })).toEqual({
        kind: "rewrite",
        id: "visitor-1",
        design: mode,
        source: "pin",
      });
    }
  });

  it("serves a forced design over the split and over a pin, marked as a preview", async () => {
    expect(await decide({ cookies: { id: "v", force: "classic" } })).toMatchObject({ design: "classic", source: "qa" });
    expect(await decide({ mode: "open-roles", cookies: { id: "v", force: "drafting-table" } })).toMatchObject({
      design: "drafting-table",
      source: "qa",
    });
  });

  it("ignores a tampered force cookie", async () => {
    expect(await decide({ cookies: { id: "v", force: "<script>" } })).toMatchObject({ source: "ab" });
  });
});

describe("decideHome: preview links", () => {
  it("sets the preview, marks the visitor internal, and keeps other parameters", async () => {
    expect(await decide({ search: "utm_source=x&variant=drafting-table&utm_medium=y" })).toEqual({
      kind: "redirect",
      search: "?utm_source=x&utm_medium=y",
      force: "drafting-table",
      internal: true,
    });
    expect(await decide({ search: "variant=classic" })).toEqual({
      kind: "redirect",
      search: "",
      force: "classic",
      internal: true,
    });
  });

  it("clears the preview with variant=auto", async () => {
    expect(await decide({ search: "variant=auto&a=1", cookies: { force: "classic" } })).toEqual({
      kind: "redirect",
      search: "?a=1",
      force: null,
    });
  });

  it("ignores unknown, empty, huge, script-like, and repeated values", async () => {
    for (const search of [
      "variant=nope",
      "variant=",
      `variant=${"x".repeat(5000)}`,
      `variant=${encodeURIComponent("<script>alert(1)</script>")}`,
      "variant=open-roles&variant=classic",
      "variant=OPEN-ROLES",
    ]) {
      expect(await decide({ search, cookies: { id: "v" } })).toMatchObject({ kind: "rewrite", source: "ab" });
    }
  });
});

describe("decideHome: other paths", () => {
  it("sends direct requests for the per-design routes back to the homepage", async () => {
    for (const pathname of ["/home", "/home/", "/home/open-roles", "/home/classic/extra", "/home//evil.com", "/home/%2F%2Fevil.com"]) {
      expect(await decide({ pathname, search: "a=1" })).toEqual({ kind: "redirect", search: "?a=1" });
    }
    expect(await decide({ pathname: "/home/open-roles" })).toEqual({ kind: "redirect", search: "" });
  });

  it("leaves every other path alone for a visitor who already has an id", async () => {
    for (const pathname of ["/work", "/homepage", "/b/example-linear", "/api/blueprint", "/call", "//evil.com"]) {
      expect(await decide({ pathname, search: "variant=classic", cookies: { id: "visitor-1" } })).toEqual({ kind: "pass" });
    }
  });

  it("gives a visitor whose first page is not the homepage an id, and nothing else", async () => {
    for (const pathname of ["/work", "/b/example-linear", "/call", "/sorry/rate-limited"]) {
      expect(await decide({ pathname, search: "variant=classic" })).toEqual({ kind: "pass", setId: "fresh-id" });
    }
  });

  it("adopts posthog-js's id on other pages too, so the visitor stays one person", async () => {
    expect(await decide({ pathname: "/work", cookies: { posthog: posthogCookie("ph-existing") } })).toEqual({
      kind: "pass",
      setId: "ph-existing",
    });
  });

  it("replaces a tampered id cookie on other pages", async () => {
    expect(await decide({ pathname: "/work", cookies: { id: "<script>" } })).toEqual({ kind: "pass", setId: "fresh-id" });
  });

  it("gives the homepage the same id that another page set first", async () => {
    const pass = await decide({ pathname: "/b/example-linear" });
    const id = pass.kind === "pass" ? pass.setId : undefined;
    expect(await decide({ cookies: { id } })).toMatchObject({ kind: "rewrite", id: "fresh-id", design: await assignVariant("fresh-id") });
  });
});
