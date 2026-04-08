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

  const BASE_URL = process.env.NEXTAUTH_URL || "https://audibot.fr";
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthLabel = prevMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  // Find all ADMIN users with at least 5 delivered bilans last month
  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      bilanSessions: {
        some: {
          delivered: true,
          createdAt: { gte: prevMonth, lt: endPrevMonth },
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      teamId: true,
    },
  });

  let sent = 0;

  for (const admin of admins) {
    const ownerFilter = admin.teamId ? { teamId: admin.teamId } : { userId: admin.id };

    const sessions = await prisma.bilanSession.findMany({
      where: {
        ...ownerFilter,
        createdAt: { gte: prevMonth, lt: endPrevMonth },
      },
      select: {
        delivered: true,
        payload: true,
        npsScore: true,
      },
      take: 1000, // Limiter pour éviter OOM
    });

    const delivered = sessions.filter((s) => s.delivered);
    if (delivered.length < 5) continue;

    // Quick stats
    const alertesCount = { urgent: 0, attention: 0, info: 0 };
    const correctionMap: Record<string, number> = {};
    const npsScores: number[] = [];

    for (const s of delivered) {
      if (s.npsScore !== null) npsScores.push(s.npsScore);
      if (!s.payload) continue;
      try {
        const result = JSON.parse(s.payload);
        for (const a of result.alertes ?? []) {
          if (a.niveau in alertesCount) alertesCount[a.niveau as keyof typeof alertesCount]++;
        }
        for (const rec of result.lensRecommendations ?? []) {
          correctionMap[rec.label] = (correctionMap[rec.label] ?? 0) + 1;
        }
      } catch { /* skip */ }
    }

    const top3 = Object.entries(correctionMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([label, count]) => `${label} (${count})`)
      .join(", ");

    let npsText = "";
    if (npsScores.length > 0) {
      const promo = npsScores.filter((s) => s >= 9).length;
      const detra = npsScores.filter((s) => s <= 6).length;
      const nps = Math.round(((promo - detra) / npsScores.length) * 100);
      npsText = `Score NPS : ${nps} (${npsScores.length} réponses)`;
    }

    const html = emailWrapper({
      content: [
        h1(`Rapport bilan — ${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}`),
        bodyText(`Bonjour${admin.name ? ` ${admin.name}` : ""}, voici le résumé de vos bilans du mois dernier.`),
        bodyText(`<strong>${delivered.length}</strong> bilans complétés sur ${sessions.length} créés.`),
        top3 ? bodyText(`<strong>Top recommandations :</strong> ${top3}`) : "",
        bodyText(
          `<strong>Alertes :</strong> ${alertesCount.urgent} urgentes, ${alertesCount.attention} attention, ${alertesCount.info} info`
        ),
        npsText ? bodyText(npsText) : "",
        `<div style="text-align:center;">${ctaButton("Voir le rapport complet", `${BASE_URL}/dashboard/rapport`)}</div>`,
        smallText("Ce rapport est généré automatiquement chaque mois."),
      ].join(""),
      unsubscribeEmail: admin.email ?? undefined,
    });

    try {
      await sendMail({
        to: admin.email!,
        subject: `Rapport bilan ${monthLabel} — ${delivered.length} bilans complétés`,
        html,
      });
      sent++;
    } catch (e) {
      console.error(`[cron] Erreur envoi rapport bilan à ${admin.email}:`, e);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
