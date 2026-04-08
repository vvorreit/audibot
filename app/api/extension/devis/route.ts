export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authenticateExtension, getExtCors, optionsCors } from "@/lib/extensionAuth"

export async function OPTIONS() { return optionsCors() }

/** V3-8 : Capturer un devis depuis un portail mutuelle */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const auth = await authenticateExtension(req, body, "devis", 30, 60_000)
    if ("error" in auth) return auth.error

    const { hostname, devis, url } = body
    if (!hostname || !devis) {
      return NextResponse.json({ ok: false, error: "hostname et devis requis" }, { status: 400, headers: getExtCors(req.headers.get('origin')) })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).devisCaptured.create({
      data: {
        userId: auth.user.id,
        hostname: String(hostname).slice(0, 100),
        url: url ? String(url).slice(0, 500) : null,
        devis: devis,
      },
    })

    return NextResponse.json({ ok: true }, { headers: getExtCors(req.headers.get('origin')) })
  } catch (e) {
    console.error("[devis]", e)
    return NextResponse.json({ ok: false }, { status: 500, headers: getExtCors(req.headers.get('origin')) })
  }
}
