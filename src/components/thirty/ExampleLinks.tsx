"use client";

import Link from "next/link";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

export type ExampleLinkItem = { slug: string; name: string; label: string };

type ExampleLinksProps = {
  examples: readonly ExampleLinkItem[];
  /** The last run error points here (live runs unavailable, or not a company): draw more attention. */
  offered?: boolean;
  className?: string;
};

/** The lead-in when an error offers the examples instead of a run. */
export const EXAMPLES_OFFERED_LEAD = "These show the same thing:";

/** Reports that an example blueprint was opened, and from which part of the page. */
export function trackExampleOpened(slug: string, via: "links" | "chart"): void {
  track("example_opened", { example: slug, via });
}

export function ExampleLinks({ examples, offered = false, className }: ExampleLinksProps) {
  return (
    <div className={cn("text-sm", className)}>
      <p className="text-muted-foreground mb-2">{offered ? EXAMPLES_OFFERED_LEAD : "Or open one I ran earlier:"}</p>
      <ul className="flex flex-wrap gap-2" aria-label="Example blueprints">
        {examples.map((ex) => (
          <li key={ex.slug}>
            <Link
              href={`/b/${ex.slug}`}
              onClick={() => trackExampleOpened(ex.slug, "links")}
              className={cn(
                "inline-flex items-baseline gap-1.5 rounded-md border px-3 py-1.5 transition-colors",
                offered
                  ? "border-primary/60 bg-primary/10 text-foreground hover:bg-primary/20"
                  : "border-border text-foreground/90 hover:border-primary/50 hover:text-foreground"
              )}
            >
              <span className="font-medium">{ex.name}</span>
              {ex.label ? <span className="text-xs text-muted-foreground">{ex.label}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
