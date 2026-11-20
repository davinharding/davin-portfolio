import { describe, expect, it, vi } from "vitest";
import { fetchPage, readCapped, readSite, type FetchLike } from "../fetchSite";

const html = (body: string, title = "Acme") =>
  `<html><head><title>${title}</title></head><body>${body}</body></html>`;

function respond(body: BodyInit | null, init: ResponseInit = {}) {
  return new Response(body, {
    status: 200,
    ...init,
    headers: { "content-type": "text/html; charset=utf-8", ...(init.headers as Record<string, string>) },
  });
}

function redirect(location: string, status = 301) {
  return new Response(null, { status, headers: { location } });
}

function netError(code: string) {
  return Object.assign(new TypeError("fetch failed"), { cause: { code } });
}

/** A transport keyed by URL; unknown URLs fail like DNS misses. */
function transport(routes: Record<string, () => Response | Promise<Response>>) {
  const calls: string[] = [];
  const impl: FetchLike = async (url) => {
    calls.push(url);
    const route = routes[url];
    if (!route) throw netError("ENOTFOUND");
    return route();
  };
  return { impl, calls };
}

describe("fetchPage", () => {
  it("follows a redirect and records the final URL", async () => {
    const { impl } = transport({
      "https://acme.com/": () => redirect("https://www.acme.com/"),
      "https://www.acme.com/": () => respond(html("hello")),
    });
    const r = await fetchPage("https://acme.com/", { timeoutMs: 1000, fetchImpl: impl });
    expect(r.ok && r.finalUrl).toBe("https://www.acme.com/");
  });

  it("stops after four redirect hops", async () => {
    const routes: Record<string, () => Response> = {};
    for (let i = 0; i < 10; i++) routes[`https://acme.com/${i}`] = () => redirect(`https://acme.com/${i + 1}`);
    const { impl, calls } = transport(routes);
    const r = await fetchPage("https://acme.com/0", { timeoutMs: 1000, fetchImpl: impl });
    expect(r).toEqual({ ok: false, reason: "too_many_redirects" });
    expect(calls).toHaveLength(5);
  });

  it("refuses a redirect to a private address", async () => {
    const { impl, calls } = transport({
      "https://acme.com/": () => redirect("http://169.254.169.254/latest/meta-data"),
    });
    const r = await fetchPage("https://acme.com/", { timeoutMs: 1000, fetchImpl: impl });
    expect(r).toEqual({ ok: false, reason: "redirect_blocked" });
    expect(calls).toEqual(["https://acme.com/"]);
  });

  it("refuses redirects to other schemes and ports", async () => {
    for (const location of ["file:///etc/passwd", "https://acme.com:8443/", "https://localhost/"]) {
      const { impl } = transport({ "https://acme.com/": () => redirect(location) });
      const r = await fetchPage("https://acme.com/", { timeoutMs: 1000, fetchImpl: impl });
      expect(r).toEqual({ ok: false, reason: "redirect_blocked" });
    }
  });

  it("treats a redirect to a platform or a login page as blocked for bots", async () => {
    for (const location of ["https://www.linkedin.com/company/acme", "https://acme.com/login?next=/"]) {
      const { impl } = transport({ "https://acme.com/": () => redirect(location) });
      const r = await fetchPage("https://acme.com/", { timeoutMs: 1000, fetchImpl: impl });
      expect(r).toEqual({ ok: false, reason: "redirect_platform" });
    }
  });

  it("maps a connect-time address block", async () => {
    const impl: FetchLike = async () => {
      throw netError("ESSRF");
    };
    expect(await fetchPage("https://acme.com/", { timeoutMs: 1000, fetchImpl: impl })).toEqual({
      ok: false,
      reason: "blocked_address",
    });
  });

  it("rejects the wrong content type", async () => {
    const { impl } = transport({
      "https://acme.com/": () => respond("%PDF", { headers: { "content-type": "application/pdf" } }),
    });
    const r = await fetchPage("https://acme.com/", { timeoutMs: 1000, fetchImpl: impl });
    expect(r).toMatchObject({ ok: false, reason: "content_type" });
  });

  it("reports HTTP errors", async () => {
    const { impl } = transport({ "https://acme.com/": () => respond("nope", { status: 403 }) });
    expect(await fetchPage("https://acme.com/", { timeoutMs: 1000, fetchImpl: impl })).toEqual({
      ok: false,
      reason: "http_status",
      status: 403,
    });
  });

  it("times out", async () => {
    const impl: FetchLike = (_url, init) =>
      new Promise((_, reject) => {
        init.signal.addEventListener("abort", () => reject(init.signal.reason), { once: true });
      });
    const r = await fetchPage("https://acme.com/", { timeoutMs: 30, fetchImpl: impl });
    expect(r).toEqual({ ok: false, reason: "timeout" });
  });

  it("cuts an oversize body at the cap and cancels the stream", async () => {
    const cancel = vi.fn();
    const chunk = new TextEncoder().encode("a".repeat(400));
    const endless = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.enqueue(chunk);
      },
      cancel,
    });
    const { impl } = transport({ "https://acme.com/": () => respond(endless) });
    const r = await fetchPage("https://acme.com/", { timeoutMs: 1000, fetchImpl: impl, maxBytes: 1000 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.body.length).toBe(1000);
      expect(r.truncated).toBe(true);
    }
    expect(cancel).toHaveBeenCalled();
  });

  it("decodes with the header charset, then the meta charset", async () => {
    const latin1 = new Uint8Array([0x63, 0x61, 0x66, 0xe9]); // "café" in ISO-8859-1
    const viaHeader = transport({
      "https://acme.com/": () => respond(latin1, { headers: { "content-type": "text/html; charset=iso-8859-1" } }),
    });
    const a = await fetchPage("https://acme.com/", { timeoutMs: 1000, fetchImpl: viaHeader.impl });
    expect(a.ok && a.body).toBe("café");

    const prefix = new TextEncoder().encode('<meta charset="windows-1252">');
    const bytes = new Uint8Array([...prefix, 0x63, 0x61, 0x66, 0xe9]);
    const viaMeta = transport({
      "https://acme.com/": () => respond(bytes, { headers: { "content-type": "text/html" } }),
    });
    const b = await fetchPage("https://acme.com/", { timeoutMs: 1000, fetchImpl: viaMeta.impl });
    expect(b.ok && b.body.endsWith("café")).toBe(true);
  });

  it("sends only GET with our headers and manual redirects", async () => {
    const seen: Parameters<FetchLike>[1][] = [];
    const impl: FetchLike = async (_url, init) => {
      seen.push(init);
      return respond(html("x"));
    };
    await fetchPage("https://acme.com/", { timeoutMs: 1000, fetchImpl: impl, userAgent: "TestBot/1" });
    expect(seen[0].method).toBe("GET");
    expect(seen[0].redirect).toBe("manual");
    expect(seen[0].headers).toEqual({
      "User-Agent": "TestBot/1",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en",
    });
  });
});

describe("readCapped", () => {
  it("returns everything under the cap", async () => {
    const r = await readCapped(new Response("hello").body, 100);
    expect(new TextDecoder().decode(r.bytes)).toBe("hello");
    expect(r.truncated).toBe(false);
  });
});

const LONG = "<p>" + "Acme makes scheduling software for machine shops. ".repeat(30) + "</p>";

describe("readSite", () => {
  it("is unresolvable when neither the host nor www resolves", async () => {
    const { impl, calls } = transport({});
    expect(await readSite({ hostname: "acme.com" }, { fetchImpl: impl })).toEqual({ kind: "unresolvable" });
    expect(calls).toEqual(["https://acme.com/", "https://www.acme.com/"]);
  });

  it("falls back to www when the bare host does not resolve", async () => {
    const { impl } = transport({ "https://www.acme.com/": () => respond(html(LONG)) });
    const r = await readSite({ hostname: "acme.com" }, { fetchImpl: impl });
    expect(r).toMatchObject({ kind: "pages", finalUrl: "https://www.acme.com/", thin: false });
  });

  it("tries http once when https fails to connect", async () => {
    const { impl, calls } = transport({
      "https://acme.com/": () => {
        throw netError("ECONNREFUSED");
      },
      "http://acme.com/": () => respond(html(LONG)),
    });
    const r = await readSite({ hostname: "acme.com" }, { fetchImpl: impl });
    expect(r.kind).toBe("pages");
    expect(calls).toContain("http://acme.com/");
  });

  it("sends a bot challenge to the search fallback", async () => {
    const { impl } = transport({ "https://acme.com/": () => respond(html("checking", "Just a moment...")) });
    expect(await readSite({ hostname: "acme.com" }, { fetchImpl: impl })).toEqual({
      kind: "blocked",
      reason: "challenge",
    });
  });

  it("sends a 403 to the search fallback", async () => {
    const { impl } = transport({ "https://acme.com/": () => respond("no", { status: 403 }) });
    expect(await readSite({ hostname: "acme.com" }, { fetchImpl: impl })).toMatchObject({ kind: "blocked" });
  });

  it("reports parked domains without spending tokens", async () => {
    const { impl } = transport({ "https://acme.com/": () => respond(html("This domain is for sale!")) });
    expect((await readSite({ hostname: "acme.com" }, { fetchImpl: impl })).kind).toBe("parked");
  });

  it("marks a JS shell as thin", async () => {
    const { impl } = transport({ "https://acme.com/": () => respond(html('<div id="root"></div>')) });
    expect(await readSite({ hostname: "acme.com" }, { fetchImpl: impl })).toMatchObject({ kind: "pages", thin: true });
  });

  it("reads sub-pages and keeps going when some fail", async () => {
    const home = html(`${LONG}<a href="/about">About</a><a href="/pricing">Pricing</a><a href="/products">Products</a>`);
    const { impl } = transport({
      "https://acme.com/": () => respond(home),
      "https://acme.com/about": () => respond(html(LONG, "About Acme")),
      "https://acme.com/pricing": () => respond("err", { status: 500 }),
      "https://acme.com/products": () => respond(html(LONG, "Products")),
    });
    const r = await readSite({ hostname: "acme.com" }, { fetchImpl: impl });
    expect(r.kind).toBe("pages");
    if (r.kind === "pages") {
      expect(r.pages.map((p) => p.title)).toEqual(["Acme", "About Acme", "Products"]);
    }
  });

  it("reports a host that resolves to a private address", async () => {
    const impl: FetchLike = async () => {
      throw netError("ESSRF");
    };
    expect(await readSite({ hostname: "acme.com" }, { fetchImpl: impl })).toEqual({ kind: "private" });
  });
});

describe("guardedFetch", () => {
  // net.connect never calls `lookup` for an IP literal, so the transport
  // itself has to refuse them. No socket is opened by these calls.
  it.each(["http://127.0.0.1/", "http://169.254.169.254/latest/meta-data", "http://[::1]/", "http://8.8.8.8/"])(
    "refuses the IP literal %s without connecting",
    async (url) => {
      const page = await fetchPage(url, { timeoutMs: 1000 });
      expect(page).toEqual({ ok: false, reason: "blocked_address" });
    }
  );
});
