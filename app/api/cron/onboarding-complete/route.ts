export const dynamic = "force-dynamic";

/**
 * Email de félicitations quand onboardingStep passe à 4 (flow complet terminé).
 * Déclenché via webhook ou cron toutes les heures sur les users qui viennent de finir.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { safeCompare } from "@/lib/safeCompare";
import { emailWrapper, h1, bodyText, ctaButton, infoBox, smallText } from "@/lib/emailTemplate";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || !auth || !safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const BASE_URL = process.env.NEXTAUTH_URL || "https://optibot.fr";
  const now = new Date();
  // Users qui ont terminé l'onboarding dans la dernière heure et n'ont pas eu cet email
  const from = new Date(now.getTime() - 65 * 60 * 1000);
  const to   = new Date(now.getTime() - 5  * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      onboardingStep: { gte: 4 },
      onboardingCompletedEmailSentAt: null,
      emailVerified: { not: null },
      // Onboarding terminé dans la fenêtre
      updatedAt: { gte: from, lte: to },
    },
    select: { id: true, email: true, name: true, clientCount: true },
    take: 100,
  });

  let sent = 0;
  for (const user of users) {
    if (!user.email) continue;
    try {
      const firstName = user.name?.split(" ")[0] || "";
      const timeSaved = (user.clientCount ?? 0) * 7;
      const timeSavedStr = timeSaved >= 60
        ? `${Math.floor(timeSaved / 60)}h${String(timeSaved % 60).padStart(2, "0")}`
        : `${timeSaved} min`;

      await sendMail({
        to: user.email,
        subject: "🎉 Vous êtes prêt — OptiBot est configuré",
        html: emailWrapper({
          content: `
            ${h1(`${firstName ? `Bravo ${firstName} !` : "Bravo !"} OptiBot est prêt 🎉`)}
            ${bodyText(`Vous venez de terminer la configuration complète d'OptiBot. Tout est en place pour que chaque dossier patient prenne <strong>10 secondes au lieu de 7 minutes</strong>.`)}
            ${timeSaved > 0
              ? infoBox(`⏱ Vous avez déjà économisé <strong>${timeSavedStr}</strong> depuis votre inscription. Ce n'est que le début.`)
              : infoBox(`⏱ Sur 15 dossiers par jour, OptiBot vous fait économiser <strong>1h45 par jour</strong>. Soit 9 heures par semaine.`)
            }
            ${bodyText(`La prochaine fois qu'un patient arrive avec sa carte mutuelle, scannez-la depuis votre téléphone ou votre PC — et regardez le portail se remplir tout seul.`)}
            ${ctaButton("Ouvrir le tableau de bord", `${BASE_URL}/dashboard`)}
            ${smallText(`Une question ? Répondez directement à cet email — notre équipe est là.`)}
          `,
        }),
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingCompletedEmailSentAt: new Date() },
      });

      sent++;
    } catch (err) {
      console.error(`[cron/onboarding-complete] Erreur pour ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: users.length });
}
