"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { ArrowRight, Calendar, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERRORS, errorMessage, isErrorCode, type ErrorCode, type NextStep } from "@/lib/thirty/errors";
import { STEP_ORDER, stepLabel, type RunEvent } from "@/lib/thirty/events";
import { cn } from "@/lib/utils";
import { ExampleLinks, type ExampleLinkItem } from "./ExampleLinks";
import { RunConsole, type ConsoleStep } from "./RunConsole";

type Phase = "idle" | "submitting" | "running" | "navigating" | "error";

type ClientErrorCode = ErrorCode | "lost" | "offline";

type LauncherError = { code: ClientErrorCode; message: string; retryAfterSec?: number };

const CLIENT_ERRORS: Record<"lost" | "offline", { message: string; next: readonly NextStep[] }> = {
  lost: { message: "Lost the connection. Your blueprint may still be finishing.", next: [] },
  offline: { message: "You appear to be offline.", next: ["retry"] },
};

const WATCHDOG_MS = 75_000;
const ERROR_ID = "blueprint-error";

/** Mirrors the server's first rules; the server stays the authority. */
function looksLikeWebsite(raw: string): boolean {
  const s = raw.trim();
  if (!s || s.length > 2048) return false;
  return s.split(/\s+/).some((t) => /[^.\s]\.[^.\s]/.test(t));
}

/** A display guess until the server's step labels arrive. */
function displayHost(raw: string): string {
  let s = raw.trim().split(/\s+/).find((t) => t.includes(".")) ?? raw.trim();
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").replace(/^[^@/]*@/, "");
  s = s.split(/[/?#:]/)[0] ?? s;
  return s.toLowerCase().replace(/^www\./, "").replace(/[.,;:!?)]+$/, "") || "your site";
}

function initialSteps(host: string): ConsoleStep[] {
  return STEP_ORDER.map((id) => ({ id, label: stepLabel(id, host), status: "pending", details: [] }));
}

function secondsBucket(ms: number): string {
  const s = ms / 1000;
  if (s < 15) return "<15";
  if (s < 30) return "15-30";
  if (s < 45) return "30-45";
  return "45+";
}

function safeTrack(name: string, props?: Record<string, string | boolean>) {
  try {
    track(name, props);
  } catch {
    // Analytics must never affect the flow.
  }
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

export default function BlueprintLauncher({ examples }: { examples: readonly ExampleLinkItem[] }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [url, setUrl] = useState("");
  const [host, setHost] = useState("");
  const [steps, setSteps] = useState<ConsoleStep[]>([]);
  const [error, setError] = useState<LauncherError | null>(null);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  /** Bumped whenever focus should return to the field once the form has rendered. */
  const [focusInput, setFocusInput] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
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

  // Returning through the back-forward cache shows a fresh form.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      abortRef.current?.abort();
      busyRef.current = false;
      setPhase("idle");
      setSteps([]);
      setStatusLine(null);
      setError(null);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  useEffect(() => {
    if (focusInput > 0) inputRef.current?.focus();
  }, [focusInput]);

  // Move focus to the console heading when the run starts.
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

  const showError = useCallback((err: LauncherError) => {
    if (!mountedRef.current) return;
    busyRef.current = false;
    setError(err);
    setPhase("error");
    setStatusLine(null);
    if (err.code !== "lost") safeTrack("blueprint_failed", { code: err.code });
    setFocusInput((n) => n + 1);
  }, []);

  const applyEvent = useCallback((event: RunEvent) => {
    setSteps((prev) => {
      const next = prev.map((s) => ({ ...s, details: [...s.details] }));
      const find = (id: string) => next.find((s) => s.id === id);
      const active = () => next.find((s) => s.status === "active");
      switch (event.t) {
        case "step": {
          const step = find(event.id);
          if (!step) return prev;
          step.label = event.label;
          if (event.status === "start") {
            for (const s of next) {
              if (STEP_ORDER.indexOf(s.id) < STEP_ORDER.indexOf(event.id) && s.status === "pending") {
                s.status = "done";
              }
            }
            step.status = "active";
          } else {
            step.status = event.status === "done" ? "done" : event.status === "skip" ? "skipped" : "failed";
          }
          return next;
        }
        case "page": {
          const read = find("read");
          if (read && read.details.length < 4) read.details.push(event.title);
          return next;
        }
        case "company": {
          const research = find("research");
          if (research) research.details.push(event.oneLiner ? `${event.name}: ${event.oneLiner}` : event.name);
          return next;
        }
        case "note": {
          const target = active() ?? find("research");
          if (target) target.details.push(event.text);
          return next;
        }
        case "agent": {
          const design = find("design");
          if (design && !design.details.includes(event.name)) design.details.push(event.name);
          return next;
        }
        default:
          return prev;
      }
    });
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
      safeTrack("blueprint_done", { cached, seconds: secondsBucket(Date.now() - startRef.current) });
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
      setError(null);
      setStatusLine(null);
      startRef.current = Date.now();
      setElapsedMs(0);
      setPhase("submitting");
      safeTrack("blueprint_started");

      const controller = new AbortController();
      abortRef.current = controller;
      let lostByWatchdog = false;
      const watchdog = setTimeout(() => {
        lostByWatchdog = true;
        controller.abort();
      }, WATCHDOG_MS);

      const honeypot =
        (rootRef.current?.querySelector<HTMLInputElement>('input[name="website_confirm"]')?.value ?? "");

      let response: Response;
      try {
        response = await fetch("/api/blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" },
          body: JSON.stringify({ url: rawUrl, website_confirm: honeypot }),
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
        let err: LauncherError = { code: "internal", message: errorMessage("internal") };
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
    cancelledRef.current = true;
    abortRef.current?.abort();
    busyRef.current = false;
    setPhase("idle");
    setSteps([]);
    setStatusLine(null);
    setFocusInput((n) => n + 1);
  }, []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
  const emphasizeExamples = next.includes("examples");
  const retryNote = error ? formatRetry(error.code, error.retryAfterSec) : null;

  return (
    <div ref={rootRef} className="w-full">
      {busy ? (
        <RunConsole
          ref={headingRef}
          host={host}
          steps={steps}
          elapsedMs={elapsedMs}
          reducedMotion={reducedMotion}
          statusLine={statusLine}
          onCancel={phase === "navigating" ? undefined : cancel}
        />
      ) : (
        <form
          method="post"
          action="/api/blueprint"
          onSubmit={onSubmit}
          noValidate={hydrated}
          className="w-full"
        >
          <label htmlFor="blueprint-url" className="sr-only">
            Your company&apos;s website
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={inputRef}
              id="blueprint-url"
              name="url"
              type="text"
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              maxLength={2048}
              required
              placeholder="yourcompany.com"
              autoComplete="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? ERROR_ID : "blueprint-help"}
              disabled={busy}
              className={cn(
                "h-12 w-full min-w-0 sm:flex-1 rounded-md border bg-background/80 px-4 text-base text-foreground shadow-sm",
                "placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                error ? "border-red-500/70" : "border-input"
              )}
            />
            <Button type="submit" size="lg" className="h-12 px-6 text-base" disabled={busy}>
              Draft my blueprint
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          {/* Honeypot: real visitors never see or fill this. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Confirm website
              <input type="text" name="website_confirm" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>

          {error ? (
            <div id={ERROR_ID} role="alert" className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm">
              <p className="text-foreground">{error.message}</p>
              {retryNote ? <p className="mt-1 text-muted-foreground">{retryNote}</p> : null}
              {error.code === "lost" || next.includes("retry") || next.includes("book_call") ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {error.code === "lost" ? (
                    <Button type="button" size="sm" onClick={() => void start(url)}>
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Check again
                    </Button>
                  ) : null}
                  {next.includes("retry") ? (
                    <Button type="button" size="sm" variant="outline" onClick={() => void start(url)}>
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Try again
                    </Button>
                  ) : null}
                  {next.includes("book_call") ? (
                    <Button asChild size="sm" variant={next.includes("retry") ? "ghost" : "default"}>
                      <Link href="/call" onClick={() => safeTrack("blueprint_cta_call", { from: "error" })}>
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        Book a call
                      </Link>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <p id="blueprint-help" className="mt-3 text-sm text-muted-foreground">
            About 30 seconds. Reads your public site, nothing else.
          </p>
        </form>
      )}

      {!busy ? (
        <ExampleLinks
          examples={examples}
          emphasized={emphasizeExamples}
          lead={emphasizeExamples ? "These show the same thing:" : undefined}
          className="mt-6"
        />
      ) : null}
    </div>
  );
}
