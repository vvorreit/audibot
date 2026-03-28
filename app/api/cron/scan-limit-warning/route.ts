export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { getBrand } from "@/lib/brand";
import { safeCompare } from "@/lib/safeCompare";

const ESSENTIEL_LIMIT = Number(process.env.ESSENTIEL_MONTHLY_SCAN_LIMIT ?? 80);
const WARNING_THRESHOLD = Math.floor(ESSENTIEL_LIMIT * 0.80); // 64 sur 80

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || !auth || !safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brand = getBrand();
  const appUrl = brand.appUrl;
  const primary = brand.colors.primary;

  // Début du mois en cours
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Users ESSENTIEL avec monthlyScanCount >= seuil ET payants
  const users = await prisma.user.findMany({
    where: {
      plan: "ESSENTIEL",
      monthlyScanResetAt: { gte: monthStart },
      monthlyScanCount: { gte: WARNING_THRESHOLD },
      stripeSubscriptionId: { not: null },
      isPro: false,
    },
    select: { id: true, email: true, name: true, monthlyScanCount: true },
    take: 100,
  });

  // Filtrer ceux qui ont déjà reçu l'alerte ce mois
  const alreadyNotified = await prisma.notification.findMany({
    where: {
      type: "scan-limit-warning",
      createdAt: { gte: monthStart },
      userId: { in: users.map(u => u.id) },
    },
    select: { userId: true },
  });

  const notifiedIds = new Set(alreadyNotified.map(n => n.userId));
  const toNotify = users.filter(u => !notifiedIds.has(u.id));

  let sent = 0;
  for (const user of toNotify) {
    if (!user.email) continue;

    const scanCount = user.monthlyScanCount;
    const pct = Math.round((scanCount / ESSENTIEL_LIMIT) * 100);
    const barWidth = pct + "%";

    try {
      await sendMail({
        to: user.email,
        subject: `${brand.name} — vous approchez de votre limite mensuelle`,
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;background:#f8fafc;">
<div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0;">
<p style="font-size:12px;font-weight:800;color:${primary};margin:0 0 24px 0;letter-spacing:0.1em;text-transform:uppercase;">${brand.name}</p>
<h1 style="font-size:20px;font-weight:800;margin:0 0 12px 0;">Vous approchez de votre limite mensuelle ⚠️</h1>
<p style="font-size:14px;line-height:1.6;color:#475569;">Bonjour${user.name ? ` ${user.name}` : ""},</p>
<p style="font-size:14px;line-height:1.6;color:#475569;">Vous avez utilisé <strong>${scanCount} scans sur ${ESSENTIEL_LIMIT}</strong> ce mois-ci (plan Essentiel).</p>
<div style="background:#fef3c7;border-radius:12px;padding:16px;margin:20px 0;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
    <span style="font-size:13px;font-weight:700;color:#92400e;">Utilisation mensuelle</span>
    <span style="font-size:13px;font-weight:800;color:#92400e;">${scanCount} / ${ESSENTIEL_LIMIT}</span>
  </div>
  <div style="background:#fde68a;border-radius:8px;height:8px;">
    <div style="background:#d97706;border-radius:8px;height:8px;width:${barWidth};"></div>
  </div>
</div>
<p style="font-size:14px;line-height:1.6;color:#475569;">Passez au plan <strong>Pro</strong> pour des scans <strong>illimités</strong> et ne jamais être bloqué en pleine journée de travail.</p>
<a href="${appUrl}/dashboard?upgrade=1" style="display:inline-block;margin:20px 0;padding:12px 28px;background:${primary};color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
  Passer au plan Pro — illimité
</a>
<p style="font-size:12px;color:#94a3b8;margin-top:8px;">Votre quota de ${ESSENTIEL_LIMIT} scans se renouvelle le 1er du mois.</p>
<hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;">
<p style="font-size:11px;color:#94a3b8;margin:0;">${brand.name} — ${brand.supportEmail}</p>
</div></body></html>`,
      });

      // Marquer comme notifié ce mois
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "scan-limit-warning",
          title: "Alerte limite scans",
          message: `Alerte limite scans envoyée (${scanCount}/${ESSENTIEL_LIMIT})`,
          read: true,
        },
      });

      sent++;
    } catch (err) {
      console.error("[scan-limit-warning] Erreur envoi:", user.email, err);
    }
  }

  console.log(`[scan-limit-warning] ${sent} alertes envoyées (${toNotify.length} éligibles)`);
  return NextResponse.json({ ok: true, sent, eligible: toNotify.length });
}
