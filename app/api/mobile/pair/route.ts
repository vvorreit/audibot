/**
 * POST /api/mobile/pair
 * Appelé après le 1er scan QR réussi.
 * Supprime tout appareil existant (1 compte = 1 téléphone)
 * puis crée un nouveau MobileDevice et retourne un deviceToken persistant.
 * Body: { syncToken: string, label?: string }
 */
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { z } from "zod";
import { parseBody } from "@/lib/validation";

const pairSchema = z.object({
  syncToken: z.string().min(1),
  label: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = await parseBody(req, pairSchema);
    if (data instanceof NextResponse) return data;

    const allowed = await rateLimit(`mobile-pair:${data.syncToken}`, 10, 60_000);
    if (!allowed) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });

    const user = await prisma.user.findUnique({
      where: { syncToken: data.syncToken },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    // 1 compte = 1 téléphone : supprimer tous les appareils existants
    await prisma.mobileDevice.deleteMany({
      where: { userId: user.id },
    });

    const device = await prisma.mobileDevice.create({
      data: {
        userId: user.id,
        label: data.label ?? null,
      },
    });

    const res = NextResponse.json({ deviceToken: device.deviceToken });
    // Cookie non-HttpOnly pour que le layout server-side puisse le lire via cookies()
    // ET que le JS client puisse aussi y accéder. SameSite=Lax + Path=/scan.
    res.cookies.set("audibot_device_token", device.deviceToken, {
      path: "/scan",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
