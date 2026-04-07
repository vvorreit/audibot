import type { BilanFormData } from "@/types/bilan";

/* ── Options ────────────────────────────────────────────────────── */

export const CORRECTION_OPTIONS = [
  { value: "myopie", label: "Myopie" }, { value: "hypermétropie", label: "Hypermétropie" },
  { value: "astigmatisme", label: "Astigmatisme" }, { value: "presbytie", label: "Presbytie" },
  { value: "aucune", label: "Aucune" },
];
export const GENE_OPTIONS = [
  { value: "halos_nuit", label: "Halos nuit" }, { value: "fatigue_visuelle", label: "Fatigue visuelle" },
  { value: "maux_de_tete", label: "Maux de tête" }, { value: "vision_floue_pres", label: "Flou près" },
  { value: "vision_floue_loin", label: "Flou loin" }, { value: "eblouissement", label: "Éblouissement" },
  { value: "aucune", label: "Aucune" },
];
export const SENSIBILITY_OPTIONS = [
  { value: "nickel", label: "Nickel" }, { value: "plastique", label: "Plastique" },
  { value: "poids", label: "Poids" }, { value: "pression_tempes", label: "Tempes" },
  { value: "nez_sensible", label: "Nez" },
];

export const FREQ_OPTIONS     = [{ v: "toujours", l: "Toujours" }, { v: "souvent", l: "Souvent" }, { v: "parfois", l: "Parfois" }, { v: "rarement", l: "Rarement" }];
export const ACTIVITY_OPTIONS = [{ v: "bureau", l: "Écrans" }, { v: "exterieur", l: "Extérieur" }, { v: "mixte", l: "Mixte" }, { v: "conduite", l: "Conduite" }];
export const SOLEIL_OPTIONS   = [{ v: "rare", l: "Rare" }, { v: "moderee", l: "Modérée" }, { v: "elevee", l: "Élevée" }];
export const STYLE_OPTIONS    = [{ v: "discret", l: "Discret" }, { v: "moderne", l: "Moderne" }, { v: "classique", l: "Classique" }, { v: "original", l: "Original" }, { v: "sport", l: "Sport" }, { v: "ne_sais_pas", l: "NSP" }];
export const FACE_OPTIONS     = [{ v: "ovale", l: "Ovale" }, { v: "rond", l: "Rond" }, { v: "carre", l: "Carré" }, { v: "allonge", l: "Allongé" }, { v: "triangulaire", l: "Triangulaire" }, { v: "inconnu", l: "NSP" }];
export const COLOR_OPTIONS    = [{ v: "sombre", l: "Sombre" }, { v: "clair", l: "Clair" }, { v: "colore", l: "Coloré" }, { v: "sans_preference", l: "Sans préf." }];
export const BUDGET_OPTIONS   = [{ v: "moins_150", l: "< 150€" }, { v: "150_300", l: "150–300€" }, { v: "300_500", l: "300–500€" }, { v: "plus_500", l: "500€+" }, { v: "ne_sais_pas", l: "NSP" }];
export const VISITE_OPTIONS   = [{ v: "moins_1an", l: "< 1 an" }, { v: "1_2ans", l: "1–2 ans" }, { v: "plus_2ans", l: "> 2 ans" }, { v: "jamais", l: "Jamais" }];

export const PRIORITY_BADGE: Record<string, { label: string; classes: string }> = {
  must:        { label: "Indispensable", classes: "bg-red-50 text-red-600" },
  recommended: { label: "Recommandé",   classes: "bg-blue-50 text-blue-600" },
  optional:    { label: "Option",       classes: "bg-slate-100 text-slate-500" },
};
export const OPPO_TYPE: Record<string, string> = {
  verre: "Verre", monture: "Monture", paire_supplementaire: "2e paire", accessoire: "Accessoire",
};

export const isSafeImageSrc = (src: string) => src.startsWith('data:image/') || src.startsWith('https://');

export const DEFAULT_FORM: BilanFormData = {
  correctionType: [], isProgressive: false, portLentilles: false,
  genesActuelles: [], lunettesBienSupportees: true, frequencePort: "toujours",
  screenTimeHours: 4, mainActivity: "bureau", sport: false, conduitNuit: false,
  expositionSoleil: "moderee", sensitivities: [], antecedentsFamiliaux: false,
  derniereVisite: "moins_1an", stylePreference: "classique", faceShape: "inconnu",
  colorPreference: "sans_preference", budgetRange: "150_300",
  projetSecondairesPaires: false, mutuelleConnue: false,
};
