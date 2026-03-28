export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const DPA_VERSION = process.env.DPA_VERSION || "1.1";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = session.user.id;

  const latest = await prisma.legalAcceptance.findFirst({
    where: { userId, documentType: "dpa" },
    orderBy: { acceptedAt: "desc" },
  });

  return NextResponse.json({
    current_version: DPA_VERSION,
    accepted_version: latest?.documentVersion || null,
    accepted_at: latest?.acceptedAt || null,
    is_current: latest?.documentVersion === DPA_VERSION,
  });
}
