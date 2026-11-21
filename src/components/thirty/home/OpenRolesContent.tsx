"use client";

import { HEADLINE } from "@/lib/thirty/homeCopy";
import type { SampleTeam } from "@/lib/thirty/sampleTeams";
import { UrlForm } from "../UrlForm";
import { useBlueprintRun } from "../useBlueprintRun";
import { RunStrip } from "./RunStrip";
import { TeamChart } from "./TeamChart";

export function OpenRolesContent({ teams }: { teams: readonly SampleTeam[] }) {
  const run = useBlueprintRun();
  return (
    <div
      ref={run.rootRef}
      className="container-narrow relative w-full pb-8 pt-[max(5.5rem,calc(50dvh-19.5rem))] md:pt-[max(6.5rem,calc(50dvh-19.5rem))]"
    >
      <div className="mx-auto max-w-2xl md:text-center">
        <h1
          id="home-title"
          className="thirty-hero mb-7 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl"
        >
          {HEADLINE}.
        </h1>
        <div className="text-left">{run.busy ? <RunStrip run={run} /> : <UrlForm run={run} />}</div>
      </div>
      <TeamChart run={run} teams={teams} />
    </div>
  );
}
