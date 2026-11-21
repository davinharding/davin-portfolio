import { ImageResponse } from "next/og";
import { HEADLINE, HOME_SOCIAL_IMAGE } from "@/lib/thirty/homeCopy";

// The homepage's link preview. homeMetadata points at this route by URL; it is not
// colocated with a page, so no page inherits it on its own.
export const alt = HOME_SOCIAL_IMAGE.alt;
export const size = { width: HOME_SOCIAL_IMAGE.width, height: HOME_SOCIAL_IMAGE.height };
export const contentType = "image/png";

const INK = "#f8fafc";
const MUTED = "#94a3b8";
const BLUE = "#3b82f6";
const CARET = "#60a5fa";

/** The header's <D> mark, from public/logo.svg. */
function Logo({ px }: { px: number }) {
  return (
    <svg width={px} height={px} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#0f172a" />
      <path d="M10 14L4 20L10 26" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 14L36 20L30 26" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M14 12V28M14 12H20.5C23.5376 12 26 14.9101 26 18.5V21.5C26 25.0899 23.5376 28 20.5 28H14"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="17" y="18" width="2" height="4" rx="0.5" fill={CARET} />
    </svg>
  );
}

/** The homepage's org chart in miniature: you on top, three open agent roles below. */
function TeamSketch() {
  const roles = [1, 2, 3];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 360 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "14px 22px",
          borderRadius: 12,
          border: "1px solid rgba(59,130,246,0.55)",
          background: "rgba(59,130,246,0.12)",
        }}
      >
        <div style={{ fontSize: 24, color: INK }}>Your team</div>
        <div style={{ fontSize: 17, color: MUTED, marginTop: 4 }}>Approves every gated action</div>
      </div>
      {/* Stem, then a rail across the three roles, then a drop to each. */}
      <div style={{ width: 2, height: 28, background: "rgba(148,163,184,0.45)" }} />
      <div style={{ width: 252, height: 2, background: "rgba(148,163,184,0.45)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", width: 360 }}>
        {roles.map((n) => (
          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 108 }}>
            <div style={{ width: 2, height: 22, background: "rgba(148,163,184,0.45)" }} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 108,
                padding: "12px 12px",
                borderRadius: 10,
                border: "1px dashed rgba(148,163,184,0.45)",
                background: "rgba(15,23,42,0.7)",
              }}
            >
              <div style={{ fontSize: 18, color: MUTED }}>Open role</div>
              <div style={{ fontSize: 15, color: "rgba(148,163,184,0.7)", marginTop: 3 }}>{`Agent ${n}`}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: "radial-gradient(ellipse 70% 60% at 75% 45%, rgba(59,130,246,0.2), #020617 70%)",
          backgroundColor: "#020617",
          color: INK,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Logo px={56} />
          <div style={{ fontSize: 30, color: MUTED, letterSpacing: 1 }}>davin.io</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", width: 600, fontSize: 68, lineHeight: 1.08, letterSpacing: -1 }}>
            {`${HEADLINE}.`}
          </div>
          <TeamSketch />
        </div>
        <div style={{ display: "flex", fontSize: 24, color: MUTED }}>
          Watch my agents draft a blueprint of the AI agents I would build for you.
        </div>
      </div>
    ),
    size
  );
}
