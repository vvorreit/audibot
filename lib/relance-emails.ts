import { getTransporter, smtpConfigured } from "@/lib/mailer";
import { prisma } from "@/lib/db";

/**
 * Mapping mutuelle → adresse email service tiers-payant.
 * null = pas d'email connu (relance manuelle uniquement).
 */
export const MUTUELLE_EMAILS: Record<string, string | null> = {
  CPAM: "reclamation@assurance-maladie.fr",
  ALMERYS: "gestiontp@almerys.com",
  VIAMEDIS: "optique@viamedis.net",
  ITELIS: "service-optique@itelis.fr",
  KALIXIA: "gestion@kalixia.com",
  CARTE_BLANCHE: "tierspayant@carte-blanche.com",
  SANTECLAIR: "optique@santeclair.fr",
  SEVEANE: "gestion@seveane.com",
  SP_SANTE: "tp@sp-sante.fr",
  AUTRE: null,
};

/* Noms lisibles pour le corps du mail */
const MUTUELLE_NOMS: Record<string, string> = {
  CPAM: "CPAM",
  ALMERYS: "Almerys",
  VIAMEDIS: "Viamedis",
  ITELIS: "Itelis",
  KALIXIA: "Kalixia",
  CARTE_BLANCHE: "Carte Blanche",
  SANTECLAIR: "Santeclair",
  SEVEANE: "Seveane",
  SP_SANTE: "SP Sante",
  AUTRE: "Mutuelle",
};

interface DossierData {
  reference: string;
  mutuelle: string;
  montant: number;
  dateEnvoi: Date | string;
}

interface TemplateData {
  objet: string;
  contenu: string;
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatMontant(montant: number): string {
  return montant.toFixed(2).replace(".", ",") + " \u20ac";
}

function defaultTemplate(): TemplateData {
  return {
    objet:
      "Relance tiers-payant \u2013 Dossier {{reference_dossier}}",
    contenu: `Madame, Monsieur,

Sauf erreur de notre part, nous n'avons pas re\u00e7u le r\u00e8glement correspondant au dossier suivant :

- R\u00e9f\u00e9rence dossier : {{reference_dossier}}
- Organisme : {{nom_mutuelle}}
- Montant : {{montant}}
- Date d'envoi : {{date_envoi}}
- Date du pr\u00e9sent courrier : {{date_courrier}}

Nous vous remercions de bien vouloir proc\u00e9der au r\u00e8glement dans les meilleurs d\u00e9lais ou, le cas \u00e9ch\u00e9ant, de nous indiquer le motif du retard.

Dans l'attente de votre retour, nous vous prions d'agr\u00e9er, Madame, Monsieur, l'expression de nos salutations distingu\u00e9es.`,
  };
}

export function replaceVariables(
  text: string,
  dossier: DossierData
): string {
  const nomMutuelle = MUTUELLE_NOMS[dossier.mutuelle] ?? dossier.mutuelle;
  return text
    .replace(/\{\{nom_mutuelle\}\}/g, nomMutuelle)
    .replace(/\{\{montant\}\}/g, formatMontant(dossier.montant))
    .replace(/\{\{date_envoi\}\}/g, formatDate(dossier.dateEnvoi))
    .replace(/\{\{reference_dossier\}\}/g, dossier.reference)
    .replace(/\{\{date_courrier\}\}/g, formatDate(new Date()));
}

/** Construit le contenu d'un email de relance (sujet, texte brut, HTML). */
export function buildEmailContent(
  dossier: DossierData,
  template: TemplateData | null
): { subject: string; text: string; html: string } {
  const tpl = template ?? defaultTemplate();
  const subject = replaceVariables(tpl.objet, dossier);
  const text = replaceVariables(tpl.contenu, dossier);

  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.7;">${text}</pre>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
  <p style="font-size:11px;color:#94a3b8;">
    Email envoy\u00e9 automatiquement via AudiBot \u2014 contact@audibot.fr
  </p>
</body></html>`;

  return { subject, text, html };
}

/**
 * Envoie un email de relance a la mutuelle du dossier.
 * Retourne { sent, to } — sent=false si la mutuelle n'a pas d'email connu.
 */
export async function sendRelanceEmail(
  dossier: DossierData,
  template: TemplateData | null,
  userEmail?: string
): Promise<{ sent: boolean; to: string | null }> {
  /* Chercher l'email en base (config personnalisable), fallback sur le mapping hardcode */
  let mutuelleEmail: string | null = null;
  try {
    const config = await prisma.mutuelleEmailConfig.findFirst({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { mutuelle: dossier.mutuelle as any, actif: true },
    });
    if (config) {
      mutuelleEmail = config.emailPerso || config.emailDefaut || null;
    }
  } catch {
    /* Table pas encore migr\u00e9e \u2014 fallback silencieux */
  }
  if (!mutuelleEmail) {
    mutuelleEmail = MUTUELLE_EMAILS[dossier.mutuelle] ?? null;
  }

  if (!mutuelleEmail) {
    return { sent: false, to: null };
  }

  if (!smtpConfigured()) {
    console.error("[relance-emails] SMTP non configure \u2014 email non envoye");
    return { sent: false, to: mutuelleEmail };
  }

  const { subject, html: bodyHtml } = buildEmailContent(dossier, template);

  const from = process.env.SMTP_FROM ?? "AudiBot <contact@audibot.fr>";

  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    to: mutuelleEmail,
    cc: userEmail,
    subject,
    html: bodyHtml,
    replyTo: userEmail,
  });

  return { sent: true, to: mutuelleEmail };
}
