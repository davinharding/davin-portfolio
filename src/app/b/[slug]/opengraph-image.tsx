import { ImageResponse } from "next/og";
import { loadBlueprint } from "@/lib/thirty/blueprints";

export const alt = "Agent blueprint";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bp = await loadBlueprint(slug).catch(() => null);
  const company = bp?.company.name ?? "Agent blueprint";
  const agents = bp?.blueprint.agents.map((a) => a.name).slice(0, 5) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(ellipse 70% 60% at 70% 30%, rgba(59,130,246,0.22), #020617 70%)",
          backgroundColor: "#020617",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#94a3b8" }}>
            Agent blueprint for
          </div>
          <div style={{ fontSize: 84, fontWeight: 700, marginTop: 12, lineHeight: 1.05 }}>{company}</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {agents.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                fontSize: 28,
                padding: "10px 18px",
                borderRadius: 10,
                border: "1px solid rgba(96,165,250,0.5)",
                background: "rgba(15,23,42,0.85)",
              }}
            >
              {name}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#94a3b8" }}>
          <span>Davin Harding builds AI agents that ship</span>
          <span>davin.io</span>
        </div>
      </div>
    ),
    size
  );
}
