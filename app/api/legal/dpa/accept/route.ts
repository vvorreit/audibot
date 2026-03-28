export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const DPA_VERSION = process.env.DPA_VERSION || "1.1";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  if (body.dpa_version !== DPA_VERSION) {
    return NextResponse.json(
      { error: `Version DPA invalide. Version actuelle : ${DPA_VERSION}` },
      { status: 400 }
    );
  }

  const userId = session.user.id;
  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent") || null;

  const acceptance = await prisma.legalAcceptance.create({
    data: {
      userId,
      email: session.user.email,
      documentType: "dpa",
      documentVersion: DPA_VERSION,
      ipAddress,
      userAgent,
    },
  });

  return NextResponse.json({
    status: "accepted",
    dpa_version: DPA_VERSION,
    accepted_at: acceptance.acceptedAt,
  });
}
