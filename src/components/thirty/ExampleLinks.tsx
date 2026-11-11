"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { cn } from "@/lib/utils";

export type ExampleLinkItem = { slug: string; name: string; label: string };

type ExampleLinksProps = {
  examples: readonly ExampleLinkItem[];
  /** Draws more attention when live runs are unavailable. */
  emphasized?: boolean;
  lead?: string;
  className?: string;
};

export function ExampleLinks({
  examples,
  emphasized = false,
  lead = "Or open one I ran earlier:",
  className,
}: ExampleLinksProps) {
  return (
    <div className={cn("text-sm", className)}>
      <p className="text-muted-foreground mb-2">{lead}</p>
      <ul className="flex flex-wrap gap-2" aria-label="Example blueprints">
        {examples.map((ex) => (
          <li key={ex.slug}>
            <Link
              href={`/b/${ex.slug}`}
              onClick={() => {
                try {
                  track("example_opened", { example: ex.slug });
                } catch {
                  // Analytics must never affect navigation.
                }
              }}
              className={cn(
                "inline-flex items-baseline gap-1.5 rounded-md border px-3 py-1.5 transition-colors",
                emphasized
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
