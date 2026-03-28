import { describe, it, expect } from "vitest";
import { generateHandler } from "@/lib/generateHandler";
import type { EtapeRPA } from "@/types/parcours";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeEtape(overrides: Partial<EtapeRPA> & { selectors?: string[] }): EtapeRPA {
  return {
    id: "step_1",
    label: "Test step",
    action: "fill",
    selector: '[name="test"]',
    variable: null,
    waitFor: undefined,
    timeout: 5000,
    ...overrides,
  };
}

// ── generateHandler ───────────────────────────────────────────────────────────

describe("generateHandler", () => {
  it("génère un handler avec le bon hostname", () => {
    const result = generateHandler({
      hostname: "example.com",
      nom: "Exemple",
      etapes: [],
    });
    expect(result).toContain('"example.com"');
    expect(result).toContain('window.location.hostname.includes("example.com")');
  });

  it("génère un fill avec variable {{nom}}", () => {
    const result = generateHandler({
      hostname: "example.com",
      nom: "Exemple",
      etapes: [makeEtape({ selector: '[name="test"]', variable: "{{nom}}" })],
    });
    // generateHandler utilise JSON.stringify → double quotes escapées
    expect(result).toContain('ultraFill(findElement("[name=\\"test\\"]"), nom)');
  });

  it("génère un fill avec variable {{nss}}", () => {
    const result = generateHandler({
      hostname: "example.com",
      nom: "Exemple",
      etapes: [makeEtape({ selector: '[name="nss"]', variable: "{{nss}}" })],
    });
    expect(result).toContain("nss)");
    expect(result).toContain("ultraFill");
  });

  it("génère un fill avec variable {{prenom}}", () => {
    const result = generateHandler({
      hostname: "example.com",
      nom: "Exemple",
      etapes: [makeEtape({ selector: "#prenom", variable: "{{prenom}}" })],
    });
    expect(result).toContain("capitalize(prenom)");
  });

  it("génère '' pour une variable inconnue", () => {
    const result = generateHandler({
      hostname: "example.com",
      nom: "Exemple",
      etapes: [makeEtape({ selector: "#x", variable: "{{inconnu}}" })],
    });
    expect(result).toContain("ultraFill(findElement(\"#x\"), '')");
  });

  it("génère '' quand variable est null", () => {
    const result = generateHandler({
      hostname: "example.com",
      nom: "Exemple",
      etapes: [makeEtape({ selector: "#x", variable: null })],
    });
    expect(result).toContain("ultraFill(findElement(\"#x\"), '')");
  });

  it("génère un click correctement", () => {
    const result = generateHandler({
      hostname: "example.com",
      nom: "Exemple",
      etapes: [makeEtape({ action: "click", selector: "#btn" })],
    });
    expect(result).toMatch(/_el_\d+ = findElement\("#btn"\)/);
    expect(result).toMatch(/_el_\d+\.click\(\)/);
  });

  it("génère un wait avec le bon timeout", () => {
    const result = generateHandler({
      hostname: "example.com",
      nom: "Exemple",
      etapes: [makeEtape({ action: "wait", timeout: 2000 })],
    });
    expect(result).toContain("setTimeout(r, 2000)");
  });

  it("ignore les étapes sans sélecteur", () => {
    const result = generateHandler({
      hostname: "example.com",
      nom: "Exemple",
      etapes: [makeEtape({ selector: "", variable: "{{nom}}" })],
    });
    expect(result).not.toContain("ultraFill");
    expect(result).toContain("return filled || false");
  });

  it("retourne filled || true quand il y a des étapes", () => {
    const result = generateHandler({
      hostname: "example.com",
      nom: "Exemple",
      etapes: [makeEtape({ variable: "{{nom}}" })],
    });
    expect(result).toContain("return filled || true");
  });

  it("rétrocompatibilité : selectors[] utilisé si selector vide", () => {
    const etape = makeEtape({ selector: "" }) as EtapeRPA & { selectors: string[] };
    etape.selectors = ['#monId', '[name="fallback"]'];
    const result = generateHandler({
      hostname: "example.com",
      nom: "Exemple",
      etapes: [etape],
    });
    expect(result).toContain('"#monId"');
  });

  it("plusieurs étapes générées dans l'ordre", () => {
    const result = generateHandler({
      hostname: "example.com",
      nom: "Exemple",
      etapes: [
        makeEtape({ id: "s1", selector: "#champ-nom", variable: "{{nom}}" }),
        makeEtape({ id: "s2", selector: "#champ-prenom", variable: "{{prenom}}" }),
        makeEtape({ id: "s3", selector: "#btn-submit", action: "click" }),
      ],
    });
    const nomIdx = result.indexOf("#champ-nom");
    const prenomIdx = result.indexOf("#champ-prenom");
    const btnIdx = result.indexOf("#btn-submit");
    expect(nomIdx).toBeGreaterThan(-1);
    expect(prenomIdx).toBeGreaterThan(-1);
    expect(btnIdx).toBeGreaterThan(-1);
    expect(nomIdx).toBeLessThan(prenomIdx);
    expect(prenomIdx).toBeLessThan(btnIdx);
  });

  it("toutes les variables du VARIABLE_MAP sont couvertes", () => {
    const variables = [
      "{{nss}}", "{{nom}}", "{{prenom}}", "{{dateNaissance}}",
      "{{dateOrdonnance}}", "{{numeroAdherent}}", "{{organisme}}",
      "{{sphere_od}}", "{{sphere_og}}", "{{cylindre_od}}", "{{cylindre_og}}",
      "{{axe_od}}", "{{axe_og}}", "{{addition}}",
    ];
    for (const v of variables) {
      const result = generateHandler({
        hostname: "example.com",
        nom: "Test",
        etapes: [makeEtape({ selector: "#x", variable: v })],
      });
      // Ne doit pas générer '' pour une variable connue
      expect(result).not.toContain('ultraFill(findElement("#x"), \'\')');
    }
  });
});

// ── sanitizeEtapes (logique extraite pour test unitaire) ──────────────────────

const ALLOWED_VARIABLES = [
  "{{nom}}", "{{prenom}}", "{{nss}}", "{{dateNaissance}}",
  "{{organisme}}", "{{numeroAdherent}}",
  "{{sphere_od}}", "{{sphere_og}}", "{{cylindre_od}}", "{{cylindre_og}}",
  "{{axe_od}}", "{{axe_og}}", "{{addition}}", "{{dateOrdonnance}}",
];

function sanitizeEtapes(etapes: unknown[]): Record<string, unknown>[] {
  return etapes.map((e) => {
    const etape = { ...(e as Record<string, unknown>) };
    if (Array.isArray(etape.selectors) && (etape.selectors as string[]).length > 0 && !etape.selector) {
      etape.selector = (etape.selectors as string[])[0];
    }
    if (
      etape.variable !== null &&
      etape.variable !== undefined &&
      (typeof etape.variable !== "string" || !ALLOWED_VARIABLES.includes(etape.variable as string))
    ) {
      etape.variable = null;
    }
    return etape;
  });
}

describe("sanitizeEtapes", () => {
  it("conserve un selector existant", () => {
    const result = sanitizeEtapes([{ id: "1", selector: '[name="nom"]', variable: "{{nom}}" }]);
    expect(result[0].selector).toBe('[name="nom"]');
  });

  it("remplace selector vide par selectors[0]", () => {
    const result = sanitizeEtapes([{
      id: "1", selector: "", selectors: ['#monId', '[name="fallback"]'], variable: "{{nom}}"
    }]);
    expect(result[0].selector).toBe("#monId");
  });

  it("ne remplace pas selector si déjà renseigné", () => {
    const result = sanitizeEtapes([{
      id: "1", selector: '[name="nom"]', selectors: ['#autre'], variable: "{{nom}}"
    }]);
    expect(result[0].selector).toBe('[name="nom"]');
  });

  it("met variable à null si non-template", () => {
    const result = sanitizeEtapes([{
      id: "1", selector: '[name="nom"]', variable: "[VALEUR STATIQUE — À RENSEIGNER]"
    }]);
    expect(result[0].variable).toBeNull();
  });

  it("met variable à null si valeur réelle patient", () => {
    const result = sanitizeEtapes([{
      id: "1", selector: '[name="nom"]', variable: "DUPONT"
    }]);
    expect(result[0].variable).toBeNull();
  });

  it("conserve une variable template valide", () => {
    const result = sanitizeEtapes([{
      id: "1", selector: '[name="nom"]', variable: "{{nom}}"
    }]);
    expect(result[0].variable).toBe("{{nom}}");
  });

  it("conserve variable null", () => {
    const result = sanitizeEtapes([{
      id: "1", selector: '[name="nom"]', variable: null
    }]);
    expect(result[0].variable).toBeNull();
  });

  it("traite plusieurs étapes indépendamment", () => {
    const result = sanitizeEtapes([
      { id: "1", selector: "", selectors: ["#a"], variable: "{{nom}}" },
      { id: "2", selector: '[name="b"]', variable: "valeur_réelle" },
      { id: "3", selector: '[name="c"]', variable: "{{nss}}" },
    ]);
    expect(result[0].selector).toBe("#a");
    expect(result[1].variable).toBeNull();
    expect(result[2].variable).toBe("{{nss}}");
  });

  it("ne plante pas sur un tableau vide", () => {
    const result = sanitizeEtapes([]);
    expect(result).toEqual([]);
  });
});
