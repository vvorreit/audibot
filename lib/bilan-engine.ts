// lib/bilan-engine.ts — Moteur de règles métier pour le bilan auditif
// Zéro dépendance externe, zéro API IA

import type { BilanFormData, BilanResult } from "@/types/bilan";

const ACTIVITY_LABELS: Record<BilanFormData["mainActivity"], string> = {
  bureau: "sédentaire bureau",
  exterieur: "actif extérieur",
  mixte: "mixte",
  conduite: "conducteur",
};

const STYLE_LABELS: Record<BilanFormData["stylePreference"], string> = {
  discret: "Discret",
  moderne: "Moderne",
  classique: "Classique",
  original: "Original",
  sport: "Sport",
  ne_sais_pas: "Sans préférence",
};

const FREQUENCE_LABELS: Record<BilanFormData["frequencePort"], string> = {
  toujours: "port permanent",
  souvent: "port fréquent",
  parfois: "port occasionnel",
  rarement: "port rare",
};

const FACE_SHAPE_TO_FRAMES: Record<string, string[]> = {
  rond: ["Carrée", "Rectangulaire", "Pilote"],
  carre: ["Ronde", "Ovale", "Pantos"],
  allonge: ["Ovale", "Ronde", "Pantos"],
  triangulaire: ["Pilote", "Papillon"],
  ovale: ["Ronde", "Carrée", "Rectangulaire", "Ovale", "Pilote", "Papillon", "Pantos"],
  inconnu: [],
};

const BUDGET_TO_PRICE: Record<BilanFormData["budgetRange"], string[]> = {
  moins_150: ["Entrée"],
  "150_300": ["Entrée", "Moyen"],
  "300_500": ["Moyen", "Premium"],
  plus_500: ["Premium"],
  ne_sais_pas: ["Entrée", "Moyen", "Premium"],
};

export function computeBilan(data: BilanFormData): BilanResult {
  const lensRecommendations: BilanResult["lensRecommendations"] = [];
  const opportunites: BilanResult["opportunites"] = [];
  const alertes: BilanResult["alertes"] = [];
  const scriptConseil: string[] = [];
  const excludeMaterials: string[] = [];
  const requiredFeatures: string[] = [];

  const hasPresbyopia = data.correctionType.includes("presbytie");
  const hasAstigmatism = data.correctionType.includes("astigmatisme");
  const hasCorrection = data.correctionType.filter((c) => c !== "aucune").length > 0;
  const correctionCount = data.correctionType.filter((c) => c !== "aucune").length;

  // ── Recommandations verres ───────────────────────────────────────

  if (hasPresbyopia && data.screenTimeHours > 6) {
    lensRecommendations.push({
      label: "Progressif digital",
      reason: "Presbytie + forte exposition écrans",
      priority: "must",
    });
  } else if (hasPresbyopia) {
    lensRecommendations.push({
      label: "Progressif",
      reason: "Presbytie confirmée",
      priority: "must",
    });
  }

  if (data.conduitNuit) {
    lensRecommendations.push({
      label: "Antireflet premium nuit",
      reason: "Conduite nocturne — halos et éblouissements",
      priority: "must",
    });
  }

  if (hasAstigmatism) {
    lensRecommendations.push({
      label: "Antireflet",
      reason: "Astigmatisme — réduction halos",
      priority: "recommended",
    });
  }

  if (data.screenTimeHours > 4) {
    lensRecommendations.push({
      label: "Filtre lumière bleue",
      reason: `Exposition écran > 4h/jour`,
      priority: "recommended",
    });
  }

  if (data.sport) {
    lensRecommendations.push({
      label: "Polycarbonate / Trivex",
      reason: "Sport — résistance chocs",
      priority: "recommended",
    });
  }

  if (data.expositionSoleil === "elevee") {
    lensRecommendations.push({
      label: "Verres photochromiques",
      reason: "Forte exposition soleil",
      priority: "recommended",
    });
  } else if (data.expositionSoleil === "moderee") {
    lensRecommendations.push({
      label: "Photochromiques envisageables",
      reason: "Exposition soleil modérée",
      priority: "optional",
    });
  }

  if (data.genesActuelles.includes("halos_nuit")) {
    lensRecommendations.push({
      label: "Antireflet renforcé",
      reason: "Halos nocturnes signalés",
      priority: "must",
    });
  }

  if (data.genesActuelles.includes("eblouissement")) {
    lensRecommendations.push({
      label: "Antireflet + teinte légère",
      reason: "Éblouissements signalés",
      priority: "recommended",
    });
  }

  if (data.sensitivities.includes("poids")) {
    lensRecommendations.push({
      label: "Verres minces légers",
      reason: "Sensibilité au poids",
      priority: "recommended",
    });
  }

  // ── Opportunités commerciales ────────────────────────────────────

  if (data.projetSecondairesPaires) {
    opportunites.push({
      label: "Deuxième paire à proposer",
      reason: "Client intéressé",
      type: "paire_supplementaire",
    });
  }

  if (
    (data.expositionSoleil === "moderee" || data.expositionSoleil === "elevee") &&
    !data.portLentilles
  ) {
    opportunites.push({
      label: "Solaires correcteurs",
      reason: "Exposition soleil + porteur de lunettes",
      type: "paire_supplementaire",
    });
  }

  if (data.conduitNuit && data.mainActivity === "conduite") {
    opportunites.push({
      label: "Pack solaires + antireflet nuit",
      reason: "Profil conducteur",
      type: "paire_supplementaire",
    });
  }

  if (data.sport) {
    opportunites.push({
      label: "Lunettes de sport correctrices",
      reason: "Sport pratiqué régulièrement",
      type: "paire_supplementaire",
    });
  }

  if (data.portLentilles) {
    opportunites.push({
      label: "Lunettes repos pour soirée",
      reason: "Porteur de lentilles",
      type: "paire_supplementaire",
    });
  }

  if (!data.mutuelleConnue) {
    opportunites.push({
      label: "Vérifier prise en charge mutuelle",
      reason: "Client ne connaît pas ses droits",
      type: "accessoire",
    });
  }

  if (data.screenTimeHours > 6) {
    opportunites.push({
      label: "Écran anti-lumière bleue (clip ou 2e paire)",
      reason: "Très forte exposition écran",
      type: "verre",
    });
  }

  // ── Alertes cliniques ────────────────────────────────────────────

  if (data.antecedentsFamiliaux) {
    alertes.push({
      message: "Antécédents familiaux DMLA/glaucome — recommander bilan ophtalmo",
      niveau: "attention",
    });
  }

  if (data.derniereVisite === "plus_2ans") {
    alertes.push({
      message: "Dernière visite ophtalmologique il y a plus de 2 ans",
      niveau: "attention",
    });
  }

  if (data.derniereVisite === "jamais") {
    alertes.push({
      message: "Aucune visite chez l'ophtalmo — orienter vers bilan",
      niveau: "urgent",
    });
  }

  if (
    data.genesActuelles.includes("maux_de_tete") &&
    !data.lunettesBienSupportees
  ) {
    alertes.push({
      message: "Maux de tête + lunettes mal supportées — vérifier prescription et ajustage",
      niveau: "urgent",
    });
  }

  if (
    data.genesActuelles.includes("vision_floue_pres") &&
    !data.isProgressive &&
    hasPresbyopia
  ) {
    alertes.push({
      message: "Vision floue de près sans progressifs — progressif fortement recommandé",
      niveau: "attention",
    });
  }

  if (data.frequencePort === "rarement" && hasCorrection) {
    alertes.push({
      message: "Sous-port des lunettes malgré correction — explorer cause (inconfort ?)",
      niveau: "info",
    });
  }

  if (data.genesActuelles.includes("halos_nuit") && data.conduitNuit) {
    alertes.push({
      message: "Halos nocturnes + conduite de nuit — priorité antireflet",
      niveau: "attention",
    });
  }

  // ── Script conseil ───────────────────────────────────────────────

  if (data.screenTimeHours > 4) {
    scriptConseil.push(
      `Avec vos ${data.screenTimeHours} heures d'écran par jour, un filtre lumière bleue vous apportera moins de fatigue en fin de journée.`
    );
  }

  if (hasPresbyopia) {
    scriptConseil.push(
      "Vos verres progressifs vous permettront de voir de loin et de près sans changer de lunettes."
    );
  }

  if (data.conduitNuit && data.genesActuelles.includes("halos_nuit")) {
    scriptConseil.push(
      "L'antireflet premium élimine les halos la nuit au volant — vous verrez la différence dès le premier soir."
    );
  } else if (data.conduitNuit) {
    scriptConseil.push(
      "Pour votre conduite de nuit, l'antireflet premium réduira considérablement les éblouissements."
    );
  }

  if (data.projetSecondairesPaires) {
    scriptConseil.push(
      "Vous avez mentionné être intéressé par une seconde paire — on peut vous proposer des solaires avec votre correction."
    );
  }

  if (data.sport && scriptConseil.length < 4) {
    scriptConseil.push(
      "Pour le sport, des verres en polycarbonate offrent une résistance aux chocs bien supérieure."
    );
  }

  // ── Montures — matériaux et features ─────────────────────────────

  if (data.sensitivities.includes("nickel")) {
    excludeMaterials.push("Métal");
  }

  if (data.sensitivities.includes("plastique")) {
    excludeMaterials.push("Acétate", "TR90");
  }

  if (data.sensitivities.includes("poids")) {
    requiredFeatures.push("lightweight");
  }

  if (data.isProgressive || hasPresbyopia) {
    requiredFeatures.push("progressive_compatible");
  }

  if (data.sensitivities.includes("pression_tempes")) {
    requiredFeatures.push("flexible_temples");
  }

  if (data.sensitivities.includes("nez_sensible")) {
    requiredFeatures.push("adjustable_nose_pads");
  }

  const recommendedShapes = FACE_SHAPE_TO_FRAMES[data.faceShape] ?? [];
  const styleKeywords = [STYLE_LABELS[data.stylePreference]];
  const priceRanges = BUDGET_TO_PRICE[data.budgetRange];

  // ── Score complexité ─────────────────────────────────────────────

  const urgentAlertes = alertes.filter((a) => a.niveau === "urgent").length;
  const totalAlertes = alertes.length;
  const lensCount = lensRecommendations.length;

  let complexiteScore: BilanResult["complexiteScore"];
  if (urgentAlertes > 0 && (totalAlertes > 1 || lensCount > 3)) {
    complexiteScore = 5;
  } else if (totalAlertes > 1 || (hasPresbyopia && correctionCount >= 2)) {
    complexiteScore = 4;
  } else if (lensCount >= 3 || totalAlertes >= 1) {
    complexiteScore = 3;
  } else if (lensCount >= 1) {
    complexiteScore = 2;
  } else {
    complexiteScore = 1;
  }

  const COMPLEXITE_LABELS: Record<BilanResult["complexiteScore"], string> = {
    1: "Profil standard",
    2: "Quelques options",
    3: "Conseil approfondi",
    4: "Cas complexe",
    5: "Urgence ophtalmo",
  };
  const complexiteLabel = COMPLEXITE_LABELS[complexiteScore];

  // ── Profil texte ─────────────────────────────────────────────────

  const corrections = hasCorrection
    ? data.correctionType.filter((c) => c !== "aucune").join(" + ")
    : "sans correction connue";

  const activityLabel = ACTIVITY_LABELS[data.mainActivity];
  const frequenceLabel = FREQUENCE_LABELS[data.frequencePort];

  const plaintes = data.genesActuelles.filter((g) => g !== "aucune");
  const plaintesText =
    plaintes.length > 0
      ? ` Gênes : ${plaintes
          .map((p) =>
            p
              .replace("halos_nuit", "halos nocturnes")
              .replace("fatigue_visuelle", "fatigue visuelle")
              .replace("maux_de_tete", "maux de tête")
              .replace("vision_floue_pres", "vision floue de près")
              .replace("vision_floue_loin", "vision floue de loin")
              .replace("eblouissement", "éblouissements")
          )
          .join(", ")}.`
      : "";

  const oppoCount = opportunites.length;
  const oppoText = oppoCount > 0 ? ` ${oppoCount} opportunité${oppoCount > 1 ? "s" : ""} détectée${oppoCount > 1 ? "s" : ""}.` : "";

  const profileText = `Client ${frequenceLabel} — ${corrections} — ${activityLabel}.${plaintesText}${oppoText}`;

  return {
    profileText,
    complexiteScore,
    complexiteLabel,
    lensRecommendations,
    opportunites,
    alertes,
    frameFilters: {
      excludeMaterials: [...new Set(excludeMaterials)],
      requiredFeatures: [...new Set(requiredFeatures)],
      styleKeywords,
      priceRanges,
      recommendedShapes,
    },
    scriptConseil: scriptConseil.slice(0, 4),
  };
}
