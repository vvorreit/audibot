export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/* GET — Check unsubscribe status without modifying anything */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t");
  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 400 });
  }

  const tracking = await prisma.emailTracking.findUnique({
    where: { token },
    select: { email: true },
  });

  if (!tracking) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  const existing = await prisma.emailUnsubscribe.findUnique({
    where: { email: tracking.email },
  });

  return NextResponse.json({ alreadyUnsubscribed: !!existing });
}

/* POST — Effective unsubscribe */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token: string | undefined = body.token;
    const reason: string | undefined = body.reason;

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    const tracking = await prisma.emailTracking.findUnique({
      where: { token },
      select: { email: true },
    });

    if (!tracking) {
      return NextResponse.json({ error: "Token invalide" }, { status: 404 });
    }

    await prisma.emailUnsubscribe.upsert({
      where: { email: tracking.email },
      create: {
        email: tracking.email,
        reason: reason || null,
      },
      update: {},
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/unsubscribe]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
