"use client";

import { useId } from "react";

// Sun that morphs into a crescent moon. Driven purely by the `light` class on
// <html> (see .theme-icon in globals.css), so it is right from first paint.
const RAYS = Array.from({ length: 8 }, (_, i) => i * 45);

export default function ThemeIcon({ className = "" }: { className?: string }) {
  const maskId = `theme-icon-crescent-${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`theme-icon ${className}`}
    >
      <mask id={maskId}>
        <rect width="24" height="24" fill="#fff" />
        <circle className="theme-icon__bite" cx="17" cy="7" r="7" fill="#000" />
      </mask>
      <circle
        className="theme-icon__body"
        cx="12"
        cy="12"
        r="8"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
      <g
        className="theme-icon__rays"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        {RAYS.map((angle) => (
          <line
            key={angle}
            x1="12"
            y1="1.5"
            x2="12"
            y2="3.5"
            transform={`rotate(${angle} 12 12)`}
          />
        ))}
      </g>
    </svg>
  );
}
