import { describe, it, expect } from "vitest";
import { validateLuhnNSS, isUnder18, getOuvrantDroitNSS } from "../content/utils/nss.js";

/* ══════════════════════════════════════════════════════════════════════════
 *  validateLuhnNSS
 * ══════════════════════════════════════════════════════════════════════════ */
describe("validateLuhnNSS", () => {
  /* Calculer une cle valide pour un NSS de base */
  function computeKey(base13) {
    var num = parseInt(base13, 10);
    return String(97 - (num % 97)).padStart(2, "0");
  }

  it("valide un NSS de 15 chiffres avec cle correcte", () => {
    var base = "2851275123456";
    var nss = base + computeKey(base);
    expect(validateLuhnNSS(nss)).toBe(true);
  });

  it("valide un NSS de 13 chiffres (sans cle)", () => {
    expect(validateLuhnNSS("2851275123456")).toBe(true);
  });

  it("refuse un NSS trop court (< 13 chiffres)", () => {
    expect(validateLuhnNSS("285127")).toBe(false);
    expect(validateLuhnNSS("12345")).toBe(false);
    expect(validateLuhnNSS("")).toBe(false);
  });

  it("refuse null et undefined", () => {
    expect(validateLuhnNSS(null)).toBe(false);
    expect(validateLuhnNSS(undefined)).toBe(false);
  });

  it("refuse un NSS avec cle incorrecte", () => {
    expect(validateLuhnNSS("285127512345699")).toBe(false);
  });

  it("gere les NSS avec espaces", () => {
    var base = "2851275123456";
    var cle = computeKey(base);
    var spaced = "2 85 12 75 123 456 " + cle;
    expect(validateLuhnNSS(spaced)).toBe(true);
  });

  /* ── Corse — BUG FIX: 2A/2B doivent etre traites correctement ────── */
  it("valide un NSS Corse 2A (Corse-du-Sud)", () => {
    /* 1 88 2A 123 456 → remplace 2A par 19 → 1881912345613 (13 chiffres) */
    var base = "1881912345613";
    expect(base.length).toBe(13);
    /* Verifier que la version avec 2A passe aussi */
    expect(validateLuhnNSS("1882A12345613")).toBe(true);
  });

  it("valide un NSS Corse 2B (Haute-Corse)", () => {
    /* 2B → 18 */
    expect(validateLuhnNSS("1882B12345613")).toBe(true);
  });

  it("gere 2a et 2b en minuscules", () => {
    expect(validateLuhnNSS("1882a12345613")).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  isUnder18
 * ══════════════════════════════════════════════════════════════════════════ */
describe("isUnder18", () => {
  it("retourne true pour un bebe ne cette annee", () => {
    var now = new Date();
    var dob = "01/01/" + now.getFullYear();
    expect(isUnder18(dob)).toBe(true);
  });

  it("retourne false pour un adulte ne en 1985", () => {
    expect(isUnder18("15/07/1985")).toBe(false);
  });

  it("retourne false pour un adulte (format ISO)", () => {
    expect(isUnder18("1985-07-15")).toBe(false);
  });

  it("retourne true pour un mineur (format ISO)", () => {
    var now = new Date();
    var recent = now.getFullYear() - 10;
    expect(isUnder18(recent + "-06-15")).toBe(true);
  });

  it("retourne false pour une date invalide", () => {
    expect(isUnder18("pas-une-date")).toBe(false);
    expect(isUnder18("")).toBe(false);
  });

  it("gere un enfant de 17 ans", () => {
    var now = new Date();
    var dob = "01/01/" + (now.getFullYear() - 17);
    expect(isUnder18(dob)).toBe(true);
  });

  it("gere un adulte de 18 ans revolu", () => {
    var now = new Date();
    var dob = "01/01/" + (now.getFullYear() - 19);
    expect(isUnder18(dob)).toBe(false);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  getOuvrantDroitNSS
 * ══════════════════════════════════════════════════════════════════════════ */
describe("getOuvrantDroitNSS", () => {
  var now = new Date();
  var minorDOB = "01/01/" + (now.getFullYear() - 5);
  var adultDOB = "01/01/1980";

  it("retourne le NSS du beneficiaire si adulte", () => {
    var result = getOuvrantDroitNSS("185012345678901", adultDOB, []);
    expect(result).toBe("185012345678901");
  });

  it("retourne le NSS du beneficiaire si pas de personnes", () => {
    var result = getOuvrantDroitNSS("185012345678901", minorDOB, null);
    expect(result).toBe("185012345678901");
  });

  it("retourne le NSS du beneficiaire si une seule personne", () => {
    var result = getOuvrantDroitNSS("185012345678901", minorDOB, [{ numeroSecuriteSociale: "185012345678901" }]);
    expect(result).toBe("185012345678901");
  });

  it("retourne le NSS de la mere pour un mineur", () => {
    var personnes = [
      { numeroSecuriteSociale: "185012345678901", dateNaissance: minorDOB },
      { numeroSecuriteSociale: "280017512345678", dateNaissance: adultDOB },
    ];
    var result = getOuvrantDroitNSS("185012345678901", minorDOB, personnes);
    expect(result).toBe("280017512345678");
  });

  it("fallback au premier adulte si pas de mere (NSS commencant par 2)", () => {
    var personnes = [
      { numeroSecuriteSociale: "185012345678901", dateNaissance: minorDOB },
      { numeroSecuriteSociale: "180017512345678", dateNaissance: adultDOB },
    ];
    var result = getOuvrantDroitNSS("185012345678901", minorDOB, personnes);
    expect(result).toBe("180017512345678");
  });
});
