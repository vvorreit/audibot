export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authenticateExtension, getExtCors, optionsCors } from "@/lib/extensionAuth"

export async function OPTIONS() { return optionsCors() }

/**
 * GET /api/extension/rejet-patterns?hostname=almerys.com
 * Returns patterns with tauxRejet > 0.3 for the given portal.
 * Used by the extension to show warnings before form submission.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateExtension(req, undefined, "rejet-patterns", 30, 60_000)
    if ("error" in auth) return auth.error

    const hostname = req.nextUrl.searchParams.get("hostname")
    if (!hostname) {
      return NextResponse.json(
        { ok: false, error: "hostname requis" },
        { status: 400, headers: getExtCors(req.headers.get('origin')) },
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patterns = await (prisma as any).rejetPattern.findMany({
      where: {
        portail: hostname,
        tauxRejet: { gt: 0.3 },
      },
      orderBy: { tauxRejet: "desc" },
      select: {
        id: true,
        champ: true,
        pattern: true,
        rejetCode: true,
        rejetLabel: true,
        rejetCount: true,
        totalCount: true,
        tauxRejet: true,
      },
    })

    return NextResponse.json({ patterns }, { headers: getExtCors(req.headers.get('origin')) })
  } catch (e) {
    console.error("[rejet-patterns]", e)
    return NextResponse.json({ patterns: [] }, { headers: getExtCors(req.headers.get('origin')) })
  }
}
