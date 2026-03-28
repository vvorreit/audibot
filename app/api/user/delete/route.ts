export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = session.user.id as string;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true, stripeCustomerId: true },
    });

    if (user?.stripeSubscriptionId) {
      try {
        const { stripe } = await import("@/lib/stripe");
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      } catch (e) {
        console.warn("[DELETE] Stripe cancel failed:", e);
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
      prisma.user.delete({ where: { id: userId } }),
    ]);

    console.log("[RGPD Art.17] Compte supprime:", userId, new Date().toISOString());

    return NextResponse.json({
      ok: true,
      message: "Compte et données supprimés conformément au RGPD Art.17",
      deletedEntities: ["ocrScanLog", "injectionLog", "rpaLog", "rejetAutoDetecte", "dossierTiersPayant", "notification", "alerteExpiration", "scanSession", "ocrFeedback", "adminAuditLog", "smartFillCorrection", "invitation", "legalAcceptance", "user"]
    });
  } catch (e) {
    console.error("[DELETE] Error:", e);
    if (process.env.SENTRY_DSN) {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureException(e);
    }
    return NextResponse.json({ ok: false, error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
