"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, UserCheck } from "lucide-react";
import { track } from "@/lib/analytics/track";
import type { SampleTeam } from "@/lib/thirty/sampleTeams";
import { cn } from "@/lib/utils";
import { EXAMPLES_OFFERED_LEAD, trackExampleOpened } from "../ExampleLinks";
import { GateBadge } from "../OrgChart";
import type { BlueprintRun } from "../useBlueprintRun";

const ROTATE_MS = 4200;

/**
 * The blueprint's org chart, on the homepage. With nothing typed it shows teams
 * from earlier runs. Once an address is typed it is the visitor's own team with
 * open roles, which fill as the run drafts each agent.
 */
export function TeamChart({ run, teams }: { run: BlueprintRun; teams: readonly SampleTeam[] }) {
  const [index, setIndex] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [inside, setInside] = useState(false);

  // An error that points at the examples brings the sample teams back, whatever is typed.
  const wantsSamples = run.url.trim() === "" || run.offersExamples;
  const mode = run.busy ? "run" : wantsSamples && teams.length > 0 ? "sample" : "yours";
  const team = teams[index % Math.max(1, teams.length)];

  useEffect(() => {
    if (mode !== "sample" || pinned || inside || run.reducedMotion || teams.length < 2) return;
    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % teams.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [mode, pinned, inside, run.reducedMotion, teams.length]);

  const { typedHost, slots } = run;

  const title = mode === "sample" ? team.company : mode === "run" ? run.host : typedHost ?? "Your team";
  const note =
    mode === "sample"
      ? "A team I drafted earlier"
      : mode === "run" && run.company?.oneLiner
        ? run.company.oneLiner
        : "Approves every gated action";

  return (
    <div
      className="mx-auto mt-8 max-w-4xl"
      onMouseEnter={() => setInside(true)}
      onMouseLeave={() => setInside(false)}
      onFocus={() => setInside(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setInside(false);
      }}
    >
      <div className="mb-4 flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        {mode === "sample" ? (
          <>
            <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Teams from earlier runs">
              <span className="mr-2 text-muted-foreground">
                {run.offersExamples ? EXAMPLES_OFFERED_LEAD : "Teams I drafted earlier:"}
              </span>
              {teams.map((t, i) => (
                <button
                  key={t.slug}
                  type="button"
                  aria-pressed={i === index}
                  onClick={() => {
                    setIndex(i);
                    setPinned(true);
                    track("sample_team_selected", { team: t.slug });
                  }}
                  className={cn(
                    "rounded-md border px-2.5 py-1 transition-colors",
                    i === index
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.company}
                </button>
              ))}
            </div>
            <Link
              href={`/b/${team.slug}`}
              onClick={() => trackExampleOpened(team.slug, "chart")}
              className="group inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Open the {team.company} blueprint
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            {/* Without JavaScript the buttons above do nothing, so list every example. */}
            <noscript>
              <ul className="flex w-full flex-wrap gap-x-4 gap-y-1">
                {teams.map((t) => (
                  <li key={t.slug}>
                    <a href={`/b/${t.slug}`} className="text-primary underline underline-offset-2">
                      {t.company} blueprint
                    </a>
                  </li>
                ))}
              </ul>
            </noscript>
          </>
        ) : mode === "yours" ? (
          <p className="text-muted-foreground">
            <span className="text-foreground">
              Four open roles{typedHost ? <> at <span className="break-all">{typedHost}</span></> : null}.
            </span>{" "}
            Press Enter and my agents fill them.
          </p>
        ) : (
          <p className="text-muted-foreground" aria-live="polite">
            <span className="text-foreground">
              {run.teamComplete
                ? `${run.agents.length} ${run.agents.length === 1 ? "role" : "roles"} filled.`
                : `${run.agents.length} of ${slots.length} roles filled.`}
            </span>
          </p>
        )}
      </div>

      <figure aria-label={mode === "sample" ? `Agent team for ${team.company}` : "Your agent team"} className="org-chart">
        <div className="flex md:justify-center">
          <div className="min-w-0 rounded-lg border border-primary/50 bg-primary/10 px-4 py-2.5 text-sm md:max-w-md">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <UserCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span key={title} className="team-swap min-w-0 break-all">
                {title}
              </span>
            </p>
            <p key={note} className="team-swap text-xs text-muted-foreground">
              {note}
            </p>
          </div>
        </div>
        <div className="org-chart__stem" aria-hidden="true" />
        <ol
          className="org-chart__agents org-chart__agents--grid mt-3 md:mt-0"
          style={{ "--org-cols": mode === "sample" ? team.agents.length : slots.length } as CSSProperties}
        >
          {mode === "sample"
            ? team.agents.map((agent) => (
                <li key={`${team.slug}-${agent.name}`} className="org-chart__agent">
                  {agent.gated ? <GateBadge /> : null}
                  <Link
                    href={`/b/${team.slug}`}
                    onClick={() => trackExampleOpened(team.slug, "chart")}
                    className="team-slot team-swap group"
                  >
                    <span className="block break-words text-sm font-medium text-foreground/75 transition-colors group-hover:text-foreground">
                      {agent.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {agent.gated ? "Human approval gate" : "Runs unattended"}
                    </span>
                  </Link>
                </li>
              ))
            : slots.map((slot, i) => {
                const agent = slot.name;
                const drafting = slot.state === "drafting";
                const unused = slot.state === "unused";
                return (
                  <li key={i} className="org-chart__agent">
                    <div
                      className={cn(
                        "team-slot",
                        agent && "team-slot--filled",
                        drafting && "team-slot--drafting",
                        unused && "opacity-50"
                      )}
                    >
                      <p className={cn("break-words text-sm font-medium", agent ? "text-foreground" : "text-muted-foreground")}>
                        {agent ?? (drafting ? "Drafting…" : unused ? "Not needed" : "Open role")}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{agent ? "Drafted" : `Agent ${i + 1}`}</p>
                    </div>
                  </li>
                );
              })}
        </ol>
      </figure>
    </div>
  );
}
