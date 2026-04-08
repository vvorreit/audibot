import { describe, it, expect } from "vitest";
import { computeBilan } from "@/lib/bilan-engine";
import type { BilanFormData } from "@/types/bilan";

const BASE_DATA: BilanFormData = {
  correctionType: ["myopie"],
  isProgressive: false,
  portLentilles: false,
  genesActuelles: ["aucune"],
  lunettesBienSupportees: true,
  frequencePort: "souvent",
  screenTimeHours: 2,
  mainActivity: "bureau",
  sport: false,
  conduitNuit: false,
  expositionSoleil: "rare",
  sensitivities: [],
  antecedentsFamiliaux: false,
  derniereVisite: "moins_1an",
  stylePreference: "classique",
  faceShape: "ovale",
  colorPreference: "sans_preference",
  budgetRange: "150_300",
  projetSecondairesPaires: false,
  mutuelleConnue: true,
};

describe("computeBilan", () => {
  it("retourne un profil texte cohérent", () => {
    const result = computeBilan(BASE_DATA);
    expect(result.profileText).toContain("port fréquent");
    expect(result.profileText).toContain("myopie");
    expect(result.profileText).toContain("sédentaire bureau");
  });

  it("presbytie + écrans > 6h → progressif digital", () => {
    const result = computeBilan({
      ...BASE_DATA,
      correctionType: ["presbytie"],
      screenTimeHours: 8,
    });
    expect(result.lensRecommendations.some(r => r.label === "Progressif digital")).toBe(true);
  });

  it("presbytie seule → progressif recommandé", () => {
    const result = computeBilan({
      ...BASE_DATA,
      correctionType: ["presbytie"],
      screenTimeHours: 3,
    });
    expect(result.lensRecommendations.some(r => r.label === "Progressif")).toBe(true);
  });

  it("astigmatisme → antireflet", () => {
    const result = computeBilan({
      ...BASE_DATA,
      correctionType: ["astigmatisme"],
    });
    expect(result.lensRecommendations.some(r => r.label === "Antireflet")).toBe(true);
  });

  it("conduite de nuit → antireflet premium nuit", () => {
    const result = computeBilan({
      ...BASE_DATA,
      conduitNuit: true,
    });
    expect(result.lensRecommendations.some((r) => r.label.includes("Antireflet premium nuit"))).toBe(true);
  });

  it("écrans > 4h → lumière bleue", () => {
    const result = computeBilan({
      ...BASE_DATA,
      screenTimeHours: 6,
    });
    expect(result.lensRecommendations.some(r => r.label === "Filtre lumière bleue")).toBe(true);
  });

  it("sport → polycarbonate", () => {
    const result = computeBilan({
      ...BASE_DATA,
      sport: true,
    });
    expect(result.lensRecommendations.some((r) => r.label.includes("Polycarbonate"))).toBe(true);
  });

  it("allergie nickel → exclut métal", () => {
    const result = computeBilan({
      ...BASE_DATA,
      sensitivities: ["nickel"],
    });
    expect(result.frameFilters.excludeMaterials).toContain("Métal");
  });

  it("visage rond → formes carrée, rectangulaire, pilote", () => {
    const result = computeBilan({
      ...BASE_DATA,
      faceShape: "rond",
    });
    expect(result.frameFilters.recommendedShapes).toEqual(["Carrée", "Rectangulaire", "Pilote"]);
  });

  it("visage carré → formes ronde, ovale, pantos", () => {
    const result = computeBilan({
      ...BASE_DATA,
      faceShape: "carre",
    });
    expect(result.frameFilters.recommendedShapes).toEqual(["Ronde", "Ovale", "Pantos"]);
  });

  it("budget 150-300 → Entrée + Moyen", () => {
    const result = computeBilan({
      ...BASE_DATA,
      budgetRange: "150_300",
    });
    expect(result.frameFilters.priceRanges).toEqual(["Entrée", "Moyen"]);
  });

  it("budget plus_500 → Premium", () => {
    const result = computeBilan({
      ...BASE_DATA,
      budgetRange: "plus_500",
    });
    expect(result.frameFilters.priceRanges).toEqual(["Premium"]);
  });

  it("génère des alertes cliniques", () => {
    const result = computeBilan({
      ...BASE_DATA,
      antecedentsFamiliaux: true,
      derniereVisite: "plus_2ans",
    });
    expect(result.alertes.length).toBeGreaterThan(0);
    expect(result.alertes.some(a => a.niveau === "attention")).toBe(true);
  });

  it("identifie des opportunités", () => {
    const result = computeBilan({
      ...BASE_DATA,
      projetSecondairesPaires: true,
    });
    expect(result.opportunites.some(o => o.type === "paire_supplementaire")).toBe(true);
  });

  // ── Genes actuelles — antireflet renforce (line 122-127) ──────
  it("halos_nuit → antireflet renforce must", () => {
    const result = computeBilan({
      ...BASE_DATA,
      genesActuelles: ["halos_nuit"],
    });
    expect(result.lensRecommendations.some(r => r.label === "Antireflet renforcé" && r.priority === "must")).toBe(true);
  });

  it("eblouissement → antireflet + teinte legere", () => {
    const result = computeBilan({
      ...BASE_DATA,
      genesActuelles: ["eblouissement"],
    });
    expect(result.lensRecommendations.some(r => r.label === "Antireflet + teinte légère")).toBe(true);
  });

  it("sensibilite poids → verres minces legers", () => {
    const result = computeBilan({
      ...BASE_DATA,
      sensitivities: ["poids"],
    });
    expect(result.lensRecommendations.some(r => r.label === "Verres minces légers")).toBe(true);
    expect(result.frameFilters.requiredFeatures).toContain("lightweight");
  });

  // ── Complexite score edge cases (lines 337-347) ──────────────

  it("complexiteScore=5 quand alerte urgente + totalAlertes>1", () => {
    const result = computeBilan({
      ...BASE_DATA,
      correctionType: ["myopie"],
      derniereVisite: "jamais",          // urgent alert
      antecedentsFamiliaux: true,        // attention alert → totalAlertes>1
      screenTimeHours: 8,               // lensCount >3 to also satisfy condition
      conduitNuit: true,
      genesActuelles: ["halos_nuit"],
    });
    expect(result.complexiteScore).toBe(5);
  });

  it("complexiteScore=4 quand totalAlertes>1 sans urgence", () => {
    const result = computeBilan({
      ...BASE_DATA,
      antecedentsFamiliaux: true,        // attention
      derniereVisite: "plus_2ans",       // attention → totalAlertes=2
    });
    expect(result.complexiteScore).toBe(4);
  });

  it("complexiteScore=4 quand presbytie + correctionCount>=2", () => {
    const result = computeBilan({
      ...BASE_DATA,
      correctionType: ["presbytie", "astigmatisme"],
    });
    expect(result.complexiteScore).toBe(4);
  });

  it("complexiteScore=3 quand lensCount>=3", () => {
    const result = computeBilan({
      ...BASE_DATA,
      correctionType: ["astigmatisme"],
      screenTimeHours: 6,  // filtre lumiere bleue
      conduitNuit: true,   // antireflet premium nuit
      // astigmatisme → antireflet = 3 reco total
    });
    expect(result.complexiteScore).toBeGreaterThanOrEqual(3);
  });

  it("complexiteScore=1 quand aucune recommandation ni alerte", () => {
    const result = computeBilan({
      ...BASE_DATA,
      correctionType: ["aucune"],
      screenTimeHours: 0,
      conduitNuit: false,
      sport: false,
      expositionSoleil: "rare",
      genesActuelles: ["aucune"],
      sensitivities: [],
    });
    expect(result.complexiteScore).toBe(1);
    expect(result.complexiteLabel).toBe("Profil standard");
  });

  // ── Profile text — genes labels (lines 370-380) ──────────────

  it("profileText contient les genes formatees", () => {
    const result = computeBilan({
      ...BASE_DATA,
      genesActuelles: ["halos_nuit", "fatigue_visuelle", "maux_de_tete", "vision_floue_pres", "vision_floue_loin", "eblouissement"],
    });
    expect(result.profileText).toContain("halos nocturnes");
    expect(result.profileText).toContain("fatigue visuelle");
    expect(result.profileText).toContain("maux de t\u00eate");
    expect(result.profileText).toContain("vision floue de pr\u00e8s");
    expect(result.profileText).toContain("vision floue de loin");
    expect(result.profileText).toContain("\u00e9blouissements");
  });

  it("profileText sans genes quand aucune", () => {
    const result = computeBilan({
      ...BASE_DATA,
      genesActuelles: ["aucune"],
    });
    expect(result.profileText).not.toContain("G\u00eanes");
  });

  // ── Opportunites supplementaires ──────────────────────────────

  it("solaires correcteurs si exposition moderee et pas lentilles", () => {
    const result = computeBilan({
      ...BASE_DATA,
      expositionSoleil: "moderee",
      portLentilles: false,
    });
    expect(result.opportunites.some(o => o.label === "Solaires correcteurs")).toBe(true);
  });

  it("pack conducteur si conduitNuit + mainActivity conduite", () => {
    const result = computeBilan({
      ...BASE_DATA,
      conduitNuit: true,
      mainActivity: "conduite",
    });
    expect(result.opportunites.some(o => o.label.includes("Pack solaires"))).toBe(true);
  });

  it("lunettes repos si portLentilles", () => {
    const result = computeBilan({
      ...BASE_DATA,
      portLentilles: true,
    });
    expect(result.opportunites.some(o => o.label.includes("repos"))).toBe(true);
  });

  it("verifier mutuelle si mutuelleConnue=false", () => {
    const result = computeBilan({
      ...BASE_DATA,
      mutuelleConnue: false,
    });
    expect(result.opportunites.some(o => o.label.includes("mutuelle"))).toBe(true);
  });

  it("ecran anti-lumiere bleue si screenTimeHours>6", () => {
    const result = computeBilan({
      ...BASE_DATA,
      screenTimeHours: 8,
    });
    expect(result.opportunites.some(o => o.type === "verre")).toBe(true);
  });

  // ── Alertes supplementaires ───────────────────────────────────

  it("alerte urgente si jamais visite ophtalmo", () => {
    const result = computeBilan({
      ...BASE_DATA,
      derniereVisite: "jamais",
    });
    expect(result.alertes.some(a => a.niveau === "urgent")).toBe(true);
  });

  it("alerte urgente si maux_de_tete + lunettes mal supportees", () => {
    const result = computeBilan({
      ...BASE_DATA,
      genesActuelles: ["maux_de_tete"],
      lunettesBienSupportees: false,
    });
    expect(result.alertes.some(a => a.niveau === "urgent" && a.message.includes("Maux de t\u00eate"))).toBe(true);
  });

  it("alerte vision floue pres sans progressifs", () => {
    const result = computeBilan({
      ...BASE_DATA,
      correctionType: ["presbytie"],
      genesActuelles: ["vision_floue_pres"],
      isProgressive: false,
    });
    expect(result.alertes.some(a => a.message.includes("progressif"))).toBe(true);
  });

  it("alerte sous-port rarement avec correction", () => {
    const result = computeBilan({
      ...BASE_DATA,
      frequencePort: "rarement",
      correctionType: ["myopie"],
    });
    expect(result.alertes.some(a => a.niveau === "info" && a.message.includes("Sous-port"))).toBe(true);
  });

  it("alerte halos_nuit + conduite de nuit", () => {
    const result = computeBilan({
      ...BASE_DATA,
      genesActuelles: ["halos_nuit"],
      conduitNuit: true,
    });
    expect(result.alertes.some(a => a.message.includes("Halos nocturnes"))).toBe(true);
  });

  // ── Exposition soleil ─────────────────────────────────────────

  it("exposition elevee → photochromiques recommended", () => {
    const result = computeBilan({
      ...BASE_DATA,
      expositionSoleil: "elevee",
    });
    expect(result.lensRecommendations.some(r => r.label === "Verres photochromiques" && r.priority === "recommended")).toBe(true);
  });

  it("exposition moderee → photochromiques optional", () => {
    const result = computeBilan({
      ...BASE_DATA,
      expositionSoleil: "moderee",
    });
    expect(result.lensRecommendations.some(r => r.label === "Photochromiques envisageables" && r.priority === "optional")).toBe(true);
  });

  // ── Montures sensitivities ────────────────────────────────────

  it("sensibilite plastique → exclut Acetate et TR90", () => {
    const result = computeBilan({
      ...BASE_DATA,
      sensitivities: ["plastique"],
    });
    expect(result.frameFilters.excludeMaterials).toContain("Ac\u00e9tate");
    expect(result.frameFilters.excludeMaterials).toContain("TR90");
  });

  it("pression_tempes → flexible_temples feature", () => {
    const result = computeBilan({
      ...BASE_DATA,
      sensitivities: ["pression_tempes"],
    });
    expect(result.frameFilters.requiredFeatures).toContain("flexible_temples");
  });

  it("nez_sensible → adjustable_nose_pads feature", () => {
    const result = computeBilan({
      ...BASE_DATA,
      sensitivities: ["nez_sensible"],
    });
    expect(result.frameFilters.requiredFeatures).toContain("adjustable_nose_pads");
  });

  it("isProgressive → progressive_compatible feature", () => {
    const result = computeBilan({
      ...BASE_DATA,
      isProgressive: true,
    });
    expect(result.frameFilters.requiredFeatures).toContain("progressive_compatible");
  });

  // ── Script conseil ────────────────────────────────────────────

  it("scriptConseil limité a 4 elements max", () => {
    const result = computeBilan({
      ...BASE_DATA,
      correctionType: ["presbytie"],
      screenTimeHours: 8,
      conduitNuit: true,
      genesActuelles: ["halos_nuit"],
      projetSecondairesPaires: true,
      sport: true,
    });
    expect(result.scriptConseil.length).toBeLessThanOrEqual(4);
  });

  it("scriptConseil contient conseil conduite sans halos", () => {
    const result = computeBilan({
      ...BASE_DATA,
      conduitNuit: true,
      genesActuelles: ["aucune"],
    });
    expect(result.scriptConseil.some(s => s.includes("\u00e9blouissements"))).toBe(true);
  });

  // ── Face shape inconnu ────────────────────────────────────────

  it("faceShape inconnu → pas de formes recommandees", () => {
    const result = computeBilan({
      ...BASE_DATA,
      faceShape: "inconnu",
    });
    expect(result.frameFilters.recommendedShapes).toEqual([]);
  });

  // ── profileText opportunites count ────────────────────────────

  it("profileText mentionne le nombre d'opportunites", () => {
    const result = computeBilan({
      ...BASE_DATA,
      projetSecondairesPaires: true,
      sport: true,
      portLentilles: true,
    });
    expect(result.profileText).toMatch(/\d+ opportunit/);
  });

  it("sans correction connue dans profileText", () => {
    const result = computeBilan({
      ...BASE_DATA,
      correctionType: ["aucune"],
    });
    expect(result.profileText).toContain("sans correction connue");
  });
});
