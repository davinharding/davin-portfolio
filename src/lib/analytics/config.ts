// Client-safe analytics settings. The PostHog project key is a public token:
// it can only send events, never read them.

/** Same-origin path that next.config.js rewrites to PostHog, so blockers keep the events. */
export const POSTHOG_PROXY_PATH = "/relay-dh";
export const POSTHOG_UI_HOST = "https://us.posthog.com";

/** Read at call time so tests can change it; Next inlines it in client bundles. */
export function posthogKey(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
}

/** Server events go straight here. POSTHOG_HOST (server-only, read at runtime) overrides the build-time value. */
export function posthogIngestHost(): string {
  return process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
}

export type AnalyticsEnvironment = "production" | "preview" | "development";

/** Tags every event so preview and local traffic filter out of production numbers. */
export function analyticsEnvironment(): AnalyticsEnvironment {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV;
  return env === "production" || env === "preview" ? env : "development";
}

/** PostHog distinct and session ids are UUID-like; anything else is ignored. */
export function sanitizeAnalyticsId(raw: unknown): string | undefined {
  return typeof raw === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(raw) ? raw : undefined;
}
