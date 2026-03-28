export const dynamic = "force-dynamic";

/**
 * Email J+15 — Réactivation post-essai
 * Cible : users dont l'essai vient d'expirer (créé il y a 14-15 jours) sans abonnement actif
 * C'est l'email de conversion le plus impactant de la séquence.
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
  // Inscrits il y a 14-15 jours (essai de 14 jours expiré)
  const from = new Date(now.getTime() - 361 * 60 * 60 * 1000); // ~15j
  const to   = new Date(now.getTime() - 335 * 60 * 60 * 1000); // ~14j

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      isPro: false,
      emailVerified: { not: null },
    },
    select: { id: true, email: true, name: true, clientCount: true },
    take: 50,
  });

  let sent = 0;
  for (const user of users) {
    if (!user.email) continue;
    try {
      const firstName = user.name?.split(" ")[0] || "";
      const scans = user.clientCount ?? 0;
      const timeSaved = scans * 7;
      const timeSavedStr = timeSaved >= 60
        ? `${Math.floor(timeSaved / 60)}h${String(timeSaved % 60).padStart(2, "0")}`
        : `${timeSaved} minutes`;

      const hasUsed = scans > 0;

      await sendMail({
        to: user.email,
        subject: hasUsed
          ? `Votre essai s'est terminé — et vous avez économisé ${timeSavedStr}`
          : "Votre essai OptiBot s'est terminé hier",
        html: emailWrapper({
          unsubscribeEmail: user.email,
          content: hasUsed ? `
            ${h1(`${firstName ? `${firstName}, votre` : "Votre"} essai est terminé — mais vos résultats restent 📊`)}
            ${infoBox(`En ${scans} dossier${scans > 1 ? "s" : ""} traité${scans > 1 ? "s" : ""}, vous avez économisé <strong>${timeSavedStr} de saisie manuelle</strong>. Sur un an, ça représente <strong>${Math.round(timeSaved * 52 / 60)}h</strong> récupérées.`)}
            ${bodyText(`Pour continuer à économiser ce temps, choisissez le plan qui correspond à votre activité. Sans engagement — annulable à tout moment.`)}
            ${ctaButton("Continuer avec OptiBot →", `${BASE_URL}/dashboard`)}
            ${smallText(`Essai expirté — accès lecture seule. <a href="${BASE_URL}/dashboard" style="color:#2563eb;text-decoration:underline;">Voir les plans →</a>`)}
          ` : `
            ${h1(`${firstName ? `${firstName}, votre` : "Votre"} essai gratuit est terminé`)}
            ${bodyText(`Vous avez créé votre compte OptiBot il y a 14 jours mais vous n'avez pas eu l'occasion de le tester complètement.`)}
            ${bodyText(`Nos utilisateurs qui complètent la configuration économisent en moyenne <strong>1h30 par jour</strong>. Ça prend 5 minutes à mettre en place.`)}
            ${infoBox(`💡 Si vous avez eu un problème d'installation ou une question, répondez à cet email — notre équipe vous aide gratuitement, même après l'essai.`)}
            ${ctaButton("Voir les plans — à partir de 39,90€/mois", `${BASE_URL}/dashboard`)}
            ${smallText(`Pas encore convaincu ? Répondez à cet email et dites-nous ce qui vous bloque.`)}
          `,
        }),
      });
      sent++;
    } catch (err) {
      console.error(`[cron/onboarding-j15] Erreur pour ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: users.length });
}
