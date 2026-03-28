export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { rateLimit } from "@/lib/rateLimit"
import { EXT_CORS, optionsCors } from "@/lib/extensionAuth"

export async function OPTIONS() { return optionsCors() }

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const allowed = await rateLimit("smart-fill-learn:" + ip, 50, 60 * 60_000)
    if (!allowed) return NextResponse.json({ ok: false }, { status: 429, headers: EXT_CORS })

    const body = await req.json()
    const syncToken = body.syncToken || (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim()
    const { hostname, selector, label, oldVariable } = body
    if (!syncToken || !hostname || !selector || !label) return NextResponse.json({ ok: false }, { status: 400, headers: EXT_CORS })

    const user = await prisma.user.findUnique({ where: { syncToken }, select: { id: true } })
    if (!user) return NextResponse.json({ ok: false }, { status: 401, headers: EXT_CORS })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).smartFillCorrection.create({
      data: {
        hostname: hostname.slice(0, 100),
        selector: selector.slice(0, 200),
        label: label.slice(0, 100),
        oldVariable: (oldVariable || "unknown").slice(0, 50),
      }
    })

    return NextResponse.json({ ok: true }, { headers: EXT_CORS })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: EXT_CORS })
  }
}
