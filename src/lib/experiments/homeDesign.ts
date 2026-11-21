// Client-safe. The homepage design experiment: its keys, cookies, and assignment.
//
// The site decides which design a visitor gets and PostHog measures the result.
// assignVariant() is PostHog's own multivariate hash, run on the same visitor id
// posthog-js is bootstrapped with, so PostHog's evaluation of the flag agrees with
// what was served without the page ever calling PostHog.
import { readCookie } from "@/lib/analytics/cookies";

export const HOME_FLAG_KEY = "home-design";

/**
 * The experiment's arms. Order and split must match the flag in PostHog, because
 * the hash walks them cumulatively. Never change one side without the other.
 */
export const EXPERIMENT_ARMS = [
  { key: "open-roles", percent: 50 },
  { key: "drafting-table", percent: 50 },
] as const;

export type ExperimentArm = (typeof EXPERIMENT_ARMS)[number]["key"];

/** Every design the homepage can render. `classic` is the fallback and is not in the experiment. */
export const HOME_DESIGNS = ["open-roles", "drafting-table", "classic"] as const;
export type HomeDesign = (typeof HOME_DESIGNS)[number];

/** Why a visitor got their design: the split, a pinned `HOME_DESIGN`, or a `?variant=` preview. */
export type HomeSource = "ab" | "pin" | "qa";
export type HomeAssignment = { design: HomeDesign; source: HomeSource };

const SOURCES: readonly HomeSource[] = ["ab", "pin", "qa"];

export const HOME_COOKIES = {
  /** Visitor id. posthog-js is bootstrapped with it. */
  id: "dh_id",
  /** `<design>.<source>` for the design last served. */
  home: "dh_home",
  /** A design forced by `?variant=`, for the browser session. */
  force: "dh_force",
  /** Set once a visitor has used `?variant=`; they are excluded from results. */
  internal: "dh_internal",
} as const;

export const HOME_COOKIE_MAX_AGE_SEC = 31_536_000;
export const VARIANT_PARAM = "variant";
/** `?variant=auto` drops a forced design and returns to the split. */
export const VARIANT_AUTO = "auto";

export function isDesign(value: unknown): value is HomeDesign {
  return typeof value === "string" && (HOME_DESIGNS as readonly string[]).includes(value);
}

/** The internal route a design is prerendered at. Reached only through the proxy's rewrite. */
export function designPath(design: HomeDesign): string {
  return `/home/${design}`;
}

// PostHog divides the first 15 hex digits of the hash by this to get a number in [0, 1).
const LONG_SCALE = 0xfffffffffffffff;

async function sha1Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * PostHog's multivariate hash (posthog-js, packages/core/src/featureFlagLocalEvaluation.ts):
 * sha1("<flag>.<id>variant"), scaled to [0, 1), then matched against the arms' cumulative split.
 */
export async function assignVariant(id: string, flagKey: string = HOME_FLAG_KEY): Promise<ExperimentArm> {
  const hex = await sha1Hex(`${flagKey}.${id}variant`);
  const value = parseInt(hex.slice(0, 15), 16) / LONG_SCALE;
  let upper = 0;
  for (const arm of EXPERIMENT_ARMS) {
    upper += arm.percent / 100;
    if (value < upper) return arm.key;
  }
  return EXPERIMENT_ARMS[EXPERIMENT_ARMS.length - 1].key;
}

export function formatHomeCookie(assignment: HomeAssignment): string {
  return `${assignment.design}.${assignment.source}`;
}

export function parseHomeCookie(raw: unknown): HomeAssignment | null {
  if (typeof raw !== "string" || raw.length > 64) return null;
  const [design, source, ...rest] = raw.split(".");
  if (rest.length > 0 || !isDesign(design)) return null;
  if (!(SOURCES as readonly string[]).includes(source)) return null;
  return { design, source: source as HomeSource };
}

/** Properties that tie an event to the design its visitor saw. Shared by client and server events. */
export function homeEventProps(assignment: HomeAssignment): Record<string, string> {
  return {
    home_variant: assignment.design,
    home_variant_source: assignment.source,
    // PostHog reads the variant of an exposure from this property. Only the split counts.
    ...(assignment.source === "ab" ? { [`$feature/${HOME_FLAG_KEY}`]: assignment.design } : {}),
  };
}

export type DesignMode = "ab" | HomeDesign;

/** `HOME_DESIGN`: unset or "ab" runs the split, a design key serves it to everyone. */
export function readDesignMode(raw: string | undefined): { mode: DesignMode; invalid: boolean } {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "" || value === "ab") return { mode: "ab", invalid: false };
  if (isDesign(value)) return { mode: value, invalid: false };
  return { mode: "ab", invalid: true };
}

export function readHomeAssignment(cookieString: string | null | undefined): HomeAssignment | null {
  return parseHomeCookie(readCookie(cookieString, HOME_COOKIES.home));
}
