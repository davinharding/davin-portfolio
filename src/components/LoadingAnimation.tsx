"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "davinLoaderShown";
const DONE_CLASS = "loader-done";

function animationsFinished(el: Element, skip?: Animation) {
  return Promise.all(
    el
      .getAnimations({ subtree: true })
      .filter((animation) => animation !== skip)
      .map((animation) => animation.finished)
  );
}

// A delayed animation reports no progress until its delay has elapsed.
function hasStarted(animation: Animation): boolean {
  return animation.effect?.getComputedTiming().progress != null;
}

// The motion lives in globals.css. This only measures where the mark has to
// land so it ends up exactly on top of the header logo.
function dockOntoHeaderLogo(splash: HTMLElement, mark: Element | null) {
  const logo = document.querySelector("[data-splash-target]");
  if (mark && logo) {
    const from = mark.getBoundingClientRect();
    const to = logo.getBoundingClientRect();
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    splash.style.setProperty("--dock-x", `${dx}px`);
    splash.style.setProperty("--dock-y", `${dy}px`);
    splash.style.setProperty("--dock-scale", String(to.width / from.width));
  }
  splash.classList.add("splash--docking");
  return animationsFinished(splash);
}

export default function LoadingAnimation() {
  const splashRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const splash = splashRef.current;
    const [failsafe] = splash?.getAnimations() ?? [];
    // No failsafe animation means CSS is hiding the splash: a repeat visit in
    // this session, or the visitor prefers reduced motion.
    if (!splash || !failsafe) return;

    sessionStorage.setItem(STORAGE_KEY, "true");
    let active = true;

    const finishIntro = async () => {
      await animationsFinished(splash, failsafe);
      if (!active) return;
      // If hydration was slow enough that the CSS failsafe is already fading
      // the splash out, let it finish instead of restarting with a dock.
      if (hasStarted(failsafe)) await failsafe.finished;
      else await dockOntoHeaderLogo(splash, markRef.current);
      if (active) document.documentElement.classList.add(DONE_CLASS);
    };
    void finishIntro();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div ref={splashRef} className="splash" aria-hidden="true">
      <div className="splash__backdrop" />
      <div className="splash__stage">
        <svg ref={markRef} className="splash__mark" viewBox="0 0 40 40">
          <rect className="splash__tile" width="40" height="40" rx="8" />
          <path
            className="splash__stroke splash__bracket splash__bracket--left"
            d="M10 14L4 20L10 26"
          />
          <path
            className="splash__stroke splash__bracket splash__bracket--right"
            d="M30 14L36 20L30 26"
          />
          <path
            className="splash__stroke splash__letter"
            pathLength={1}
            d="M14 12V28"
          />
          <path
            className="splash__stroke splash__letter"
            pathLength={1}
            d="M14 12H20.5C23.5376 12 26 14.9101 26 18.5V21.5C26 25.0899 23.5376 28 20.5 28H14"
          />
          <rect
            className="splash__caret"
            x="17"
            y="18"
            width="2"
            height="4"
            rx="0.5"
          />
        </svg>
        <p className="splash__name">Davin Harding</p>
      </div>
    </div>
  );
}
