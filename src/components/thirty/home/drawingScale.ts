export const NARROW_VIEWBOX_WIDTH = 300;

export const NARROWEST_CONTAINER_PX = 360 - 2 * 16;

export const MIN_TEXT_PX = 10;

export function renderedTextPx(fontSize: number, widthPx: number = NARROWEST_CONTAINER_PX): number {
  return (fontSize * widthPx) / NARROW_VIEWBOX_WIDTH;
}
