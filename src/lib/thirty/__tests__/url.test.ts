import { describe, expect, it } from "vitest";
import { checkHost, isPlatformHost, normalizeInput } from "../url";

const ok = (raw: string, opts = {}) => {
  const r = normalizeInput(raw, opts);
  if (!r.ok) throw new Error(`expected ok for ${JSON.stringify(raw)}, got ${r.code}`);
  return r;
};
const code = (raw: unknown, opts = {}) => {
  const r = normalizeInput(raw, opts);
  return r.ok ? "ok" : r.code;
};

describe("normalizeInput", () => {
  it("accepts a bare domain", () => {
    expect(ok("acme.com")).toEqual({ ok: true, host: "acme.com", hostname: "acme.com", startUrl: "https://acme.com/" });
  });

  it("trims, lowercases, and strips www for the cache key", () => {
    const r = ok(" HTTPS://WWW.Acme.com/ ");
    expect(r.host).toBe("acme.com");
    expect(r.hostname).toBe("www.acme.com");
    expect(r.startUrl).toBe("https://www.acme.com/");
    expect(r.extraPath).toBeUndefined();
  });

  it("keeps a non-root path as extraPath and drops the query", () => {
    const r = ok("acme.com/products/x?utm=1");
    expect(r.host).toBe("acme.com");
    expect(r.startUrl).toBe("https://acme.com/");
    expect(r.extraPath).toBe("/products/x");
  });

  it("uses the domain of an email address", () => {
    expect(ok("me@acme.com").host).toBe("acme.com");
  });

  it("finds the domain in a sentence and strips trailing punctuation", () => {
    expect(ok("check out acme.com!").host).toBe("acme.com");
    expect(ok("(acme.com).").host).toBe("acme.com");
    expect(ok('"acme.com"').host).toBe("acme.com");
    expect(ok("<https://acme.com>").host).toBe("acme.com");
  });

  it("rejects a sentence with no dotted token", () => {
    expect(code("hello there friend")).toBe("invalid_url");
  });

  it("blocks a single-label host", () => {
    expect(code("acme")).toBe("blocked_host");
  });

  it("blocks IP literals, including metadata endpoints", () => {
    expect(code("http://127.0.0.1")).toBe("blocked_host");
    expect(code("http://[::1]")).toBe("blocked_host");
    expect(code("http://169.254.169.254/latest/meta-data")).toBe("blocked_host");
    expect(code("8.8.8.8")).toBe("blocked_host");
    // Numeric shorthand is canonicalized by the URL parser and still caught.
    expect(code("http://2130706433")).toBe("blocked_host");
  });

  it("rejects non-http schemes", () => {
    expect(code("ftp://acme.com")).toBe("invalid_url");
    expect(code("javascript:alert(1)")).toBe("invalid_url");
    expect(code("mailto:me@acme.com")).toBe("invalid_url");
    expect(code("data:text/html,hi")).toBe("invalid_url");
  });

  it("rejects userinfo and non-standard ports", () => {
    expect(code("https://user:pw@acme.com")).toBe("invalid_url");
    expect(code("acme.com:8080")).toBe("invalid_url");
    expect(ok("acme.com:443").host).toBe("acme.com");
    expect(ok("http://acme.com:80/").host).toBe("acme.com");
  });

  it("converts IDNs to punycode", () => {
    expect(ok("bücher.de").host).toBe("xn--bcher-kva.de");
  });

  it("rejects platform hosts and their subdomains", () => {
    expect(code("linkedin.com/company/acme")).toBe("platform_url");
    expect(code("https://www.linkedin.com/in/someone")).toBe("platform_url");
    expect(code("x.com/acme")).toBe("platform_url");
    expect(code("acme.medium.com")).toBe("platform_url");
    expect(code("google.co.uk")).toBe("platform_url");
    expect(code("amazon.de/shops/acme")).toBe("platform_url");
    expect(code("bit.ly/abc")).toBe("platform_url");
  });

  it("allows storefronts on hosted builders", () => {
    expect(ok("acme.myshopify.com").host).toBe("acme.myshopify.com");
    expect(ok("acme.webflow.io").host).toBe("acme.webflow.io");
    expect(ok("acme.substack.com").host).toBe("acme.substack.com");
  });

  it("rejects this site", () => {
    expect(code("https://www.davin.io")).toBe("self_url");
    expect(code("davin.io")).toBe("self_url");
    expect(code("preview.example-host.com", { requestHost: "preview.example-host.com:3000" })).toBe("self_url");
    expect(code("davin-portfolio-git-feat.vercel.app")).toBe("self_url");
    expect(ok("someone-else.vercel.app").host).toBe("someone-else.vercel.app");
  });

  it("rejects empty, oversized, and non-string input", () => {
    expect(code("")).toBe("invalid_url");
    expect(code("   ")).toBe("invalid_url");
    expect(code("a".repeat(3000) + ".com")).toBe("invalid_url");
    expect(code(undefined)).toBe("invalid_url");
    expect(code(42)).toBe("invalid_url");
  });

  it("enforces label and host length limits", () => {
    expect(code(`${"a".repeat(64)}.com`)).toBe("invalid_url");
    expect(code(`${Array(60).fill("abcd").join(".")}.com`)).toBe("invalid_url");
  });

  it("blocks private suffixes, and allows .test only in mock mode", () => {
    for (const host of ["printer.local", "app.localhost", "db.internal", "nas.lan", "x.home", "x.corp", "x.example", "x.invalid", "abc.onion"]) {
      expect(code(host)).toBe("blocked_host");
    }
    expect(code("acme.test")).toBe("blocked_host");
    expect(ok("acme.test", { allowTestTld: true }).host).toBe("acme.test");
  });
});

describe("host helpers", () => {
  it("checkHost is shared with redirect validation", () => {
    expect(checkHost("www.facebook.com")).toBe("platform_url");
    expect(checkHost("10.0.0.1")).toBe("blocked_host");
    expect(checkHost("acme.com")).toBeNull();
  });

  it("does not treat lookalike hosts as platforms", () => {
    expect(isPlatformHost("notlinkedin.com")).toBe(false);
    expect(isPlatformHost("googleads-partner.com")).toBe(false);
  });
});
