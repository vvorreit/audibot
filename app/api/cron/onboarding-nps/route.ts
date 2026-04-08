export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { safeCompare } from "@/lib/safeCompare";
import { emailWrapper, h1, bodyText, smallText } from "@/lib/emailTemplate";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || !auth || !safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const BASE_URL = process.env.NEXTAUTH_URL || "https://audibot.fr";
  const now = new Date();
  const from = new Date(now.getTime() - 169 * 60 * 60 * 1000);
  const to   = new Date(now.getTime() - 167 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      onboardingStep: 4,
      npsEmailSentAt: null,
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
      const timeSaved = (user.clientCount ?? 0) * 7;
      const timeSavedStr = timeSaved >= 60
        ? `${Math.floor(timeSaved / 60)}h${String(timeSaved % 60).padStart(2, "0")}`
        : `${timeSaved} minutes`;

      // Étoiles NPS cliquables 1→5
      const stars = [1, 2, 3, 4, 5].map(score => {
        const colors: Record<number, string> = { 1: "#ef4444", 2: "#f97316", 3: "#eab308", 4: "#84cc16", 5: "#22c55e" };
        return `<a href="${BASE_URL}/feedback?score=${score}" style="display:inline-block;width:48px;height:48px;line-height:48px;text-align:center;border-radius:12px;background:${colors[score]};color:white;font-size:20px;text-decoration:none;font-weight:700;margin:0 4px;">★</a>`;
      }).join("");

      await sendMail({
        to: user.email,
        subject: "Comment s'est passée votre première semaine ?",
        html: emailWrapper({
          unsubscribeEmail: user.email,
          content: `
            ${h1(`${firstName ? `${firstName}, votre` : "Votre"} première semaine avec AudiBot ⭐`)}
            ${timeSaved > 0
              ? bodyText(`En une semaine, vous avez déjà économisé <strong>${timeSavedStr}</strong> de saisie manuelle. Comment s'est passée votre expérience ?`)
              : bodyText(`Vous utilisez AudiBot depuis une semaine maintenant. Comment s'est passée votre expérience ?`)
            }
            <p style="font-size:14px;color:#475569;margin:8px 0 4px;">Votre satisfaction :</p>
            <div style="text-align:center;margin:16px 0 24px;">
              <div style="display:inline-block;">${stars}</div>
              <p style="font-size:11px;color:#94a3b8;margin:8px 0 0;">
                <span style="margin-right:32px;">😞 Décevant</span>
                <span>Excellent 😍</span>
              </p>
            </div>
            ${bodyText(`Votre avis prend 10 secondes et aide directement toute la communauté des opticiens AudiBot.`)}
            ${smallText(`Vous avez une question ou un problème ? Répondez directement à cet email — notre équipe est là.`)}
          `,
        }),
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { npsEmailSentAt: new Date() },
      });

      sent++;
    } catch (err) {
      console.error(`[cron/onboarding-nps] Erreur pour ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: users.length });
}
