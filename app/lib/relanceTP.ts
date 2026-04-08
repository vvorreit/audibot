import { prisma } from "@/lib/db";
import { sendMail, smtpConfigured } from "@/lib/mailer";
import { createNotification } from "@/app/actions/notifications";

const DELAI_RELANCE_JOURS = 15;
const MAX_RELANCES = 3;

interface RelanceResult {
  sent: number;
  errors: number;
  totalDossiers: number;
}

/**
 * Traite les relances automatiques des dossiers tiers-payant en attente.
 *
 * Criteres :
 *  - statut EN_ATTENTE
 *  - dateEnvoi > 15 jours
 *  - relanceDesactivee = false
 *  - relanceCount < 3
 *  - derniereRelanceAt null OU > 15 jours
 *
 * Pour chaque dossier eligible :
 *  - Incremente relanceCount + met a jour derniereRelanceAt
 *  - Cree un RelanceLog (type AUTO)
 *  - Envoie un email recapitulatif a l'utilisateur
 */
export async function processRelances(): Promise<RelanceResult> {
  const now = new Date();
  const seuilDate = new Date(now.getTime() - DELAI_RELANCE_JOURS * 24 * 60 * 60 * 1000);

  const dossiers = await prisma.dossierTiersPayant.findMany({
    where: {
      statut: "EN_ATTENTE",
      relanceDesactivee: false,
      relanceCount: { lt: MAX_RELANCES },
      dateEnvoi: { lt: seuilDate },
      OR: [
        { derniereRelanceAt: null },
        { derniereRelanceAt: { lt: seuilDate } },
      ],
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (dossiers.length === 0) {
    return { sent: 0, errors: 0, totalDossiers: 0 };
  }

  /* Grouper par utilisateur pour envoyer un seul email recapitulatif */
  const byUser = new Map<
    string,
    {
      email: string | null;
      name: string | null;
      dossiers: typeof dossiers;
    }
  >();

  for (const d of dossiers) {
    const existing = byUser.get(d.userId);
    if (existing) {
      existing.dossiers.push(d);
    } else {
      byUser.set(d.userId, {
        email: d.user.email,
        name: d.user.name,
        dossiers: [d],
      });
    }
  }

  let sent = 0;
  let errors = 0;
  const appUrl = process.env.NEXTAUTH_URL || "https://audibot.fr";

  for (const [userId, userData] of Array.from(byUser.entries())) {
    try {
      /* 1. Mettre a jour chaque dossier + creer les RelanceLog en transaction */
      await prisma.$transaction(
        userData.dossiers.flatMap((d) => [
          prisma.dossierTiersPayant.update({
            where: { id: d.id },
            data: {
              relanceCount: { increment: 1 },
              derniereRelanceAt: now,
            },
          }),
          prisma.relanceLog.create({
            data: {
              dossierId: d.id,
              type: "AUTO",
              delaiJours: Math.round(
                (now.getTime() - d.dateEnvoi.getTime()) / (1000 * 60 * 60 * 24)
              ),
              statut: "envoyee",
              datePrevu: now,
              dateExecution: now,
            },
          }),
        ])
      );

      /* 2. Email recapitulatif a l'utilisateur */
      if (smtpConfigured() && userData.email) {
        const dossierRows = userData.dossiers
          .map((d) => {
            const jours = Math.round(
              (now.getTime() - d.dateEnvoi.getTime()) / (1000 * 60 * 60 * 24)
            );
            return `<tr>
              <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${d.reference}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${d.mutuelle}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${d.montant.toFixed(2)} &euro;</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${jours} j</td>
            </tr>`;
          })
          .join("");

        const count = userData.dossiers.length;

        await sendMail({
          to: userData.email,
          subject: `AudiBot \u2014 Relance tiers payant (${count} dossier${count > 1 ? "s" : ""} en attente)`,
          html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:20px;font-weight:800;margin-bottom:8px;">
    Relance automatique \u2014 ${count} dossier${count > 1 ? "s" : ""} en attente
  </h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Bonjour${userData.name ? ` ${userData.name}` : ""},<br/>
    Les dossiers suivants sont en attente de r\u00e8glement depuis plus de ${DELAI_RELANCE_JOURS} jours :
  </p>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0;">
    <thead>
      <tr style="background:#f1f5f9;">
        <th style="padding:8px 12px;text-align:left;">R\u00e9f\u00e9rence</th>
        <th style="padding:8px 12px;text-align:left;">Mutuelle</th>
        <th style="padding:8px 12px;text-align:right;">Montant</th>
        <th style="padding:8px 12px;text-align:center;">Attente</th>
      </tr>
    </thead>
    <tbody>
      ${dossierRows}
    </tbody>
  </table>
  <a href="${appUrl}/dashboard/tiers-payant"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2563eb;color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
    Voir mes dossiers
  </a>
  <p style="font-size:11px;color:#cbd5e1;margin-top:32px;">
    AudiBot \u2014 contact@audibot.fr
  </p>
</body></html>`,
        }).catch((err) => {
          console.error(`[relanceTP] Erreur email pour userId=${userId}:`, err);
        });
      }

      /* 3. Notification in-app pour chaque dossier */
      for (const d of userData.dossiers) {
        const jours = Math.round(
          (now.getTime() - d.dateEnvoi.getTime()) / (1000 * 60 * 60 * 24)
        );
        await createNotification(
          userId,
          "relance_tp",
          "Relance automatique",
          `Dossier ${d.reference} (${d.mutuelle}) en attente depuis ${jours} jours`,
          "/dashboard/tiers-payant"
        ).catch((err) =>
          console.error(`[relanceTP] Erreur notif ${d.reference}:`, err)
        );
      }

      sent += userData.dossiers.length;
    } catch (err) {
      console.error(`[relanceTP] Erreur pour userId=${userId}:`, err);
      errors += userData.dossiers.length;
    }
  }

  return { sent, errors, totalDossiers: dossiers.length };
}
