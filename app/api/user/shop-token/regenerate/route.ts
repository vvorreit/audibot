export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST() {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, teamRole: true, teamId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const isGlobalAdmin = user.role === "ADMIN";
  const isTeamOwner = user.teamRole === "OWNER";

  if (!isGlobalAdmin && !isTeamOwner) {
    return NextResponse.json({ error: "Seul le responsable du cabinet peut modifier le QR magasin." }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { shopToken: randomBytes(32).toString("hex") },
    select: { shopToken: true },
  });

  return NextResponse.json({ shopToken: updated.shopToken });
}
