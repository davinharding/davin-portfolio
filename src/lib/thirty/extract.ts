// Server-only. HTML to readable text, metadata, and sub-page selection.
import { parse, type HTMLElement } from "node-html-parser";
import { LIMITS } from "./config";

export type PageContent = {
  url: string;
  title: string;
  description: string;
  siteName: string;
  ogDescription: string;
  headings: string[];
  text: string;
  links: Array<{ href: string; text: string }>;
};

const STRIP_SELECTOR =
  "script, style, noscript, svg, template, iframe, form, input, select, textarea, button, option, object, embed, canvas";

function collapse(s: string): string {
  return s
    .replace(/[ \t\f\v ]+/g, " ")
    .replace(/ *\n[\s]*/g, "\n")
    .trim();
}

function attr(root: HTMLElement, selector: string, name = "content"): string {
  return collapse(root.querySelector(selector)?.getAttribute(name) ?? "");
}

export function capText(s: string, cap: number): string {
  if (s.length <= cap) return s;
  const cut = s.slice(0, cap);
  const lastBreak = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(". "));
  return (lastBreak > cap * 0.8 ? cut.slice(0, lastBreak + 1) : cut).trim();
}

export function extractPage(body: string, url: string, contentType = "text/html"): PageContent {
  if (contentType.startsWith("text/plain")) {
    return {
      url,
      title: "",
      description: "",
      siteName: "",
      ogDescription: "",
      headings: [],
      text: capText(collapse(body), LIMITS.pageCharCap),
      links: [],
    };
  }
  const root = parse(body, { comment: false });
  const title = collapse(root.querySelector("title")?.text ?? "");
  const description = attr(root, 'meta[name="description"]');
  const siteName = attr(root, 'meta[property="og:site_name"]');
  const ogDescription = attr(root, 'meta[property="og:description"]');

  const links: PageContent["links"] = [];
  for (const a of root.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href");
    if (href) links.push({ href, text: collapse(a.text).slice(0, 120) });
  }

  const bodyEl = root.querySelector("body") ?? root;
  for (const el of bodyEl.querySelectorAll(STRIP_SELECTOR)) el.remove();
  const headings = bodyEl
    .querySelectorAll("h1, h2, h3")
    .map((h) => collapse(h.text))
    .filter(Boolean)
    .slice(0, 40);
  const text = capText(collapse(bodyEl.structuredText), LIMITS.pageCharCap);

  return { url, title, description, siteName, ogDescription, headings, text, links };
}

/** Text that would actually help the research step. */
export function usableChars(page: PageContent): number {
  return page.text.length + page.description.length + page.ogDescription.length;
}

const CHALLENGE_PATTERNS = [
  /just a moment/i,
  /attention required/i,
  /access denied/i,
  /verify you are (a )?human/i,
  /checking your browser/i,
  /enable javascript and cookies/i,
  /are you a robot/i,
  /request unsuccessful\. incapsula/i,
];

const PARKED_PATTERNS = [
  /domain (name )?is for sale/i,
  /buy this domain/i,
  /this domain (may be|is) for sale/i,
  /\bparked (free|domain|by)\b/i,
  /domain parking/i,
  /parkingcrew|sedoparking|bodis\.com/i,
];

export function isChallengePage(page: PageContent): boolean {
  const head = `${page.title}\n${page.text.slice(0, 2000)}`;
  return CHALLENGE_PATTERNS.some((re) => re.test(head));
}

export function isParkedPage(page: PageContent): boolean {
  const head = `${page.title}\n${page.description}\n${page.text.slice(0, 3000)}`;
  return PARKED_PATTERNS.some((re) => re.test(head));
}

const LINK_KEYWORDS: Array<[RegExp, number]> = [
  [/about|company|who-we-are|our-story/, 5],
  [/products?|platform|solutions?|services?|features?|shop|menu|collections?/, 4],
  [/pricing|plans/, 4],
  [/customers?|case-stud|industries|use-cases?/, 3],
  [/how-it-works|how-we-work|locations?/, 3],
];

const EXCLUDE =
  /login|log-in|signin|sign-in|signup|sign-up|register|account|cart|checkout|basket|careers?|jobs|legal|privacy|terms|cookie|policy|gdpr|press|status|support\/|help\/|cdn-cgi|wp-admin|wp-login|feed|rss/;

function scoreLink(path: string, text: string): number {
  const p = path.toLowerCase();
  const t = text.toLowerCase();
  let score = 0;
  for (const [re, weight] of LINK_KEYWORDS) {
    if (re.test(p)) score += weight;
    if (re.test(t.replace(/\s+/g, "-"))) score += weight / 2;
  }
  // Prefer shallow paths: /about over /about/team/leadership/board.
  score -= Math.max(0, p.split("/").filter(Boolean).length - 1);
  return score;
}

/**
 * Picks up to `max` same-host pages worth reading, best first. `extraPath`
 * (from the visitor's input) always comes first.
 */
export function selectSubpages(
  links: PageContent["links"],
  pageUrl: string,
  extraPath?: string,
  max = LIMITS.maxPages - 1
): string[] {
  const base = new URL(pageUrl);
  const bareHost = base.hostname.replace(/^www\./, "");
  const seen = new Set<string>([base.pathname.replace(/\/+$/, "") || "/"]);
  const picked: string[] = [];

  if (extraPath) {
    const u = new URL(extraPath, base);
    const key = u.pathname.replace(/\/+$/, "") || "/";
    if (!seen.has(key)) {
      seen.add(key);
      picked.push(`${base.origin}${u.pathname}`);
    }
  }

  const candidates: Array<{ url: string; score: number }> = [];
  for (const link of links) {
    let u: URL;
    try {
      u = new URL(link.href, base);
    } catch {
      continue;
    }
    if (u.protocol !== "https:" && u.protocol !== "http:") continue;
    if (u.hostname.replace(/^www\./, "") !== bareHost) continue;
    const path = u.pathname.replace(/\/+$/, "") || "/";
    if (seen.has(path)) continue;
    const ext = /\.([a-z0-9]{1,5})$/i.exec(path)?.[1]?.toLowerCase();
    if (ext && ext !== "html" && ext !== "htm") continue;
    if (EXCLUDE.test(path.toLowerCase())) continue;
    // Blog indexes and posts rarely describe the business.
    if (/^\/(blog|news|articles|posts)(\/|$)/i.test(path)) continue;
    const score = scoreLink(path, link.text);
    if (score <= 0) continue;
    seen.add(path);
    candidates.push({ url: `${base.origin}${u.pathname}`, score });
  }
  candidates.sort((a, b) => b.score - a.score);
  for (const c of candidates) {
    if (picked.length >= max) break;
    picked.push(c.url);
  }
  return picked.slice(0, max);
}

/** Caps the whole bundle, homepage first, so later pages are trimmed before earlier ones. */
export function capBundle(pages: PageContent[], cap = LIMITS.bundleCharCap): PageContent[] {
  let remaining = cap;
  const out: PageContent[] = [];
  for (const page of pages) {
    if (remaining <= 200) break;
    const text = capText(page.text, remaining);
    remaining -= text.length;
    out.push({ ...page, text });
  }
  return out;
}

/** Sniffs a charset from `<meta charset>` or an http-equiv content type in the first 2 KB. */
export function sniffMetaCharset(head: string): string | null {
  const m =
    /<meta[^>]+charset\s*=\s*["']?\s*([a-z0-9_.:-]+)/i.exec(head) ??
    /<meta[^>]+content\s*=\s*["'][^"']*charset=([a-z0-9_.:-]+)/i.exec(head);
  return m ? m[1].toLowerCase() : null;
}
