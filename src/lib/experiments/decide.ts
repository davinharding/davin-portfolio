// The proxy's decision for one request, as a pure function so every branch is
// unit-tested without Next. src/proxy.ts applies the result.
import { sanitizeAnalyticsId } from "@/lib/analytics/config";
import {
  assignVariant,
  distinctIdFromPostHogCookie,
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
    /** The raw value of posthog-js's own cookie, if the visitor has one. */
    posthog?: string;
  };
  mode: DesignMode;
  newId: () => string;
};

export type HomeDecision =
  | { kind: "pass" }
  /** Always to `/`. `force` sets or clears the preview cookie; `internal` marks the visitor. */
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

  // The per-design routes exist only as rewrite targets.
  if (pathname === "/home" || pathname.startsWith("/home/")) {
    const text = searchParams.toString();
    return { kind: "redirect", search: text ? `?${text}` : "" };
  }
  if (pathname !== "/") return { kind: "pass" };

  // A preview link. Repeated or unknown values are ignored.
  const requested = searchParams.getAll(VARIANT_PARAM);
  if (requested.length === 1) {
    const search = searchWithoutVariant(searchParams);
    if (isDesign(requested[0])) return { kind: "redirect", search, force: requested[0], internal: true };
    if (requested[0] === VARIANT_AUTO) return { kind: "redirect", search, force: null };
  }

  const id =
    sanitizeAnalyticsId(cookies.id) ?? distinctIdFromPostHogCookie(cookies.posthog) ?? input.newId();

  if (isDesign(cookies.force)) return { kind: "rewrite", id, design: cookies.force, source: "qa" };
  if (mode !== "ab") return { kind: "rewrite", id, design: mode, source: "pin" };
  return { kind: "rewrite", id, design: await assignVariant(id), source: "ab" };
}
