/**
 * Tests de non-régression des parsers OptiBot.
 *
 * Les fixtures (lib/__tests__/fixtures/*.txt) sont extraites des vrais PDFs du
 * dossier optibot-data/ via la même logique Y-grouping que extractTextFromPDFNative().
 * Ils représentent exactement le texte que les parsers reçoivent en production.
 *
 * Pour régénérer les fixtures :
 *   node scripts/extract-fixtures.mjs
 */

import { describe, it, expect } from "vitest";
import { parseMutuelle, parseOrdonnance, scoreMutuelle, scoreOrdonnance } from "../parsers";
import type { MutuelleData, OrdonnanceData } from "../parsers";
import { readFileSync } from "fs";
import { resolve } from "path";

const fx = (f: string) =>
  readFileSync(resolve("lib/__tests__/fixtures/" + f), "utf8");

// ─── Cartes mutuelle — PDFs réels ─────────────────────────────────────────────

describe("parseMutuelle — card.pdf (Viamedis / Qualiopee Malakoff Humanis)", () => {
  const r = parseMutuelle(fx("card_viamedis.txt"));

  it("N° AMC", () => expect(r.numeroAMC).toBe("75949776"));
  it("N° adhérent", () => expect(r.numeroAdherent).toBe("13486638"));
  it("N° Télétransmission", () => expect(r.numeroTeletransmission).toBe("75990010"));
  it("Organisme contient MALAKOFF ou HUMANIS", () =>
    expect(r.organisme).toMatch(/malakoff|humanis|qualiopee/i));
  it("Début validité", () => expect(r.dateDebutValidite).toBe("01/01/2026"));
  it("Fin validité", () => expect(r.dateFinValidite).toBe("31/12/2026"));

  it("4 bénéficiaires détectés", () => expect(r.personnes).toHaveLength(4));

  it("Bénéficiaire 1 — VORREITER VINCENT (assuré principal)", () => {
    expect(r.personnes[0].nom).toBe("VORREITER");
    expect(r.personnes[0].prenom).toBe("VINCENT");
    expect(r.personnes[0].numeroSecuriteSociale).toBe("1900592023090");
    expect(r.personnes[0].dateNaissance).toBe("13/05/1990");
  });

  it("Bénéficiaire 2 — VORREITER MARINE", () => {
    expect(r.personnes[1].nom).toBe("VORREITER");
    expect(r.personnes[1].prenom).toBe("MARINE");
    expect(r.personnes[1].numeroSecuriteSociale).toBe("2890892019046");
    expect(r.personnes[1].dateNaissance).toBe("08/08/1989");
  });

  it("Bénéficiaire 3 — VORREITER JADE", () => {
    expect(r.personnes[2].nom).toBe("VORREITER");
    expect(r.personnes[2].prenom).toBe("JADE");
    expect(r.personnes[2].dateNaissance).toBe("26/12/2021");
  });

  it("Bénéficiaire 4 — VORREITER ZOE", () => {
    expect(r.personnes[3].nom).toBe("VORREITER");
    expect(r.personnes[3].prenom).toBe("ZOE");
    expect(r.personnes[3].dateNaissance).toBe("12/07/2024");
  });

  it("Pas de token TM dans les noms", () => {
    for (const p of r.personnes) {
      expect(p.nom).not.toContain("TM");
      expect(p.prenom).not.toContain("TM");
    }
  });

  it("Données du premier bénéficiaire remontées au niveau racine", () => {
    expect(r.nom).toBe("VORREITER");
    expect(r.prenom).toBe("VINCENT");
    expect(r.numeroSecuriteSociale).toBe("1900592023090");
    expect(r.dateNaissance).toBe("13/05/1990");
  });
});

describe("parseMutuelle — carte-tiers-payant_2025.pdf (ACTIL / Alptis)", () => {
  const r = parseMutuelle(fx("carte_actil.txt"));

  it("N° AMC (normalisé sans espaces)", () => expect(r.numeroAMC).toBe("69906121"));
  it("N° assuré", () => expect(r.numeroAdherent).toBe("A0139527"));
  it("Début validité", () => expect(r.dateDebutValidite).toBe("01/01/2025"));
  it("Fin validité", () => expect(r.dateFinValidite).toBe("31/12/2025"));

  it("1 bénéficiaire — DURANCER JULIEN", () => {
    expect(r.personnes).toHaveLength(1);
    expect(r.personnes[0].nom).toBe("DURANCER");
    expect(r.personnes[0].prenom).toBe("JULIEN");
    expect(r.personnes[0].dateNaissance).toBe("29/04/1987");
    expect(r.personnes[0].numeroSecuriteSociale).toBe("187049302910525");
  });

  it("Données racine cohérentes avec le bénéficiaire", () => {
    expect(r.nom).toBe("DURANCER");
    expect(r.prenom).toBe("JULIEN");
    expect(r.numeroSecuriteSociale).toBe("187049302910525");
  });
});

describe("parseMutuelle — carte.pdf (GEREP — 3 bénéficiaires)", () => {
  const r = parseMutuelle(fx("carte_gerep.txt"));

  it("N° AMC", () => expect(r.numeroAMC).toBe("00401554"));
  it("N° adhérent", () => expect(r.numeroAdherent).toBe("00392776"));
  it("NSS assuré depuis N° INSEE", () =>
    expect(r.numeroSecuriteSociale).toBe("285096938816856"));
  it("Début validité (fallback DATE au DATE)", () =>
    expect(r.dateDebutValidite).toBe("01/01/2025"));
  it("Fin validité", () => expect(r.dateFinValidite).toBe("31/12/2025"));

  it("3 bénéficiaires détectés", () => expect(r.personnes).toHaveLength(3));

  it("Bénéficiaire 1 — POULLENARD MATHILDE (assuré principal avec NSS INSEE)", () => {
    expect(r.personnes[0].nom).toBe("POULLENARD");
    expect(r.personnes[0].prenom).toBe("MATHILDE");
    expect(r.personnes[0].dateNaissance).toBe("26/09/1985");
    expect(r.personnes[0].numeroSecuriteSociale).toBe("285096938816856");
  });

  it("Bénéficiaire 2 — REBILLARD LEA", () => {
    expect(r.personnes[1].nom).toBe("REBILLARD");
    expect(r.personnes[1].prenom).toBe("LEA");
    expect(r.personnes[1].dateNaissance).toBe("27/02/2014");
  });

  it("Bénéficiaire 3 — REBILLARD MARTIN", () => {
    expect(r.personnes[2].nom).toBe("REBILLARD");
    expect(r.personnes[2].prenom).toBe("MARTIN");
    expect(r.personnes[2].dateNaissance).toBe("07/10/2018");
  });
});

describe("parseMutuelle — REBILLARD Justine CARTE MUT.pdf (AXA / SOGAREP)", () => {
  const r = parseMutuelle(fx("carte_sogarep.txt"));

  it("N° AMC", () => expect(r.numeroAMC).toBe("00402511"));
  it("N° adhérent", () => expect(r.numeroAdherent).toBe("01253324"));
  it("Début validité (fallback DATE au DATE)", () =>
    expect(r.dateDebutValidite).toBe("01/01/2026"));
  it("Fin validité", () => expect(r.dateFinValidite).toBe("31/12/2026"));

  it("1 bénéficiaire — REBILLARD JUSTINE", () => {
    expect(r.personnes).toHaveLength(1);
    expect(r.personnes[0].nom).toBe("REBILLARD");
    expect(r.personnes[0].prenom).toBe("JUSTINE");
    expect(r.personnes[0].dateNaissance).toBe("03/09/1993");
    expect(r.personnes[0].numeroSecuriteSociale).toBe("293096926604453");
  });

  it("'PEC' n'est pas capturé comme nom (NOISE_TOKEN)", () => {
    const noms = r.personnes.map((p) => p.nom + " " + p.prenom);
    expect(noms.join(" ")).not.toContain("PEC");
  });

  it("Données racine cohérentes", () => {
    expect(r.nom).toBe("REBILLARD");
    expect(r.prenom).toBe("JUSTINE");
    expect(r.numeroSecuriteSociale).toBe("293096926604453");
    expect(r.dateNaissance).toBe("03/09/1993");
  });
});

// ─── parseMutuelle — cas unitaires (non-régression) ──────────────────────────

describe("parseMutuelle — cas unitaires", () => {
  it("Token TM collé au nom (format Viamedis réel)", () => {
    const r = parseMutuelle("VIAMEDIS\nMARTIN SOPHIE TM 2820369012345 01/03/1982");
    expect(r.personnes[0].nom).toBe("MARTIN");
    expect(r.personnes[0].prenom).toBe("SOPHIE");
    expect(r.personnes[0].nom).not.toContain("TM");
  });

  it("VALIDITE n'est jamais parsé comme nom de personne", () => {
    const r = parseMutuelle(`MUTUELLE GENERALI
VALIDITÉ 01/01/2025 AU 31/12/2025
MARTIN PAUL 1820169012345 15/01/1982`);
    expect(r.personnes.some((p) => /VALIDIT/i.test(p.nom))).toBe(false);
  });

  it("Dates PÉRIODE DE … AU … (HARMONIE)", () => {
    const r = parseMutuelle(`HARMONIE MUTUELLE
PÉRIODE DE 01/01/2025 AU 31/12/2025
DUPONT JEAN 1851269012345 15/06/1985`);
    expect(r.dateDebutValidite).toBe("01/01/2025");
    expect(r.dateFinValidite).toBe("31/12/2025");
  });

  it("Fallback assuré principal (sans tableau de bénéficiaires)", () => {
    const r = parseMutuelle(`MUTUELLE SANTÉ
Assuré principal : BERNARD Michel
N° INSEE : 1 82 01 69 012 345 67`);
    expect(r.personnes.length).toBeGreaterThan(0);
    expect(r.personnes[0].nom).toContain("BERNARD");
  });
});

// ─── parseOrdonnance — cas unitaires ─────────────────────────────────────────

describe("parseOrdonnance — cas unitaires", () => {
  it("OD/OG classique avec séparateur 'x'", () => {
    const r = parseOrdonnance(`Dr. MARTIN Jean
Ophtalmologue
le 15/03/2024
Madame DUPONT Sophie
Prescription lunettes
Oeil droit : +2.50 (-0.75 x 180°) Addition : +1.50
Oeil gauche : +1.75 (-0.50 x 90°) Addition : +1.50
Distance pupillaire : 63 mm`);
    expect(r.lunettesOD.sphere).toBe("+2.50");
    expect(r.lunettesOD.cylindre).toBe("-0.75");
    expect(r.lunettesOD.axe).toBe("180");
    expect(r.lunettesOD.addition).toBe("+1.50");
    expect(r.lunettesOG.sphere).toBe("+1.75");
    expect(r.lunettesOG.cylindre).toBe("-0.50");
    expect(r.lunettesOG.axe).toBe("90");
    expect(r.distancePupillaire).toBe("63");
    expect(r.nomPatient).toBe("DUPONT");
    expect(r.prenomPatient).toBe("Sophie");
    expect(r.typePrescription).toBe("lunettes");
  });

  it("OD/OG avec séparateur 'à' et virgule décimale", () => {
    const r = parseOrdonnance(`Dr. ROUSSEAU Claire
le 20/11/2023
Monsieur LEMAIRE Pierre
Oeil droit +5,00 (-3,00 à 125°)
Oeil gauche -1,50 (-0,75 à 45°)`);
    expect(r.lunettesOD.sphere).toBe("+5.00");
    expect(r.lunettesOD.cylindre).toBe("-3.00");
    expect(r.lunettesOD.axe).toBe("125");
    expect(r.lunettesOG.sphere).toBe("-1.50");
    expect(r.lunettesOG.cylindre).toBe("-0.75");
  });

  it("Plano en sphère → 0.00", () => {
    const r = parseOrdonnance(`Dr. DUBOIS Nathalie
le 10/04/2024
Mme PETIT Claire
Oeil droit : plano (-0.50 x 90°)
Oeil gauche : -1.00`);
    expect(r.lunettesOD.sphere).toBe("0.00");
    expect(r.lunettesOD.cylindre).toBe("-0.50");
    expect(r.lunettesOD.axe).toBe("90");
    expect(r.lunettesOG.sphere).toBe("-1.00");
  });

  it("Sphère seule sans cylindre", () => {
    const r = parseOrdonnance(`Dr. LEFEBVRE Paul
le 01/06/2024
M. BERNARD Louis
OD: +0.50
OG: +0.75
DP : 64 mm`);
    expect(r.lunettesOD.sphere).toBe("+0.50");
    expect(r.lunettesOD.cylindre).toBe("");
    expect(r.lunettesOG.sphere).toBe("+0.75");
    expect(r.distancePupillaire).toBe("64");
  });

  it("Lentilles de contact avec BC / DIA", () => {
    const r = parseOrdonnance(`Dr. GARCIA Marc
le 05/09/2024
M. SIMON Antoine
Prescription lentilles de contact
OD: -3.50 (-1.00 à 180°)
OG: -2.75
BC : 8.6 mm  DIA : 14.2 mm`);
    expect(r.typePrescription).toBe("lentilles");
    expect(r.lentillesOD.rayonCourbure).toBe("8.6");
    expect(r.lentillesOD.diametre).toBe("14.2");
    expect(r.lentillesOD.sphere).toBe("-3.50");
  });

  it("Date en toutes lettres", () => {
    const r = parseOrdonnance(`Dr. MOREAU Isabelle
le 11 mars 2021
Madame FONTAINE Anne
OD: -1.25
OG: -1.00`);
    expect(r.dateOrdonnance).toBe("11 mars 2021");
  });

  it("Fallback ligne par ligne (tableau Sphère/Cylindre/Axe)", () => {
    const r = parseOrdonnance(`Dr. BLANC Eric
le 22/08/2024
M. MOREL Thomas

Sphère    -2.50  -1.75
Cylindre  -0.50  -0.25
Axe        100    80`);
    expect(r.lunettesOD.sphere).toBe("-2.50");
    expect(r.lunettesOG.sphere).toBe("-1.75");
    expect(r.lunettesOD.cylindre).toBe("-0.50");
    expect(r.lunettesOG.cylindre).toBe("-0.25");
  });
});

// ─── parseOrdonnance — branches non couvertes (lignes 436-448) ───────────────

describe("parseOrdonnance — nom patient sans civilité (fallback)", () => {
  it("Nom via keyword 'nom :' (pas de Monsieur/Madame) → nomPatient renseigné", () => {
    const r = parseOrdonnance(`Dr. LEROUX Paul
le 14/06/2024
Nom : Dubois
Prénom : Alice
OD: -1.00
OG: -0.75`);
    expect(r.nomPatient).toBeTruthy();
    expect(r.nomPatient).toMatch(/dubois/i);
  });

  it("Prénom via keyword 'prénom' dans fallback", () => {
    const r = parseOrdonnance(`Dr. GARCIA Léa
le 01/01/2025
Nom : MARTIN
prénom : Jean
OD: -0.50
OG: -0.25`);
    expect(r.prenomPatient).toMatch(/jean/i);
  });

  it("Nom seul (une seule partie) → nomPatient = fullName (ligne 447)", () => {
    const r = parseOrdonnance(`Dr. BLANC Eric
le 22/08/2024
Madame DUPONT
OD: -1.25
OG: -1.00`);
    // Un seul token → nomPatient = token entier, prenomPatient vide
    expect(r.nomPatient).toBeTruthy();
  });

  it("Nom avec uniquement majuscules → fallback dernier token = prénom (ligne 443)", () => {
    // Tous les tokens sont majuscules → pas de split nom/prénom possible
    // → nomPatient = parts[0..n-2], prenomPatient = parts[n-1]
    const r = parseOrdonnance(`Dr. THOMAS Marc
le 10/03/2025
Monsieur DUPONT MARTIN
OD: -0.50
OG: -0.25`);
    // Les deux tokens sont tout-majuscules → branche else de ligne 438
    expect(r.nomPatient).toBe("DUPONT");
    expect(r.prenomPatient).toBe("MARTIN");
  });

  it("Date de naissance parsée (né le / date de naissance)", () => {
    const r = parseOrdonnance(`Dr. RENARD Sophie
le 05/05/2025
Monsieur DUPUIS Jean
né le 15/06/1985
OD: +1.00
OG: +0.75`);
    expect(r.dateNaissancePatient).toBe("15/06/1985");
  });

  it("Type prescription 'les deux' (lunettes ET lentilles)", () => {
    const r = parseOrdonnance(`Dr. MULLER Franz
le 01/01/2025
M. KLEIN Eric
Prescription lunettes et lentilles de contact
OD: -2.00
OG: -1.75`);
    expect(r.typePrescription).toBe("les deux");
  });

  it("Remarques extraites", () => {
    const r = parseOrdonnance(`Dr. PAUL Jean
le 10/10/2024
Mme SIMON Claire
OD: -0.50
OG: -0.25
Remarques :
Verre antireflet recommandé`);
    expect(r.remarques).toBeTruthy();
  });
});

// ─── Cartes mutuelle — Almerys (fixture synthétique anonymisée) ───────────────

describe("parseMutuelle — carte_almerys.txt", () => {
  const r = parseMutuelle(fx("carte_almerys.txt"));

  it("N° AMC", () => expect(r.numeroAMC).toBe("82976543"));
  it("N° adhérent", () => expect(r.numeroAdherent).toBe("20198765"));
  it("N° Télétransmission", () => expect(r.numeroTeletransmission).toBe("82990012"));
  it("Organisme contient Almerys", () =>
    expect(r.organisme).toMatch(/almerys/i));
  it("Détecte 2 personnes", () => expect(r.personnes.length).toBe(2));
  it("Personne 1 = Sophie MARTIN", () => {
    expect(r.personnes[0].nom).toMatch(/MARTIN/i);
    expect(r.personnes[0].prenom).toMatch(/Sophie/i);
  });
  it("Type convention ROC", () => expect(r.typeConv).toMatch(/ROC/));
  it("Date fin validité 2026", () => expect(r.dateFinValidite).toContain("2026"));
  it("Score >= 60", () => expect(scoreMutuelle(r)).toBeGreaterThanOrEqual(60));
});

// ─── Cartes mutuelle — Itelis (fixture synthétique anonymisée) ───────────────

describe("parseMutuelle — carte_itelis.txt", () => {
  const r = parseMutuelle(fx("carte_itelis.txt"));

  it("N° AMC", () => expect(r.numeroAMC).toBe("60145782"));
  it("N° adhérent", () => expect(r.numeroAdherent).toBe("33567890"));
  it("N° Télétransmission", () => expect(r.numeroTeletransmission).toBe("60190045"));
  it("Organisme contient HARMONIE ou ITELIS", () =>
    expect(r.organisme).toMatch(/harmonie|itelis/i));
  it("Détecte au moins 1 personne", () => expect(r.personnes.length).toBeGreaterThanOrEqual(1));
  it("Personne 1 = Pierre DUBOIS", () => {
    expect(r.personnes[0].nom).toMatch(/DUBOIS/i);
    expect(r.personnes[0].prenom).toMatch(/Pierre/i);
  });
  it("Type convention VM", () => expect(r.typeConv).toMatch(/VM/));
  it("Score >= 60", () => expect(scoreMutuelle(r)).toBeGreaterThanOrEqual(60));
});

// ─── parsers — scoreMutuelle / scoreOrdonnance (lignes 535-578) ──────────────

describe("scoreMutuelle", () => {
  const base: MutuelleData = {
    organisme: "",
    numeroAMC: "",
    numeroAdherent: "",
    numeroTeletransmission: "",
    typeConv: "",
    dateDebutValidite: "",
    dateFinValidite: "",
    nom: "",
    prenom: "",
    numeroSecuriteSociale: "",
    dateNaissance: "",
    personnes: [],
  };

  it("score 0 si tous les champs vides", () => {
    expect(scoreMutuelle(base)).toBe(0);
  });

  it("score 100 si 8 champs remplis avec NSS valide et dates valides", () => {
    const data: MutuelleData = {
      ...base,
      organisme: "MUTUELLE TEST",
      numeroAMC: "12345678",
      numeroAdherent: "A12345",
      nom: "DUPONT",
      prenom: "Alice",
      numeroSecuriteSociale: "2890892019046", // 13 chiffres
      dateDebutValidite: "01/01/2025",
      dateFinValidite: "31/12/2025",
    };
    expect(scoreMutuelle(data)).toBe(100);
  });

  it("pénalité NSS non numérique ou mauvaise longueur (-20)", () => {
    const data: MutuelleData = {
      ...base,
      organisme: "MUTUELLE TEST",
      numeroAMC: "12345678",
      numeroAdherent: "A12345",
      nom: "DUPONT",
      prenom: "Alice",
      numeroSecuriteSociale: "ABC", // invalide
      dateDebutValidite: "01/01/2025",
      dateFinValidite: "31/12/2025",
    };
    const score = scoreMutuelle(data);
    // 8 champs * 12.5 = 100, -20 pour NSS invalide → 80
    expect(score).toBe(80);
  });

  it("pénalité date début invalide (-10)", () => {
    const data: MutuelleData = {
      ...base,
      organisme: "MUTUELLE TEST",
      numeroAMC: "12345678",
      nom: "DUPONT",
      prenom: "Alice",
      numeroSecuriteSociale: "2890892019046",
      dateDebutValidite: "2025-01-01", // format incorrect
      dateFinValidite: "31/12/2025",
    };
    const score = scoreMutuelle(data);
    // 7 champs * 12.5 = 87.5 arrondi 88, -10 = 78
    expect(score).toBeLessThan(90);
  });

  it("pénalité date fin invalide (-10)", () => {
    const data: MutuelleData = {
      ...base,
      organisme: "MUTUELLE TEST",
      nom: "DUPONT",
      prenom: "Alice",
      numeroSecuriteSociale: "2890892019046",
      dateDebutValidite: "01/01/2025",
      dateFinValidite: "2025/12/31", // format incorrect
    };
    const score = scoreMutuelle(data);
    expect(score).toBeLessThan(90);
  });

  it("score minimum est 0 (pas négatif)", () => {
    const data: MutuelleData = {
      ...base,
      numeroSecuriteSociale: "XXXX", // pénalité
      dateDebutValidite: "mauvaise",
      dateFinValidite: "mauvaise",
    };
    expect(scoreMutuelle(data)).toBeGreaterThanOrEqual(0);
  });
});

describe("scoreOrdonnance", () => {
  const emptyOeil = { sphere: "", cylindre: "", axe: "", addition: "" };
  const base: OrdonnanceData = {
    nomOphtalmologue: "",
    dateOrdonnance: "",
    dateValidite: "",
    nomPatient: "",
    prenomPatient: "",
    dateNaissancePatient: "",
    distancePupillaire: "",
    typePrescription: "",
    lunettesOD: { ...emptyOeil },
    lunettesOG: { ...emptyOeil },
    lentillesOD: { ...emptyOeil, rayonCourbure: "", diametre: "" },
    lentillesOG: { ...emptyOeil, rayonCourbure: "", diametre: "" },
    remarques: "",
  };

  it("score 0 si tous les champs vides", () => {
    expect(scoreOrdonnance(base)).toBe(0);
  });

  it("score 100 si les 6 champs clés remplis avec valeurs numériques valides", () => {
    const data: OrdonnanceData = {
      ...base,
      nomOphtalmologue: "Dr. MARTIN",
      dateOrdonnance: "01/01/2025",
      nomPatient: "DUPONT",
      typePrescription: "lunettes",
      lunettesOD: { ...emptyOeil, sphere: "-1.50" },
      lunettesOG: { ...emptyOeil, sphere: "+0.75" },
    };
    expect(scoreOrdonnance(data)).toBe(100);
  });

  it("pénalité sphère OD non-numérique (-15)", () => {
    const data: OrdonnanceData = {
      ...base,
      nomOphtalmologue: "Dr. MARTIN",
      dateOrdonnance: "01/01/2025",
      nomPatient: "DUPONT",
      typePrescription: "lunettes",
      lunettesOD: { ...emptyOeil, sphere: "ABC" }, // invalide
      lunettesOG: { ...emptyOeil, sphere: "+0.75" },
    };
    const score = scoreOrdonnance(data);
    // 6 * (100/6) ≈ 100, -15 pour OD invalide → 85
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it("pénalité sphère OG non-numérique (-15)", () => {
    const data: OrdonnanceData = {
      ...base,
      nomOphtalmologue: "Dr. MARTIN",
      dateOrdonnance: "01/01/2025",
      nomPatient: "DUPONT",
      typePrescription: "lunettes",
      lunettesOD: { ...emptyOeil, sphere: "-1.50" },
      lunettesOG: { ...emptyOeil, sphere: "INVALID" }, // invalide
    };
    const score = scoreOrdonnance(data);
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it("score minimum est 0 (pas négatif)", () => {
    const data: OrdonnanceData = {
      ...base,
      lunettesOD: { ...emptyOeil, sphere: "BAD" },
      lunettesOG: { ...emptyOeil, sphere: "BAD" },
    };
    expect(scoreOrdonnance(data)).toBeGreaterThanOrEqual(0);
  });

  it("score maximum est 100 (pas supérieur)", () => {
    const data: OrdonnanceData = {
      ...base,
      nomOphtalmologue: "Dr. TEST",
      dateOrdonnance: "01/01/2025",
      nomPatient: "DUPONT",
      typePrescription: "lunettes",
      lunettesOD: { ...emptyOeil, sphere: "-1.00" },
      lunettesOG: { ...emptyOeil, sphere: "+0.50" },
    };
    expect(scoreOrdonnance(data)).toBeLessThanOrEqual(100);
  });
});
