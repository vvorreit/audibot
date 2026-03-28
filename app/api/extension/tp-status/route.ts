export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authenticateExtension, EXT_CORS, optionsCors } from "@/lib/extensionAuth"

export async function OPTIONS() { return optionsCors() }

/** V3-6 : Retourner les dossiers TP récents de l'utilisateur */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateExtension(req, undefined, "tp-status", 30, 60_000)
    if ("error" in auth) return auth.error

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dossiers = await (prisma as any).tPDossier.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        date: true,
        fse: true,
        organisme: true,
        montant: true,
        status: true,
        rejetMotif: true,
        portail: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ dossiers }, { headers: EXT_CORS })
  } catch (e) {
    console.error("[tp-status]", e)
    return NextResponse.json({ dossiers: [] }, { headers: EXT_CORS })
  }
}

/** Créer ou mettre à jour un dossier TP */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const auth = await authenticateExtension(req, body, "tp-status-post", 30, 60_000)
    if ("error" in auth) return auth.error

    const { dossiers } = body
    if (!Array.isArray(dossiers)) {
      return NextResponse.json({ ok: false, error: "dossiers array requis" }, { status: 400, headers: EXT_CORS })
    }

    let created = 0
    for (const d of dossiers.slice(0, 50)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).tPDossier.create({
        data: {
          userId: auth.user.id,
          date: String(d.date || "").slice(0, 20),
          fse: String(d.fse || "").slice(0, 50),
          organisme: String(d.organisme || "").slice(0, 100),
          montant: String(d.montant || "").slice(0, 20),
          status: ["pending", "accepted", "rejected"].includes(d.status) ? d.status : "pending",
          rejetMotif: d.rejetMotif ? String(d.rejetMotif).slice(0, 200) : null,
          portail: d.portail ? String(d.portail).slice(0, 100) : null,
        },
      })
      created++
    }

    return NextResponse.json({ ok: true, created }, { headers: EXT_CORS })
  } catch (e) {
    console.error("[tp-status POST]", e)
    return NextResponse.json({ ok: false }, { status: 500, headers: EXT_CORS })
  }
}
