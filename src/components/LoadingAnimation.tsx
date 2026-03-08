"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "davinLoaderShown";
const TOTAL_DURATION_MS = 1700;

export default function LoadingAnimation() {
  const [isActive, setIsActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const alreadyShown = sessionStorage.getItem(STORAGE_KEY) === "true";
    if (alreadyShown) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const totalDurationMs = prefersReducedMotion ? 600 : TOTAL_DURATION_MS;

    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsActive(true);

    const animationFrameId = window.requestAnimationFrame(() => {
      setIsAnimating(true);
    });

    const timeoutId = window.setTimeout(() => {
      setIsActive(false);
    }, totalDurationMs);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!isActive) {
    return null;
  }

  return (
    <div
      className={isAnimating ? "loading-overlay loading-overlay--animate" : "loading-overlay"}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "hsl(222.2, 84%, 4.9%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        className="loading-mark"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 160,
          height: 160,
        }}
      >
        <svg
          className="loading-monogram"
          viewBox="0 0 120 120"
          role="img"
          aria-label="Davin Harding"
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <path
            className="loading-stroke loading-stroke--d"
            d="M32 22 H58 C74 22 84 34 84 60 C84 86 74 98 58 98 H32 Z"
            style={{
              fill: "rgba(74, 144, 217, 0)",
              stroke: "#4A90D9",
              strokeWidth: 6,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          />
          <path
            className="loading-stroke loading-stroke--h"
            d="M70 22 V98 M70 60 H98 M98 22 V98"
            style={{
              fill: "rgba(74, 144, 217, 0)",
              stroke: "#4A90D9",
              strokeWidth: 6,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          />
        </svg>
      </div>
      <style jsx>{`
        .loading-overlay--animate {
          animation: overlay-fade 1.7s ease forwards;
        }

        .loading-monogram {
          filter: drop-shadow(0 0 0 rgba(74, 144, 217, 0));
          animation: glow-pulse 1.7s ease forwards;
        }

        .loading-stroke {
          stroke-dasharray: 320;
          stroke-dashoffset: 320;
          animation: stroke-draw 1s ease forwards, fill-in 0.35s ease forwards 1s;
        }

        .loading-stroke--h {
          animation-delay: 0.05s, 1s;
        }

        @keyframes stroke-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fill-in {
          to {
            fill: rgba(74, 144, 217, 1);
          }
        }

        @keyframes glow-pulse {
          0% {
            filter: drop-shadow(0 0 0 rgba(74, 144, 217, 0));
          }
          60% {
            filter: drop-shadow(0 0 0 rgba(74, 144, 217, 0));
          }
          72% {
            filter: drop-shadow(0 0 16px rgba(74, 144, 217, 0.8));
          }
          100% {
            filter: drop-shadow(0 0 0 rgba(74, 144, 217, 0));
          }
        }

        @keyframes overlay-fade {
          0% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
