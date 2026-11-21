import { sanitizeAnalyticsId } from "@/lib/analytics/config";
import { distinctIdFromPostHogCookie } from "@/lib/analytics/cookies";
import {
  assignVariant,
  isDesign,
  VARIANT_AUTO,
  VARIANT_PARAM,
  type DesignMode,
  type HomeAssignment,
  type HomeDesign,
} from "./homeDesign";

export type HomeDecisionInput = {
  pathname: string;
  searchParams: URLSearchParams;
  cookies: {
    id?: string;
    force?: string;
    posthog?: string;
  };
  mode: DesignMode;
  newId: () => string;
};

export type HomeDecision =
  | { kind: "pass"; setId?: string }
  | { kind: "redirect"; search: string; force?: HomeDesign | null; internal?: boolean }
  | ({ kind: "rewrite"; id: string } & HomeAssignment);

function searchWithoutVariant(params: URLSearchParams): string {
  const rest = new URLSearchParams(params);
  rest.delete(VARIANT_PARAM);
  const text = rest.toString();
  return text ? `?${text}` : "";
}

export async function decideHome(input: HomeDecisionInput): Promise<HomeDecision> {
  const { pathname, searchParams, cookies, mode } = input;

  if (pathname === "/home" || pathname.startsWith("/home/")) {
    const text = searchParams.toString();
    return { kind: "redirect", search: text ? `?${text}` : "" };
  }
  const known = sanitizeAnalyticsId(cookies.id);
  const visitorId = () => known ?? distinctIdFromPostHogCookie(cookies.posthog) ?? input.newId();

  if (pathname !== "/") return known ? { kind: "pass" } : { kind: "pass", setId: visitorId() };

  const requested = searchParams.getAll(VARIANT_PARAM);
  if (requested.length === 1) {
    const search = searchWithoutVariant(searchParams);
    if (isDesign(requested[0])) return { kind: "redirect", search, force: requested[0], internal: true };
    if (requested[0] === VARIANT_AUTO) return { kind: "redirect", search, force: null };
  }

  const id = visitorId();

  if (isDesign(cookies.force)) return { kind: "rewrite", id, design: cookies.force, source: "qa" };
  if (mode !== "ab") return { kind: "rewrite", id, design: mode, source: "pin" };
  return { kind: "rewrite", id, design: await assignVariant(id), source: "ab" };
}
