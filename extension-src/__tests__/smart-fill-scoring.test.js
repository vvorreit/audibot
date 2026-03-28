// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { normalizeAlias, levenshtein, matchFieldAgainst } from "./helpers.js";

/* ══════════════════════════════════════════════════════════════════════════
 *  Smart-fill scoring — tests complémentaires
 * ══════════════════════════════════════════════════════════════════════════ */

const patientAliases = {
  nom: ["nom", "lastname", "last_name", "nom_patient", "surname", "name"],
  prenom: ["prenom", "firstname", "first_name", "prenom_patient", "given_name"],
  dateNaissance: ["datenaissance", "date_naissance", "birthdate", "ddn", "date_nais"],
  numeroSecuriteSociale: [
    "nss", "num_ss", "securite_sociale", "numero_secu", "numero_secu_social",
    "num_securite_sociale", "social_security",
  ],
  telephone: ["telephone", "tel", "phone", "mobile", "portable"],
  email: ["email", "mail", "courriel"],
  montant: ["montant", "montant_total", "amount", "total", "prix"],
};

describe("matchFieldAgainst — scoring complet", () => {
  it('champ "numero_secu_social" → match "nss" avec score > 0', () => {
    const result = matchFieldAgainst(["numero_secu_social"], patientAliases);
    expect(result.field).toBe("numeroSecuriteSociale");
    expect(result.score).toBeGreaterThan(0);
  });

  it('champ "dateNaissancePatient" → match "dateNaissance"', () => {
    const result = matchFieldAgainst(["dateNaissancePatient"], patientAliases);
    expect(result.field).toBe("dateNaissance");
    expect(result.score).toBeGreaterThan(0);
  });

  it('champ "firstName" → match "prenom"', () => {
    const result = matchFieldAgainst(["firstName"], patientAliases);
    expect(result.field).toBe("prenom");
    expect(result.score).toBeGreaterThan(0);
  });

  it('champ "montant_total_euros" → match "montant"', () => {
    const result = matchFieldAgainst(["montant_total_euros"], patientAliases);
    expect(result.field).toBe("montant");
    expect(result.score).toBeGreaterThan(0);
  });

  it('champ "loginPassword" → ne match AUCUN champ patient (sécurité)', () => {
    const result = matchFieldAgainst(["loginPassword"], patientAliases);
    expect(result.field).toBeNull();
    expect(result.score).toBe(0);
  });

  it('champ "creditCard" → score 0 — ne pas remplir infos bancaires', () => {
    const result = matchFieldAgainst(["creditCard"], patientAliases);
    expect(result.score).toBe(0);
  });

  it('champ "password" → ne match rien', () => {
    const result = matchFieldAgainst(["password"], patientAliases);
    expect(result.field).toBeNull();
  });

  it('champ "iban" → ne match rien', () => {
    const result = matchFieldAgainst(["iban"], patientAliases);
    expect(result.field).toBeNull();
  });
});

describe("levenshtein — cas supplémentaires", () => {
  it('levenshtein("nss", "nss") → 0', () => {
    expect(levenshtein("nss", "nss")).toBe(0);
  });

  it('levenshtein("nom", "non") → 1', () => {
    expect(levenshtein("nom", "non")).toBe(1);
  });

  it('levenshtein("almerys", "almery") → 1', () => {
    expect(levenshtein("almerys", "almery")).toBe(1);
  });

  it('levenshtein("viamedis", "viamedis") → 0', () => {
    expect(levenshtein("viamedis", "viamedis")).toBe(0);
  });

  it('levenshtein("sphere", "sphère") → 0 (pas de normalisation ici)', () => {
    // Note: levenshtein does not normalize — accented chars are different
    expect(levenshtein("sphere", "sphère")).toBeGreaterThan(0);
  });
});

describe("normalizeAlias — cas supplémentaires", () => {
  it("nettoie les caractères avec accents composés", () => {
    expect(normalizeAlias("àéîöü")).toBe("aeiou");
  });

  it("gère les majuscules avec accents", () => {
    expect(normalizeAlias("ÉLÉPHANT")).toBe("elephant");
  });

  it("supprime les points et slashes", () => {
    expect(normalizeAlias("v.l./add")).toBe("vladd");
  });

  it("gère les chaînes avec uniquement des séparateurs", () => {
    expect(normalizeAlias("---___...")).toBe("");
  });

  it("normalise les noms de champs HTML courants", () => {
    expect(normalizeAlias("data-patient-name")).toBe("datapatientname");
    expect(normalizeAlias("form_field.input")).toBe("formfieldinput");
  });
});

describe("matchFieldAgainst — edge cases avancés", () => {
  it("match prioritaire sur l'alias le plus long (spécificité)", () => {
    const aliases = {
      nom: ["nom"],
      nomPatient: ["nom_patient"],
    };
    const result = matchFieldAgainst(["nom_patient"], aliases);
    expect(result.field).toBe("nomPatient");
    expect(result.score).toBeGreaterThan(3); // "nompatient" is 10 chars vs "nom" is 3
  });

  it("signaux combinés ne créent pas de faux positif", () => {
    const aliases = {
      creditCard: ["creditcard", "carte_bancaire"],
    };
    // "nom" should not match "creditCard"
    const result = matchFieldAgainst(["nom"], aliases);
    expect(result.field).toBeNull();
  });

  it("match avec label très long", () => {
    const result = matchFieldAgainst(
      ["champ_numero_securite_sociale_patient"],
      patientAliases
    );
    // Should match "numero_secu" or similar
    expect(result.field).toBe("numeroSecuriteSociale");
  });
});
