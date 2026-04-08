export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const BANNER_VERSION = "1.0";

const consentSchema = z.object({
  consents: z.array(z.object({
    category: z.enum(["analytics", "marketing", "essential"]),
    granted: z.boolean(),
  })).min(1, "consents[] requis"),
});

/** POST — Persiste les choix de consentement cookies côté serveur (RGPD Art. 7) */
export async function POST(req: NextRequest) {
  try {
    let raw: unknown;
    try { raw = await req.json(); } catch {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }
    const result = consentSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: "Données invalides", details: result.error.flatten().fieldErrors }, { status: 400 });
    }
    const { consents } = result.data;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? req.headers.get("x-real-ip")
      ?? null;
    const ua = req.headers.get("user-agent") ?? null;

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id ?? null;
    const email = session?.user?.email ?? null;

    await prisma.consentRecord.createMany({
      data: consents.map((c) => ({
        userId,
        email,
        category: c.category,
        granted: c.granted,
        bannerVersion: BANNER_VERSION,
        ipAddress: ip,
        userAgent: ua,
      })),
    });

    if (userId) {
      const marketingConsent = consents.find((c) => c.category === "marketing");
      if (marketingConsent !== undefined) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            marketingConsent: marketingConsent.granted,
            marketingConsentAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Consent] Error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
