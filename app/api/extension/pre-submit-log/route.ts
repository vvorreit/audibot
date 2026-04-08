export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authenticateExtension, getExtCors, optionsCors } from "@/lib/extensionAuth"
import { z } from "zod"

const preSubmitSchema = z.object({
  portail: z.string().min(1).max(200),
  errors: z.number().int().min(0).optional(),
  warnings: z.number().int().min(0).optional(),
  action: z.enum(["corrected", "submitted_anyway", "submitted_clean"]),
  syncToken: z.string().optional(),
})

export async function OPTIONS() { return optionsCors() }

/**
 * POST /api/extension/pre-submit-log
 * Track when warnings are shown and whether they were corrected or ignored.
 * Body: { portail, errors, warnings, action }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const auth = await authenticateExtension(req, body, "pre-submit-log", 60, 60_000)
    if ("error" in auth) return auth.error

    const parsed = preSubmitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Données invalides" },
        { status: 400, headers: getExtCors(req.headers.get('origin')) },
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).preSubmitLog.create({
      data: {
        userId: auth.user.id,
        portail: parsed.data.portail,
        errors: parsed.data.errors ?? 0,
        warnings: parsed.data.warnings ?? 0,
        action: parsed.data.action,
      },
    })

    return NextResponse.json({ ok: true }, { headers: getExtCors(req.headers.get('origin')) })
  } catch (e) {
    console.error("[pre-submit-log]", e)
    return NextResponse.json({ ok: false }, { status: 500, headers: getExtCors(req.headers.get('origin')) })
  }
}
