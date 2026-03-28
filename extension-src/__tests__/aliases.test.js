import { describe, it, expect } from "vitest";
import {
  PATIENT_ALIASES,
  MUTUELLE_ALIASES,
  ORDONNANCE_ALIASES,
  OPTICAL_OD_ALIASES,
  OPTICAL_OG_ALIASES,
  PEC_ALIASES,
  REJET_NOTE_ALIASES,
  buildScrapingAliases,
  buildPecAliases,
} from "../erp-bridge/aliases.js";

/* ══════════════════════════════════════════════════════════════════════════
 *  Structure des dictionnaires
 * ══════════════════════════════════════════════════════════════════════════ */
describe("alias dictionaries structure", () => {
  it("PATIENT_ALIASES contient les champs essentiels", () => {
    expect(PATIENT_ALIASES).toHaveProperty("nom");
    expect(PATIENT_ALIASES).toHaveProperty("prenom");
    expect(PATIENT_ALIASES).toHaveProperty("numeroSecuriteSociale");
    expect(PATIENT_ALIASES).toHaveProperty("dateNaissance");
    expect(PATIENT_ALIASES).toHaveProperty("telephone");
    expect(PATIENT_ALIASES).toHaveProperty("email");
    expect(PATIENT_ALIASES).toHaveProperty("adresse");
    expect(PATIENT_ALIASES).toHaveProperty("codePostal");
    expect(PATIENT_ALIASES).toHaveProperty("ville");
  });

  it("MUTUELLE_ALIASES contient organisme et adherent", () => {
    expect(MUTUELLE_ALIASES).toHaveProperty("organisme");
    expect(MUTUELLE_ALIASES).toHaveProperty("numeroAdherent");
  });

  it("ORDONNANCE_ALIASES contient rpps, date et ophtalmo", () => {
    expect(ORDONNANCE_ALIASES).toHaveProperty("rpps");
    expect(ORDONNANCE_ALIASES).toHaveProperty("dateOrdonnance");
    expect(ORDONNANCE_ALIASES).toHaveProperty("nomOphtalmologue");
  });

  it("OPTICAL_OD_ALIASES contient sphere, cylindre, axe, addition", () => {
    expect(OPTICAL_OD_ALIASES).toHaveProperty("lunettesOD.sphere");
    expect(OPTICAL_OD_ALIASES).toHaveProperty("lunettesOD.cylindre");
    expect(OPTICAL_OD_ALIASES).toHaveProperty("lunettesOD.axe");
    expect(OPTICAL_OD_ALIASES).toHaveProperty("lunettesOD.addition");
  });

  it("OPTICAL_OG_ALIASES est symetrique a OD", () => {
    expect(Object.keys(OPTICAL_OG_ALIASES).length).toBe(Object.keys(OPTICAL_OD_ALIASES).length);
    for (var key in OPTICAL_OD_ALIASES) {
      var ogKey = key.replace("OD", "OG");
      expect(OPTICAL_OG_ALIASES).toHaveProperty(ogKey);
    }
  });

  it("PEC_ALIASES contient accord, montant et date", () => {
    expect(PEC_ALIASES).toHaveProperty("numeroAccord");
    expect(PEC_ALIASES).toHaveProperty("montantPEC");
    expect(PEC_ALIASES).toHaveProperty("datePEC");
  });

  it("REJET_NOTE_ALIASES est un tableau non-vide", () => {
    expect(Array.isArray(REJET_NOTE_ALIASES)).toBe(true);
    expect(REJET_NOTE_ALIASES.length).toBeGreaterThan(10);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  Qualite des aliases
 * ══════════════════════════════════════════════════════════════════════════ */
describe("alias quality", () => {
  it("chaque champ patient a au moins 8 aliases", () => {
    for (var key in PATIENT_ALIASES) {
      expect(PATIENT_ALIASES[key].length, key + " devrait avoir >= 8 aliases").toBeGreaterThanOrEqual(8);
    }
  });

  it("chaque champ optique a au moins 10 aliases", () => {
    for (var key in OPTICAL_OD_ALIASES) {
      expect(OPTICAL_OD_ALIASES[key].length, key + " devrait avoir >= 10 aliases").toBeGreaterThanOrEqual(10);
    }
  });

  it("pas de doublons au sein d'un meme champ", () => {
    var allDicts = [PATIENT_ALIASES, MUTUELLE_ALIASES, ORDONNANCE_ALIASES, OPTICAL_OD_ALIASES, OPTICAL_OG_ALIASES, PEC_ALIASES];
    for (var d = 0; d < allDicts.length; d++) {
      for (var key in allDicts[d]) {
        var aliases = allDicts[d][key];
        var unique = new Set(aliases);
        expect(unique.size, key + " contient des doublons internes").toBe(aliases.length);
      }
    }
  });

  it("NSS a des aliases specifiques au domaine optique", () => {
    var nssAliases = PATIENT_ALIASES.numeroSecuriteSociale;
    expect(nssAliases).toContain("nss");
    expect(nssAliases).toContain("nir");
    expect(nssAliases).toContain("immatriculation");
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  Build functions
 * ══════════════════════════════════════════════════════════════════════════ */
describe("buildScrapingAliases", () => {
  it("merge tous les dictionnaires patient + mutuelle + ordonnance + optique", () => {
    var merged = buildScrapingAliases();
    expect(merged).toHaveProperty("nom");
    expect(merged).toHaveProperty("organisme");
    expect(merged).toHaveProperty("rpps");
    expect(merged).toHaveProperty("lunettesOD.sphere");
    expect(merged).toHaveProperty("lunettesOG.sphere");
  });

  it("ne modifie pas les dictionnaires originaux (copie)", () => {
    var merged = buildScrapingAliases();
    merged.nom.push("TEST_ALIAS");
    expect(PATIENT_ALIASES.nom).not.toContain("TEST_ALIAS");
  });

  it("contient au moins 30 champs", () => {
    var merged = buildScrapingAliases();
    expect(Object.keys(merged).length).toBeGreaterThanOrEqual(20);
  });
});

describe("buildPecAliases", () => {
  it("merge les aliases PEC", () => {
    var merged = buildPecAliases();
    expect(merged).toHaveProperty("numeroAccord");
    expect(merged).toHaveProperty("montantPEC");
    expect(merged).toHaveProperty("datePEC");
  });

  it("ne modifie pas PEC_ALIASES (copie)", () => {
    var merged = buildPecAliases();
    merged.numeroAccord.push("TEST_ALIAS");
    expect(PEC_ALIASES.numeroAccord).not.toContain("TEST_ALIAS");
  });
});
