// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mock chrome + global functions needed by replay/index.js ──────── */

vi.stubGlobal("chrome", {
  storage: {
    local: { get: vi.fn(), set: vi.fn() },
  },
});

vi.stubGlobal("getSyncToken", vi.fn().mockResolvedValue(null));
vi.stubGlobal("readEncryptedCache", vi.fn().mockResolvedValue(null));
vi.stubGlobal("smartFillField", vi.fn().mockResolvedValue(true));
vi.stubGlobal("ultraFill", vi.fn());
vi.stubGlobal("smartSelectOption", vi.fn().mockReturnValue(true));
vi.stubGlobal("markFilledByAudiBot", vi.fn());
vi.stubGlobal("findElementBySelectors", vi.fn().mockResolvedValue(null));
vi.stubGlobal("waitForElement", vi.fn().mockResolvedValue(null));
vi.stubGlobal("logRPA", vi.fn());
vi.stubGlobal("showRPAToast", vi.fn());
vi.stubGlobal("showReplayControls", vi.fn());
vi.stubGlobal("sendHealthPing", vi.fn());

import { resolveVariables, replayState, setReplayState } from "../content/replay/index.js";

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
    critereSecondaire: "CS001",
    codeConvention: "CC01",
    dateDebutValidite: "01/01/2026",
    dateFinValidite: "31/12/2026",
    ordonnance: {
      dateOrdonnance: "01/03/2026",
      nomOphtalmologue: "Dr Martin",
      rpps: "12345678901",
      distancePupillaire: "63",
      typePrescription: "lunettes",
      lunettesOD: { sphere: "-2.50", cylindre: "-0.75", axe: "90", addition: "+1.50" },
      lunettesOG: { sphere: "-3.00", cylindre: "", axe: "", addition: "" },
      lentillesOD: { sphere: "-2.00", cylindre: "-0.50", axe: "85", addition: "", rayonCourbure: "8.6", diametre: "14.2" },
      lentillesOG: { sphere: "-2.75", cylindre: "", axe: "", addition: "", rayonCourbure: "8.6", diametre: "14.0" },
    },
  },
};

describe("resolveVariables — replay engine", () => {
  it('resolveVariables("{{nom}}", mockCache) → "DUPONT"', () => {
    expect(resolveVariables("{{nom}}", mockCache)).toBe("DUPONT");
  });

  it('resolveVariables("{{prenom}}", mockCache) → "Marie"', () => {
    expect(resolveVariables("{{prenom}}", mockCache)).toBe("Marie");
  });

  it('resolveVariables("{{nss}}", mockCache, null) → NSS formaté', () => {
    const result = resolveVariables("{{nss}}", mockCache, null);
    // Default formatting: 15 digits raw
    expect(result.replace(/\s/g, "")).toMatch(/^285127512345678$/);
  });

  it('resolveVariables("{{sphere_od}}", mockCache) → "-2.50"', () => {
    expect(resolveVariables("{{sphere_od}}", mockCache)).toBe("-2.50");
  });

  it('resolveVariables("{{cylindre_og}}", mockCache) → ""', () => {
    expect(resolveVariables("{{cylindre_og}}", mockCache)).toBe("");
  });

  it('resolveVariables("", mockCache) → ""', () => {
    expect(resolveVariables("", mockCache)).toBe("");
  });

  it('resolveVariables(null, mockCache) → ""', () => {
    expect(resolveVariables(null, mockCache)).toBe("");
  });

  it("template with multiple variables → all resolved", () => {
    const result = resolveVariables(
      "Bonjour {{nom}}, votre prénom est {{prenom}}",
      mockCache
    );
    expect(result).toBe("Bonjour DUPONT, votre prénom est Marie");
  });

  it('resolveVariables("{{champ_inconnu}}", mockCache) → ""', () => {
    expect(resolveVariables("{{champ_inconnu}}", mockCache)).toBe("");
  });

  /* ── Contact variables ─────────────────────────────────────────── */

  it("{{telephone}} → phone number", () => {
    expect(resolveVariables("{{telephone}}", mockCache)).toBe("0612345678");
  });

  it("{{email}} → email", () => {
    expect(resolveVariables("{{email}}", mockCache)).toBe("marie@test.fr");
  });

  it("{{adresse}} → address", () => {
    expect(resolveVariables("{{adresse}}", mockCache)).toBe("12 rue de la Paix");
  });

  it("{{codePostal}} → zip code", () => {
    expect(resolveVariables("{{codePostal}}", mockCache)).toBe("75001");
  });

  it("{{ville}} → city", () => {
    expect(resolveVariables("{{ville}}", mockCache)).toBe("Paris");
  });

  /* ── Mutuelle variables ─────────────────────────────────────── */

  it("{{organisme}} → organisme", () => {
    expect(resolveVariables("{{organisme}}", mockCache)).toBe("Almerys");
  });

  it("{{numeroAdherent}} → numero adherent", () => {
    expect(resolveVariables("{{numeroAdherent}}", mockCache)).toBe("ADH123456");
  });

  it("{{numeroAMC}} → AMC number", () => {
    expect(resolveVariables("{{numeroAMC}}", mockCache)).toBe("AMC789");
  });

  it("{{numeroTeletransmission}} → teletransmission number", () => {
    expect(resolveVariables("{{numeroTeletransmission}}", mockCache)).toBe("TT001");
  });

  /* ── Prescription variables ─────────────────────────────────── */

  it("{{dateOrdonnance}} → prescription date", () => {
    expect(resolveVariables("{{dateOrdonnance}}", mockCache)).toBe("01/03/2026");
  });

  it("{{nomOphtalmologue}} → doctor name", () => {
    expect(resolveVariables("{{nomOphtalmologue}}", mockCache)).toBe("Dr Martin");
  });

  it("{{rpps}} → RPPS number", () => {
    expect(resolveVariables("{{rpps}}", mockCache)).toBe("12345678901");
  });

  it("{{distancePupillaire}} → IPD", () => {
    expect(resolveVariables("{{distancePupillaire}}", mockCache)).toBe("63");
  });

  /* ── Optical variables ──────────────────────────────────────── */

  it("{{axe_od}} → 90", () => {
    expect(resolveVariables("{{axe_od}}", mockCache)).toBe("90");
  });

  it("{{addition_od}} → +1.50", () => {
    expect(resolveVariables("{{addition_od}}", mockCache)).toBe("+1.50");
  });

  it("{{addition}} → generic addition from OD", () => {
    expect(resolveVariables("{{addition}}", mockCache)).toBe("+1.50");
  });

  /* ── Lentilles variables ────────────────────────────────────── */

  it("{{sphere_lentille_od}} → -2.00", () => {
    expect(resolveVariables("{{sphere_lentille_od}}", mockCache)).toBe("-2.00");
  });

  it("{{rayon_od}} → 8.6", () => {
    expect(resolveVariables("{{rayon_od}}", mockCache)).toBe("8.6");
  });

  it("{{diametre_od}} → 14.2", () => {
    expect(resolveVariables("{{diametre_od}}", mockCache)).toBe("14.2");
  });

  it("{{diametre_og}} → 14.0", () => {
    expect(resolveVariables("{{diametre_og}}", mockCache)).toBe("14.0");
  });

  /* ── NSS formatting with element context ────────────────────── */

  describe("NSS formatting", () => {
    it("maxlength=13 → 13 digits (no key)", () => {
      const el = document.createElement("input");
      el.setAttribute("maxlength", "13");
      const result = resolveVariables("{{nss}}", mockCache, el);
      expect(result).toBe("2851275123456");
    });

    it("maxlength=2 + name contains 'cle' → key (last 2 digits)", () => {
      const el = document.createElement("input");
      el.setAttribute("maxlength", "2");
      el.name = "nss_cle";
      const result = resolveVariables("{{nss}}", mockCache, el);
      expect(result).toBe("78");
    });

    it("maxlength=2 + name contains 'key' → key (last 2 digits)", () => {
      const el = document.createElement("input");
      el.setAttribute("maxlength", "2");
      el.name = "nss_key";
      const result = resolveVariables("{{nss}}", mockCache, el);
      expect(result).toBe("78");
    });

    it("placeholder with spaced digits → formatted with spaces", () => {
      const el = document.createElement("input");
      el.placeholder = "1 23 45 67 890 123 45";
      el.setAttribute("maxlength", "20");
      const result = resolveVariables("{{nss}}", mockCache, el);
      expect(result).toBe("2 85 12 75 123 456 78");
    });

    it("name contains '13' → 13 digits", () => {
      const el = document.createElement("input");
      el.name = "nss13";
      const result = resolveVariables("{{nss}}", mockCache, el);
      expect(result).toBe("2851275123456");
    });

    it("no element → raw 15 digits", () => {
      const result = resolveVariables("{{nss}}", mockCache, null);
      expect(result).toBe("285127512345678");
    });
  });

  /* ── Extended patient variables ──────────────────────────────── */
  describe("extended patient variables", () => {
    const extCache = {
      current: {
        ...mockCache.current,
        nssOuvrantDroit: "185078511111111",
        rangBeneficiaire: "1",
        qualiteBeneficiaire: "Assure",
        codeOrganisme: "01",
        libelleOrganisme: "CPAM Paris",
        codeRegime: "01",
        numeroAccord: "ACC123",
        montantPEC: "150.00",
        montantPECVerres: "100.00",
        montantPECMonture: "50.00",
        dateAccord: "15/03/2026",
        codeGarantie: "G01",
        codeAcke: "ACK01",
        numeroDevis: "DEV001",
        dateDevis: "01/03/2026",
        montantTotal: "500.00",
        montantMonture: "200.00",
        montantVerres: "300.00",
        montantAMO: "50.00",
        montantAMC: "200.00",
        montantReste: "250.00",
        codeActe: "LPP1",
        nomMagasin: "Optique Centre",
        siretMagasin: "12345678901234",
        adresseMagasin: "1 rue Optique",
        codePostalMagasin: "75001",
        villeMagasin: "Paris",
        telephoneMagasin: "0145678901",
        numeroFiness: "FIN001",
        numeroAgreement: "AGR001",
        ordonnance: {
          ...mockCache.current.ordonnance,
          distancePupillaireOD: "31.5",
          distancePupillaireOG: "31.5",
          hauteurMontage: "20",
          hauteurMontageOD: "20",
          hauteurMontageOG: "19",
          lunettesOD: { ...mockCache.current.ordonnance.lunettesOD, prisme: "2", base: "180" },
          lunettesOG: { ...mockCache.current.ordonnance.lunettesOG, prisme: "1", base: "0" },
        },
      },
    };

    it("{{nssOuvrantDroit}} → NSS ouvrant droit", () => {
      expect(resolveVariables("{{nssOuvrantDroit}}", extCache)).toBe("185078511111111");
    });

    it("{{rangBeneficiaire}} → rang", () => {
      expect(resolveVariables("{{rangBeneficiaire}}", extCache)).toBe("1");
    });

    it("{{codeOrganisme}} → code organisme", () => {
      expect(resolveVariables("{{codeOrganisme}}", extCache)).toBe("01");
    });

    it("{{numeroAccord}} → accord number", () => {
      expect(resolveVariables("{{numeroAccord}}", extCache)).toBe("ACC123");
    });

    it("{{montantPEC}} → montant PEC", () => {
      expect(resolveVariables("{{montantPEC}}", extCache)).toBe("150.00");
    });

    it("{{montantTotal}} → montant total", () => {
      expect(resolveVariables("{{montantTotal}}", extCache)).toBe("500.00");
    });

    it("{{nomMagasin}} → nom magasin", () => {
      expect(resolveVariables("{{nomMagasin}}", extCache)).toBe("Optique Centre");
    });

    it("{{numeroFiness}} → FINESS", () => {
      expect(resolveVariables("{{numeroFiness}}", extCache)).toBe("FIN001");
    });

    it("{{distancePupillaireOD}} → DP OD", () => {
      expect(resolveVariables("{{distancePupillaireOD}}", extCache)).toBe("31.5");
    });

    it("{{hauteurMontage}} → hauteur montage", () => {
      expect(resolveVariables("{{hauteurMontage}}", extCache)).toBe("20");
    });

    it("{{prisme_od}} → prisme OD", () => {
      expect(resolveVariables("{{prisme_od}}", extCache)).toBe("2");
    });

    it("{{base_og}} → base OG", () => {
      expect(resolveVariables("{{base_og}}", extCache)).toBe("0");
    });

    it("{{dateAujourdhui}} → today's date", () => {
      const result = resolveVariables("{{dateAujourdhui}}", extCache);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("{{anneeEnCours}} → current year", () => {
      const result = resolveVariables("{{anneeEnCours}}", extCache);
      expect(result).toMatch(/^\d{4}$/);
    });

    it("{{montantPECVerres}} → montant PEC verres", () => {
      expect(resolveVariables("{{montantPECVerres}}", extCache)).toBe("100.00");
    });

    it("{{montantPECMonture}} → montant PEC monture", () => {
      expect(resolveVariables("{{montantPECMonture}}", extCache)).toBe("50.00");
    });

    it("{{codeGarantie}} → code garantie", () => {
      expect(resolveVariables("{{codeGarantie}}", extCache)).toBe("G01");
    });

    it("{{referenceAccord}} → reference accord (falls back to numeroAccord)", () => {
      expect(resolveVariables("{{referenceAccord}}", extCache)).toBe("ACC123");
    });

    it("{{montantMonture}} → montant monture", () => {
      expect(resolveVariables("{{montantMonture}}", extCache)).toBe("200.00");
    });

    it("{{montantVerres}} → montant verres", () => {
      expect(resolveVariables("{{montantVerres}}", extCache)).toBe("300.00");
    });

    it("{{montantAMO}} → montant AMO", () => {
      expect(resolveVariables("{{montantAMO}}", extCache)).toBe("50.00");
    });

    it("{{montantAMC}} → montant AMC", () => {
      expect(resolveVariables("{{montantAMC}}", extCache)).toBe("200.00");
    });

    it("{{montantReste}} → montant reste", () => {
      expect(resolveVariables("{{montantReste}}", extCache)).toBe("250.00");
    });

    it("{{siretMagasin}} → SIRET", () => {
      expect(resolveVariables("{{siretMagasin}}", extCache)).toBe("12345678901234");
    });

    it("{{numeroAgreement}} → agreement number", () => {
      expect(resolveVariables("{{numeroAgreement}}", extCache)).toBe("AGR001");
    });
  });

  /* ── setReplayState ─────────────────────────────────────────── */
  describe("setReplayState", () => {
    it("sets replayState to a value", () => {
      setReplayState({ currentIndex: 0 });
      expect(replayState).toEqual({ currentIndex: 0 });
    });

    it("sets replayState to null", () => {
      setReplayState(null);
      expect(replayState).toBeNull();
    });
  });
});
