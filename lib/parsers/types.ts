export interface Personne {
  nom: string;
  prenom: string;
  numeroSecuriteSociale: string;
  dateNaissance: string;
}

export interface MutuelleData {
  organisme: string;
  numeroAMC: string;
  numeroAdherent: string;
  numeroTeletransmission: string;
  typeConv: string;
  dateDebutValidite: string;
  dateFinValidite: string;
  nom: string;
  prenom: string;
  numeroSecuriteSociale: string;
  dateNaissance: string;
  personnes: Personne[];
  fieldConfidence?: Record<string, number>;
}

export interface CorrectionOeil {
  sphere: string;
  cylindre: string;
  axe: string;
  addition: string;
}

export interface CorrectionLentille extends CorrectionOeil {
  rayonCourbure: string;
  diametre: string;
}

export interface OrdonnanceData {
  nomOphtalmologue: string;
  rpps: string;
  adeli: string;
  dateOrdonnance: string;
  dateValidite: string;
  nomPatient: string;
  prenomPatient: string;
  dateNaissancePatient: string;
  distancePupillaire: string;
  typePrescription: "lunettes" | "lentilles" | "les deux" | "";
  lunettesOD: CorrectionOeil;
  lunettesOG: CorrectionOeil;
  lentillesOD: CorrectionLentille;
  lentillesOG: CorrectionLentille;
  remarques: string;
  fieldConfidence?: Record<string, number>;
}
