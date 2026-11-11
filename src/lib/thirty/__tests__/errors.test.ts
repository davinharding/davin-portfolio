import { describe, expect, it } from "vitest";
import { ERROR_CODES, ERRORS, codeFromSorryParam, errorMessage, errorStatus, sorryParam } from "../errors";

describe("errors table", () => {
  it.each(ERROR_CODES)("%s has a status, a message, next steps, and a /sorry param", (code) => {
    const status = errorStatus(code);
    expect(status).toBeGreaterThanOrEqual(400);
    expect(status).toBeLessThan(600);
    expect(errorMessage(code).length).toBeGreaterThan(10);
    expect(errorMessage(code)).not.toContain("{host}");
    expect(ERRORS[code].next.length).toBeGreaterThan(0);
    const param = sorryParam(code);
    expect(param).toMatch(/^[a-z-]+$/);
    expect(codeFromSorryParam(param)).toBe(code);
  });

  it("substitutes the host where the message mentions it", () => {
    expect(errorMessage("unreachable", "acme.com")).toBe("I could not find a website at acme.com. Check the spelling.");
    expect(errorMessage("not_a_company")).toMatch(/^That address does not look/);
  });

  it("rejects unknown sorry params", () => {
    expect(codeFromSorryParam("nope")).toBeNull();
  });
});
