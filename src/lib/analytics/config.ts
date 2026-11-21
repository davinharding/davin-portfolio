export const POSTHOG_PROXY_PATH = "/relay-dh";
export const POSTHOG_UI_HOST = "https://us.posthog.com";

export function posthogKey(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
}

export function posthogIngestHost(): string {
  return process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
}

export type AnalyticsEnvironment = "production" | "preview" | "development";

export function analyticsEnvironment(): AnalyticsEnvironment {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV;
  return env === "production" || env === "preview" ? env : "development";
}

export function sanitizeAnalyticsId(raw: unknown): string | undefined {
  return typeof raw === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(raw) ? raw : undefined;
}
