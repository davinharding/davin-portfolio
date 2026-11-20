// Server-only. Sends one event to PostHog's capture endpoint. Never throws and
// gives up after 2 seconds, so a slow or failing PostHog cannot hold up a run.
import { analyticsEnvironment, posthogIngestHost, posthogKey } from "./config";

export type ServerEvent = {
  event: string;
  distinctId: string;
  /** The browser's PostHog session id, which links the event to its replay. */
  sessionId?: string;
  properties?: Record<string, unknown>;
  set?: Record<string, unknown>;
  setOnce?: Record<string, unknown>;
};

export type ReportEvent = (event: ServerEvent) => Promise<boolean>;

const TIMEOUT_MS = 2_000;

export async function captureServerEvent(
  e: ServerEvent,
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = TIMEOUT_MS
): Promise<boolean> {
  const apiKey = posthogKey();
  if (!apiKey) return false;
  try {
    const res = await fetchImpl(`${posthogIngestHost()}/i/v0/e/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event: e.event,
        distinct_id: e.distinctId,
        timestamp: new Date().toISOString(),
        properties: {
          ...e.properties,
          environment: analyticsEnvironment(),
          $lib: "davin-server",
          // The request comes from Vercel, so its IP would place every visitor in a data center.
          $geoip_disable: true,
          ...(e.sessionId ? { $session_id: e.sessionId } : {}),
          ...(e.set ? { $set: e.set } : {}),
          ...(e.setOnce ? { $set_once: e.setOnce } : {}),
        },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    return res.ok;
  } catch {
    return false;
  }
}
