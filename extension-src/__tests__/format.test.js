import { describe, it, expect } from "vitest";
import {
  capitalize,
  normalizePhone,
  normalizeDateValue,
  fieldHasValue,
  VALUE_NORMALIZERS,
  OPTICAL_FORMATTERS,
} from "../content/utils/format.js";

/* ══════════════════════════════════════════════════════════════════════════
 *  capitalize
 * ══════════════════════════════════════════════════════════════════════════ */
describe("capitalize", () => {
  it("met en majuscule la premiere lettre", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("world")).toBe("World");
  });

  it("met le reste en minuscules", () => {
    expect(capitalize("HELLO")).toBe("Hello");
    expect(capitalize("hELLO")).toBe("Hello");
  });

  it("gere les chaines vides et null", () => {
    expect(capitalize("")).toBe("");
    expect(capitalize(null)).toBe("");
    expect(capitalize(undefined)).toBe("");
  });

  it("gere un seul caractere", () => {
    expect(capitalize("a")).toBe("A");
    expect(capitalize("A")).toBe("A");
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  normalizePhone
 * ══════════════════════════════════════════════════════════════════════════ */
describe("normalizePhone", () => {
  it("retourne un numero 10 chiffres tel quel", () => {
    expect(normalizePhone("0612345678")).toBe("0612345678");
  });

  it("convertit +33 en 0", () => {
    expect(normalizePhone("+33612345678")).toBe("0612345678");
  });

  it("convertit 0033 en 0", () => {
    expect(normalizePhone("0033612345678")).toBe("0612345678");
  });

  it("supprime les espaces, points et tirets", () => {
    expect(normalizePhone("06 12 34 56 78")).toBe("0612345678");
    expect(normalizePhone("06.12.34.56.78")).toBe("0612345678");
    expect(normalizePhone("06-12-34-56-78")).toBe("0612345678");
  });

  it("retourne vide si < 10 chiffres", () => {
    expect(normalizePhone("061234")).toBe("");
    expect(normalizePhone("12345")).toBe("");
  });

  it("tronque a 10 chiffres si > 10", () => {
    expect(normalizePhone("06123456789999")).toBe("0612345678");
  });

  it("gere les entrees vides", () => {
    expect(normalizePhone("")).toBe("");
    expect(normalizePhone(null)).toBe("");
    expect(normalizePhone(undefined)).toBe("");
  });

  it("gere les parentheses", () => {
    expect(normalizePhone("(+33)612345678")).toBe("0612345678");
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  normalizeDateValue
 * ══════════════════════════════════════════════════════════════════════════ */
describe("normalizeDateValue", () => {
  it("parse DD/MM/YYYY correctement", () => {
    var result = normalizeDateValue("15/07/1985");
    expect(result.display).toBe("15/07/1985");
    expect(result.iso).toBe("1985-07-15");
    expect(result.dd).toBe("15");
    expect(result.mm).toBe("07");
    expect(result.yyyy).toBe("1985");
  });

  it("parse ISO YYYY-MM-DD correctement", () => {
    var result = normalizeDateValue("1985-07-15");
    expect(result.display).toBe("15/07/1985");
    expect(result.iso).toBe("1985-07-15");
  });

  it("parse 8 chiffres bruts (YYYYMMDD)", () => {
    var result = normalizeDateValue("19850715");
    expect(result.display).toBe("15/07/1985");
    expect(result.iso).toBe("1985-07-15");
  });

  it("parse 8 chiffres bruts (DDMMYYYY)", () => {
    var result = normalizeDateValue("15071985");
    expect(result.display).toBe("15/07/1985");
    expect(result.iso).toBe("1985-07-15");
  });

  it("retourne la valeur brute si format non reconnu", () => {
    var result = normalizeDateValue("abc");
    expect(result.display).toBe("abc");
    expect(result.iso).toBe("abc");
    expect(result.dd).toBeUndefined();
  });

  it("gere null et vide", () => {
    var result = normalizeDateValue(null);
    expect(result.display).toBeNull();

    var result2 = normalizeDateValue("");
    expect(result2.display).toBe("");
  });

  it("gere les dates avec separateurs melanges", () => {
    /* "15-07-1985" ne matche pas DD/MM/YYYY (slashes) ni ISO (wrong order) */
    /* Les chiffres bruts = 15071985 (8 chiffres) → DDMMYYYY */
    var result = normalizeDateValue("15-07-1985");
    expect(result.dd).toBe("15");
    expect(result.mm).toBe("07");
    expect(result.yyyy).toBe("1985");
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  fieldHasValue
 * ══════════════════════════════════════════════════════════════════════════ */
describe("fieldHasValue", () => {
  it("retourne true si valeurs identiques", () => {
    var el = { value: "test" };
    expect(fieldHasValue(el, "test")).toBe(true);
  });

  it("retourne true si valeurs identiques apres strip digits", () => {
    var el = { value: "15/07/1985" };
    expect(fieldHasValue(el, "15071985")).toBe(true);
  });

  it("retourne false si champ vide", () => {
    var el = { value: "" };
    expect(fieldHasValue(el, "test")).toBe(false);
  });

  it("retourne false si valeurs differentes", () => {
    var el = { value: "abc" };
    expect(fieldHasValue(el, "xyz")).toBe(false);
  });

  it("gere les espaces", () => {
    var el = { value: " test " };
    expect(fieldHasValue(el, "test")).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  VALUE_NORMALIZERS
 * ══════════════════════════════════════════════════════════════════════════ */
describe("VALUE_NORMALIZERS", () => {
  describe("numeroSecuriteSociale", () => {
    it("retourne 15 chiffres par defaut", () => {
      var el = { getAttribute: () => null, placeholder: "" };
      var result = VALUE_NORMALIZERS.numeroSecuriteSociale("2 85 12 751 234 567 89", el);
      expect(result.replace(/\s/g, "").length).toBeLessThanOrEqual(15);
    });

    it("retourne 13 chiffres si maxlength=13", () => {
      var el = { getAttribute: (a) => a === "maxlength" ? "13" : null, placeholder: "" };
      var result = VALUE_NORMALIZERS.numeroSecuriteSociale("285127512345678", el);
      expect(result).toBe("2851275123456");
    });

    it("formate avec espaces si maxlength >= 19", () => {
      var el = { getAttribute: (a) => a === "maxlength" ? "20" : null, placeholder: "" };
      var result = VALUE_NORMALIZERS.numeroSecuriteSociale("285127512345678", el);
      expect(result).toContain(" ");
    });
  });

  describe("telephone", () => {
    it("retourne 10 chiffres bruts par defaut", () => {
      var el = { placeholder: "" };
      var result = VALUE_NORMALIZERS.telephone("0612345678", el);
      expect(result).toBe("0612345678");
    });

    it("formate avec espaces si placeholder contient des espaces", () => {
      var el = { placeholder: "06 12 34 56 78" };
      var result = VALUE_NORMALIZERS.telephone("0612345678", el);
      expect(result).toBe("06 12 34 56 78");
    });
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  OPTICAL_FORMATTERS
 * ══════════════════════════════════════════════════════════════════════════ */
describe("OPTICAL_FORMATTERS", () => {
  it("comma: remplace . par ,", () => {
    expect(OPTICAL_FORMATTERS.comma("-2.50")).toBe("-2,50");
  });

  it("no_plus: supprime le + initial", () => {
    expect(OPTICAL_FORMATTERS.no_plus("+1.50")).toBe("1.50");
    expect(OPTICAL_FORMATTERS.no_plus("-2.50")).toBe("-2.50");
  });

  it("absolute: supprime + et -", () => {
    expect(OPTICAL_FORMATTERS.absolute("+1.50")).toBe("1.50");
    expect(OPTICAL_FORMATTERS.absolute("-2.50")).toBe("2.50");
  });
});
