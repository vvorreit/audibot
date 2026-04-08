// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.stubGlobal("chrome", {
  storage: { local: { get: vi.fn(), set: vi.fn() } },
});
vi.stubGlobal("readEncryptedCache", vi.fn().mockResolvedValue(null));

import {
  normalizeForMatch,
  normalizeDateForMatch,
  detectVariableByLabel,
  detectVariable,
  saveRecorderState,
  clearSnapshots,
  getSnapshots,
  recorderState,
} from "../content/recorder/state.js";

/* ══════════════════════════════════════════════════════════════════════════
 *  normalizeForMatch
 * ══════════════════════════════════════════════════════════════════════════ */
describe("normalizeForMatch", () => {
  it("supprime espaces, tirets, points, slashes et passe en minuscules", () => {
    expect(normalizeForMatch("Marie-Claire")).toBe("marieclaire");
    expect(normalizeForMatch("01/02/2024")).toBe("01022024");
    expect(normalizeForMatch("DR. MARTIN")).toBe("drmartin");
  });

  it("gere null et vide", () => {
    expect(normalizeForMatch("")).toBe("");
    expect(normalizeForMatch(null)).toBe("");
    expect(normalizeForMatch(undefined)).toBe("");
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  normalizeDateForMatch
 * ══════════════════════════════════════════════════════════════════════════ */
describe("normalizeDateForMatch", () => {
  it("retourne plusieurs variantes pour une date DD/MM/YYYY", () => {
    var variants = normalizeDateForMatch("15/07/1985");
    expect(variants).toContain("15071985");
    expect(variants.length).toBe(3);
  });

  it("retourne un tableau avec une seule entree pour formats courts", () => {
    var variants = normalizeDateForMatch("2024");
    expect(variants.length).toBe(1);
  });

  it("gere null et vide", () => {
    expect(normalizeDateForMatch(null)).toEqual([]);
    expect(normalizeDateForMatch("")).toEqual([]);
  });

  it("gere une date ISO", () => {
    var variants = normalizeDateForMatch("1985-07-15");
    expect(variants).toContain("19850715");
    expect(variants.length).toBe(3);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  detectVariableByLabel
 * ══════════════════════════════════════════════════════════════════════════ */
describe("detectVariableByLabel", () => {
  it("detecte un champ 'nom' simple", () => {
    expect(detectVariableByLabel("Nom", null, null, null)).toBe("{{nom}}");
  });

  it("detecte un champ 'prenom' avec accent", () => {
    expect(detectVariableByLabel("Prenom", null, null, null)).toBe("{{prenom}}");
    expect(detectVariableByLabel("Prenom du patient", null, null, null)).toBe("{{prenom}}");
  });

  it("detecte un champ NSS", () => {
    expect(detectVariableByLabel("N° Securite Sociale", null, null, null)).toBe("{{nss}}");
    expect(detectVariableByLabel(null, "nss", null, null)).toBe("{{nss}}");
  });

  it("detecte un champ date de naissance", () => {
    expect(detectVariableByLabel("Date de naissance", null, null, null)).toBe("{{dateNaissance}}");
    expect(detectVariableByLabel("Ne(e) le", null, null, null)).toBe("{{dateNaissance}}");
  });

  it("detecte un champ telephone", () => {
    expect(detectVariableByLabel("Telephone", null, null, null)).toBe("{{telephone}}");
    expect(detectVariableByLabel(null, "tel", null, null)).toBe("{{telephone}}");
  });

  it("detecte un champ email", () => {
    expect(detectVariableByLabel("E-mail", null, null, null)).toBe("{{email}}");
    expect(detectVariableByLabel("Courriel", null, null, null)).toBe("{{email}}");
  });

  it("detecte un champ organisme/mutuelle", () => {
    expect(detectVariableByLabel("Organisme", null, null, null)).toBe("{{organisme}}");
    expect(detectVariableByLabel("Mutuelle", null, null, null)).toBe("{{organisme}}");
  });

  it("detecte un champ sphere OD", () => {
    expect(detectVariableByLabel("Sphere OD", null, null, null)).toBe("{{sphere_od}}");
    expect(detectVariableByLabel("Sph. droit", null, null, null)).toBe("{{sphere_od}}");
  });

  it("detecte un champ cylindre OG", () => {
    expect(detectVariableByLabel("Cylindre OG", null, null, null)).toBe("{{cylindre_og}}");
    expect(detectVariableByLabel("Cyl. gauche", null, null, null)).toBe("{{cylindre_og}}");
  });

  it("detecte un champ addition generique", () => {
    expect(detectVariableByLabel("Addition", null, null, null)).toBe("{{addition}}");
  });

  it("detecte un champ RPPS", () => {
    expect(detectVariableByLabel("RPPS", null, null, null)).toBe("{{rpps}}");
    expect(detectVariableByLabel("Num. RPPS", null, null, null)).toBe("{{rpps}}");
  });

  it("detecte un champ date ordonnance", () => {
    expect(detectVariableByLabel("Date ordonnance", null, null, null)).toBe("{{dateOrdonnance}}");
    expect(detectVariableByLabel("Date prescription", null, null, null)).toBe("{{dateOrdonnance}}");
  });

  it("detecte un champ adresse", () => {
    expect(detectVariableByLabel("Adresse", null, null, null)).toBe("{{adresse}}");
  });

  it("detecte un champ code postal", () => {
    expect(detectVariableByLabel("Code postal", null, null, null)).toBe("{{codePostal}}");
  });

  it("detecte un champ ville", () => {
    expect(detectVariableByLabel("Ville", null, null, null)).toBe("{{ville}}");
  });

  it("retourne null pour un label non reconnu", () => {
    expect(detectVariableByLabel("Commentaire libre", null, null, null)).toBeNull();
    expect(detectVariableByLabel("Submit", null, null, null)).toBeNull();
  });

  it("retourne null si tous les arguments sont null", () => {
    expect(detectVariableByLabel(null, null, null, null)).toBeNull();
  });

  it("utilise le placeholder comme fallback", () => {
    expect(detectVariableByLabel(null, null, "Entrez votre nom", null)).toBe("{{nom}}");
  });

  it("utilise aria-label comme fallback", () => {
    expect(detectVariableByLabel(null, null, null, "Numero adherent")).toBe("{{numeroAdherent}}");
  });

  it("detecte les champs lentilles", () => {
    expect(detectVariableByLabel("Sphere lentille OD", null, null, null)).toBe("{{sphere_lentille_od}}");
    expect(detectVariableByLabel("Rayon OG", null, null, null)).toBe("{{rayon_og}}");
    expect(detectVariableByLabel("Diametre OD", null, null, null)).toBe("{{diametre_od}}");
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  detectVariable (async — value-based + label fallback)
 * ══════════════════════════════════════════════════════════════════════════ */
describe("detectVariable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne null si value est vide et pas de fieldInfo", async () => {
    const result = await detectVariable("", null);
    expect(result).toBeNull();
  });

  it("retourne null si value est trop courte et pas de fieldInfo", async () => {
    const result = await detectVariable("x", null);
    expect(result).toBeNull();
  });

  it("fallback sur label detection si value courte + fieldInfo", async () => {
    const result = await detectVariable("", { label: "Nom", name: null, placeholder: null, ariaLabel: null });
    expect(result).toBe("{{nom}}");
  });

  it("fallback sur label si cache est null", async () => {
    globalThis.readEncryptedCache.mockResolvedValue(null);
    const result = await detectVariable("Dupont", { label: "Nom", name: null, placeholder: null, ariaLabel: null });
    expect(result).toBe("{{nom}}");
  });

  it("fallback sur label si cache.current est absent", async () => {
    globalThis.readEncryptedCache.mockResolvedValue({});
    const result = await detectVariable("Dupont", { label: "Prenom", name: null, placeholder: null, ariaLabel: null });
    expect(result).toBe("{{prenom}}");
  });

  it("detecte une valeur simple (nom) depuis le cache", async () => {
    globalThis.readEncryptedCache.mockResolvedValue({
      current: { nom: "Dupont", prenom: "Jean" },
    });
    const result = await detectVariable("Dupont", null);
    expect(result).toBe("{{nom}}");
  });

  it("detecte un prenom depuis le cache", async () => {
    globalThis.readEncryptedCache.mockResolvedValue({
      current: { nom: "Dupont", prenom: "Jean" },
    });
    const result = await detectVariable("Jean", null);
    expect(result).toBe("{{prenom}}");
  });

  it("detecte un NSS depuis le cache", async () => {
    globalThis.readEncryptedCache.mockResolvedValue({
      current: { nss: "1850775123456" },
    });
    const result = await detectVariable("1850775123456", null);
    expect(result).toBe("{{nss}}");
  });

  it("detecte une date de naissance via dateFields", async () => {
    globalThis.readEncryptedCache.mockResolvedValue({
      current: { dateNaissance: "15/07/1985" },
    });
    const result = await detectVariable("15071985", null);
    expect(result).toBe("{{dateNaissance}}");
  });

  it("detecte une date ordonnance", async () => {
    globalThis.readEncryptedCache.mockResolvedValue({
      current: { ordonnance: { dateOrdonnance: "10/03/2026" } },
    });
    const result = await detectVariable("10032026", null);
    expect(result).toBe("{{dateOrdonnance}}");
  });

  it("fallback label si valeur ne matche rien dans le cache", async () => {
    globalThis.readEncryptedCache.mockResolvedValue({
      current: { nom: "Dupont" },
    });
    const result = await detectVariable("InconnuXYZ", { label: "Telephone", name: null, placeholder: null, ariaLabel: null });
    expect(result).toBe("{{telephone}}");
  });

  it("retourne null si valeur ne matche rien et pas de fieldInfo", async () => {
    globalThis.readEncryptedCache.mockResolvedValue({
      current: { nom: "Dupont" },
    });
    const result = await detectVariable("InconnuXYZ", null);
    expect(result).toBeNull();
  });

  it("detecte sphere_od depuis ordonnance", async () => {
    globalThis.readEncryptedCache.mockResolvedValue({
      current: { ordonnance: { lunettesOD: { sphere: "-2.50" } } },
    });
    const result = await detectVariable("-2.50", null);
    expect(result).toBe("{{sphere_od}}");
  });

  it("detecte organisme depuis regimes.rc1", async () => {
    globalThis.readEncryptedCache.mockResolvedValue({
      current: { regimes: { rc1: { nom: "Harmonie Mutuelle" } } },
    });
    const result = await detectVariable("Harmonie Mutuelle", null);
    expect(result).toBe("{{organisme}}");
  });

  it("detecte lentilles OD sphere", async () => {
    globalThis.readEncryptedCache.mockResolvedValue({
      current: { ordonnance: { lentillesOD: { sphere: "-3.00" } } },
    });
    const result = await detectVariable("-3.00", null);
    expect(result).toBe("{{sphere_lentille_od}}");
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 *  saveRecorderState / clearSnapshots / getSnapshots
 * ══════════════════════════════════════════════════════════════════════════ */
describe("saveRecorderState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ne fait rien si recorderState est null", () => {
    // recorderState is null by default (module-level)
    saveRecorderState();
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });
});

describe("clearSnapshots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chrome.storage.local.remove = vi.fn();
  });

  it("appelle chrome.storage.local.remove", () => {
    clearSnapshots();
    expect(chrome.storage.local.remove).toHaveBeenCalledWith("audibot_recorder_snapshots");
  });
});

describe("getSnapshots", () => {
  it("retourne un objet vide si pas de snapshots", async () => {
    chrome.storage.local.get.mockImplementation((keys, cb) => {
      cb({});
    });
    const result = await getSnapshots();
    expect(result).toEqual({});
  });

  it("retourne les snapshots stockes", async () => {
    const snaps = { "https://example.com": "<html></html>" };
    chrome.storage.local.get.mockImplementation((keys, cb) => {
      cb({ audibot_recorder_snapshots: snaps });
    });
    const result = await getSnapshots();
    expect(result).toEqual(snaps);
  });
});
