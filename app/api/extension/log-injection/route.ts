export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { syncToken, site, success, fieldsCount } = body;

    if (!syncToken || typeof site !== "string" || typeof success !== "boolean") {
      return NextResponse.json({ ok: false });
    }

    const user = await prisma.user.findUnique({
      where: { syncToken },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false });
    }

    await prisma.injectionLog.create({
      data: {
        userId: user.id,
        site,
        success,
        fieldsCount: typeof fieldsCount === "number" ? fieldsCount : 0,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[log-injection] Erreur:", e);
    return NextResponse.json({ ok: false });
  }
}
