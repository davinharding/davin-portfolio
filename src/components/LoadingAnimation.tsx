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
    <div className="dh-loader" style={{ animationDuration: `${TOTAL_MS}ms` }}>
      <div className="dh-loader__stage">
        <svg viewBox="0 0 160 160" role="img" aria-label="Davin Harding">
          <defs>
            <linearGradient id="dh-loader-stroke" x1="22" x2="138" y1="26" y2="134">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="48%" stopColor="#4a90d9" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <g className="dh-loader__orbit" aria-hidden="true">
            <path d="M31 82 C52 31 112 31 133 82 C112 129 52 129 31 82 Z" />
            <circle cx="31" cy="82" r="3.5" />
            <circle cx="133" cy="82" r="3.5" />
            <circle cx="80" cy="32" r="3.5" />
          </g>
          <g className="dh-loader__data" aria-hidden="true">
            <path d="M30 122 H130" />
            <path d="M45 136 H115" />
          </g>
          <g className="dh-loader__mark">
            <path
              className="dh-loader__stroke dh-loader__stroke--d"
              d="M39 31 H72 C94 31 108 48 108 80 C108 112 94 129 72 129 H39 Z"
            />
            <path
              className="dh-loader__stroke dh-loader__stroke--h"
              d="M87 31 V129 M87 80 H128 M128 31 V129"
            />
          </g>
        </svg>
        <span>Davin Harding</span>
      </div>
    </div>
  );
}
