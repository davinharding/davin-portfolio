import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MIN_TEXT_PX, NARROWEST_CONTAINER_PX, renderedTextPx } from "../drawingScale";

const css = readFileSync(new URL("../../../../app/globals.css", import.meta.url), "utf8");

/** Every font-size set inside a .drafting-drawing--narrow rule. */
function narrowFontSizes(): number[] {
  const rules = [...css.matchAll(/([^{}]*\.drafting-drawing--narrow[^{}]*)\{([^}]*)\}/g)];
  return rules.flatMap(([, , body]) => [...body.matchAll(/font-size:\s*([\d.]+)px/g)].map((m) => Number(m[1])));
}

describe("the Drafting table's phone drawing", () => {
  it("sets its type in globals.css", () => {
    expect(narrowFontSizes().length).toBeGreaterThan(0);
  });

  it("renders no text below 10 px in the narrowest phone container", () => {
    // FM-25: at 360 px wide the base text rendered at 9.84 px.
    expect(NARROWEST_CONTAINER_PX).toBe(328);
    for (const size of narrowFontSizes()) {
      expect(renderedTextPx(size)).toBeGreaterThanOrEqual(MIN_TEXT_PX);
    }
  });
});
