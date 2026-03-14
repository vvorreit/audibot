import { describe, it, expect } from "vitest";
import { parseMutuelle, parseOrdonnance } from "../parsers";

// ─── parseMutuelle ────────────────────────────────────────────────────────────

describe("parseMutuelle", () => {
  it("Viamedis / Qualiopee – NSS compact sur la même ligne (fmt1)", () => {
    const text = `
QUALIOPEE
N° AMC : 69 9 0612 1
N° Teletransmission : 123456789
DUPONT JEAN 1851269012345 15/06/1985
DUPONT MARIE 2870469098765 07/04/1987
PÉRIODE DE 01/01/2025 AU 31/12/2025
`;
    const r = parseMutuelle(text);
    expect(r.numeroAMC).toBeTruthy();
    expect(r.numeroAMC.replace(/\s/g, "")).toBe("6990612 1".replace(/\s/g, ""));
    expect(r.numeroTeletransmission).toBe("123456789");
    expect(r.personnes).toHaveLength(2);
    expect(r.personnes[0].nom).toBe("DUPONT");
    expect(r.personnes[0].prenom).toBe("JEAN");
    expect(r.personnes[0].numeroSecuriteSociale).toBe("1851269012345");
    expect(r.personnes[1].nom).toBe("DUPONT");
    expect(r.personnes[1].prenom).toBe("MARIE");
    expect(r.dateDebutValidite).toBe("01/01/2025");
    expect(r.dateFinValidite).toBe("31/12/2025");
  });

  it("Viamedis – filtre le token TM collé au nom (format réel carte)", () => {
    const text = `
VIAMEDIS
MARTIN SOPHIE TM 2820369012345 01/03/1982
`;
    const r = parseMutuelle(text);
    expect(r.personnes).toHaveLength(1);
    expect(r.personnes[0].nom).toBe("MARTIN");
    expect(r.personnes[0].prenom).toBe("SOPHIE");
    expect(r.personnes[0].nom).not.toContain("TM");
  });

  it("ACTIL / Alptis – NSS sur ligne suivante avec code arbitraire (fmt2b)", () => {
    const text = `
ACTIL
N° adhérent : AB12345
DURANCER BEATRICE
A001 01/04/1980 2 2 80 04 33012 345 67
PÉRIODE DE 01/01/2025 AU 31/12/2025
`;
    const r = parseMutuelle(text);
    expect(r.numeroAdherent).toBe("AB12345");
    expect(r.personnes.length).toBeGreaterThan(0);
    expect(r.personnes[0].nom).toBe("DURANCER");
    expect(r.personnes[0].prenom).toBe("BEATRICE");
    expect(r.personnes[0].dateNaissance).toBe("01/04/1980");
    expect(r.dateDebutValidite).toBe("01/01/2025");
    expect(r.dateFinValidite).toBe("31/12/2025");
  });

  it("AXA / SOGAREP – NSS avec rang sur ligne suivante (fmt2)", () => {
    const text = `
AXA SOGAREP
REBILLARD JUSTINE
15/04/1975 1 2 75 04 33012 345 67
VALIDITÉ 31/12/2025
`;
    const r = parseMutuelle(text);
    expect(r.organisme).toMatch(/axa|sogarep/i);
    expect(r.personnes.length).toBeGreaterThan(0);
    const p = r.personnes[0];
    expect(p.nom).toBe("REBILLARD");
    expect(p.prenom).toBe("JUSTINE");
    expect(p.dateNaissance).toBe("15/04/1975");
    expect(p.numeroSecuriteSociale).toMatch(/^2/);
    expect(r.dateFinValidite).toBe("31/12/2025");
  });

  it("Blacklist – VALIDITE n'est jamais parsé comme un nom de personne", () => {
    const text = `
MUTUELLE GENERALI
VALIDITÉ 01/01/2025 AU 31/12/2025
MARTIN PAUL 1820169012345 15/01/1982
`;
    const r = parseMutuelle(text);
    const hasValidite = r.personnes.some((p) => /VALIDIT/i.test(p.nom));
    expect(hasValidite).toBe(false);
  });

  it("Fallback assuré principal quand aucune personne détectée", () => {
    const text = `
MUTUELLE SANTÉ
Assuré principal : BERNARD Michel
N° INSEE : 1 82 01 69 012 345 67
`;
    const r = parseMutuelle(text);
    expect(r.personnes.length).toBeGreaterThan(0);
    expect(r.personnes[0].nom).toContain("BERNARD");
  });

  it("Dates de validité – format PÉRIODE DE … AU …", () => {
    const text = `HARMONIE MUTUELLE
PÉRIODE DE 01/01/2025 AU 31/12/2025
DUPONT JEAN 1851269012345 15/06/1985`;
    const r = parseMutuelle(text);
    expect(r.dateDebutValidite).toBe("01/01/2025");
    expect(r.dateFinValidite).toBe("31/12/2025");
  });
});

// ─── parseOrdonnance (Prescription ORL) ──────────────────────────────────────

describe("parseOrdonnance — Prescription ORL", () => {
  it("Format OD/OG classique avec audiogramme par oreille", () => {
    const text = `
Dr. MARTIN Jean
ORL
RPPS : 12345678901
le 15/03/2024
Madame DUPONT Sophie née le 12/05/1965

Oreille droite :
250Hz : 45dB  500Hz : 55dB  1000Hz : 65dB  2000Hz : 70dB  4000Hz : 75dB

Oreille gauche :
250Hz : 40dB  500Hz : 50dB  1000Hz : 60dB  2000Hz : 65dB  4000Hz : 70dB

Classe 2 — Type : RIC
`;
    const r = parseOrdonnance(text);
    expect(r.nomORL).toContain("MARTIN");
    expect(r.rpps).toBe("12345678901");
    expect(r.datePrescription).toBe("15/03/2024");
    expect(r.nomPatient).toBe("DUPONT");
    expect(r.prenomPatient).toBe("Sophie");
    expect(r.dateNaissancePatient).toBe("12/05/1965");
    expect(r.oreilleDroite.hz250).toBe("45");
    expect(r.oreilleDroite.hz1000).toBe("65");
    expect(r.oreilleDroite.hz4000).toBe("75");
    expect(r.oreilleGauche.hz500).toBe("50");
    expect(r.oreilleGauche.hz2000).toBe("65");
    expect(r.classeAppareillage).toBe("2");
    expect(r.typeAppareillage).toBe("RIC");
  });

  it("Classe 1 / 100% Santé détectée automatiquement", () => {
    const text = `
Dr. DUPUIS Paul — ORL
le 10/06/2024
M. BERNARD Louis
Oreille droite : 40 50 60 65 70
Oreille gauche : 35 45 55 60 65
Appareillage sans reste à charge — Classe 1
`;
    const r = parseOrdonnance(text);
    expect(r.classeAppareillage).toBe("1");
  });

  it("100% Santé détecté via phrase clé", () => {
    const text = `
Dr. LECLERC Marie
le 01/09/2024
Mme FONTAINE Anne
100% Santé — pas de dépassement d'honoraires
Oreille droite : 50 60 70 80 85
Oreille gauche : 45 55 65 75 80
`;
    const r = parseOrdonnance(text);
    expect(r.classeAppareillage).toBe("1");
  });

  it("Type BTE (contour d'oreille) détecté", () => {
    const text = `
Dr. PETIT Sophie
le 20/11/2023
M. LEMAIRE Pierre
Oreille droite : 60 70 75 80 85
Oreille gauche : 55 65 70 75 80
Contour d'oreille BTE préconisé
`;
    const r = parseOrdonnance(text);
    expect(r.typeAppareillage).toBe("BTE");
  });

  it("Type ITE (intra-auriculaire) détecté", () => {
    const text = `
Dr. MOREL Claire
le 05/04/2024
M. SIMON Antoine
Oreille droite : 30 40 50 55 60
Intra-auriculaire recommandé
`;
    const r = parseOrdonnance(text);
    expect(r.typeAppareillage).toBe("ITE");
  });

  it("Renouvellement détecté", () => {
    const text = `
Dr. BLANC Eric
le 22/08/2024
M. MOREL Thomas
Renouvellement de prescription — Classe 2
Oreille droite : 45 55 60 65 70
Oreille gauche : 40 50 58 63 68
`;
    const r = parseOrdonnance(text);
    expect(r.renouvellement).toBe(true);
  });

  it("Pas de renouvellement par défaut", () => {
    const text = `
Dr. ROUSSEAU Claire
le 10/03/2024
Mme MARTIN Isabelle
Première prescription
Oreille droite : 35 45 50 55 60
`;
    const r = parseOrdonnance(text);
    expect(r.renouvellement).toBe(false);
  });

  it("Fallback tableau à 2 lignes (OD puis OG)", () => {
    const text = `
Dr. GARCIA Marc
le 05/09/2024
M. HENRY Paul
OD : 50 60 70 75 80
OG : 45 55 65 70 75
`;
    const r = parseOrdonnance(text);
    // Le fallback lit les 2 premières séquences de 5 nombres
    expect(r.oreilleDroite.hz250).toBeTruthy();
    expect(r.oreilleGauche.hz250).toBeTruthy();
  });

  it("Date prescription en toutes lettres", () => {
    const text = `
Dr. MOREAU Isabelle
le 11 mars 2021
Madame FONTAINE Anne
Oreille droite : 40 50 60 65 70
`;
    const r = parseOrdonnance(text);
    expect(r.datePrescription).toBe("11 mars 2021");
  });

  it("RPPS extrait correctement", () => {
    const text = `
Dr. VERNET Paul — ORL — RPPS : 10003456789
le 01/01/2025
M. LEBRUN Victor
`;
    const r = parseOrdonnance(text);
    expect(r.rpps).toBe("10003456789");
  });
});
