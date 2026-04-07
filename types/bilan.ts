// types/bilan.ts — Types pour le module bilan auditif Tablette

export interface BilanFormData {
  // Étape 0 — Identité patient
  civilite?: 'M' | 'Mme';
  nom?: string;
  prenom?: string;
  nomNaissance?: string;
  dateNaissance?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  // Étape 1 — Profil vision
  correctionType: ('myopie' | 'hypermétropie' | 'astigmatisme' | 'presbytie' | 'aucune')[];
  isProgressive: boolean;
  portLentilles: boolean;
  // Étape 2 — Plaintes & gênes
  genesActuelles: ('halos_nuit' | 'fatigue_visuelle' | 'maux_de_tete' | 'vision_floue_pres' | 'vision_floue_loin' | 'eblouissement' | 'aucune')[];
  lunettesBienSupportees: boolean;
  frequencePort: 'toujours' | 'souvent' | 'parfois' | 'rarement';
  // Étape 3 — Usages quotidiens
  screenTimeHours: number;
  mainActivity: 'bureau' | 'exterieur' | 'mixte' | 'conduite';
  sport: boolean;
  conduitNuit: boolean;
  expositionSoleil: 'rare' | 'moderee' | 'elevee';
  // Étape 4 — Confort & santé
  sensitivities: ('nickel' | 'plastique' | 'poids' | 'pression_tempes' | 'nez_sensible')[];
  antecedentsFamiliaux: boolean;
  derniereVisite: 'moins_1an' | '1_2ans' | 'plus_2ans' | 'jamais';
  // Étape 5 — Esthétique
  stylePreference: 'discret' | 'moderne' | 'classique' | 'original' | 'sport' | 'ne_sais_pas';
  stylePreferences?: ('discret' | 'moderne' | 'classique' | 'original' | 'sport' | 'ne_sais_pas')[]; // multi-select (prend le dessus sur stylePreference)
  faceShape: 'ovale' | 'rond' | 'carre' | 'allonge' | 'triangulaire' | 'inconnu';
  colorPreference: 'sombre' | 'clair' | 'colore' | 'sans_preference';
  // Étape 6 — Budget & projet
  budgetRange: 'moins_150' | '150_300' | '300_500' | 'plus_500' | 'ne_sais_pas';
  projetSecondairesPaires: boolean;
  mutuelleConnue: boolean;
}

export interface BilanResult {
  profileText: string;

  complexiteScore: 1 | 2 | 3 | 4 | 5;
  complexiteLabel: string;

  lensRecommendations: Array<{
    label: string;
    reason: string;
    priority: 'must' | 'recommended' | 'optional';
  }>;

  opportunites: Array<{
    label: string;
    reason: string;
    type: 'verre' | 'monture' | 'paire_supplementaire' | 'accessoire';
  }>;

  alertes: Array<{
    message: string;
    niveau: 'info' | 'attention' | 'urgent';
  }>;

  frameFilters: {
    excludeMaterials: string[];
    requiredFeatures: string[];
    styleKeywords: string[];
    priceRanges: string[];
    recommendedShapes: string[];
  };

  scriptConseil: string[];
}
