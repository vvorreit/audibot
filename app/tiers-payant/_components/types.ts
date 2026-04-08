export interface HistoriqueEntry {
  id: string;
  ancienStatut: string;
  nouveauStatut: string;
  commentaire: string | null;
  auteurNom: string;
  createdAt: string;
}

export interface DossierTP {
  id: string;
  reference: string;
  mutuelle: string;
  montant: number;
  dateEnvoi: string;
  numeroAdherent: string | null;
  referenceInterne: string | null;
  statut: string;
  montantRecu: number | null;
  dateReception: string | null;
  motifRejet: string | null;
  commentaire: string | null;
  mode: string | null;
  createdBy: string;
  createdAt: string;
  historique: HistoriqueEntry[];
}

export type SortKey = "reference" | "mutuelle" | "montant" | "dateEnvoi" | "statut" | "mode";
