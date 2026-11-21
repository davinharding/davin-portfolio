// How large the Drafting table's phone drawing renders. Its type is set in globals.css
// (.drafting-drawing--narrow); the test beside this file checks the two stay in step.

/** The narrow drawing's viewBox width, in drawing units. */
export const NARROW_VIEWBOX_WIDTH = 300;

/** The narrowest container it is drawn in: a 360 px phone less the 16 px page gutters. */
export const NARROWEST_CONTAINER_PX = 360 - 2 * 16;

/** No text in the drawing may render smaller than this on a phone. */
export const MIN_TEXT_PX = 10;

/** Rendered size, in CSS pixels, of text set at `fontSize` drawing units in a container `widthPx` wide. */
export function renderedTextPx(fontSize: number, widthPx: number = NARROWEST_CONTAINER_PX): number {
  return (fontSize * widthPx) / NARROW_VIEWBOX_WIDTH;
}
