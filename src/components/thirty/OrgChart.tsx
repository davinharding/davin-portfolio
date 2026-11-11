import type { CSSProperties } from "react";
import { Lock, UserCheck } from "lucide-react";
import type { NormalizedAgent } from "@/lib/thirty/schema";

export function OrgChart({ agents, companyName }: { agents: NormalizedAgent[]; companyName: string }) {
  return (
    <figure aria-label={`Agent team for ${companyName}`} className="org-chart">
      <div className="flex md:justify-center">
        <div className="rounded-lg border border-primary/50 bg-primary/10 px-4 py-2.5 text-sm">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <UserCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            Your team
          </p>
          <p className="text-xs text-muted-foreground">Approves every gated action</p>
        </div>
      </div>
      <div className="org-chart__stem" aria-hidden="true" />
      <ol
        className="org-chart__agents mt-3 md:mt-0"
        style={{ "--org-cols": agents.length } as CSSProperties}
      >
        {agents.map((agent) => (
          <li key={agent.name} className="org-chart__agent">
            {agent.humanGate.required ? (
              <span
                className="org-chart__gate inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-500/70 bg-background text-amber-400 [.light_&]:text-amber-700"
                title="Needs human approval"
              >
                <Lock className="h-3 w-3" aria-hidden="true" />
              </span>
            ) : null}
            <a
              href={`#agent-${slugify(agent.name)}`}
              className="block h-full rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/50"
            >
              <p className="text-sm font-medium text-foreground break-words">{agent.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {agent.humanGate.required ? "Human approval gate" : "Runs unattended"}
              </p>
            </a>
          </li>
        ))}
      </ol>
      <figcaption className="sr-only">
        {agents.filter((a) => a.humanGate.required).length} of {agents.length} agents need human approval before
        they act.
      </figcaption>
    </figure>
  );
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
