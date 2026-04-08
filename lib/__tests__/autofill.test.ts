/**
 * Tests — autofill (payload generation)
 *
 * Donnees fictives uniquement.
 */
import { describe, it, expect } from "vitest";
import { generatePayloadString } from "@/lib/autofill";
import type { AutofillPayload } from "@/lib/autofill";

describe("generatePayloadString", () => {
  it("generates valid JSON", () => {
    const payload: AutofillPayload = {};
    const result = generatePayloadString(payload);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it("includes empty mutuelle/ordonnance when not provided", () => {
    const result = JSON.parse(generatePayloadString({}));
    expect(result.m).toEqual({});
    expect(result.o).toEqual({});
    expect(result.syncToken).toBe("");
  });

  it("includes syncToken when provided", () => {
    const result = JSON.parse(
      generatePayloadString({ syncToken: "tok-abc-123" })
    );
    expect(result.syncToken).toBe("tok-abc-123");
  });

  it("includes mutuelle data", () => {
    const mutuelle = {
      organisme: "MUTUELLE TEST",
      numeroAMC: "12345678",
      numeroAdherent: "A123",
      numeroTeletransmission: "",
      typeConv: "",
      dateDebutValidite: "01/01/2025",
      dateFinValidite: "31/12/2025",
      nom: "DUPONT",
      prenom: "Alice",
      numeroSecuriteSociale: "2890892019046",
      dateNaissance: "08/08/1989",
      personnes: [],
    };
    const result = JSON.parse(generatePayloadString({ mutuelle }));
    expect(result.m.organisme).toBe("MUTUELLE TEST");
    expect(result.m.numeroAMC).toBe("12345678");
    expect(result.m.nom).toBe("DUPONT");
  });

  it("includes ordonnance data", () => {
    const emptyOeil = { sphere: "", cylindre: "", axe: "", addition: "" };
    const ordonnance = {
      nomOphtalmologue: "Dr. MARTIN",
      rpps: "",
      adeli: "",
      dateOrdonnance: "01/01/2025",
      dateValidite: "",
      nomPatient: "DUPONT",
      prenomPatient: "Alice",
      dateNaissancePatient: "",
      distancePupillaire: "63",
      typePrescription: "lunettes" as const,
      lunettesOD: { ...emptyOeil, sphere: "-1.50" },
      lunettesOG: { ...emptyOeil, sphere: "+0.75" },
      lentillesOD: { ...emptyOeil, rayonCourbure: "", diametre: "" },
      lentillesOG: { ...emptyOeil, rayonCourbure: "", diametre: "" },
      remarques: "",
    };
    const result = JSON.parse(generatePayloadString({ ordonnance }));
    expect(result.o.nomOphtalmologue).toBe("Dr. MARTIN");
    expect(result.o.lunettesOD.sphere).toBe("-1.50");
  });

  it("includes both mutuelle and ordonnance together", () => {
    const payload: AutofillPayload = {
      mutuelle: {
        organisme: "MUT",
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
      },
      ordonnance: {
        nomOphtalmologue: "Dr. X",
        rpps: "",
        adeli: "",
        dateOrdonnance: "",
        dateValidite: "",
        nomPatient: "",
        prenomPatient: "",
        dateNaissancePatient: "",
        distancePupillaire: "",
        typePrescription: "",
        lunettesOD: { sphere: "", cylindre: "", axe: "", addition: "" },
        lunettesOG: { sphere: "", cylindre: "", axe: "", addition: "" },
        lentillesOD: { sphere: "", cylindre: "", axe: "", addition: "", rayonCourbure: "", diametre: "" },
        lentillesOG: { sphere: "", cylindre: "", axe: "", addition: "", rayonCourbure: "", diametre: "" },
        remarques: "",
      },
      syncToken: "tok-xyz",
    };
    const result = JSON.parse(generatePayloadString(payload));
    expect(result.m.organisme).toBe("MUT");
    expect(result.o.nomOphtalmologue).toBe("Dr. X");
    expect(result.syncToken).toBe("tok-xyz");
  });

  it("defaults syncToken to empty string when undefined", () => {
    const result = JSON.parse(
      generatePayloadString({ syncToken: undefined })
    );
    expect(result.syncToken).toBe("");
  });

  it("returns a string (not an object)", () => {
    expect(typeof generatePayloadString({})).toBe("string");
  });
});
