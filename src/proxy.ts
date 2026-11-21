import { NextResponse, type NextRequest } from "next/server";
import { posthogKey } from "@/lib/analytics/config";
import { posthogCookieName } from "@/lib/analytics/cookies";
import { decideHome } from "@/lib/experiments/decide";
import {
  designPath,
  formatHomeCookie,
  HOME_COOKIE_MAX_AGE_SEC,
  HOME_COOKIES,
  readDesignMode,
} from "@/lib/experiments/homeDesign";
import { isMockMode } from "@/lib/thirty/config";

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
        response.headers.set("Cache-Control", "private, no-cache");
      }
      return response;
    }

    if (decision.kind === "redirect") {
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
    response.headers.set("Cache-Control", "private, no-cache");
    return response;
  } catch (err) {
    console.error("[home-design] proxy failed", err);
    return NextResponse.next();
  }
}
