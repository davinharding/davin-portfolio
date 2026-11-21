"use client";

import { ExampleLinks, type ExampleLinkItem } from "./ExampleLinks";
import { RunConsole } from "./RunConsole";
import { UrlForm } from "./UrlForm";
import { useBlueprintRun } from "./useBlueprintRun";

/** The classic launcher: the form, then the run console in its place, with example links under it. */
export default function BlueprintLauncher({ examples }: { examples: readonly ExampleLinkItem[] }) {
  const run = useBlueprintRun();

  return (
    <div ref={run.rootRef} className="w-full">
      {run.busy ? <RunConsole run={run} /> : <UrlForm run={run} />}
      {!run.busy ? (
        <ExampleLinks examples={examples} offered={run.offersExamples} className="mt-6" />
      ) : null}
    </div>
  );
}
