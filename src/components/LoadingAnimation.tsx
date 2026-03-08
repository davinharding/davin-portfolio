"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "davinLoaderShown";
const TOTAL_MS = 2800;

export default function LoadingAnimation() {
  const [shouldShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(STORAGE_KEY) !== "true";
  });
  const [visible, setVisible] = useState(shouldShow);

  useEffect(() => {
    if (!shouldShow) return;
    sessionStorage.setItem(STORAGE_KEY, "true");
    const timer = setTimeout(() => {
      setVisible(false);
      // Add class so CSS body::before overlay is hidden on future navigations
      document.documentElement.classList.add("loader-done");
    }, TOTAL_MS);
    return () => clearTimeout(timer);
  }, [shouldShow]);

  // Don't render the monogram SVG if already shown or after animation
  if (!visible) return null;

  // The dark overlay is handled by body::before in CSS (no flash).
  // This component only renders the DH monogram animation on top.
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        animation: `dh-mono-fade ${TOTAL_MS}ms ease forwards`,
      }}
    >
      <style>{`
        @keyframes dh-stroke{to{stroke-dashoffset:0}}
        @keyframes dh-fill{to{fill:rgba(74,144,217,1)}}
        @keyframes dh-glow{0%,60%{filter:drop-shadow(0 0 0 rgba(74,144,217,0))}72%{filter:drop-shadow(0 0 16px rgba(74,144,217,.8))}100%{filter:drop-shadow(0 0 0 rgba(74,144,217,0))}}
        @keyframes dh-mono-fade{0%,75%{opacity:1}100%{opacity:0}}
      `}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 160, height: 160 }}>
        <svg viewBox="0 0 120 120" role="img" aria-label="Davin Harding" style={{ width: "100%", height: "100%" }}>
          <g style={{ filter: "drop-shadow(0 0 0 rgba(74,144,217,0))", animation: "dh-glow 1.7s ease forwards" }}>
            <path
              d="M32 22 H58 C74 22 84 34 84 60 C84 86 74 98 58 98 H32 Z"
              style={{
                fill: "rgba(74,144,217,0)",
                stroke: "#4A90D9",
                strokeWidth: 6,
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeDasharray: 320,
                strokeDashoffset: 320,
                animation: "dh-stroke 1s ease forwards, dh-fill 0.35s ease forwards 1s",
              }}
            />
            <path
              d="M70 22 V98 M70 60 H98 M98 22 V98"
              style={{
                fill: "rgba(74,144,217,0)",
                stroke: "#4A90D9",
                strokeWidth: 6,
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeDasharray: 320,
                strokeDashoffset: 320,
                animation: "dh-stroke 1s ease forwards 50ms, dh-fill 0.35s ease forwards 1s",
              }}
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
