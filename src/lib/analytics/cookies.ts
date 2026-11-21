import { sanitizeAnalyticsId } from "./config";

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

export function readCookie(cookieString: string | null | undefined, name: string): string | undefined {
  if (!cookieString) return undefined;
  for (const part of cookieString.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return undefined;
}
