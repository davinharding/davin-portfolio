import { describe, expect, it } from "vitest";
import {
  capBundle,
  extractPage,
  isChallengePage,
  isParkedPage,
  selectSubpages,
  sniffMetaCharset,
  type PageContent,
} from "../extract";

const HTML = `<!doctype html><html><head>
<title> Acme Tools | Scheduling for machine shops </title>
<meta name="description" content="Scheduling software for small machine shops.">
<meta property="og:site_name" content="Acme Tools">
<meta property="og:description" content="Plan every job.">
<script>window.secret = "do not read me";</script>
<style>.x{color:red}</style>
</head><body>
<nav><a href="/about">About us</a><a href="/pricing">Pricing</a><a href="/login">Log in</a>
<a href="/careers">Careers</a><a href="/blog/post-1">Blog</a><a href="/brochure.pdf">Brochure</a>
<a href="https://other.com/products">Elsewhere</a><a href="/products">Products</a><a href="/products/">Products again</a>
<a href="mailto:hi@acme.com">Mail</a></nav>
<h1>ShopFloor Scheduler</h1>
<p>Plan   every job
   across every machine.</p>
<noscript>Enable JavaScript</noscript>
<svg><text>chart label</text></svg>
<form><input value="secret input"><button>Send</button></form>
<h2>Pricing that scales</h2><p>From $49 per month &amp; up.</p>
<template><p>hidden template</p></template>
<iframe src="https://evil.example"></iframe>
</body></html>`;

describe("extractPage", () => {
  const page = extractPage(HTML, "https://acme.com/");

  it("reads metadata", () => {
    expect(page.title).toBe("Acme Tools | Scheduling for machine shops");
    expect(page.description).toBe("Scheduling software for small machine shops.");
    expect(page.siteName).toBe("Acme Tools");
    expect(page.ogDescription).toBe("Plan every job.");
    expect(page.headings).toEqual(["ShopFloor Scheduler", "Pricing that scales"]);
  });

  it("removes scripts, styles, noscript, svg, templates, iframes, and form controls", () => {
    for (const hidden of ["do not read me", "color:red", "Enable JavaScript", "chart label", "secret input", "hidden template"]) {
      expect(page.text).not.toContain(hidden);
    }
  });

  it("collapses whitespace and decodes entities", () => {
    expect(page.text).toContain("Plan every job across every machine.");
    expect(page.text).toContain("From $49 per month & up.");
  });

  it("caps each page", () => {
    const big = `<html><body><p>${"word ".repeat(10_000)}</p></body></html>`;
    expect(extractPage(big, "https://acme.com/").text.length).toBeLessThanOrEqual(12_000);
  });

  it("handles text/plain", () => {
    const p = extractPage("  plain   text  ", "https://acme.com/", "text/plain; charset=utf-8");
    expect(p.text).toBe("plain text");
  });
});

describe("selectSubpages", () => {
  const page = extractPage(HTML, "https://acme.com/");

  it("scores useful same-host pages and skips login, careers, blog, files, and other hosts", () => {
    const picked = selectSubpages(page.links, "https://acme.com/");
    expect(picked).toEqual(
      expect.arrayContaining(["https://acme.com/about", "https://acme.com/pricing", "https://acme.com/products"])
    );
    expect(picked).toHaveLength(3);
    expect(picked.join(" ")).not.toMatch(/login|careers|blog|pdf|other\.com/);
  });

  it("puts the visitor's path first and deduplicates by path", () => {
    const picked = selectSubpages(page.links, "https://acme.com/", "/products/");
    expect(picked[0]).toBe("https://acme.com/products/");
    expect(picked.filter((u) => u.replace(/\/$/, "").endsWith("/products"))).toHaveLength(1);
  });

  it("treats www and the bare host as the same site", () => {
    const picked = selectSubpages([{ href: "https://acme.com/about", text: "About" }], "https://www.acme.com/");
    expect(picked).toEqual(["https://www.acme.com/about"]);
  });
});

describe("detection", () => {
  const make = (title: string, text: string): PageContent => ({
    url: "https://acme.com/",
    title,
    description: "",
    siteName: "",
    ogDescription: "",
    headings: [],
    text,
    links: [],
  });

  it("spots bot challenges", () => {
    expect(isChallengePage(make("Just a moment...", ""))).toBe(true);
    expect(isChallengePage(make("Attention Required! | Cloudflare", ""))).toBe(true);
    expect(isChallengePage(make("Acme", "Access denied. You do not have permission."))).toBe(true);
    expect(isChallengePage(make("Acme", "Please verify you are human"))).toBe(true);
    expect(isChallengePage(make("Acme Tools", "We sell scheduling software."))).toBe(false);
  });

  it("spots parked domains", () => {
    expect(isParkedPage(make("acme.com", "This domain is for sale. Buy this domain today."))).toBe(true);
    expect(isParkedPage(make("acme.com", "Parked free, courtesy of a registrar"))).toBe(true);
    expect(isParkedPage(make("Acme Tools", "Our park-and-ride scheduling feature"))).toBe(false);
  });
});

describe("helpers", () => {
  it("sniffs meta charsets", () => {
    expect(sniffMetaCharset('<meta charset="ISO-8859-1">')).toBe("iso-8859-1");
    expect(sniffMetaCharset('<meta http-equiv="Content-Type" content="text/html; charset=windows-1252">')).toBe(
      "windows-1252"
    );
    expect(sniffMetaCharset("<title>x</title>")).toBeNull();
  });

  it("caps the bundle with the homepage first", () => {
    const page = (n: number): PageContent => ({
      url: `https://acme.com/${n}`,
      title: "",
      description: "",
      siteName: "",
      ogDescription: "",
      headings: [],
      text: "x".repeat(12_000),
      links: [],
    });
    const bundle = capBundle([page(0), page(1), page(2), page(3)]);
    const total = bundle.reduce((n, p) => n + p.text.length, 0);
    expect(total).toBeLessThanOrEqual(30_000);
    expect(bundle[0].text.length).toBe(12_000);
  });
});
