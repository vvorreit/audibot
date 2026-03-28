export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authenticateExtension, EXT_CORS, optionsCors } from "@/lib/extensionAuth"

export async function OPTIONS() { return optionsCors() }

/** V3-7 : Retourner les rejets récents avec raison et suggestion */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateExtension(req, undefined, "rejections", 30, 60_000)
    if ("error" in auth) return auth.error

    const rows = await prisma.rejetAutoDetecte.findMany({
      where: { userId: auth.user.id, traite: false },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        portail: true,
        numeroDossier: true,
        motif: true,
        montant: true,
        dateRejet: true,
        createdAt: true,
      },
    })

    const rejections = rows.map((r) => ({
      id: r.id,
      portail: r.portail,
      numeroDossier: r.numeroDossier,
      date: r.dateRejet || r.createdAt?.toISOString().split("T")[0],
      reason: r.motif || null,
      montant: r.montant || null,
      suggestion: getSuggestion(r.motif),
    }))

    return NextResponse.json({ rejections }, { headers: EXT_CORS })
  } catch (e) {
    console.error("[rejections]", e)
    return NextResponse.json({ rejections: [] }, { headers: EXT_CORS })
  }
}

/** Suggestions basées sur le motif de rejet */
function getSuggestion(motif: string | null): string | null {
  if (!motif) return null
  const m = motif.toLowerCase()
  if (m.includes("montant") || m.includes("excessif") || m.includes("plafond")) {
    return "Verifier le montant du devis — il depasse peut-etre le plafond de la mutuelle."
  }
  if (m.includes("document") || m.includes("manquant") || m.includes("piece")) {
    return "Un document semble manquant — verifier l'ordonnance et la carte mutuelle."
  }
  if (m.includes("date") || m.includes("expire") || m.includes("validite")) {
    return "Verifier la date de validite de l'ordonnance ou de la carte mutuelle."
  }
  if (m.includes("adherent") || m.includes("numero") || m.includes("identifiant")) {
    return "Le numero d'adherent semble incorrect — verifier avec la carte mutuelle."
  }
  if (m.includes("doublon") || m.includes("deja")) {
    return "Ce dossier a deja ete soumis — verifier s'il n'y a pas un doublon."
  }
  return "Contacter la mutuelle pour obtenir plus de details sur le motif de rejet."
}
