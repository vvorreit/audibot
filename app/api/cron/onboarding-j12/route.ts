export const dynamic = "force-dynamic";

/**
 * Cron J+12 — Fin de trial dans 48h
 * Cible : users inscrits ~12 jours, non convertis (pas de stripeSubscriptionId)
 * Fenêtre : 289h–287h avant maintenant (≈12 jours)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { safeCompare } from "@/lib/safeCompare";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || !auth || !safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const from = new Date(now.getTime() - 289 * 60 * 60 * 1000); // ~12j
  const to   = new Date(now.getTime() - 287 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      emailVerified: { not: null },
      stripeSubscriptionId: null, // non convertis
      plan: "FREE",
    },
    select: { id: true, email: true, name: true, clientCount: true, onboardingStep: true },
    take: 50,
  });

  let sent = 0;
  for (const user of users) {
    if (!user.email) continue;

    const hasUsed = user.clientCount > 0;
    const subject = hasUsed
      ? "AudiBot — votre essai se termine dans 48h"
      : "AudiBot — 48h pour tester, on vous guide";

    const bodyUsed = `
      <p style="font-size:14px;line-height:1.6;color:#475569;">
        Vous avez déjà traité <strong>${user.clientCount} dossier${user.clientCount > 1 ? "s" : ""}</strong> avec AudiBot.
        Votre essai se termine dans <strong>48 heures</strong>.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#475569;">
        Pour continuer sans interruption — et surtout continuer à gagner du temps — choisissez votre plan maintenant.
      </p>
      <a href="${process.env.NEXTAUTH_URL}/pricing"
         style="display:inline-block;margin:24px 0;padding:14px 32px;background:#2563eb;color:#fff;font-size:15px;font-weight:800;border-radius:12px;text-decoration:none;">
        Continuer avec AudiBot — dès 39,90€/mois
      </a>
      <p style="font-size:13px;color:#64748b;margin-top:8px;">Sans engagement. Annulable à tout moment.</p>`;

    const bodyNotUsed = `
      <p style="font-size:14px;line-height:1.6;color:#475569;">
        Votre essai gratuit se termine dans <strong>48 heures</strong> et vous n'avez pas encore testé AudiBot en conditions réelles.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#475569;">
        Il suffit d'un seul dossier pour voir la différence. Votre premier scan prend moins de 2 minutes.
      </p>
      <div style="margin:24px 0;padding:20px 24px;background:#f0fdf4;border-left:4px solid #16a34a;border-radius:8px;">
        <p style="font-size:14px;font-weight:700;color:#15803d;margin:0;">On vous accompagne en direct</p>
        <p style="font-size:13px;color:#22c55e;margin:8px 0 0;">Répondez à cet email — notre équipe vous configure l'extension en 10 minutes, en visio si besoin.</p>
      </div>
      <a href="${process.env.NEXTAUTH_URL}/dashboard"
         style="display:inline-block;margin:8px 0;padding:12px 28px;background:#2563eb;color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
        Tester maintenant — il vous reste 48h
      </a>`;

    try {
      await sendMail({
        to: user.email,
        subject,
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:20px;font-weight:800;margin-bottom:8px;">${hasUsed ? "Votre essai se termine bientôt" : "Il vous reste 48h pour tester AudiBot"}</h1>
  ${hasUsed ? bodyUsed : bodyNotUsed}
  <p style="font-size:11px;color:#cbd5e1;margin-top:32px;">
    AudiBot — contact@audibot.fr ·
    <a href="${process.env.NEXTAUTH_URL}/api/unsubscribe?email=${encodeURIComponent(user.email)}" style="color:#94a3b8;">Se désabonner</a>
  </p>
</body></html>`,
      });
      sent++;
    } catch (err) {
      console.error(`[cron/onboarding-j12] Erreur pour ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: users.length });
}
