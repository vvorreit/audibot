export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail, smtpConfigured } from "@/lib/mailer";

const ALERTES_JOURS = [60, 30, 7];

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const appUrl = process.env.NEXTAUTH_URL || "https://app.audibot.fr";
  let created = 0;
  let emailsSent = 0;

  for (const joursAvant of ALERTES_JOURS) {
    const dateOrdonnanceCible = new Date(now);
    dateOrdonnanceCible.setFullYear(dateOrdonnanceCible.getFullYear() - 2);
    dateOrdonnanceCible.setDate(dateOrdonnanceCible.getDate() + joursAvant);

    const dateDebut = new Date(dateOrdonnanceCible);
    dateDebut.setHours(0, 0, 0, 0);
    const dateFin = new Date(dateOrdonnanceCible);
    dateFin.setHours(23, 59, 59, 999);

    const dossiers = await prisma.dossierTiersPayant.findMany({
      where: {
        dateEnvoi: { gte: dateDebut, lte: dateFin },
        statut: { in: ["EN_ATTENTE", "RECU"] },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    for (const dossier of dossiers) {
      const dateExpiration = new Date(dossier.dateEnvoi);
      dateExpiration.setFullYear(dateExpiration.getFullYear() + 2);

      const existingAlerte = await prisma.alerteExpiration.findFirst({
        where: {
          userId: dossier.userId,
          dateOrdonnance: dossier.dateEnvoi,
          joursAvant,
        },
      });

      if (existingAlerte) continue;

      await prisma.alerteExpiration.create({
        data: {
          dossierId: dossier.id,
          clientNom: dossier.referenceInterne || dossier.reference,
          dateOrdonnance: dossier.dateEnvoi,
          dateExpiration,
          joursAvant,
          userId: dossier.userId,
        },
      });
      created++;

      if (smtpConfigured() && dossier.user.email) {
        try {
          await sendMail({
            to: dossier.user.email,
            subject: `AudiBot — Prescription ${dossier.reference} expire dans ${joursAvant} jours`,
            html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:20px;font-weight:800;margin-bottom:8px;">Alerte expiration prescription ORL</h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    La prescription ORL du dossier <strong>${dossier.reference}</strong>
    (${dossier.mutuelle}, ${dossier.montant.toFixed(2)} EUR)
    datee du ${dossier.dateEnvoi.toLocaleDateString("fr-FR")}
    <strong>expire dans ${joursAvant} jours</strong>
    (le ${dateExpiration.toLocaleDateString("fr-FR")}).
  </p>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Pensez a contacter le patient pour un renouvellement.
  </p>
  <a href="${appUrl}/tiers-payant/alertes"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#4f46e5;color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
    Voir les alertes
  </a>
  <p style="font-size:11px;color:#cbd5e1;margin-top:32px;">AudiBot — contact@audibot.fr</p>
</body></html>`,
          });
          await prisma.alerteExpiration.updateMany({
            where: { userId: dossier.userId, dateOrdonnance: dossier.dateEnvoi, joursAvant },
            data: { notifEmail: true },
          });
          emailsSent++;
        } catch (err) {
          console.error(`[cron/alertes-expiration] Erreur email:`, err);
        }
      }
    }
  }

  return NextResponse.json({ created, emailsSent });
}
