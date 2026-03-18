export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail, smtpConfigured } from "@/lib/mailer";
import { sendRelanceEmail } from "@/lib/relance-emails";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const regles = await prisma.regleRelance.findMany({
    where: { actif: true },
    orderBy: { delaiJours: "asc" },
  });

  if (regles.length === 0) {
    return NextResponse.json({ message: "Aucune regle active", sent: 0 });
  }

  const dossiersEnAttente = await prisma.dossierTiersPayant.findMany({
    where: {
      statut: "EN_ATTENTE",
      relanceDesactivee: false,
      relanceCount: { lt: 3 },
      montant: { gt: 1 },
    },
    include: {
      relances: { where: { statut: "envoyee" }, select: { delaiJours: true } },
      user: { select: { name: true, email: true } },
    },
  });

  let sent = 0;
  let errors = 0;
  const appUrl = process.env.NEXTAUTH_URL || "https://app.audibot.fr";

  for (const dossier of dossiersEnAttente) {
    const joursEcoules = Math.round((now.getTime() - dossier.dateEnvoi.getTime()) / (1000 * 60 * 60 * 24));
    const delaisDejaRelances = dossier.relances.map((r) => r.delaiJours);

    const reglesApplicables = regles.filter((r) => !r.mutuelle || r.mutuelle === dossier.mutuelle);

    for (const regle of reglesApplicables) {
      if (joursEcoules >= regle.delaiJours && !delaisDejaRelances.includes(regle.delaiJours)) {
        try {
          await prisma.$transaction([
            prisma.relanceLog.create({
              data: {
                dossierId: dossier.id,
                type: regle.action,
                delaiJours: regle.delaiJours,
                statut: "envoyee",
                datePrevu: now,
                dateExecution: now,
              },
            }),
            prisma.dossierTiersPayant.update({
              where: { id: dossier.id },
              data: {
                relanceCount: { increment: 1 },
                derniereRelanceAt: now,
              },
            }),
          ]);

          if ((regle.action === "email" || regle.action === "both") && smtpConfigured() && dossier.user.email) {
            await sendMail({
              to: dossier.user.email,
              subject: `AudiBot — Relance dossier ${dossier.reference} (J+${regle.delaiJours})`,
              html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:20px;font-weight:800;margin-bottom:8px;">Relance automatique — ${dossier.reference}</h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Le dossier <strong>${dossier.reference}</strong> (${dossier.mutuelle}) de
    <strong>${dossier.montant.toFixed(2)} EUR</strong> est en attente depuis
    <strong>${joursEcoules} jours</strong> (envoye le ${dossier.dateEnvoi.toLocaleDateString("fr-FR")}).
  </p>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Ceci est la relance n&deg;${dossier.relanceCount + 1} (J+${regle.delaiJours}).
  </p>
  <a href="${appUrl}/tiers-payant"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#4f46e5;color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
    Voir le dossier
  </a>
  <p style="font-size:11px;color:#cbd5e1;margin-top:32px;">
    AudiBot — contact@audibot.fr
  </p>
</body></html>`,
            }).catch((err) => {
              console.error(`[cron/relances-tp] Erreur email pour ${dossier.reference}:`, err);
            });
          }

          /* --- Email relance vers la mutuelle --- */
          if ((regle.action === "email" || regle.action === "both") && smtpConfigured()) {
            const templateType =
              dossier.relanceCount === 0
                ? "amiable"
                : dossier.relanceCount === 1
                  ? "ferme"
                  : "mise_en_demeure";

            const template = await prisma.templateRelance.findFirst({
              where: { actif: true, type: templateType },
              orderBy: { createdAt: "desc" },
            });

            const templateData = template
              ? { objet: template.objet, contenu: template.contenu }
              : null;

            await sendRelanceEmail(
              {
                reference: dossier.reference,
                mutuelle: dossier.mutuelle,
                montant: dossier.montant,
                dateEnvoi: dossier.dateEnvoi,
              },
              templateData,
              dossier.user.email ?? undefined
            ).catch((err) =>
              console.error(
                `[cron/relances-tp] Erreur email mutuelle ${dossier.reference}:`,
                err
              )
            );
          }

          sent++;
        } catch (err) {
          console.error(`[cron/relances-tp] Erreur pour ${dossier.reference}:`, err);
          errors++;
        }
        break;
      }
    }
  }

  return NextResponse.json({ sent, errors, totalDossiers: dossiersEnAttente.length, reglesActives: regles.length });
}
