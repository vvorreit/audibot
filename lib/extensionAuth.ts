import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { rateLimit } from "@/lib/rateLimit"

export const EXT_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
}

export function getExtCors(origin?: string | null) {
  const allowed = !origin || origin.startsWith('chrome-extension://') || /^https?:\/\/([\w-]+\.)?audibot\.fr$/.test(origin)
  return {
    'Access-Control-Allow-Origin': allowed && origin ? origin : 'https://audibot.fr',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  }
}

export function optionsCors(req?: NextRequest) {
  const origin = req?.headers.get('origin') ?? null
  return new NextResponse(null, { status: 204, headers: getExtCors(origin) })
}

/** Extract syncToken from Authorization header or body/query */
export function extractToken(req: NextRequest, body?: Record<string, unknown>): string {
  return (
    (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim() ||
    req.nextUrl.searchParams.get("token") ||
    (body?.syncToken as string) ||
    ""
  )
}

/** Validate token and return user, or error response */
export async function authenticateExtension(
  req: NextRequest,
  body?: Record<string, unknown>,
  rateLimitKey?: string,
  rateLimitMax = 60,
  rateLimitWindowMs = 60_000
) {
  const token = extractToken(req, body)
  if (!token) {
    return { error: NextResponse.json({ ok: false, error: "Token requis" }, { status: 400, headers: EXT_CORS }) }
  }

  if (rateLimitKey) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const allowed = await rateLimit(`${rateLimitKey}:${ip}`, rateLimitMax, rateLimitWindowMs)
    if (!allowed) {
      return { error: NextResponse.json({ ok: false }, { status: 429, headers: EXT_CORS }) }
    }
  }

  const user = await prisma.user.findUnique({
    where: { syncToken: token },
    select: { id: true, plan: true, teamId: true },
  })
  if (!user) {
    return { error: NextResponse.json({ ok: false, error: "Token invalide" }, { status: 401, headers: EXT_CORS }) }
  }

  return { user, token }
}
