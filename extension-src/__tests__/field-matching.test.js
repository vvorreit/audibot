import { describe, it, expect } from "vitest";
import { normalizeAlias, levenshtein, matchFieldAgainst } from "./helpers.js";

/* ══════════════════════════════════════════════════════════════════════════
 *  normalizeAlias
 * ══════════════════════════════════════════════════════════════════════════ */
describe("normalizeAlias", () => {
  it("lowercase et supprime les accents", () => {
    expect(normalizeAlias("Prénom")).toBe("prenom");
    expect(normalizeAlias("Numéro Sécurité Sociale")).toBe("numerosecuritesociale");
    expect(normalizeAlias("Complément")).toBe("complement");
    expect(normalizeAlias("Éléphant")).toBe("elephant");
  });

  it("supprime les séparateurs (espaces, tirets, underscores, points)", () => {
    expect(normalizeAlias("nom_patient")).toBe("nompatient");
    expect(normalizeAlias("nom-patient")).toBe("nompatient");
    expect(normalizeAlias("nom patient")).toBe("nompatient");
    expect(normalizeAlias("nom.patient")).toBe("nompatient");
    expect(normalizeAlias("nom/patient")).toBe("nompatient");
  });

  it("gère les inputs vides et null", () => {
    expect(normalizeAlias("")).toBe("");
    expect(normalizeAlias(null)).toBe("");
    expect(normalizeAlias(undefined)).toBe("");
  });

  it("gère le camelCase et les majuscules", () => {
    expect(normalizeAlias("nomPatient")).toBe("nompatient");
    expect(normalizeAlias("NOM_PATIENT")).toBe("nompatient");
    expect(normalizeAlias("PRÉNOM")).toBe("prenom");
  });

  it("gère les caractères spéciaux optiques", () => {
    expect(normalizeAlias("sphère_od")).toBe("sphereod");
    expect(normalizeAlias("Cylindre OG")).toBe("cylindreog");
    expect(normalizeAlias("addition_v.l.")).toBe("additionvl");
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  levenshtein
 * ══════════════════════════════════════════════════════════════════════════ */
describe("levenshtein", () => {
  it("retourne 0 pour des chaines identiques", () => {
    expect(levenshtein("nom", "nom")).toBe(0);
    expect(levenshtein("", "")).toBe(0);
    expect(levenshtein("abc123", "abc123")).toBe(0);
  });

  it("calcule la distance correcte pour des edits simples", () => {
    expect(levenshtein("nom", "noom")).toBe(1);    // insertion
    expect(levenshtein("nom", "non")).toBe(1);      // substitution
    expect(levenshtein("nom", "no")).toBe(1);       // suppression
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });

  it("gère les chaines vides", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });

  it("est symétrique", () => {
    expect(levenshtein("abc", "def")).toBe(levenshtein("def", "abc"));
    expect(levenshtein("nom", "prenom")).toBe(levenshtein("prenom", "nom"));
  });

  it("gère les chaines longues", () => {
    expect(levenshtein("numeroSecuriteSociale", "numeroSecuriteSocial")).toBe(1);
    expect(levenshtein("dateNaissance", "dateNaissanc")).toBe(1);
  });

  it("gère null et undefined", () => {
    expect(levenshtein(null, "abc")).toBe(3);
    expect(levenshtein("abc", null)).toBe(3);
    expect(levenshtein(null, null)).toBe(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  matchFieldAgainst
 * ══════════════════════════════════════════════════════════════════════════ */
describe("matchFieldAgainst", () => {
  var testAliases = {
    nom: ["nom", "lastname", "last_name", "nom_patient", "surname"],
    prenom: ["prenom", "firstname", "first_name", "prenom_patient"],
    dateNaissance: ["datenaissance", "date_naissance", "birthdate", "ddn"],
    numeroSecuriteSociale: ["nss", "num_ss", "securite_sociale", "numero_secu"],
    telephone: ["telephone", "tel", "phone", "mobile"],
  };

  it("matche un nom de champ exact", () => {
    var result = matchFieldAgainst(["nom"], testAliases);
    expect(result.field).toBe("nom");
  });

  it("matche un alias snake_case", () => {
    var result = matchFieldAgainst(["nom_patient"], testAliases);
    expect(result.field).toBe("nom");
  });

  it("matche un alias camelCase (via normalisation)", () => {
    var result = matchFieldAgainst(["prenomPatient"], testAliases);
    expect(result.field).toBe("prenom");
  });

  it("prefere l'alias le plus long (plus specifique)", () => {
    // "nom_patient" (10 chars normalisé) vs "nom" (3 chars)
    var result = matchFieldAgainst(["nom_patient"], testAliases);
    expect(result.score).toBeGreaterThan(3);
  });

  it("retourne null quand rien ne matche", () => {
    var result = matchFieldAgainst(["adresse_postale"], testAliases);
    expect(result.field).toBeNull();
    expect(result.score).toBe(0);
  });

  it("matche avec des signaux multiples", () => {
    var result = matchFieldAgainst(["input", "form-control", "date_naissance"], testAliases);
    expect(result.field).toBe("dateNaissance");
  });

  it("matche un alias court", () => {
    var result = matchFieldAgainst(["nss"], testAliases);
    expect(result.field).toBe("numeroSecuriteSociale");
  });

  it("matche avec des accents via normalisation", () => {
    var result = matchFieldAgainst(["Prénom"], testAliases);
    expect(result.field).toBe("prenom");
  });

  it("matche tel et telephone (alias court vs long)", () => {
    var resultTel = matchFieldAgainst(["tel"], testAliases);
    expect(resultTel.field).toBe("telephone");
    var resultFull = matchFieldAgainst(["telephone"], testAliases);
    expect(resultFull.field).toBe("telephone");
    expect(resultFull.score).toBeGreaterThan(resultTel.score);
  });

  it("gère un dictionnaire vide", () => {
    var result = matchFieldAgainst(["nom"], {});
    expect(result.field).toBeNull();
  });

  it("gère des signaux vides", () => {
    var result = matchFieldAgainst([], testAliases);
    expect(result.field).toBeNull();
  });
});
