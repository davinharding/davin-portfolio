"use client";

import { forwardRef } from "react";
import { Check, Circle, Loader2, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StepId } from "@/lib/thirty/events";
import { cn } from "@/lib/utils";

export type ConsoleStepStatus = "pending" | "active" | "done" | "skipped" | "failed";

export type ConsoleStep = {
  id: StepId;
  label: string;
  status: ConsoleStepStatus;
  details: string[];
};

type RunConsoleProps = {
  host: string;
  steps: ConsoleStep[];
  elapsedMs: number;
  reducedMotion: boolean;
  /** Replaces the step list footer, for example "Blueprint ready". */
  statusLine?: string | null;
  onCancel?: () => void;
};

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

export const RunConsole = forwardRef<HTMLHeadingElement, RunConsoleProps>(function RunConsole(
  { host, steps, elapsedMs, reducedMotion, statusLine, onCancel },
  headingRef
) {
  const seconds = reducedMotion ? Math.floor(elapsedMs / 1000).toFixed(1) : (elapsedMs / 1000).toFixed(1);
  const slow = elapsedMs >= 30_000;

  return (
    <section
      aria-labelledby="run-console-title"
      className="w-full rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4 sm:p-5 text-left"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h2
            id="run-console-title"
            ref={headingRef}
            tabIndex={-1}
            className="text-base font-semibold text-foreground break-words"
          >
            Drafting a blueprint for {host}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {slow ? "Taking a little longer than usual." : "About 30 seconds. Reads your public site, nothing else."}
          </p>
        </div>
        <p
          className="font-mono text-lg tabular-nums text-foreground shrink-0"
          aria-label={`${Math.floor(elapsedMs / 1000)} seconds elapsed`}
        >
          {seconds}s
        </p>
      </div>

      <ol aria-live="polite" aria-relevant="additions text" className="space-y-3">
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
                <ul className="mt-1 space-y-0.5">
                  {step.details.map((d, i) => (
                    <li key={`${i}-${d}`} className="text-xs text-muted-foreground break-words">
                      {d}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex items-center justify-between gap-3 min-h-9">
        <p className="text-sm text-foreground" role="status">
          {statusLine ?? ""}
        </p>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </section>
  );
});
