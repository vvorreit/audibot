export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeCompare } from "@/lib/safeCompare";

const RETENTION_DAYS = 90;

export async function GET(req: NextRequest) {
  // Authentification via header uniquement.
  // Les query params sont loggés par Nginx, les CDN et les proxies intermédiaires —
  // un secret dans l'URL serait exposé dans les access logs sans chiffrement.
  // Le header X-Cron-Secret ne transite que dans le corps TLS et n'est pas loggé par défaut.
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || !secret || !safeCompare(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  try {
    const [
      rpaLogs,
      ocrLogs,
      injectionLogs,
      bookmarkletPings,
      smartFillCorrections,
      ocrFeedbacks,
      rejetDetectes,
    ] = await Promise.all([
      prisma.rpaLog.deleteMany({ where: { createdAt: { lt: cutoff } } }),
      prisma.ocrScanLog.deleteMany({ where: { createdAt: { lt: cutoff } } }),
      prisma.injectionLog.deleteMany({ where: { createdAt: { lt: cutoff } } }),
      (prisma as any).bookmarkletPing.deleteMany({ where: { createdAt: { lt: cutoff } } }),
      (prisma as any).smartFillCorrection.deleteMany({ where: { createdAt: { lt: cutoff } } }),
      prisma.ocrFeedback.deleteMany({ where: { createdAt: { lt: cutoff } } }),
      prisma.rejetAutoDetecte.deleteMany({ where: { traite: true, createdAt: { lt: cutoff } } }),
    ]);

    // Désactiver isPro pour les users dont freeUntil est expiré (sans abo Stripe actif)
    const expiredFree = await prisma.user.updateMany({
      where: {
        freeUntil: { lt: new Date() },
        isPro: true,
        stripeSubscriptionId: null,
      },
      data: { isPro: false },
    });

    const total =
      rpaLogs.count + ocrLogs.count + injectionLogs.count +
      bookmarkletPings.count + smartFillCorrections.count +
      ocrFeedbacks.count + rejetDetectes.count;

    if (expiredFree.count > 0) {
      console.log(`[CRON] ${expiredFree.count} accès gratuits expirés désactivés`);
    }
    console.log(`[RGPD] Purge logs > ${RETENTION_DAYS}j : ${total} entrées supprimées`);

    return NextResponse.json({
      ok: true,
      purged: {
        rpaLogs: rpaLogs.count,
        ocrLogs: ocrLogs.count,
        injectionLogs: injectionLogs.count,
        bookmarkletPings: bookmarkletPings.count,
        smartFillCorrections: smartFillCorrections.count,
        ocrFeedbacks: ocrFeedbacks.count,
        rejetDetectes: rejetDetectes.count,
        expiredFreeAccess: expiredFree.count,
        total,
      },
      cutoff: cutoff.toISOString(),
    });
  } catch (e) {
    console.error("[RGPD] Purge error:", e);
    return NextResponse.json({ ok: false, error: "Purge failed" }, { status: 500 });
  }
}
