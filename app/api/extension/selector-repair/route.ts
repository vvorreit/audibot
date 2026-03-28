export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authenticateExtension, EXT_CORS, optionsCors } from "@/lib/extensionAuth"

export async function OPTIONS() { return optionsCors() }

/** V3-2 : Recevoir un snapshot DOM anonymisé quand le taux de skip est élevé */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const auth = await authenticateExtension(req, body, "selector-repair", 10, 60_000)
    if ("error" in auth) return auth.error

    const { hostname, skipRate, failedFields, snapshot } = body
    if (!hostname) {
      return NextResponse.json({ ok: false, error: "hostname requis" }, { status: 400, headers: EXT_CORS })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).selectorRepairRequest.create({
      data: {
        userId: auth.user.id,
        hostname: String(hostname).slice(0, 100),
        skipRate: Number(skipRate) || 0,
        failedFields: failedFields || {},
        snapshot: Array.isArray(snapshot) ? snapshot.slice(0, 100) : [],
      },
    })

    return NextResponse.json({ ok: true }, { headers: EXT_CORS })
  } catch (e) {
    console.error("[selector-repair]", e)
    return NextResponse.json({ ok: false }, { status: 500, headers: EXT_CORS })
  }
}
