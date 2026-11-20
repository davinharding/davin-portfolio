import { describe, expect, it } from "vitest";
import { abandonRun } from "../runControl";

describe("abandonRun", () => {
  it("aborts the request, frees the form, and marks the run so its aborted stream shows no error", () => {
    const controller = new AbortController();
    const refs = { abort: { current: controller }, cancelled: { current: false }, busy: { current: true } };
    abandonRun(refs);
    expect(controller.signal.aborted).toBe(true);
    // FM-09: the back-forward cache restore once aborted without this mark, and the
    // aborted stream then showed "Lost the connection" instead of a fresh form.
    expect(refs.cancelled.current).toBe(true);
    expect(refs.busy.current).toBe(false);
  });

  it("is safe when no request has started", () => {
    const refs = { abort: { current: null }, cancelled: { current: false }, busy: { current: false } };
    expect(() => abandonRun(refs)).not.toThrow();
    expect(refs.cancelled.current).toBe(true);
  });
});
