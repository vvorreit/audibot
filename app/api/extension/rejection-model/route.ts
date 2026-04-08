export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authenticateExtension, getExtCors, optionsCors } from "@/lib/extensionAuth"

export async function OPTIONS() { return optionsCors() }

/** V3-9 : Retourner le modele de prediction de rejet (regles actives) */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateExtension(req, undefined, "rejection-model", 10, 60_000)
    if ("error" in auth) return auth.error

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rules = await (prisma as any).rejectionRule.findMany({
      where: { enabled: true },
      select: {
        hostname: true,
        type: true,
        threshold: true,
        organisms: true,
        codes: true,
        weight: true,
        reason: true,
        suggestion: true,
      },
    })

    return NextResponse.json({ model: { rules, version: 1 } }, { headers: getExtCors(req.headers.get('origin')) })
  } catch (e) {
    console.error("[rejection-model]", e)
    return NextResponse.json({ model: { rules: [], version: 0 } }, { headers: getExtCors(req.headers.get('origin')) })
  }
}
