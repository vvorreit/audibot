/**
 * Tests de la logique `resolveVariables` du Replay Engine (extension/content.js).
 *
 * Note : `resolveVariables` est une fonction pure définie dans le fichier de
 * l'extension (extension/content.js — code browser). Elle n'est pas exportée
 * depuis un module lib, donc on la ré-implémente ici à l'identique pour
 * couvrir la logique côté Node.js/Vitest.
 *
 * RÈGLE : Zéro donnée santé patient réelle — uniquement des valeurs fictives.
 */
import { describe, it, expect } from "vitest";

/* ────────────────────────────────────────────────────────────────────────── *
 * Réimplémentation locale de resolveVariables (miroir exact de content.js)  *
 * ────────────────────────────────────────────────────────────────────────── */
interface Ordonnance {
  lunettesOD?: { sphere?: string; cylindre?: string; axe?: string; addition?: string };
  lunettesOG?: { sphere?: string; cylindre?: string; axe?: string; addition?: string };
  dateOrdonnance?: string;
}

interface Personne {
  nom?: string;
  prenom?: string;
}

interface CacheMemoire {
  nom?: string;
  prenom?: string;
  numeroSecuriteSociale?: string;
  dateNaissance?: string;
  organisme?: string;
  numeroAdherent?: string;
  ordonnance?: Ordonnance;
  personnes?: Personne[];
}

interface Cache {
  current?: CacheMemoire;
}

function resolveVariables(template: string, cache: Cache): string {
  if (!template) return "";
  const m: CacheMemoire = cache.current || {};
  const o: Ordonnance = m.ordonnance || {};
  const od = o.lunettesOD || {};
  const og = o.lunettesOG || {};
  const p0: Personne = (m.personnes && m.personnes[0]) || {};
  const vars: Record<string, string> = {
    "{{nom}}": (m.nom || p0.nom || "").toUpperCase(),
    "{{prenom}}": m.prenom || p0.prenom || "",
    "{{nss}}": m.numeroSecuriteSociale || "",
    "{{dateNaissance}}": m.dateNaissance || "",
    "{{organisme}}": m.organisme || "",
    "{{numeroAdherent}}": m.numeroAdherent || "",
    "{{sphere_od}}": od.sphere || "",
    "{{sphere_og}}": og.sphere || "",
    "{{cylindre_od}}": od.cylindre || "",
    "{{cylindre_og}}": og.cylindre || "",
    "{{axe_od}}": od.axe || "",
    "{{axe_og}}": og.axe || "",
    "{{addition}}": od.addition || og.addition || "",
    "{{dateOrdonnance}}": o.dateOrdonnance || "",
  };
  let result = template;
  for (const key in vars) {
    result = result.split(key).join(vars[key]);
  }
  return result;
}

/* ─────────────────── Données fictives (zéro donnée patient réelle) ─────── */
const CACHE_FICTIF: Cache = {
  current: {
    nom: "Dupont",
    prenom: "Alice",
    /* NSS fictif — format valide mais inexistant */
    numeroSecuriteSociale: "2900199000000",
    dateNaissance: "01/01/1990",
    organisme: "Mutuelle Fictive",
    numeroAdherent: "ADH-000001",
    ordonnance: {
      lunettesOD: { sphere: "-1.50", cylindre: "-0.50", axe: "90", addition: "1.00" },
      lunettesOG: { sphere: "-1.25", cylindre: "", axe: "", addition: "1.00" },
      dateOrdonnance: "01/03/2026",
    },
  },
};

/* ───────────────────────────────── Tests ────────────────────────────────── */
describe("resolveVariables (Replay Engine)", () => {
  it("retourne '' pour template vide", () => {
    expect(resolveVariables("", CACHE_FICTIF)).toBe("");
  });

  it("retourne le template inchangé s'il n'y a aucune variable", () => {
    expect(resolveVariables("Bonjour", CACHE_FICTIF)).toBe("Bonjour");
  });

  it("remplace {{nom}} en majuscules", () => {
    expect(resolveVariables("{{nom}}", CACHE_FICTIF)).toBe("DUPONT");
  });

  it("remplace {{prenom}}", () => {
    expect(resolveVariables("{{prenom}}", CACHE_FICTIF)).toBe("Alice");
  });

  it("remplace {{nss}} par le NSS fictif", () => {
    expect(resolveVariables("{{nss}}", CACHE_FICTIF)).toBe("2900199000000");
  });

  it("remplace {{dateNaissance}}", () => {
    expect(resolveVariables("{{dateNaissance}}", CACHE_FICTIF)).toBe("01/01/1990");
  });

  it("remplace {{organisme}}", () => {
    expect(resolveVariables("{{organisme}}", CACHE_FICTIF)).toBe("Mutuelle Fictive");
  });

  it("remplace {{numeroAdherent}}", () => {
    expect(resolveVariables("{{numeroAdherent}}", CACHE_FICTIF)).toBe("ADH-000001");
  });

  it("remplace {{sphere_od}}", () => {
    expect(resolveVariables("{{sphere_od}}", CACHE_FICTIF)).toBe("-1.50");
  });

  it("remplace {{sphere_og}}", () => {
    expect(resolveVariables("{{sphere_og}}", CACHE_FICTIF)).toBe("-1.25");
  });

  it("remplace {{cylindre_od}}", () => {
    expect(resolveVariables("{{cylindre_od}}", CACHE_FICTIF)).toBe("-0.50");
  });

  it("remplace {{axe_od}}", () => {
    expect(resolveVariables("{{axe_od}}", CACHE_FICTIF)).toBe("90");
  });

  it("remplace {{addition}} depuis OD en priorité", () => {
    expect(resolveVariables("{{addition}}", CACHE_FICTIF)).toBe("1.00");
  });

  it("remplace {{dateOrdonnance}}", () => {
    expect(resolveVariables("{{dateOrdonnance}}", CACHE_FICTIF)).toBe("01/03/2026");
  });

  it("remplace plusieurs variables dans un même template", () => {
    const result = resolveVariables("{{prenom}} {{nom}} - {{organisme}}", CACHE_FICTIF);
    expect(result).toBe("Alice DUPONT - Mutuelle Fictive");
  });

  it("fallback sur personnes[0].nom si m.nom absent", () => {
    const cache: Cache = {
      current: {
        personnes: [{ nom: "Martin", prenom: "Bob" }],
      },
    };
    expect(resolveVariables("{{nom}}", cache)).toBe("MARTIN");
    expect(resolveVariables("{{prenom}}", cache)).toBe("Bob");
  });

  it("retourne '' pour une variable absente du cache", () => {
    const cache: Cache = { current: {} };
    expect(resolveVariables("{{organisme}}", cache)).toBe("");
  });

  it("gère un cache vide gracieusement", () => {
    const cache: Cache = {};
    expect(resolveVariables("{{nom}}", cache)).toBe("");
    expect(resolveVariables("{{sphere_od}}", cache)).toBe("");
  });

  it("remplace toutes les occurrences d'une variable dans le template", () => {
    const result = resolveVariables("{{nom}} / {{nom}}", CACHE_FICTIF);
    expect(result).toBe("DUPONT / DUPONT");
  });
});
