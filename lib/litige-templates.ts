import {
  replaceVariables as baseReplace,
  formatDate,
  formatMontant,
  MUTUELLE_EMAILS,
} from "@/lib/relance-emails";

export { MUTUELLE_EMAILS };

interface LitigeDossier {
  reference: string;
  mutuelle: string;
  montant: number;
  dateEnvoi: Date | string;
  motifRejet?: string | null;
  numeroAdherent?: string | null;
}

interface LitigeContext {
  nomOpticien: string;
  adresseOpticien: string;
  siretOpticien: string;
}

function computeNombreJours(dateEnvoi: Date | string): number {
  const d = typeof dateEnvoi === "string" ? new Date(dateEnvoi) : dateEnvoi;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function replaceLitigeVariables(
  text: string,
  dossier: LitigeDossier,
  ctx: LitigeContext
): string {
  let result = baseReplace(text, {
    reference: dossier.reference,
    mutuelle: dossier.mutuelle,
    montant: dossier.montant,
    dateEnvoi: dossier.dateEnvoi,
  });

  result = result
    .replace(/\{\{nombre_jours\}\}/g, String(computeNombreJours(dossier.dateEnvoi)))
    .replace(/\{\{motif_rejet\}\}/g, dossier.motifRejet ?? "Non precise")
    .replace(/\{\{numero_adherent\}\}/g, dossier.numeroAdherent ?? "N/A")
    .replace(/\{\{nom_opticien\}\}/g, ctx.nomOpticien)
    .replace(/\{\{adresse_opticien\}\}/g, ctx.adresseOpticien)
    .replace(/\{\{siret_opticien\}\}/g, ctx.siretOpticien)
    .replace(/\{\{date_courrier\}\}/g, formatDate(new Date()))
    .replace(/\{\{montant_formate\}\}/g, formatMontant(dossier.montant));

  return result;
}

export const TEMPLATE_MISE_EN_DEMEURE = `{{nom_opticien}}
{{adresse_opticien}}
SIRET : {{siret_opticien}}

{{nom_mutuelle}}
Service Tiers-Payant

{{date_courrier}}

Objet : MISE EN DEMEURE — Dossier n\u00b0 {{reference_dossier}}

Lettre recommandee avec accuse de reception

Madame, Monsieur,

Par la presente, je vous mets en demeure de proceder au reglement de la somme de {{montant}} correspondant au dossier de tiers-payant reference {{reference_dossier}}, transmis le {{date_envoi}}, soit il y a {{nombre_jours}} jours.

Malgre le delai reglementaire prevu par les articles L.162-21 et R.161-47 du Code de la securite sociale, et en depit de nos precedentes relances, ce reglement n'a toujours pas ete effectue a ce jour.

Conformement aux dispositions de l'article L.133-4 du Code de la securite sociale et a l'accord national interprofessionnel relatif aux echanges tiers-payant, vous etes tenu de proceder au reglement dans un delai de 30 jours a compter de la reception du dossier complet.

Je vous mets donc en demeure de regulariser cette situation sous 15 jours a compter de la reception de la presente. A defaut, je me reserverai le droit de :
- Saisir le mediateur de votre organisme ;
- Engager une procedure de recouvrement ;
- Facturer des penalites de retard conformement a la reglementation en vigueur.

Details du dossier :
- Reference : {{reference_dossier}}
- Organisme : {{nom_mutuelle}}
- Montant : {{montant}}
- Date de transmission : {{date_envoi}}
- Nombre de jours ecoules : {{nombre_jours}}

Dans l'attente de votre reglement rapide, je vous prie d'agreer, Madame, Monsieur, l'expression de mes salutations distinguees.

{{nom_opticien}}`;

export const TEMPLATE_CONTESTATION_REJET = `{{nom_opticien}}
{{adresse_opticien}}
SIRET : {{siret_opticien}}

{{nom_mutuelle}}
Service Tiers-Payant

{{date_courrier}}

Objet : CONTESTATION DE REJET — Dossier n\u00b0 {{reference_dossier}}

Madame, Monsieur,

Je conteste par la presente le rejet du dossier de tiers-payant reference {{reference_dossier}}, transmis le {{date_envoi}} pour un montant de {{montant}}.

Motif de rejet invoque : {{motif_rejet}}

Je considere ce rejet non fonde pour les raisons suivantes :
- Le dossier a ete transmis dans les delais reglementaires prevus par l'article R.161-47 du Code de la securite sociale ;
- L'ensemble des pieces justificatives requises (ordonnance, devis, facture) ont ete fournies ;
- Les droits du beneficiaire etaient ouverts a la date de la prestation.

Conformement aux dispositions de l'accord national interprofessionnel relatif aux echanges tiers-payant et a l'article L.162-21 du Code de la securite sociale, je vous demande de reexaminer ce dossier et de proceder au reglement dans les meilleurs delais.

Je joins a la presente les documents suivants :
- Copie de la facture et du devis ;
- Copie de l'ordonnance ;
- Attestation de droits du beneficiaire (si disponible).

Details du dossier :
- Reference : {{reference_dossier}}
- Organisme : {{nom_mutuelle}}
- Montant : {{montant}}
- Date de transmission : {{date_envoi}}
- Motif de rejet : {{motif_rejet}}

A defaut de reponse favorable sous 30 jours, je me reserverai le droit de saisir le mediateur de votre organisme.

Dans l'attente de votre retour, je vous prie d'agreer, Madame, Monsieur, l'expression de mes salutations distinguees.

{{nom_opticien}}`;

export function renderLitigeTemplate(
  type: "mise_en_demeure" | "contestation_rejet",
  dossier: LitigeDossier,
  ctx: LitigeContext
): string {
  const template =
    type === "mise_en_demeure"
      ? TEMPLATE_MISE_EN_DEMEURE
      : TEMPLATE_CONTESTATION_REJET;

  return replaceLitigeVariables(template, dossier, ctx);
}
