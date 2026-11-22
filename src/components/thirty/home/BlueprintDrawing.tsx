"use client";

import { cn } from "@/lib/utils";
import { MAX_AGENTS } from "@/lib/thirty/events";
import type { BlueprintRun } from "../useBlueprintRun";
import { NARROW_VIEWBOX_WIDTH } from "./drawingScale";

const GATED = [true, true, false, true, true];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const box = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}z`;
const ring = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

export function twoLines(name: string, maxChars: number): string[] {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length < 2 || name.length <= maxChars) return [clip(name, maxChars)];
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < diff) {
      diff = d;
      best = i;
    }
  }
  return [clip(words.slice(0, best).join(" "), maxChars), clip(words.slice(best).join(" "), maxChars)];
}

type Slot = { name?: string; note: string; active: boolean; unused: boolean };

const SLOT_LABEL = { drafted: "DRAFTED", drafting: "DRAFTING", open: "OPEN ROLE", unused: "NOT NEEDED" } as const;

function slotsFor(run: BlueprintRun): Slot[] {
  return run.slots.map(({ name, state }) => ({
    name: name?.toUpperCase(),
    note: SLOT_LABEL[state],
    active: state === "drafted" || state === "drafting",
    unused: state === "unused",
  }));
}

function titleBlock(run: BlueprintRun) {
  return {
    time: run.busy ? `${(run.elapsedMs / 1000).toFixed(1)} S` : "ABOUT 30 S",
    checked:
      run.phase === "navigating"
        ? "PASSED"
        : run.activeStep === "check"
          ? "IN REVIEW"
          : run.busy
            ? "PENDING"
            : "NOT YET",
  };
}

function Ink({ p, from, to, d, filled }: { p: number; from: number; to: number; d: string; filled?: boolean }) {
  const k = clamp01((p - from) / (to - from));
  return (
    <g>
      <path d={d} className={cn("drafting-construct", filled && "drafting-construct--filled")} />
      <path d={d} pathLength={1} className="drafting-ink" style={{ strokeDashoffset: 1 - k, opacity: k > 0 ? 1 : 0 }} />
    </g>
  );
}

function Cell({ x, y, label, value, ink }: { x: number; y: number; label: string; value: string; ink?: boolean }) {
  return (
    <g>
      <text x={x + 7} y={y + 11} className="drafting-t drafting-t--label">
        {label}
      </text>
      <text x={x + 7} y={y + 23} className={cn("drafting-t drafting-t--value", ink && "drafting-t--ink")}>
        {value}
      </text>
    </g>
  );
}

type DrawingProps = {
  run: BlueprintRun;
  progress: number;
  host: string;
  today: string;
};

const ALT =
  "Schematic of an agent team: your team at the top and the agents below it, each with read and write tools and a human approval gate before any write.";

function WideDrawing({ run, progress: p, host, today }: DrawingProps) {
  const slots = slotsFor(run);
  const n = slots.length;
  const w = n === MAX_AGENTS ? 92 : 110;
  const centers = slots.map((_, i) => 10 + w / 2 + (i * (500 - w)) / (n - 1));
  const last = centers[n - 1];
  const maxChars = n === MAX_AGENTS ? 15 : 17;
  const shown = (at: number) => ({ opacity: p >= at ? 1 : 0 });
  const { time, checked } = titleBlock(run);
  const client = host ? host.toUpperCase() : null;

  return (
    <svg viewBox="0 0 520 414" className="drafting-drawing hidden h-auto w-full sm:block" role="img" aria-label={ALT}>
      <Ink p={p} from={0} to={0.14} d={box(190, 24, 140, 50)} />
      <text x="260" y="46" textAnchor="middle" className="drafting-t drafting-t--strong">
        {client ? clip(client, 22) : "YOUR TEAM"}
      </text>
      <text x="260" y="61" textAnchor="middle" className="drafting-t">
        APPROVES GATED ACTIONS
      </text>
      <Ink p={p} from={0.14} to={0.2} d="M260 74V112" />
      <Ink p={p} from={0.2} to={0.34} d={`M${centers[0]} 112H${last}`} />

      {slots.map((slot, i) => {
        const cx = centers[i];
        const from = 0.42 + i * 0.07;
        const lines = slot.name ? twoLines(slot.name, maxChars) : [];
        return (
          <g key={i} style={slot.unused ? { opacity: 0.4 } : undefined} className="drafting-fade">
            <Ink p={p} from={0.34} to={0.42} d={`M${cx} 112V146`} />
            <Ink p={p} from={from} to={from + 0.1} d={box(cx - w / 2, 146, w, 56)} />
            {slot.name ? (
              <g className="drafting-pop">
                {lines.map((line, j) => (
                  <text
                    key={j}
                    x={cx}
                    y={(lines.length === 1 ? 170 : 164) + j * 12}
                    textAnchor="middle"
                    className={cn("drafting-t drafting-t--value", n === MAX_AGENTS && "drafting-t--tight")}
                  >
                    {line}
                  </text>
                ))}
                <text x={cx} y="194" textAnchor="middle" className="drafting-t drafting-t--ink">
                  {slot.note}
                </text>
              </g>
            ) : (
              <g className="drafting-fade" style={shown(from)}>
                <text x={cx} y="171" textAnchor="middle" className="drafting-t drafting-t--strong">
                  AGENT 0{i + 1}
                </text>
                <text x={cx} y="186" textAnchor="middle" className={cn("drafting-t", slot.active && "drafting-t--ink")}>
                  {slot.note}
                </text>
              </g>
            )}

            <Ink p={p} from={0.73} to={0.77} d={`M${cx} 202V212`} />
            {[-31, -7, 17].map((dx, j) => (
              <g key={dx}>
                <Ink p={p} from={0.76 + j * 0.03} to={0.82 + j * 0.03} d={box(cx + dx, 212, 14, 14)} />
                <text x={cx + dx + 7} y="222" textAnchor="middle" className="drafting-t drafting-fade" style={shown(0.86)}>
                  {j === 2 ? "W" : "R"}
                </text>
              </g>
            ))}

            {GATED[i] ? <Ink p={p} from={0.86} to={0.92} d={ring(cx, 129, 4.5)} filled /> : null}
          </g>
        );
      })}

      <Ink p={p} from={0.9} to={0.95} d={`M${last + 4} 125L${last + 15} 96H512`} />
      <text x="512" y="90" textAnchor="end" className="drafting-t drafting-fade" style={shown(0.93)}>
        HUMAN GATE
      </text>
      <text x="10" y="246" className="drafting-t drafting-fade" style={shown(0.88)}>
        R READ · W WRITE, BEHIND THE GATE
      </text>

      <text x="10" y="302" className="drafting-t drafting-t--strong">
        FIG. 1
      </text>
      <text x="10" y="316" className="drafting-t">
        AGENT TEAM, PROPOSED
      </text>
      <text x="10" y="344" className="drafting-t drafting-t--strong">
        NOTES
      </text>
      <text x="10" y="358" className="drafting-t">
        1. EVERY WRITE WAITS FOR A PERSON.
      </text>
      <text x="10" y="371" className="drafting-t">
        2. READS ONLY YOUR PUBLIC WEBSITE.
      </text>

      <Ink p={p} from={0.94} to={1} d={`${box(270, 292, 240, 112)}M270 320H510M270 348H510M270 376H510M390 320V404`} />
      <Cell x={270} y={292} label="PROJECT" value="AGENT BLUEPRINT" />
      <Cell x={270} y={320} label="CLIENT" value={client ? clip(client, 16) : "YOUR COMPANY"} ink={Boolean(client)} />
      <Cell x={390} y={320} label="DATE" value={today} />
      <Cell x={270} y={348} label="DRAWN BY" value="DAVIN'S AGENTS" />
      <Cell x={390} y={348} label="TIME" value={time} ink={run.busy} />
      <Cell x={270} y={376} label="CHECKED" value={checked} ink={run.phase === "navigating"} />
      <Cell x={390} y={376} label="SHEET" value="1 OF 1" />
    </svg>
  );
}

function NarrowDrawing({ run, progress: p, host }: DrawingProps) {
  const slots = slotsFor(run);
  const rows = Math.ceil(slots.length / 2);
  const rowTop = (row: number) => 92 + row * 66;
  const rowMid = (row: number) => rowTop(row) + 26;
  const titleTop = rowTop(rows) + 6;
  const shown = (at: number) => ({ opacity: p >= at ? 1 : 0 });
  const { time, checked } = titleBlock(run);
  const client = host ? host.toUpperCase() : null;
  const oddLast = slots.length % 2 === 1;

  return (
    <svg
      viewBox={`0 0 ${NARROW_VIEWBOX_WIDTH} ${titleTop + 68}`}
      className="drafting-drawing drafting-drawing--narrow h-auto w-full sm:hidden"
      role="img"
      aria-label={ALT}
    >
      <Ink p={p} from={0} to={0.14} d={box(60, 12, 180, 50)} />
      <text x="150" y="33" textAnchor="middle" className="drafting-t drafting-t--strong">
        {client ? clip(client, 22) : "YOUR TEAM"}
      </text>
      <text x="150" y="49" textAnchor="middle" className="drafting-t">
        APPROVES GATED ACTIONS
      </text>
      <Ink p={p} from={0.14} to={0.34} d={`M150 62V${rowMid(rows - 1)}`} />
      {Array.from({ length: rows }, (_, row) => (
        <Ink key={row} p={p} from={0.34} to={0.42} d={`M144 ${rowMid(row)}H${oddLast && row === rows - 1 ? 150 : 156}`} />
      ))}

      {slots.map((slot, i) => {
        const x = i % 2 === 0 ? 12 : 156;
        const y = rowTop(Math.floor(i / 2));
        const cx = x + 66;
        const from = 0.42 + i * 0.07;
        const lines = slot.name ? twoLines(slot.name, 17) : [];
        return (
          <g key={i} style={slot.unused ? { opacity: 0.4 } : undefined} className="drafting-fade">
            <Ink p={p} from={from} to={from + 0.1} d={box(x, y, 132, 52)} />
            {slot.name ? (
              <g className="drafting-pop">
                {lines.map((line, j) => (
                  <text key={j} x={cx} y={y + (lines.length === 1 ? 25 : 18) + j * 13} textAnchor="middle" className="drafting-t drafting-t--value">
                    {line}
                  </text>
                ))}
                <text x={cx} y={y + 45} textAnchor="middle" className="drafting-t drafting-t--ink">
                  {slot.note}
                </text>
              </g>
            ) : (
              <g className="drafting-fade" style={shown(from)}>
                <text x={cx} y={y + 24} textAnchor="middle" className="drafting-t drafting-t--strong">
                  AGENT 0{i + 1}
                </text>
                <text x={cx} y={y + 40} textAnchor="middle" className={cn("drafting-t", slot.active && "drafting-t--ink")}>
                  {slot.note}
                </text>
              </g>
            )}
          </g>
        );
      })}

      <Ink p={p} from={0.9} to={1} d={`${box(12, titleTop, 276, 60)}M12 ${titleTop + 30}H288M150 ${titleTop}V${titleTop + 60}`} />
      <Cell x={12} y={titleTop} label="PROJECT" value="AGENT BLUEPRINT" />
      <Cell x={150} y={titleTop} label="CLIENT" value={client ? clip(client, 16) : "YOUR COMPANY"} ink={Boolean(client)} />
      <Cell x={12} y={titleTop + 30} label="TIME" value={time} ink={run.busy} />
      <Cell x={150} y={titleTop + 30} label="CHECKED" value={checked} ink={run.phase === "navigating"} />
    </svg>
  );
}

export function BlueprintDrawing(props: DrawingProps) {
  return (
    <>
      <WideDrawing {...props} />
      <NarrowDrawing {...props} />
    </>
  );
}
