import { describe, it, expect } from "vitest";
import { validateSelector } from "../selectorsSchema";

describe("selectorsSchema", () => {
  it("should validate a correct selector", () => {
    const input = {
      portal: "test.com",
      selectorName: "nomAdherent",
      selector: "#name",
    };
    const result = validateSelector(input);
    expect(result.success).toBe(true);
  });

  it("should fail on missing fields", () => {
    const input = {
      portal: "test.com",
    };
    const result = validateSelector(input);
    expect(result.success).toBe(false);
  });

  it("should fail on too short portal name", () => {
    const input = {
      portal: "a",
      selectorName: "nomAdherent",
      selector: "#name",
    };
    const result = validateSelector(input);
    expect(result.success).toBe(false);
  });

  it("should fail on too long selector", () => {
    const input = {
      portal: "test.com",
      selectorName: "nomAdherent",
      selector: "a".repeat(501),
    };
    const result = validateSelector(input);
    expect(result.success).toBe(false);
  });
});
