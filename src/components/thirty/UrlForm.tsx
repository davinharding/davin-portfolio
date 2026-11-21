"use client";

import Link from "next/link";
import { ArrowRight, Calendar, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCallCta } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";
import { RUN_PROMISE } from "./runModel";
import type { BlueprintRun } from "./useBlueprintRun";

const ERROR_ID = "blueprint-error";
const HELP_ID = "blueprint-help";

/**
 * The address field, the submit button, and whatever the last error offers next.
 * Posts natively to /api/blueprint when JavaScript has not loaded.
 */
export function UrlForm({ run, className }: { run: BlueprintRun; className?: string }) {
  const { error, next, retryNote } = run;
  const showActions = error && (error.code === "lost" || next.includes("retry") || next.includes("book_call"));

  return (
    <form
      method="post"
      action="/api/blueprint"
      onSubmit={run.onSubmit}
      noValidate={run.hydrated}
      className={cn("w-full", className)}
    >
      <label htmlFor="blueprint-url" className="sr-only">
        Your company&apos;s website
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          ref={run.inputRef}
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
          value={run.url}
          onChange={(e) => run.setUrl(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? ERROR_ID : HELP_ID}
          disabled={run.busy}
          className={cn(
            "h-12 w-full min-w-0 sm:flex-1 rounded-md border bg-background/80 px-4 text-base text-foreground shadow-sm",
            "placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            error ? "border-red-500/70" : "border-input"
          )}
        />
        <Button type="submit" size="lg" className="h-12 px-6 text-base" disabled={run.busy}>
          Draft my blueprint
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      {/* Honeypot: real visitors never see or fill this. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Confirm website
          <input
            ref={run.honeypotRef}
            type="text"
            name="website_confirm"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      {error ? (
        <div id={ERROR_ID} role="alert" className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm">
          <p className="text-foreground">{error.message}</p>
          {retryNote ? <p className="mt-1 text-muted-foreground">{retryNote}</p> : null}
          {showActions ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {error.code === "lost" ? (
                <Button type="button" size="sm" onClick={run.retry}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Check again
                </Button>
              ) : null}
              {next.includes("retry") ? (
                <Button type="button" size="sm" variant="outline" onClick={run.retry}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Try again
                </Button>
              ) : null}
              {next.includes("book_call") ? (
                <Button asChild size="sm" variant={next.includes("retry") ? "ghost" : "default"}>
                  <Link href="/call" onClick={() => trackCallCta("error")}>
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    Book a call
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <p id={HELP_ID} className="mt-3 text-sm text-muted-foreground">
        {RUN_PROMISE}
      </p>
    </form>
  );
}
