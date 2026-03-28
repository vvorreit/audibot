export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { getPortalCorsHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getPortalCorsHeaders(req.headers.get("origin")) });
}

export async function POST(req: NextRequest) {
  const CORS = getPortalCorsHeaders(req.headers.get("origin"));

  try {
    const body = await req.json();
    const { syncToken, pings } = body;

    if (!syncToken || !Array.isArray(pings) || pings.length === 0) {
      return NextResponse.json({ ok: false, error: "Payload invalide" }, { status: 400, headers: CORS });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const allowed = await rateLimit(`selector-health:${ip}`, 50, 60 * 60_000);
    if (!allowed) {
      return NextResponse.json({ ok: false }, { status: 429, headers: CORS });
    }

    const user = await prisma.user.findUnique({
      where: { syncToken },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: "Token invalide" }, { status: 401, headers: CORS });
    }

    const userAgent = req.headers.get("user-agent")?.slice(0, 255) ?? null;

    await prisma.selectorHealthPing.createMany({
      data: pings.slice(0, 200).map((p: { portal: string; selectorName: string; found: boolean; url?: string }) => ({
        portal: String(p.portal).slice(0, 100),
        selectorName: String(p.selectorName).slice(0, 100),
        found: Boolean(p.found),
        userId: user.id,
        url: p.url ? String(p.url).slice(0, 500) : null,
        userAgent,
      })),
    });

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (e) {
    console.error("[selector-health]", e);
    return NextResponse.json({ ok: false }, { status: 500, headers: CORS });
  }
}
