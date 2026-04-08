export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getExtCors, optionsCors } from "@/lib/extensionAuth";

export async function OPTIONS() {
  return optionsCors();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shopToken: string }> }
) {
  const { shopToken } = await params;

  const user = await prisma.user.findUnique({
    where: { shopToken },
    select: { storeName: true, role: true, teamId: true },
  });

  if (user) {
    return NextResponse.json(
      { valid: true, shopName: user.storeName ?? "Votre opticien" },
      { headers: getExtCors(_req.headers.get('origin')) }
    );
  }

  // Check team shopToken as fallback
  const team = await prisma.team.findUnique({
    where: { shopToken },
    select: { name: true },
  });

  if (team) {
    return NextResponse.json(
      { valid: true, shopName: team.name },
      { headers: getExtCors(_req.headers.get('origin')) }
    );
  }

  return NextResponse.json(
    { valid: false },
    { status: 404, headers: getExtCors(_req.headers.get('origin')) }
  );
}
