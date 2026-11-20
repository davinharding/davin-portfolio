import Link from "next/link";
import { ArrowRight, Lock, PenLine, Eye, ShieldCheck } from "lucide-react";
import type { NormalizedAgent } from "@/lib/thirty/schema";
import { slugify } from "./OrgChart";

export type RelatedProjectLink = { href: string; projectName: string; relevance: string };

type AgentCardProps = {
  agent: NormalizedAgent;
  index: number;
  related: RelatedProjectLink | null;
  isFirstBuild: boolean;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground mb-1">{label}</dt>
      <dd className="text-sm text-foreground/90 leading-relaxed">{children}</dd>
    </div>
  );
}

export function AgentCard({ agent, index, related, isFirstBuild }: AgentCardProps) {
  return (
    <article
      id={`agent-${slugify(agent.name)}`}
      aria-labelledby={`agent-${index}-name`}
      className="scroll-mt-24 rounded-lg border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs tabular-nums text-muted-foreground">Agent {index + 1}</span>
          {isFirstBuild ? (
            <span className="rounded-full border border-primary/50 bg-primary/10 px-2 py-0.5 text-xs text-foreground">
              Build this one first
            </span>
          ) : null}
        </div>
        <h3 id={`agent-${index}-name`} className="text-lg font-semibold text-foreground break-words">
          {agent.name}
        </h3>
        <p className="text-body mt-1">{agent.role}</p>
      </header>

      <dl className="grid gap-4">
        <Field label="Trigger">{agent.trigger}</Field>
        <Field label="What it does">
          <ul className="list-disc pl-5 space-y-1 marker:text-primary">
            {agent.does.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Field>
        <Field label="Tools">
          <ul className="space-y-1.5">
            {agent.tools.map((t) => (
              <li key={`${t.name}-${t.system}`} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span
                  className={
                    t.access === "write"
                      ? "inline-flex items-center gap-1 rounded border border-amber-500/50 px-1.5 text-xs text-amber-300 [.light_&]:text-amber-700"
                      : "inline-flex items-center gap-1 rounded border border-border px-1.5 text-xs text-muted-foreground"
                  }
                >
                  {t.access === "write" ? (
                    <PenLine className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Eye className="h-3 w-3" aria-hidden="true" />
                  )}
                  {t.access}
                </span>
                <span>{t.name}</span>
                {t.system ? <span className="text-muted-foreground">in {t.system}</span> : null}
              </li>
            ))}
          </ul>
        </Field>
        <Field label="Human gate">
          <span className="flex gap-2">
            {agent.humanGate.required ? (
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400 [.light_&]:text-amber-700" aria-hidden="true" />
            ) : (
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            <span>
              <span className="font-medium">{agent.humanGate.required ? "Needs approval. " : "Runs unattended. "}</span>
              {agent.humanGate.detail}
            </span>
          </span>
        </Field>
        <Field label="Why this one">{agent.evidence}</Field>
        <Field label="Expected impact">{agent.impact}</Field>
      </dl>

      {related ? (
        <div className="mt-5 border-t border-border pt-4 text-sm">
          <Link href={related.href} className="group inline-flex items-center gap-1 font-medium text-primary hover:underline">
            Closest thing I have shipped: {related.projectName}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <p className="mt-1 text-muted-foreground">{related.relevance}</p>
        </div>
      ) : null}
    </article>
  );
}
