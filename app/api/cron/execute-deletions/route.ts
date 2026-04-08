export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeCompare } from "@/lib/safeCompare";

/** GET — Exécute les suppressions de compte dont le délai de grâce est expiré */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!process.env.CRON_SECRET || !auth || !safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pendingDeletions = await prisma.deletionRequest.findMany({
    where: {
      scheduledAt: { lte: new Date() },
      cancelledAt: null,
      executedAt: null,
    },
    include: { user: { select: { id: true, stripeSubscriptionId: true } } },
  });

  let executed = 0;

  for (const deletion of pendingDeletions) {
    try {
      const userId = deletion.userId;

      if (deletion.user.stripeSubscriptionId) {
        try {
          const { stripe } = await import("@/lib/stripe");
          await stripe.subscriptions.cancel(deletion.user.stripeSubscriptionId);
        } catch (e) {
          console.warn("[ExecuteDeletions] Stripe cancel failed:", e);
        }
      }

      await prisma.$transaction([
        prisma.ocrScanLog.deleteMany({ where: { userId } }),
        prisma.injectionLog.deleteMany({ where: { userId } }),
        prisma.rpaLog.deleteMany({ where: { userId } }),
        prisma.rejetAutoDetecte.deleteMany({ where: { userId } }),
        prisma.dossierTiersPayant.deleteMany({ where: { userId } }),
        prisma.notification.deleteMany({ where: { userId } }),
        prisma.alerteExpiration.deleteMany({ where: { userId } }),
        prisma.scanSession.deleteMany({ where: { userId } }),
        prisma.ocrFeedback.deleteMany({ where: { userId } }),
        prisma.adminAuditLog.deleteMany({ where: { userId } }),
        (prisma as any).smartFillCorrection.deleteMany({ where: { userId } }),
        prisma.invitation.deleteMany({ where: { inviterId: userId } }),
        prisma.legalAcceptance.deleteMany({ where: { userId } }),
        prisma.consentRecord.deleteMany({ where: { userId } }),
        prisma.dataAccessLog.deleteMany({ where: { userId } }),
        prisma.deletionRequest.update({ where: { id: deletion.id }, data: { executedAt: new Date() } }),
        prisma.user.delete({ where: { id: userId } }),
      ]);

      console.log(`[RGPD Art.17] Compte supprimé (grâce expirée): ${userId}`);
      executed++;
    } catch (e) {
      console.error(`[ExecuteDeletions] Failed for user ${deletion.userId}:`, e);
    }
  }

  return NextResponse.json({ ok: true, executed, pending: pendingDeletions.length });
}
