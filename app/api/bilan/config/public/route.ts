import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getExtCors, optionsCors } from "@/lib/extensionAuth";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return optionsCors();
}

export async function GET(req: NextRequest) {
  const shopToken = req.nextUrl.searchParams.get("shop");
  if (!shopToken) {
    return NextResponse.json({ error: "shop token requis" }, { status: 400, headers: getExtCors(req.headers.get('origin')) });
  }

  // Find user by shopToken (ADMIN ou PRO avec shopToken)
  const user = await prisma.user.findUnique({
    where: { shopToken },
    select: { id: true },
  });

  if (user) {
    const config = await prisma.bilanConfig.findUnique({
      where: { userId: user.id },
      select: {
        nomMagasin: true,
        logoUrl: true,
        accentColor: true,
        welcomeTitle: true,
        welcomeMessage: true,
        footerText: true,
      },
    });

    return NextResponse.json(
      config ?? { nomMagasin: null, logoUrl: null, accentColor: null, welcomeTitle: null, welcomeMessage: null, footerText: null },
      { headers: getExtCors(req.headers.get('origin')) }
    );
  }

  // Fallback: check team shopToken → find team owner
  const team = await prisma.team.findUnique({
    where: { shopToken },
    select: { ownerId: true },
  });

  if (team) {
    const config = await prisma.bilanConfig.findUnique({
      where: { userId: team.ownerId },
      select: {
        nomMagasin: true,
        logoUrl: true,
        accentColor: true,
        welcomeTitle: true,
        welcomeMessage: true,
        footerText: true,
      },
    });

    return NextResponse.json(
      config ?? { nomMagasin: null, logoUrl: null, accentColor: null, welcomeTitle: null, welcomeMessage: null, footerText: null },
      { headers: getExtCors(req.headers.get('origin')) }
    );
  }

  return NextResponse.json(
    { nomMagasin: null, logoUrl: null, accentColor: null, welcomeTitle: null, welcomeMessage: null, footerText: null },
    { headers: getExtCors(req.headers.get('origin')) }
  );
}
