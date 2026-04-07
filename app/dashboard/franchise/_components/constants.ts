export type Period = "7d" | "30d" | "90d" | "all";
export type Tab = "tiers-payant" | "bilan" | "magasins" | "comparaison";

export const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 jours", "30d": "30 jours", "90d": "90 jours", all: "Tout",
};

export const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"];

export const GENE_LABELS: Record<string, string> = {
  acouphenes: "Acouphenes", difficulte_conversation: "Difficulte conversation",
  fatigue_auditive: "Fatigue auditive", hyperacousie: "Hyperacousie",
  comprehension_bruit: "Comprehension bruit", isolement: "Isolement", aucune: "Aucune",
};

export const OPPO_LABELS: Record<string, string> = {
  appareil: "Appareil", accessoire: "Accessoire", protection: "Protection", entretien: "Entretien",
};
