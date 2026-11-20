import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const posthogMock = {
  capture: vi.fn(),
  get_distinct_id: vi.fn(() => "browser-id"),
  get_session_id: vi.fn(() => "session-id"),
};
const vercelTrack = vi.hoisted(() => vi.fn());
vi.mock("@vercel/analytics", () => ({ track: vercelTrack }));

import { analyticsEnvironment, sanitizeAnalyticsId } from "../config";
import { captureServerEvent } from "../server";
import type { PostHog } from "posthog-js";
import { analyticsIds, setPostHog, track } from "../track";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("captureServerEvent", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key"));

  it("posts one event with the environment, session link, and geoip disabled", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const ok = await captureServerEvent(
      { event: "blueprint_run", distinctId: "browser-id", sessionId: "session-id", properties: { host: "acme.com" }, set: { last_blueprint_host: "acme.com" } },
      fetchImpl as unknown as typeof fetch
    );
    expect(ok).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://us.i.posthog.com/i/v0/e/");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      api_key: "phc_test_key",
      event: "blueprint_run",
      distinct_id: "browser-id",
      properties: {
        host: "acme.com",
        environment: "preview",
        $geoip_disable: true,
        $session_id: "session-id",
        $set: { last_blueprint_host: "acme.com" },
      },
    });
    expect(body.properties).not.toHaveProperty("$ip");
  });

  it("does nothing without a key", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const fetchImpl = vi.fn();
    expect(await captureServerEvent({ event: "x", distinctId: "d" }, fetchImpl as unknown as typeof fetch)).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("swallows network errors and non-2xx responses", async () => {
    const failing = vi.fn(async () => Promise.reject(new Error("ECONNREFUSED")));
    expect(await captureServerEvent({ event: "x", distinctId: "d" }, failing as unknown as typeof fetch)).toBe(false);
    const bad = vi.fn(async () => new Response("nope", { status: 500 }));
    expect(await captureServerEvent({ event: "x", distinctId: "d" }, bad as unknown as typeof fetch)).toBe(false);
  });

  it("gives up on a hanging endpoint at the timeout", async () => {
    const hang = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_, reject) => init.signal?.addEventListener("abort", () => reject(new Error("aborted"))))
    );
    const t0 = Date.now();
    expect(await captureServerEvent({ event: "x", distinctId: "d" }, hang as unknown as typeof fetch, 50)).toBe(false);
    expect(Date.now() - t0).toBeLessThan(1000);
  });
});

describe("client track", () => {
  it("queues events until the SDK loads, never throws, and then exposes browser ids", () => {
    vercelTrack.mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(analyticsIds()).toEqual({});
    expect(() => track("blueprint_started", { input_host: "acme.com" })).not.toThrow();
    expect(posthogMock.capture).not.toHaveBeenCalled();

    setPostHog(posthogMock as unknown as PostHog);
    expect(posthogMock.capture).toHaveBeenCalledWith("blueprint_started", { input_host: "acme.com" });
    expect(analyticsIds()).toEqual({ ph_id: "browser-id", ph_session: "session-id" });

    posthogMock.capture.mockImplementation(() => {
      throw new Error("sdk broke");
    });
    expect(() => track("blueprint_done", { cached: false })).not.toThrow();
    expect(posthogMock.capture).toHaveBeenLastCalledWith("blueprint_done", { cached: false });
  });
});

describe("config helpers", () => {
  it("accepts only id-shaped strings", () => {
    expect(sanitizeAnalyticsId("019a2b3c-4d5e-7f00-8a9b-0c1d2e3f4a5b")).toBe("019a2b3c-4d5e-7f00-8a9b-0c1d2e3f4a5b");
    expect(sanitizeAnalyticsId("<script>")).toBeUndefined();
    expect(sanitizeAnalyticsId("a".repeat(129))).toBeUndefined();
    expect(sanitizeAnalyticsId(42)).toBeUndefined();
    expect(sanitizeAnalyticsId("")).toBeUndefined();
  });

  it("maps Vercel environments and defaults to development", () => {
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(analyticsEnvironment()).toBe("production");
    vi.stubEnv("VERCEL_ENV", "");
    expect(analyticsEnvironment()).toBe("development");
  });
});
