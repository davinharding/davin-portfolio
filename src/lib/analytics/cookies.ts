// Client-safe. Reading cookies, including the one posthog-js keeps its own state in.
import { sanitizeAnalyticsId } from "./config";

/** posthog-js keeps its state, including the distinct id, in this cookie as URL-encoded JSON. */
export function posthogCookieName(projectKey: string): string {
  return `ph_${projectKey}_posthog`;
}

export function distinctIdFromPostHogCookie(raw: string | undefined): string | undefined {
  if (!raw || raw.length > 4096) return undefined;
  try {
    const state: unknown = JSON.parse(decodeURIComponent(raw));
    if (!state || typeof state !== "object") return undefined;
    return sanitizeAnalyticsId((state as Record<string, unknown>).distinct_id);
  } catch {
    return undefined;
  }
}

/** Reads one cookie from a `Cookie` header or `document.cookie` string. */
export function readCookie(cookieString: string | null | undefined, name: string): string | undefined {
  if (!cookieString) return undefined;
  for (const part of cookieString.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return undefined;
}
