export const dynamic = "force-dynamic";

/**
 * Cron J+5 — Réactivation douce
 * Cible : users inscrits il y a ~5 jours qui n'ont toujours pas atteint onboardingStep 4
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

  const BASE_URL = process.env.NEXTAUTH_URL || "https://audibot.fr";
  const now = new Date();
  const from = new Date(now.getTime() - 121 * 60 * 60 * 1000);
  const to   = new Date(now.getTime() - 119 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      onboardingStep: { lt: 4 },
      emailVerified: { not: null },
    },
    select: { id: true, email: true, name: true, onboardingStep: true, clientCount: true },
    take: 50,
  });

  let sent = 0;
  for (const user of users) {
    if (!user.email) continue;

    const firstName = user.name?.split(" ")[0] || "";
    const blockingStep = user.onboardingStep < 1
      ? "l'installation de l'extension Chrome"
      : user.clientCount === 0
        ? "votre premier scan de document"
        : "le remplissage automatique sur un portail";

    const nextUrl = user.onboardingStep < 1
      ? `${BASE_URL}/extension`
      : `${BASE_URL}/dashboard`;

    try {
      await sendMail({
        to: user.email,
        subject: "On peut vous aider à débloquer ça ?",
        html: emailWrapper({
          unsubscribeEmail: user.email,
          content: `
            ${h1(`${firstName ? `${firstName}, on` : "On"} a vu que vous étiez bloqué 🙋`)}
            ${bodyText(`Vous avez créé votre compte AudiBot il y a 5 jours. La prochaine étape pour vous : <strong>${blockingStep}</strong>.`)}
            ${bodyText(`C'est souvent une question de configuration initiale — nos utilisateurs qui franchissent cette étape économisent en moyenne <strong>1h30 par jour</strong>.`)}
            ${infoBox(`<strong>Vous êtes bloqué quelque part ?</strong><br>Répondez directement à cet email — notre équipe vous répond en moins d'une heure, en français.`)}
            ${ctaButton("Reprendre la configuration", nextUrl)}
            ${smallText(`Il vous reste ${14 - 5} jours d'essai gratuit.`)}
          `,
        }),
      });
      sent++;
    } catch (err) {
      console.error(`[cron/onboarding-j5] Erreur pour ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: users.length });
}
