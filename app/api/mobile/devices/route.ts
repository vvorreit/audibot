export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const PAIRING_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 1 mois

/**
 * GET /api/mobile/devices
 * Retourne l'appareil mobile appairé de l'utilisateur (s'il existe et n'est pas expiré).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = session.user.id as string;

  const device = await prisma.mobileDevice.findFirst({
    where: { userId },
    select: { id: true, label: true, lastSeenAt: true, createdAt: true },
  });

  if (!device) {
    return NextResponse.json({ device: null });
  }

  // Vérifier l'expiration (1 mois)
  if (Date.now() - device.createdAt.getTime() > PAIRING_MAX_AGE_MS) {
    await prisma.mobileDevice.delete({ where: { id: device.id } });
    return NextResponse.json({ device: null, expired: true });
  }

  return NextResponse.json({
    device: {
      label: device.label,
      lastSeenAt: device.lastSeenAt,
      createdAt: device.createdAt,
      expiresAt: new Date(device.createdAt.getTime() + PAIRING_MAX_AGE_MS),
    },
  });
}

/**
 * DELETE /api/mobile/devices
 * Dissocie l'appareil mobile appairé.
 */
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  await prisma.mobileDevice.deleteMany({
    where: { userId: session.user.id as string },
  });

  return NextResponse.json({ ok: true });
}
