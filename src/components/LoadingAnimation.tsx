"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "davinLoaderShown";
// Keep splash short — research shows 800-1200ms is the sweet spot for a
// branded intro before users start to perceive it as latency.
const TOTAL_MS = 1100;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function LoadingAnimation() {
  // Start as `false` on both server and first client render so hydration matches.
  // The CSS overlay in globals.css covers the splash visually until the React
  // SVG mounts a tick later, so users still see a continuous splash.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(STORAGE_KEY) === "true";
    if (alreadyShown || prefersReducedMotion()) {
      document.documentElement.classList.add("loader-done");
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, "true");
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      document.documentElement.classList.add("loader-done");
    }, TOTAL_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
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
        @keyframes dh-mono-fade{0%,70%{opacity:1}100%{opacity:0}}
      `}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 140, height: 140 }}>
        <svg viewBox="0 0 120 120" role="img" aria-label="Davin Harding" style={{ width: "100%", height: "100%" }}>
          <g style={{ filter: "drop-shadow(0 0 0 rgba(74,144,217,0))", animation: "dh-glow 0.9s ease forwards" }}>
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
                animation: "dh-stroke 0.55s ease forwards, dh-fill 0.25s ease forwards 0.5s",
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
                animation: "dh-stroke 0.55s ease forwards 50ms, dh-fill 0.25s ease forwards 0.5s",
              }}
            />
          </g>
        </svg>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
