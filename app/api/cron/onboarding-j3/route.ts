export const dynamic = "force-dynamic";

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
  const from = new Date(now.getTime() - 73 * 60 * 60 * 1000);
  const to   = new Date(now.getTime() - 71 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      clientCount: 0,
      emailVerified: { not: null },
    },
    select: { email: true, name: true },
    take: 50,
  });

  let sent = 0;
  for (const user of users) {
    if (!user.email) continue;
    try {
      const firstName = user.name?.split(" ")[0] || "";
      await sendMail({
        to: user.email,
        subject: "47 minutes économisées cette semaine — et vous ?",
        html: emailWrapper({
          unsubscribeEmail: user.email,
          content: `
            ${h1(`Les opticiens avancent sans vous 😉`)}
            ${bodyText(`Cette semaine, les utilisateurs AudiBot ont économisé en moyenne <strong>47 minutes de saisie</strong>. Vous êtes inscrit${firstName ? `, ${firstName},` : ""} mais vous n'avez pas encore testé le remplissage automatique.`)}
            ${infoBox(`🤖 En pratique : scannez une carte mutuelle → AudiBot remplit Almerys, Wemind, Viamedis en 10 secondes. Pas de copier-coller, pas d'erreur de NSS.`)}
            ${bodyText(`Ça prend <strong>30 secondes</strong> pour voir ce que ça donne sur votre premier dossier.`)}
            ${ctaButton("Tester maintenant — gratuit 14 jours", `${BASE_URL}/dashboard`)}
            ${smallText(`Pas encore l'extension ? <a href="${BASE_URL}/extension" style="color:#2563eb;text-decoration:underline;">Installez-la en 2 minutes</a>. Notre équipe répond à vos questions — répondez simplement à cet email.`)}
          `,
        }),
      });
      sent++;
    } catch (err) {
      console.error(`[cron/onboarding-j3] Erreur pour ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: users.length });
}
