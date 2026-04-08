export const dynamic = "force-dynamic";

/**
 * GET /api/user/export
 * RGPD Art.15 — Droit d'accès et portabilité des données.
 * Retourne toutes les données personnelles de l'utilisateur en JSON.
 * ~120 lignes
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = session.user.id;

  // Rate limit: 3 exports par heure par utilisateur
  const allowed = await rateLimit(`export:${userId}`, 3, 3_600_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes. Réessayez dans une heure." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      clientCount: true,
      isPro: true,
      plan: true,
      teamId: true,
      teamRole: true,
      storeName: true,
      onboardingStep: true,
      twoFactorEnabled: true,
      marketingConsent: true,
      marketingConsentAt: true,
      dpaAcceptedAt: true,
      freeUntil: true,
      createdAt: true,
      updatedAt: true,
      lastActiveAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // Récupérer toutes les données liées en parallèle
  const [
    dossiers,
    notifications,
    ocrScans,
    scanSessions,
    legalAcceptances,
    consentRecords,
    alertes,
    churnReasons,
  ] = await Promise.all([
    prisma.dossierTiersPayant.findMany({
      where: { userId },
      select: {
        id: true, reference: true, mutuelle: true, montant: true, statut: true,
        dateEnvoi: true, dateReception: true, motifRejet: true, createdAt: true,
      },
      take: 5000,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId },
      select: { id: true, type: true, title: true, message: true, createdAt: true, read: true },
      take: 1000,
      orderBy: { createdAt: "desc" },
    }),
    prisma.ocrScanLog.findMany({
      where: { userId },
      select: { id: true, type: true, ocrConfidence: true, createdAt: true },
      take: 5000,
      orderBy: { createdAt: "desc" },
    }),
    prisma.scanSession.findMany({
      where: { userId },
      select: { id: true, delivered: true, createdAt: true },
      take: 5000,
      orderBy: { createdAt: "desc" },
    }),
    prisma.legalAcceptance.findMany({
      where: { userId },
      select: { id: true, documentType: true, documentVersion: true, acceptedAt: true },
    }),
    prisma.consentRecord.findMany({
      where: { userId },
      select: { id: true, category: true, granted: true, bannerVersion: true, createdAt: true },
      take: 500,
    }),
    prisma.alerteExpiration.findMany({
      where: { userId },
      select: { id: true, dateExpiration: true, joursAvant: true, traitee: true, createdAt: true },
      take: 1000,
    }),
    prisma.churnReason.findMany({
      where: { userId },
      select: { id: true, reason: true, comment: true, createdAt: true },
    }),
  ]);

  // Log l'accès aux données (RGPD Art.15 accountability)
  await prisma.dataAccessLog.create({
    data: {
      userId,
      action: "export",
      accessor: "self",
      meta: { detail: "RGPD Art.15 full data export" },
    },
  });

  const exportData = {
    _meta: {
      exportedAt: new Date().toISOString(),
      legalBasis: "RGPD Article 15 — Droit d'accès aux données personnelles",
      format: "JSON",
    },
    profile: user,
    dossiersTiersPayant: dossiers,
    notifications,
    ocrScans,
    scanSessions,
    legalAcceptances,
    consentRecords,
    alertesExpiration: alertes,
    churnReasons,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="audibot_export_${userId}_${Date.now()}.json"`,
    },
  });
}
