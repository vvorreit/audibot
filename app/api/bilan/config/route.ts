export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    let config = await prisma.bilanConfig.findUnique({ where: { userId } });

    if (!config) {
      config = await prisma.bilanConfig.create({
        data: { userId },
      });
    }

    return NextResponse.json(config);
  } catch (err) {
    console.error("[bilan/config] GET error:", err);
    return NextResponse.json(
      { error: "Impossible de charger la configuration. La migration est peut-être en cours." },
      { status: 500 }
    );
  }
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { z } = await import("zod");
  const configSchema = z.object({
    nomMagasin: z.string().max(100).optional(),
    logoUrl: z.string().max(200_000).optional(),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Hex couleur invalide (#RRGGBB)").optional(),
    welcomeTitle: z.string().max(200).optional(),
    welcomeMessage: z.string().max(2000).optional(),
    footerText: z.string().max(500).optional(),
  });
  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const parsed = configSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { nomMagasin, logoUrl, accentColor, welcomeTitle, welcomeMessage, footerText } = parsed.data;

  try {
    const config = await prisma.bilanConfig.upsert({
      where: { userId },
      create: {
        userId,
        nomMagasin: nomMagasin ?? null,
        logoUrl: logoUrl ?? null,
        accentColor: accentColor ?? "#2563eb",
        welcomeTitle: welcomeTitle ?? null,
        welcomeMessage: welcomeMessage ?? null,
        footerText: footerText ?? null,
      },
      update: {
        nomMagasin: nomMagasin ?? null,
        logoUrl: logoUrl ?? null,
        accentColor: accentColor ?? "#2563eb",
        welcomeTitle: welcomeTitle ?? null,
        welcomeMessage: welcomeMessage ?? null,
        footerText: footerText ?? null,
      },
    });

    return NextResponse.json(config);
  } catch (err) {
    console.error("[bilan/config] PUT error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde. La table BilanConfig n'existe peut-être pas encore en base." },
      { status: 500 }
    );
  }
}
