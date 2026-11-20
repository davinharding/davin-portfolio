"use client";

import { Check, Circle, Loader2, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StepId } from "@/lib/thirty/events";
import { cn } from "@/lib/utils";
import type { BlueprintRun } from "./useBlueprintRun";

export type ConsoleStepStatus = "pending" | "active" | "done" | "skipped" | "failed";

export type ConsoleStep = {
  id: StepId;
  label: string;
  status: ConsoleStepStatus;
  details: string[];
  /** How far into the run the step became active, in milliseconds. */
  startedAt?: number;
};

/** After this long the run views say it is taking longer than usual. */
export const SLOW_RUN_MS = 30_000;
export const SLOW_RUN_NOTE = "Taking a little longer than usual.";
export const RUN_PROMISE = "About 30 seconds. Reads your public site, nothing else.";

const STATUS_TEXT: Record<ConsoleStepStatus, string> = {
  pending: "pending",
  active: "in progress",
  done: "done",
  skipped: "skipped",
  failed: "failed",
};

function StepIcon({ status }: { status: ConsoleStepStatus }) {
  const common = "h-4 w-4 shrink-0";
  switch (status) {
    case "done":
      return <Check className={cn(common, "text-primary")} aria-hidden="true" />;
    case "active":
      return <Loader2 className={cn(common, "text-primary animate-spin motion-reduce:animate-none")} aria-hidden="true" />;
    case "skipped":
      return <Minus className={cn(common, "text-muted-foreground")} aria-hidden="true" />;
    case "failed":
      return <X className={cn(common, "text-red-500")} aria-hidden="true" />;
    default:
      return <Circle className={cn(common, "text-muted-foreground/50")} aria-hidden="true" />;
  }
}

/** The run as a list of steps with what each one found. Takes the form's place while a run is on screen. */
export function RunConsole({ run }: { run: BlueprintRun }) {
  const { host, steps, elapsedMs, reducedMotion, statusLine, slow, cancel } = run;
  const seconds = reducedMotion ? Math.floor(elapsedMs / 1000).toFixed(1) : (elapsedMs / 1000).toFixed(1);

  return (
    <section
      aria-labelledby="run-console-title"
      className="w-full rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4 sm:p-5 text-left"
    >
      <div className="flex items-start justify-between gap-4 mb-4 compact:mb-3">
        <div className="min-w-0">
          <h2
            id="run-console-title"
            ref={run.headingRef}
            tabIndex={-1}
            className="text-base font-semibold text-foreground break-words"
          >
            Drafting a blueprint for {host}
          </h2>
          {/* Compact screens skip the reminder (the form just said it) to keep the run on one screen. */}
          <p className={cn("text-xs text-muted-foreground mt-1", !slow && "compact:hidden")}>
            {slow ? SLOW_RUN_NOTE : RUN_PROMISE}
          </p>
        </div>
        <p
          className="font-mono text-lg tabular-nums text-foreground shrink-0"
          aria-label={`${Math.floor(elapsedMs / 1000)} seconds elapsed`}
        >
          {seconds}s
        </p>
      </div>

      <ol aria-live="polite" aria-relevant="additions text" className="space-y-3 compact:space-y-2">
        {steps.map((step) => (
          <li key={step.id} className="flex gap-3">
            <span className="mt-0.5">
              <StepIcon status={step.status} />
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm break-words",
                  step.status === "pending" ? "text-muted-foreground" : "text-foreground",
                  step.status === "skipped" && "text-muted-foreground line-through decoration-muted-foreground/50"
                )}
              >
                {step.label}
                <span className="sr-only">, {STATUS_TEXT[step.status]}</span>
              </p>
              {step.details.length > 0 ? (
                <>
                  <ul className="mt-1 space-y-0.5 compact:hidden">
                    {step.details.map((d, i) => (
                      <li key={`${i}-${d}`} className="text-xs text-muted-foreground break-words">
                        {d}
                      </li>
                    ))}
                  </ul>
                  {/* Compact screens keep every detail visible on one line so the run fits one screen. */}
                  <p className="mt-0.5 hidden truncate text-xs text-muted-foreground compact:block">
                    {step.details.join(" · ")}
                  </p>
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 compact:mt-3 flex items-center justify-between gap-3 min-h-9">
        <p className="text-sm text-foreground" role="status">
          {statusLine ?? ""}
        </p>
        {cancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={cancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </section>
  );
}
