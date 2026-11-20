// Runs before every page is served. On `/` it picks the visitor's design and
// rewrites to its prerendered page, so there is no flash and nothing renders per
// request. On any other page it only gives a new visitor their id, so posthog-js
// starts from the same id the homepage will hash.
// Spec: docs/specs/home-design-experiment.md.
import { NextResponse, type NextRequest } from "next/server";
import { posthogKey } from "@/lib/analytics/config";
import { decideHome } from "@/lib/experiments/decide";
import {
  designPath,
  formatHomeCookie,
  HOME_COOKIE_MAX_AGE_SEC,
  HOME_COOKIES,
  posthogCookieName,
  readDesignMode,
} from "@/lib/experiments/homeDesign";
import { isMockMode } from "@/lib/thirty/config";

// Page routes only: not the API, Next's own files, the PostHog relay, generated
// images, or anything with a file extension. Every /home/* path is matched too,
// dotted or not, so crafted ones are still sent back to `/`.
export const config = {
  matcher: ["/((?!api/|_next/|relay-dh|.*opengraph-image|.*twitter-image|.*\\.[^/]*$).*)", "/home/:path*"],
};

let warnedAboutMode = false;

function designMode() {
  const { mode, invalid } = readDesignMode(process.env.HOME_DESIGN);
  if (invalid && !warnedAboutMode) {
    warnedAboutMode = true;
    console.warn(`[home-design] HOME_DESIGN="${process.env.HOME_DESIGN}" is not a design. Running the split.`);
  }
  return mode;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  try {
    // Fault injection for verification. Mock mode never runs in production.
    if (process.env.HOME_PROXY_FAULT === "1" && isMockMode()) throw new Error("Injected proxy fault");

    const { nextUrl, cookies } = request;
    const decision = await decideHome({
      pathname: nextUrl.pathname,
      searchParams: nextUrl.searchParams,
      cookies: {
        id: cookies.get(HOME_COOKIES.id)?.value,
        force: cookies.get(HOME_COOKIES.force)?.value,
        posthog: cookies.get(posthogCookieName(posthogKey()))?.value,
      },
      mode: designMode(),
      newId: () => crypto.randomUUID(),
    });
    const cookie = { path: "/", sameSite: "lax" as const, secure: nextUrl.protocol === "https:" };
    const lasting = { ...cookie, maxAge: HOME_COOKIE_MAX_AGE_SEC };

    if (decision.kind === "pass") {
      const response = NextResponse.next();
      if (decision.setId) {
        response.cookies.set(HOME_COOKIES.id, decision.setId, lasting);
        // A response that sets a visitor's id must never be served to someone else.
        response.headers.set("Cache-Control", "private, no-cache");
      }
      return response;
    }

    if (decision.kind === "redirect") {
      // The target is always this site's root, so a crafted path or query cannot redirect elsewhere.
      const response = NextResponse.redirect(new URL(`/${decision.search}`, request.url), 307);
      if (decision.force) response.cookies.set(HOME_COOKIES.force, decision.force, cookie);
      if (decision.force === null) response.cookies.delete(HOME_COOKIES.force);
      if (decision.internal) response.cookies.set(HOME_COOKIES.internal, "1", lasting);
      return response;
    }

    const target = nextUrl.clone();
    target.pathname = designPath(decision.design);
    const assignment = formatHomeCookie(decision);
    const response = NextResponse.rewrite(target);
    response.cookies.set(HOME_COOKIES.id, decision.id, lasting);
    response.cookies.set(HOME_COOKIES.home, assignment, lasting);
    response.headers.set("x-home-design", assignment);
    // This response is one visitor's: it sets their id and depends on their cookies.
    // The prerendered page behind it says it can be cached for a year; a shared cache must not.
    response.headers.set("Cache-Control", "private, no-cache");
    return response;
  } catch (err) {
    // The homepage must load regardless: `/` itself renders the classic design.
    console.error("[home-design] proxy failed", err);
    return NextResponse.next();
  }
}
