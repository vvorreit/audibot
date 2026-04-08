export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authenticateExtension, getExtCors, optionsCors } from "@/lib/extensionAuth"

export async function OPTIONS() { return optionsCors() }

/** V3-3 : Retourner les poids de scoring appris pour un hostname */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateExtension(req, undefined, "smart-fill-weights", 30, 60_000)
    if ("error" in auth) return auth.error

    const hostname = req.nextUrl.searchParams.get("hostname") || ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma as any).smartFillWeight.findMany({
      where: { hostname },
      select: { field: true, multiplier: true },
    })

    const weights: Record<string, { multiplier: number }> = {}
    for (const row of rows) {
      weights[row.field] = { multiplier: row.multiplier }
    }

    return NextResponse.json({ weights }, { headers: getExtCors(req.headers.get('origin')) })
  } catch (e) {
    console.error("[smart-fill/weights]", e)
    return NextResponse.json({ weights: {} }, { headers: getExtCors(req.headers.get('origin')) })
  }
}
