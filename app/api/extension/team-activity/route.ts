export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authenticateExtension, getExtCors, optionsCors } from "@/lib/extensionAuth"

export async function OPTIONS() { return optionsCors() }

/** V3-11 : Dashboard equipe — stats d'activite pour les plans EQUIPE */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateExtension(req, undefined, "team-activity", 20, 60_000)
    if ("error" in auth) return auth.error

    const plan = (auth.user.plan || "").toUpperCase()
    if (plan !== "EQUIPE") {
      return NextResponse.json({ ok: false, error: "Fonctionnalite reservee au plan Equipe" }, { status: 403, headers: getExtCors(req.headers.get('origin')) })
    }

    const teamId = auth.user.teamId
    if (!teamId) {
      return NextResponse.json({ activity: { fillsToday: 0, rejectsToday: 0, acceptanceRate: "—", activeMembers: 0 } }, { headers: getExtCors(req.headers.get('origin')) })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Membres actifs de l'equipe
    const members = await prisma.user.findMany({
      where: { teamId },
      select: { id: true },
    })
    const memberIds = members.map((m) => m.id)

    // Rejets du jour
    const rejectsToday = await prisma.rejetAutoDetecte.count({
      where: {
        userId: { in: memberIds },
        createdAt: { gte: today },
      },
    })

    // Total rejets vs total dossiers pour le taux d'acceptation (30 derniers jours)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalDossiers = await (prisma as any).tPDossier.count({
      where: { userId: { in: memberIds }, createdAt: { gte: thirtyDaysAgo } },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const acceptedDossiers = await (prisma as any).tPDossier.count({
      where: { userId: { in: memberIds }, createdAt: { gte: thirtyDaysAgo }, status: "accepted" },
    })

    const acceptanceRate = totalDossiers > 0
      ? Math.round((acceptedDossiers / totalDossiers) * 100) + "%"
      : "—"

    // Fills du jour (via log-injection)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fillsToday = 0
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fillsToday = await (prisma as any).injectionLog.count({
        where: { userId: { in: memberIds }, createdAt: { gte: today } },
      })
    } catch {
      // Model may not exist yet
      fillsToday = 0
    }

    return NextResponse.json({
      activity: {
        fillsToday,
        rejectsToday,
        acceptanceRate,
        activeMembers: memberIds.length,
      },
    }, { headers: getExtCors(req.headers.get('origin')) })
  } catch (e) {
    console.error("[team-activity]", e)
    return NextResponse.json({
      activity: { fillsToday: 0, rejectsToday: 0, acceptanceRate: "—", activeMembers: 0 },
    }, { headers: getExtCors(req.headers.get('origin')) })
  }
}
