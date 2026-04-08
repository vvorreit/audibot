/**
 * Tests — safeCompare (timing-safe string comparison)
 */
import { describe, it, expect } from "vitest";
import { safeCompare } from "@/lib/safeCompare";

describe("safeCompare", () => {
  it("returns true for identical strings", () => {
    expect(safeCompare("secret123", "secret123")).toBe(true);
  });

  it("returns true for empty strings (both empty)", () => {
    expect(safeCompare("", "")).toBe(true);
  });

  it("returns false for different strings of same length", () => {
    expect(safeCompare("abcdef", "abcdeg")).toBe(false);
  });

  it("returns false when strings have different lengths", () => {
    expect(safeCompare("short", "longer-string")).toBe(false);
  });

  it("returns false when first string is empty", () => {
    expect(safeCompare("", "notempty")).toBe(false);
  });

  it("returns false when second string is empty", () => {
    expect(safeCompare("notempty", "")).toBe(false);
  });

  it("handles special characters correctly", () => {
    expect(safeCompare("!@#$%^&*()", "!@#$%^&*()")).toBe(true);
    expect(safeCompare("!@#$%^&*()", "!@#$%^&*(!")).toBe(false);
  });

  it("handles unicode characters", () => {
    expect(safeCompare("caf\u00e9", "caf\u00e9")).toBe(true);
    expect(safeCompare("caf\u00e9", "cafe")).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(safeCompare("Secret", "secret")).toBe(false);
  });

  it("handles long strings", () => {
    const long = "a".repeat(10000);
    expect(safeCompare(long, long)).toBe(true);
    expect(safeCompare(long, long + "b")).toBe(false);
  });
});
