import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export const MUTUELLES = [
  { value: "CPAM", label: "CPAM" },
  { value: "ALMERYS", label: "Almerys" },
  { value: "VIAMEDIS", label: "Viamedis" },
  { value: "ITELIS", label: "Itelis / AG2R" },
  { value: "KALIXIA", label: "Kalixia / Actil" },
  { value: "CARTE_BLANCHE", label: "Carte Blanche" },
  { value: "SANTECLAIR", label: "Santeclair" },
  { value: "SEVEANE", label: "Séveane" },
  { value: "SP_SANTE", label: "SP Santé" },
  { value: "AUTRE", label: "Autre" },
] as const;

/* Mapping organisme brut → label lisible (stocké dans referenceInterne préfixé par ORG:) */
export function getOrganismeLabel(dossier: { mutuelle: string; referenceInterne?: string | null }): string {
  // Si referenceInterne contient un libellé organisme encodé
  if (dossier.referenceInterne?.startsWith("ORG:")) {
    return dossier.referenceInterne.slice(4);
  }
  return MUTUELLES.find((m) => m.value === dossier.mutuelle)?.label || dossier.mutuelle;
}

export const STATUT_CONFIG: Record<string, { label: string; color: string; bgBtn: string; icon: React.ElementType }> = {
  EN_ATTENTE: { label: "En attente", color: "bg-amber-100 text-amber-700", bgBtn: "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200", icon: Clock },
  RECU: { label: "Reçu", color: "bg-green-100 text-green-700", bgBtn: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200", icon: CheckCircle },
  REJETE: { label: "Rejeté", color: "bg-red-100 text-red-700", bgBtn: "bg-red-50 text-red-600 hover:bg-red-100 border-red-200", icon: XCircle },
  EN_LITIGE: { label: "En litige", color: "bg-slate-100 text-slate-600", bgBtn: "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200", icon: AlertTriangle },
};

export const MOTIFS_REJET = [
  { value: "doublon", label: "Doublon" },
  { value: "piece_manquante", label: "Pièce manquante" },
  { value: "delai_depasse", label: "Délai dépassé" },
  { value: "droits_expires", label: "Droits expirés" },
  { value: "autre", label: "Autre" },
] as const;

export const NOEMIE_CODES = [
  { code: "57", label: "Rejet signature", desc: "Signature électronique invalide" },
  { code: "100", label: "Doublon FSE", desc: "FSE déjà transmise" },
  { code: "200", label: "Bénéficiaire inconnu", desc: "Droits non ouverts" },
  { code: "210", label: "Droits expirés", desc: "Droits du bénéficiaire clos" },
  { code: "300", label: "Prescripteur", desc: "N. prescripteur invalide" },
  { code: "400", label: "Acte non pris en charge", desc: "Code LPP non reconnu" },
  { code: "500", label: "Date prescription", desc: "Ordonnance expirée" },
  { code: "600", label: "Complément info", desc: "Pièces justificatives manquantes" },
  { code: "896", label: "Rejet technique", desc: "Erreur technique NOEMIE" },
  { code: "1946", label: "Organisme inconnu", desc: "Centre payeur non identifié" },
] as const;

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}
