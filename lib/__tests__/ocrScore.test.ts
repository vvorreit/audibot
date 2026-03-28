/**
 * Tests unitaires — computeScore (lib/ocrScore.ts)
 * Données fictives uniquement. Aucune donnée santé patient réelle.
 */
import { describe, it, expect } from "vitest";
import { computeScore } from "../ocrScore";

describe("computeScore — données complètes → score élevé", () => {
  it("100% OCR confidence + 100% data score → score élevé (level=high)", () => {
    const result = computeScore(100, 100);
    expect(result.ocrConfidence).toBe(100);
    expect(result.dataScore).toBe(100);
    expect(result.globalScore).toBe(100);
    expect(result.level).toBe("high");
  });

  it("90% OCR + 95% data → score >= 80 (level=high)", () => {
    const result = computeScore(90, 95);
    // globalScore = round(90*0.3 + 95*0.7) = round(27 + 66.5) = 94
    expect(result.globalScore).toBe(94);
    expect(result.level).toBe("high");
  });

  it("80% OCR + 80% data → score = 80, level=high (limite exacte)", () => {
    const result = computeScore(80, 80);
    // globalScore = round(80*0.3 + 80*0.7) = round(24 + 56) = 80
    expect(result.globalScore).toBe(80);
    expect(result.level).toBe("high");
  });
});

describe("computeScore — données vides → score bas", () => {
  it("0% OCR + 0% data → score = 0 (level=low)", () => {
    const result = computeScore(0, 0);
    expect(result.ocrConfidence).toBe(0);
    expect(result.dataScore).toBe(0);
    expect(result.globalScore).toBe(0);
    expect(result.level).toBe("low");
  });

  it("10% OCR + 10% data → score faible (level=low)", () => {
    const result = computeScore(10, 10);
    // globalScore = round(10*0.3 + 10*0.7) = round(3 + 7) = 10
    expect(result.globalScore).toBe(10);
    expect(result.level).toBe("low");
  });

  it("0% OCR + 30% data → score bas (level=low)", () => {
    const result = computeScore(0, 30);
    // globalScore = round(0*0.3 + 30*0.7) = round(21) = 21
    expect(result.globalScore).toBe(21);
    expect(result.level).toBe("low");
  });
});

describe("computeScore — données partielles → score intermédiaire", () => {
  it("50% OCR + 60% data → score medium", () => {
    const result = computeScore(50, 60);
    // globalScore = round(50*0.3 + 60*0.7) = round(15 + 42) = 57
    expect(result.globalScore).toBe(57);
    expect(result.level).toBe("medium");
  });

  it("70% OCR + 50% data → score medium", () => {
    const result = computeScore(70, 50);
    // globalScore = round(70*0.3 + 50*0.7) = round(21 + 35) = 56
    expect(result.globalScore).toBe(56);
    expect(result.level).toBe("medium");
  });

  it("limite basse medium = 50 (level=medium)", () => {
    // On cherche combo donnant exactement 50
    // round(x*0.3 + y*0.7) = 50
    // Ex: x=50, y=50 → 15+35=50
    const result = computeScore(50, 50);
    expect(result.globalScore).toBe(50);
    expect(result.level).toBe("medium");
  });

  it("score 49 → level=low (juste sous la limite medium)", () => {
    const result = computeScore(50, 49);
    // globalScore = round(50*0.3 + 49*0.7) = round(15 + 34.3) = round(49.3) = 49
    expect(result.globalScore).toBe(49);
    expect(result.level).toBe("low");
  });

  it("score 79 → level=medium (juste sous la limite high)", () => {
    const result = computeScore(79, 79);
    // globalScore = round(79*0.3 + 79*0.7) = round(23.7 + 55.3) = round(79) = 79
    expect(result.globalScore).toBe(79);
    expect(result.level).toBe("medium");
  });
});

describe("computeScore — structure de retour", () => {
  it("retourne les 4 champs attendus", () => {
    const result = computeScore(75, 85);
    expect(result).toHaveProperty("ocrConfidence");
    expect(result).toHaveProperty("dataScore");
    expect(result).toHaveProperty("globalScore");
    expect(result).toHaveProperty("level");
  });

  it("globalScore est un entier arrondi", () => {
    const result = computeScore(33, 66);
    // globalScore = round(33*0.3 + 66*0.7) = round(9.9 + 46.2) = round(56.1) = 56
    expect(Number.isInteger(result.globalScore)).toBe(true);
  });

  it("level est bien l'une des trois valeurs autorisées", () => {
    const levels = ["high", "medium", "low"];
    expect(levels).toContain(computeScore(90, 90).level);
    expect(levels).toContain(computeScore(60, 60).level);
    expect(levels).toContain(computeScore(10, 10).level);
  });
});
