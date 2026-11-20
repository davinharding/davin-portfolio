"use client";

// The run behind every homepage design: the field's value, the request and its
// event stream, errors, cancel, focus, and the timer. Designs differ only in how
// they draw this state.
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ERRORS, errorMessage, isErrorCode, type ErrorCode, type NextStep } from "@/lib/thirty/errors";
import type { RunEvent, StepId } from "@/lib/thirty/events";
import { analyticsIds, track } from "@/lib/analytics/track";
import { abandonRun } from "./runControl";
import {
  agentSlots,
  applyRunEvent,
  displayHost,
  initialSteps,
  looksLikeWebsite,
  SLOW_RUN_MS,
  type ConsoleStep,
} from "./runModel";

export type RunPhase = "idle" | "submitting" | "running" | "navigating" | "error";

type ClientErrorCode = ErrorCode | "lost" | "offline";

export type RunError = { code: ClientErrorCode; message: string; retryAfterSec?: number };

const CLIENT_ERRORS: Record<"lost" | "offline", { message: string; next: readonly NextStep[] }> = {
  lost: { message: "Lost the connection. Your blueprint may still be finishing.", next: [] },
  offline: { message: "You appear to be offline.", next: ["retry"] },
};

const WATCHDOG_MS = 75_000;

function secondsBucket(ms: number): string {
  const s = ms / 1000;
  if (s < 15) return "<15";
  if (s < 30) return "15-30";
  if (s < 45) return "30-45";
  return "45+";
}

function formatRetry(code: ClientErrorCode, seconds?: number): string | null {
  if (!seconds) return null;
  if (code === "too_fast") return `Try again in ${seconds} second${seconds === 1 ? "" : "s"}.`;
  if (code === "rate_limited") {
    const h = Math.floor(seconds / 3600);
    const m = Math.max(1, Math.round((seconds % 3600) / 60));
    return h > 0 ? `That is in about ${h} h ${m} min.` : `That is in about ${m} min.`;
  }
  return null;
}

export function useBlueprintRun() {
  const router = useRouter();
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [url, setUrl] = useState("");
  const [host, setHost] = useState("");
  const [steps, setSteps] = useState<ConsoleStep[]>([]);
  const [company, setCompany] = useState<{ name: string; oneLiner: string } | null>(null);
  const [error, setError] = useState<RunError | null>(null);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  /** Bumped whenever focus should return to the field once the form has rendered. */
  const [focusInput, setFocusInput] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  /** Any element inside the page's `data-thirty-stage` section. */
  const rootRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const startRef = useRef(0);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHydrated(true);
    mountedRef.current = true;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => {
      mountedRef.current = false;
      mq.removeEventListener("change", onChange);
      abortRef.current?.abort();
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  // Focus the field once the splash is gone, on fine pointers only, without scrolling.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const root = document.documentElement;
    const focus = () => {
      if (document.activeElement === document.body || document.activeElement === null) {
        inputRef.current?.focus({ preventScroll: true });
      }
    };
    const splashSkipped =
      root.classList.contains("loader-done") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (splashSkipped) {
      focus();
      return;
    }
    const observer = new MutationObserver(() => {
      if (root.classList.contains("loader-done")) {
        observer.disconnect();
        focus();
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    const fallback = setTimeout(() => {
      observer.disconnect();
      focus();
    }, 5000);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  /** Stops any run in flight and shows the form again. */
  const resetToIdle = useCallback(() => {
    abandonRun({ abort: abortRef, cancelled: cancelledRef, busy: busyRef });
    setPhase("idle");
    setSteps([]);
    setCompany(null);
    setStatusLine(null);
  }, []);

  // Returning through the back-forward cache shows a fresh form.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      resetToIdle();
      setError(null);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [resetToIdle]);

  useEffect(() => {
    if (focusInput > 0) inputRef.current?.focus();
  }, [focusInput]);

  // Move focus to the run view's heading when the run starts.
  useEffect(() => {
    if (phase === "submitting") headingRef.current?.focus({ preventScroll: true });
  }, [phase]);

  // Timer: real elapsed time, ticking once a second under reduced motion.
  useEffect(() => {
    if (phase !== "running" && phase !== "submitting") return;
    const tick = () => setElapsedMs(Date.now() - startRef.current);
    tick();
    const id = setInterval(tick, reducedMotion ? 1000 : 100);
    return () => clearInterval(id);
  }, [phase, reducedMotion]);

  // The page background reacts to the active step through a data attribute.
  useEffect(() => {
    const stage = rootRef.current?.closest<HTMLElement>("[data-thirty-stage]");
    if (!stage) return;
    const active = steps.find((s) => s.status === "active")?.id;
    const value =
      phase === "navigating" ? "done" : phase === "running" || phase === "submitting" ? active ?? "validate" : "idle";
    stage.dataset.step = value;
  }, [steps, phase]);

  const showError = useCallback((err: RunError) => {
    if (!mountedRef.current) return;
    busyRef.current = false;
    setError(err);
    setPhase("error");
    setStatusLine(null);
    if (err.code !== "lost") track("blueprint_failed", { code: err.code });
    setFocusInput((n) => n + 1);
  }, []);

  const applyEvent = useCallback((event: RunEvent) => {
    if (event.t === "company") setCompany({ name: event.name, oneLiner: event.oneLiner });
    setSteps((prev) => applyRunEvent(prev, event, () => Date.now() - startRef.current));
  }, []);

  const finish = useCallback(
    (slug: string, cached: boolean) => {
      if (!mountedRef.current) return;
      setPhase("navigating");
      setStatusLine(cached ? "Already drafted that one. Opening it." : "Blueprint ready.");
      if (!cached) {
        setSteps((prev) =>
          prev.map((s) => (s.status === "active" || s.status === "pending" ? { ...s, status: "done" } : s))
        );
      }
      track("blueprint_done", { cached, slug, seconds: secondsBucket(Date.now() - startRef.current) });
      navTimerRef.current = setTimeout(() => router.push(`/b/${slug}`), cached ? 500 : 700);
    },
    [router]
  );

  const start = useCallback(
    async (rawUrl: string) => {
      if (busyRef.current) return;
      if (!looksLikeWebsite(rawUrl)) {
        showError({ code: "invalid_url", message: errorMessage("invalid_url") });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        showError({ code: "offline", message: CLIENT_ERRORS.offline.message });
        return;
      }
      busyRef.current = true;
      cancelledRef.current = false;
      const guess = displayHost(rawUrl);
      setHost(guess);
      setSteps(initialSteps(guess));
      setCompany(null);
      setError(null);
      setStatusLine(null);
      startRef.current = Date.now();
      setElapsedMs(0);
      setPhase("submitting");
      track("blueprint_started", { input_host: guess });

      const controller = new AbortController();
      abortRef.current = controller;
      let lostByWatchdog = false;
      const watchdog = setTimeout(() => {
        lostByWatchdog = true;
        controller.abort();
      }, WATCHDOG_MS);

      let response: Response;
      try {
        response = await fetch("/api/blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" },
          body: JSON.stringify({ url: rawUrl, website_confirm: honeypotRef.current?.value ?? "", ...analyticsIds() }),
          signal: controller.signal,
        });
      } catch {
        clearTimeout(watchdog);
        if (cancelledRef.current || !mountedRef.current) return;
        showError(
          lostByWatchdog
            ? { code: "lost", message: CLIENT_ERRORS.lost.message }
            : { code: "offline", message: CLIENT_ERRORS.offline.message }
        );
        return;
      }

      const type = response.headers.get("content-type") ?? "";
      if (!response.ok || !type.includes("ndjson") || !response.body) {
        clearTimeout(watchdog);
        let err: RunError = { code: "internal", message: errorMessage("internal") };
        try {
          const data = (await response.json()) as {
            error?: { code?: unknown; message?: unknown; retryAfterSec?: unknown };
          };
          const code = data.error?.code;
          if (isErrorCode(code)) {
            err = {
              code,
              message: typeof data.error?.message === "string" ? data.error.message : errorMessage(code),
              retryAfterSec:
                typeof data.error?.retryAfterSec === "number" ? data.error.retryAfterSec : undefined,
            };
          }
        } catch {
          // A platform error page, not our JSON: keep the generic message.
        }
        if (!cancelledRef.current) showError(err);
        return;
      }

      if (!mountedRef.current) return;
      setPhase("running");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let terminal: RunEvent | null = null;
      let cached = false;
      try {
        while (!terminal) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let newline: number;
          while ((newline = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);
            if (!line) continue;
            let event: RunEvent;
            try {
              event = JSON.parse(line) as RunEvent;
            } catch {
              continue;
            }
            if (!event || typeof event !== "object" || !("t" in event)) continue;
            if (!mountedRef.current || cancelledRef.current) return;
            if (event.t === "cached") cached = true;
            if (event.t === "done" || event.t === "error") {
              terminal = event;
              break;
            }
            applyEvent(event);
          }
        }
      } catch {
        // Falls through to the lost-connection state below.
      } finally {
        clearTimeout(watchdog);
        reader.cancel().catch(() => undefined);
      }

      if (cancelledRef.current || !mountedRef.current) return;
      const end = terminal as RunEvent | null;
      if (end?.t === "done") {
        finish(end.slug, cached);
      } else if (end?.t === "error") {
        setSteps((prev) => prev.map((s) => (s.status === "active" ? { ...s, status: "failed" } : s)));
        showError({ code: end.code, message: end.message, retryAfterSec: end.retryAfterSec });
      } else {
        showError({ code: "lost", message: CLIENT_ERRORS.lost.message });
      }
    },
    [applyEvent, finish, showError]
  );

  const cancel = useCallback(() => {
    resetToIdle();
    setFocusInput((n) => n + 1);
  }, [resetToIdle]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phase !== "idle" && phase !== "error") return;
    void start(url);
  };

  const busy = phase === "submitting" || phase === "running" || phase === "navigating";
  const next: readonly NextStep[] = error
    ? error.code === "lost" || error.code === "offline"
      ? CLIENT_ERRORS[error.code].next
      : ERRORS[error.code].next
    : [];
  const stepOf = (id: StepId) => steps.find((s) => s.id === id);
  const design = stepOf("design");
  const activeStep = steps.find((s) => s.status === "active")?.id ?? null;
  const agents = design?.details ?? [];
  const teamComplete = design ? design.status !== "pending" && design.status !== "active" : false;

  return {
    phase,
    busy,
    url,
    setUrl,
    /** The host being drafted, as the server last named it. */
    host,
    steps,
    activeStep,
    /** Agent names in the order they were drafted. */
    agents,
    /** True once the design step has finished, so no more agents will arrive. */
    teamComplete,
    /** The agent slots the homepage designs draw. */
    slots: agentSlots(agents, { busy, designing: activeStep === "design", teamComplete }),
    /** The field's value as a host, once it looks like a website. */
    typedHost: looksLikeWebsite(url) ? displayHost(url) : null,
    company,
    error,
    /** What the UI should offer after the current error. */
    next,
    /** The last error points the visitor at the example blueprints. */
    offersExamples: next.includes("examples"),
    retryNote: error ? formatRetry(error.code, error.retryAfterSec) : null,
    statusLine,
    elapsedMs,
    slow: elapsedMs >= SLOW_RUN_MS,
    reducedMotion,
    hydrated,
    inputRef,
    headingRef,
    rootRef,
    honeypotRef,
    onSubmit,
    /** Starts a run for the field's current value. */
    retry: () => void start(url),
    /** Undefined once the run can no longer be cancelled. */
    cancel: phase === "navigating" ? undefined : cancel,
  };
}

export type BlueprintRun = ReturnType<typeof useBlueprintRun>;
