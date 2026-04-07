/**
 * POST /api/mobile/auth
 * Authentification persistante via deviceToken (après 1er pairing).
 * Retourne un sessionId de scan prêt à l'emploi + syncToken.
 * Body: { deviceToken: string }
 */
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { z } from "zod";
import { parseBody } from "@/lib/validation";

const authSchema = z.object({
  deviceToken: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const data = await parseBody(req, authSchema);
    if (data instanceof NextResponse) return data;

    const allowed = await rateLimit(`mobile-auth:${data.deviceToken}`, 10, 60_000);
    if (!allowed) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });

    const device = await prisma.mobileDevice.findUnique({
      where: { deviceToken: data.deviceToken },
      include: { user: { select: { id: true, syncToken: true } } },
    });

    if (!device) return NextResponse.json({ error: "Appareil non reconnu" }, { status: 401 });

    // Mise à jour du lastSeenAt
    await prisma.mobileDevice.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date() },
    });

    // Cleanup sessions expirées
    await prisma.scanSession.deleteMany({
      where: { userId: device.userId, expiresAt: { lt: new Date() } },
    });

    // Créer une session de scan (id généré par Prisma cuid)
    const scanSession = await prisma.scanSession.create({
      data: {
        userId: device.userId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min (plus long qu'un QR)
      },
      select: { id: true },
    });

    return NextResponse.json({
      sessionId: scanSession.id,
      syncToken: device.user.syncToken,
      deviceLabel: device.label,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
