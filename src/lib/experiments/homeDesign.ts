import { readCookie } from "@/lib/analytics/cookies";

export const HOME_FLAG_KEY = "home-design";

export const EXPERIMENT_ARMS = [
  { key: "open-roles", percent: 50 },
  { key: "drafting-table", percent: 50 },
] as const;

export type ExperimentArm = (typeof EXPERIMENT_ARMS)[number]["key"];

export const HOME_DESIGNS = ["open-roles", "drafting-table", "classic"] as const;
export type HomeDesign = (typeof HOME_DESIGNS)[number];

export type HomeSource = "ab" | "pin" | "qa";
export type HomeAssignment = { design: HomeDesign; source: HomeSource };

const SOURCES: readonly HomeSource[] = ["ab", "pin", "qa"];

export const HOME_COOKIES = {
  id: "dh_id",
  home: "dh_home",
  force: "dh_force",
  internal: "dh_internal",
} as const;

export const HOME_COOKIE_MAX_AGE_SEC = 31_536_000;
export const VARIANT_PARAM = "variant";
export const VARIANT_AUTO = "auto";

export function isDesign(value: unknown): value is HomeDesign {
  return typeof value === "string" && (HOME_DESIGNS as readonly string[]).includes(value);
}

export function designPath(design: HomeDesign): string {
  return `/home/${design}`;
}

const LONG_SCALE = 0xfffffffffffffff;

async function sha1Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

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

export function homeEventProps(assignment: HomeAssignment): Record<string, string> {
  return {
    home_variant: assignment.design,
    home_variant_source: assignment.source,
    ...(assignment.source === "ab" ? { [`$feature/${HOME_FLAG_KEY}`]: assignment.design } : {}),
  };
}

export type DesignMode = "ab" | HomeDesign;

export function readDesignMode(raw: string | undefined): { mode: DesignMode; invalid: boolean } {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "" || value === "ab") return { mode: "ab", invalid: false };
  if (isDesign(value)) return { mode: value, invalid: false };
  return { mode: "ab", invalid: true };
}

export function readHomeAssignment(cookieString: string | null | undefined): HomeAssignment | null {
  return parseHomeCookie(readCookie(cookieString, HOME_COOKIES.home));
}
