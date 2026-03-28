export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { getPortalCorsHeaders } from "@/lib/cors";
import type { Prisma } from "@prisma/client";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getPortalCorsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: NextRequest) {
  const CORS = getPortalCorsHeaders(req.headers.get("origin"));

  try {
    const body = await req.json();
    const { syncToken, status, portal, details } = body;

    if (!syncToken || !status) {
      return NextResponse.json(
        { ok: false, error: "Payload invalide" },
        { status: 400, headers: CORS }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const allowed = await rateLimit(`ext-status:${ip}`, 100, 60 * 60_000);
    if (!allowed) {
      return NextResponse.json({ ok: false }, { status: 429, headers: CORS });
    }

    const user = await prisma.user.findUnique({
      where: { syncToken },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Token invalide" },
        { status: 401, headers: CORS }
      );
    }

    /* Create an event so the dashboard can listen */
    await prisma.extensionEvent.create({
      data: {
        userId: user.id,
        type: "extension_status",
        payload: {
          status,
          portal: portal || null,
          details: details || null,
        } as Prisma.InputJsonValue,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) /* 30 min expiry */,
      },
    });

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (e) {
    console.error("[extension-status]", e);
    return NextResponse.json({ ok: false }, { status: 500, headers: CORS });
  }
}
