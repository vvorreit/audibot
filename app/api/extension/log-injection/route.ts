export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getPortalCorsHeaders(req.headers.get("origin")) });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPortalCorsHeaders } from "@/lib/cors";

export async function POST(req: NextRequest) {
  const CORS = getPortalCorsHeaders(req.headers.get("origin"));
  try {
    const body = await req.json();
    const syncToken = body.syncToken || (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
    const { site, success, fieldsCount, mode } = body;

    if (!syncToken || typeof syncToken !== "string") {
      return NextResponse.json({ ok: false, error: "syncToken requis" }, { status: 401, headers: CORS });
    }

    if (typeof site !== "string" || typeof success !== "boolean") {
      return NextResponse.json({ ok: false, error: "Données invalides" }, { status: 400, headers: CORS });
    }

    const user = await prisma.user.findUnique({
      where: { syncToken },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "Token invalide" }, { status: 401, headers: CORS });
    }

    await prisma.injectionLog.create({
      data: {
        userId: user.id,
        site,
        success,
        fieldsCount: typeof fieldsCount === "number" ? fieldsCount : 0,
        mode: ["smartfill", "bot", "recorder"].includes(mode) ? mode : "smartfill",
      },
    });

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (e) {
    console.error("[log-injection] Erreur:", e);
    return NextResponse.json({ ok: false }, { headers: CORS });
  }
}
