"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { HEADLINE } from "@/lib/thirty/homeCopy";
import { cn } from "@/lib/utils";
import { ExampleLinks, type ExampleLinkItem } from "../ExampleLinks";
import { RunConsole } from "../RunConsole";
import { UrlForm } from "../UrlForm";
import { useBlueprintRun } from "../useBlueprintRun";
import { BlueprintDrawing } from "./BlueprintDrawing";

const CHARS_TO_FULL_INK = 12;
const RESTING_INK = 0.14;

function usePaperLight(insideStage: RefObject<HTMLElement | null>, readout: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const stage = insideStage.current?.closest<HTMLElement>("[data-thirty-stage]");
    if (!stage || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      stage.style.setProperty("--paper-x", `${x}px`);
      stage.style.setProperty("--paper-y", `${y}px`);
      if (readout.current) {
        const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");
        readout.current.textContent = `X ${pad(x)}  Y ${pad(y)}`;
      }
    };
    const onMove = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    stage.addEventListener("pointermove", onMove);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [insideStage, readout]);
}

export function DraftingTableContent({ examples }: { examples: readonly ExampleLinkItem[] }) {
  const run = useBlueprintRun();
  const readoutRef = useRef<HTMLParagraphElement>(null);
  const [today, setToday] = useState("");
  useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);
  usePaperLight(run.rootRef, readoutRef);

  const typed = run.url.trim().length;
  const progress = run.busy ? 1 : Math.max(RESTING_INK, Math.min(1, typed / CHARS_TO_FULL_INK));
  const host = run.busy ? run.host : run.typedHost ?? "";

  const caption = run.busy
    ? run.phase === "navigating"
      ? "Drawing checked"
      : "Drafting"
    : typed === 0
      ? "Type your address to ink the drawing"
      : progress < 1
        ? "Keep going"
        : "Ready to draft";

  return (
    <>
      <div
        ref={run.rootRef}
        className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 pb-10 pt-24 md:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8"
      >
        <div className="min-w-0">
          <p className="text-meta mb-4">Thirty Seconds</p>
          <h1
            id="home-title"
            className="thirty-hero mb-8 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            {HEADLINE}.
          </h1>
          {run.busy ? (
            <RunConsole run={run} />
          ) : (
            <>
              <UrlForm run={run} />
              <ExampleLinks examples={examples} offered={run.offersExamples} className="mt-6" />
            </>
          )}
        </div>
        <div className={cn("min-w-0", run.busy && "hidden sm:block")}>
          <BlueprintDrawing run={run} progress={progress} host={host} today={today} />
          <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground" aria-hidden="true">
            {caption}
          </p>
        </div>
      </div>
      <p
        ref={readoutRef}
        className="drafting-coords pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] tracking-[0.14em] text-muted-foreground/70"
        aria-hidden="true"
      >
        X 0000  Y 0000
      </p>
    </>
  );
}
