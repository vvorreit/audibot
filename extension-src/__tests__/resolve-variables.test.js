// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from "vitest";

/* ── Mock chrome + window globals needed by replay/index.js ────────── */

vi.stubGlobal("chrome", {
  storage: {
    local: { get: vi.fn(), set: vi.fn() },
  },
});

/* Mock functions referenced by replay/index.js but not needed for resolveVariables */
vi.stubGlobal("getSyncToken", vi.fn().mockResolvedValue(null));
vi.stubGlobal("readEncryptedCache", vi.fn().mockResolvedValue(null));
vi.stubGlobal("smartFillField", vi.fn().mockResolvedValue(true));
vi.stubGlobal("ultraFill", vi.fn());
vi.stubGlobal("smartSelectOption", vi.fn().mockReturnValue(true));
vi.stubGlobal("markFilledByOptiBot", vi.fn());
vi.stubGlobal("findElementBySelectors", vi.fn().mockResolvedValue(null));
vi.stubGlobal("waitForElement", vi.fn().mockResolvedValue(null));
vi.stubGlobal("logRPA", vi.fn());
vi.stubGlobal("showRPAToast", vi.fn());
vi.stubGlobal("showReplayControls", vi.fn());
vi.stubGlobal("sendHealthPing", vi.fn());

import { resolveVariables } from "../content/replay/index.js";

const mockCache = {
  current: {
    nom: "DUPONT",
    prenom: "Marie",
    numeroSecuriteSociale: "285127512345678",
    dateNaissance: "15/07/1985",
    phone: "0612345678",
    email: "marie@test.fr",
    address: "12 rue de la Paix",
    zipCode: "75001",
    city: "Paris",
    organisme: "Almerys",
    numeroAdherent: "ADH123456",
    numeroAMC: "AMC789",
    numeroTeletransmission: "TT001",
    ordonnance: {
      dateOrdonnance: "01/03/2026",
      nomOphtalmologue: "Dr Martin",
      rpps: "12345678901",
      lunettesOD: { sphere: "-2.50", cylindre: "-0.75", axe: "90", addition: "+1.50" },
      lunettesOG: { sphere: "-3.00", cylindre: "", axe: "", addition: "" },
    },
  },
};

describe("resolveVariables", () => {
  it("{{nom}} → retourne nom en majuscules", () => {
    expect(resolveVariables("{{nom}}", mockCache)).toBe("DUPONT");
  });

  it("{{prenom}} → retourne prénom", () => {
    expect(resolveVariables("{{prenom}}", mockCache)).toBe("Marie");
  });

  it("{{nss}} → retourne NSS formaté (15 chiffres par défaut)", () => {
    const result = resolveVariables("{{nss}}", mockCache, null);
    expect(result).toMatch(/^2851275123456(78)?$/);
  });

  it("{{dateOrdonnance}} → retourne date formatée", () => {
    expect(resolveVariables("{{dateOrdonnance}}", mockCache)).toBe("01/03/2026");
  });

  it("{{sphere_od}} → retourne valeur sphère OD", () => {
    expect(resolveVariables("{{sphere_od}}", mockCache)).toBe("-2.50");
  });

  it("{{cylindre_od}} → retourne valeur cylindre OD", () => {
    expect(resolveVariables("{{cylindre_od}}", mockCache)).toBe("-0.75");
  });

  it("{{axe_od}} → retourne valeur axe OD", () => {
    expect(resolveVariables("{{axe_od}}", mockCache)).toBe("90");
  });

  it("{{addition_od}} → retourne addition OD", () => {
    expect(resolveVariables("{{addition_od}}", mockCache)).toBe("+1.50");
  });

  it("{{sphere_og}} → retourne valeur sphère OG", () => {
    expect(resolveVariables("{{sphere_og}}", mockCache)).toBe("-3.00");
  });

  it("{{cylindre_og}} → retourne chaîne vide si non renseigné", () => {
    expect(resolveVariables("{{cylindre_og}}", mockCache)).toBe("");
  });

  it("variable inconnue {{unknown}} → retourne chaîne vide", () => {
    expect(resolveVariables("{{unknown}}", mockCache)).toBe("");
  });

  it("template null → retourne chaîne vide", () => {
    expect(resolveVariables(null, mockCache)).toBe("");
  });

  it("template undefined → retourne chaîne vide", () => {
    expect(resolveVariables(undefined, mockCache)).toBe("");
  });

  it("template vide → retourne chaîne vide", () => {
    expect(resolveVariables("", mockCache)).toBe("");
  });

  it("template avec multiples variables → toutes résolues", () => {
    const result = resolveVariables(
      "Bonjour {{nom}}, votre prénom est {{prenom}}",
      mockCache
    );
    expect(result).toBe("Bonjour DUPONT, votre prénom est Marie");
  });

  it("{{telephone}} → retourne le téléphone", () => {
    expect(resolveVariables("{{telephone}}", mockCache)).toBe("0612345678");
  });

  it("{{email}} → retourne l'email", () => {
    expect(resolveVariables("{{email}}", mockCache)).toBe("marie@test.fr");
  });

  it("{{organisme}} → retourne la mutuelle", () => {
    expect(resolveVariables("{{organisme}}", mockCache)).toBe("Almerys");
  });

  it("{{nomOphtalmologue}} → retourne le nom du médecin", () => {
    expect(resolveVariables("{{nomOphtalmologue}}", mockCache)).toBe("Dr Martin");
  });

  it("{{addition}} → retourne addition OD si renseignée", () => {
    expect(resolveVariables("{{addition}}", mockCache)).toBe("+1.50");
  });

  describe("NSS formatting", () => {
    it("NSS dans champ maxlength=13 → retourne 13 premiers chiffres (sans clé)", () => {
      const el = document.createElement("input");
      el.setAttribute("maxlength", "13");
      const result = resolveVariables("{{nss}}", mockCache, el);
      expect(result).toBe("2851275123456");
    });

    it("NSS dans champ maxlength=2 avec name contenant 'cle' → retourne clé (2 derniers)", () => {
      const el = document.createElement("input");
      el.setAttribute("maxlength", "2");
      el.name = "nss_cle";
      const result = resolveVariables("{{nss}}", mockCache, el);
      expect(result).toBe("78");
    });

    it("NSS 15 chiffres → formaté avec espaces si placeholder contient espaces", () => {
      const el = document.createElement("input");
      el.setAttribute("maxlength", "20");
      el.placeholder = "2 85 12 751 234 567 89";
      const result = resolveVariables("{{nss}}", mockCache, el);
      expect(result).toContain(" ");
      expect(result.replace(/\s/g, "")).toBe("285127512345678");
    });
  });

  describe("empty cache", () => {
    it("retourne chaîne vide si cache est vide", () => {
      expect(resolveVariables("{{nom}}", { current: {} })).toBe("");
    });

    it("retourne chaîne vide si cache.current est undefined", () => {
      expect(resolveVariables("{{nom}}", {})).toBe("");
    });
  });
});
