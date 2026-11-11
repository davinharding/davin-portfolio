import type { ResolvedTheme } from "@/lib/theme";

// Decorative layer for the day/night reveal: a glowing horizon on the edge of
// the reveal, plus sunbeams for day or a field of stars for night. Styles are
// in globals.css under "Day/night reveal"; this only builds the elements.

const REVEAL_MS = 900;
const LIFETIME_MS = 2200;
const STAR_COUNT = 70;

let active: HTMLElement | null = null;

function el(className: string, style: Record<string, string> = {}) {
  const node = document.createElement("div");
  node.className = className;
  for (const [key, value] of Object.entries(style)) {
    node.style.setProperty(key, value);
  }
  return node;
}

function addStars(layer: HTMLElement, origin: { x: number; y: number }, radius: number) {
  const { innerWidth: w, innerHeight: h } = window;
  for (let i = 0; i < STAR_COUNT; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    // Each star lights up just as the edge of the night sweeps over it
    const reach = Math.hypot(x - origin.x, y - origin.y) / radius;
    const delay = Math.round(REVEAL_MS * Math.pow(reach, 0.8));
    layer.append(
      el("theme-fx__star", {
        left: `${x}px`,
        top: `${y}px`,
        "--size": `${(Math.random() * 1.8 + 1).toFixed(2)}px`,
        "--delay": `${delay}ms`,
        "--peak": (Math.random() * 0.5 + 0.5).toFixed(2),
      })
    );
  }
  layer.append(el("theme-fx__shooting-star"));
}

export function playThemeFx(
  theme: ResolvedTheme,
  origin: { x: number; y: number },
  radius: number
) {
  active?.remove();

  const layer = el(
    `theme-fx theme-fx--${theme === "light" ? "day" : "night"}`,
    {
      "--fx-x": `${origin.x}px`,
      "--fx-y": `${origin.y}px`,
      "--fx-r": `${radius}px`,
    }
  );
  layer.setAttribute("aria-hidden", "true");

  layer.append(el("theme-fx__horizon"));
  if (theme === "light") {
    layer.append(el("theme-fx__beams"), el("theme-fx__sun"));
  } else {
    addStars(layer, origin, radius);
  }

  document.body.append(layer);
  active = layer;
  window.setTimeout(() => {
    layer.remove();
    if (active === layer) active = null;
  }, LIFETIME_MS);
}
