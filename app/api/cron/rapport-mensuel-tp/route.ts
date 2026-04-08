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

  // Mois précédent
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthParam = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = prevMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  // Tous les users PRO actifs (avec syncToken pour le lien sécurisé)
  const TP_PLANS = ["PRO", "EQUIPE", "CABINET", "RESEAU", "ENTERPRISE"];
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { isPro: true },
        { plan: { in: TP_PLANS } },
        { role: "ADMIN" },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      syncToken: true,
      plan: true,
    },
  });

  let sent = 0;
  let skipped = 0;

  // Batch : compter les dossiers par user en une seule requête au lieu de N
  const dateDebut = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
  const dateFin = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1);
  const dossierCounts = await prisma.dossierTiersPayant.groupBy({
    by: ["userId"],
    where: {
      userId: { in: users.map((u) => u.id) },
      dateEnvoi: { gte: dateDebut, lt: dateFin },
    },
    _count: true,
  });
  const countByUser = new Map(dossierCounts.map((c) => [c.userId, c._count]));

  for (const user of users) {
    if (!user.email) { skipped++; continue; }

    const count = countByUser.get(user.id) ?? 0;
    if (count === 0) { skipped++; continue; }

    // Générer un syncToken si absent
    let token = user.syncToken;
    if (!token) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { syncToken: crypto.randomUUID() },
        select: { syncToken: true },
      });
      token = updated.syncToken;
    }

    const rapportUrl = `${BASE_URL}/tiers-payant/rapport-pdf?month=${monthParam}&token=${token}`;

    const html = emailWrapper({
      content: [
        h1(`Rapport tiers-payant — ${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}`),
        bodyText(`Bonjour${user.name ? ` ${user.name}` : ""},`),
        bodyText(`Votre rapport mensuel tiers-payant est disponible pour le mois de <strong>${monthLabel}</strong>.`),
        bodyText(`Vous avez traité <strong>${count} dossier(s)</strong> ce mois-ci.`),
        `<div style="text-align:center;">${ctaButton("Voir mon rapport PDF", rapportUrl)}</div>`,
        smallText("Cliquez sur le bouton pour ouvrir le rapport imprimable. Ce lien est personnel et sécurisé."),
        smallText("Pour imprimer ou sauvegarder en PDF, utilisez le bouton dans la page."),
      ].join(""),
      unsubscribeEmail: user.email,
    });

    try {
      await sendMail({
        to: user.email,
        subject: `Rapport TP ${monthLabel} — ${count} dossier(s)`,
        html,
      });
      sent++;
    } catch (e) {
      console.error(`[cron] Erreur envoi rapport TP à ${user.email}:`, e);
      skipped++;
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, month: monthParam });
}
