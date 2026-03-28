export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { safeCompare } from "@/lib/safeCompare";
import { emailWrapper, h1, bodyText, ctaButton, smallText } from "@/lib/emailTemplate";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || !auth || !safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const BASE_URL = process.env.NEXTAUTH_URL || "https://optibot.fr";
  const now = new Date();
  const from = new Date(now.getTime() - 25 * 60 * 60 * 1000);
  const to   = new Date(now.getTime() - 23 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      onboardingStep: { lt: 1 },
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
        subject: "Une dernière étape pour commencer — OptiBot",
        html: emailWrapper({
          unsubscribeEmail: user.email,
          content: `
            ${h1(`${firstName ? `${firstName}, il` : "Il"} ne manque qu'une chose ☝️`)}
            ${bodyText(`Votre compte OptiBot est prêt. Mais sans l'extension Chrome, le remplissage automatique ne peut pas fonctionner.`)}
            ${bodyText(`L'installation prend <strong>2 minutes</strong>. Après ça, OptiBot remplit Almerys, Wemind, Viamedis et 10+ autres portails en un clic — à la place de vos 7 minutes de saisie manuelle.`)}
            ${ctaButton("Installer l'extension — 2 min", `${BASE_URL}/extension`)}
            ${smallText(`Vous l'avez déjà ? <a href="${BASE_URL}/dashboard" style="color:#2563eb;text-decoration:underline;">Accédez au tableau de bord →</a>`)}
          `,
        }),
      });
      sent++;
    } catch (err) {
      console.error(`[cron/onboarding-j1] Erreur pour ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: users.length });
}
