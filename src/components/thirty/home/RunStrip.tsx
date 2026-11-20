"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SLOW_RUN_NOTE } from "../RunConsole";
import type { BlueprintRun } from "../useBlueprintRun";
import { EXPECTED_STEP_MS, SHORT_STEP_LABEL, stepFill } from "./stepProgress";

/**
 * The run as five progress bars. Used by the Open roles design, where the team
 * chart below shows what the run is finding.
 */
export function RunStrip({ run }: { run: BlueprintRun }) {
  const { steps, elapsedMs, reducedMotion } = run;
  const seconds = reducedMotion ? Math.floor(elapsedMs / 1000).toFixed(1) : (elapsedMs / 1000).toFixed(1);
  const active = steps.find((s) => s.status === "active");
  const latest = active?.details[active.details.length - 1];

  return (
    <section
      aria-labelledby="run-strip-title"
      className="w-full rounded-lg border border-border bg-card/80 p-4 text-left backdrop-blur-sm sm:p-5"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="run-strip-title"
          ref={run.headingRef}
          tabIndex={-1}
          className="min-w-0 break-words text-base font-semibold text-foreground"
        >
          Drafting a blueprint for {run.host}
        </h2>
        <p
          className="shrink-0 font-mono text-lg tabular-nums text-foreground"
          aria-label={`${Math.floor(elapsedMs / 1000)} seconds elapsed`}
        >
          {seconds}s
        </p>
      </div>

      <ol className="mt-4 grid grid-cols-5 gap-1.5">
        {steps.map((step) => {
          const fill = stepFill(step.status, elapsedMs - (step.startedAt ?? elapsedMs), EXPECTED_STEP_MS[step.id]);
          return (
            <li key={step.id}>
              <div className="h-1 overflow-hidden rounded-full bg-border" aria-hidden="true">
                <div
                  className={cn("h-full rounded-full", step.status === "failed" ? "bg-red-500" : "bg-primary")}
                  style={{ width: `${fill * 100}%` }}
                />
              </div>
              <p
                className={cn(
                  "mt-1.5 truncate text-xs",
                  step.status === "pending" ? "text-muted-foreground/70" : "text-foreground",
                  step.status === "skipped" && "text-muted-foreground line-through decoration-muted-foreground/50"
                )}
              >
                {SHORT_STEP_LABEL[step.id]}
                <span className="sr-only">, {step.status === "active" ? "in progress" : step.status}</span>
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-2 flex min-h-9 items-center justify-between gap-3">
        <p className="min-w-0 text-sm text-muted-foreground" role="status">
          {run.statusLine ? (
            <span className="text-foreground">{run.statusLine}</span>
          ) : (
            <span className="line-clamp-2 break-words">
              <span className="text-foreground">{active?.label ?? "Starting"}</span>
              {latest ? ` · ${latest}` : ""}
              {run.slow ? ` ${SLOW_RUN_NOTE}` : ""}
            </span>
          )}
        </p>
        {run.cancel ? (
          <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={run.cancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </section>
  );
}
