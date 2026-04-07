export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkAdmin } from "@/lib/adminAudit";
import { prisma } from "@/lib/db";

/* GET — liste tous les overrides */
export async function GET() {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const overrides = await prisma.portalSelectorOverride.findMany({
    orderBy: [{ portal: "asc" }, { selectorName: "asc" }],
    take: 1000,
  });

  return NextResponse.json({ overrides });
}

/* POST — créer ou mettre à jour un override */
export async function POST(req: NextRequest) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const session = (await getServerSession(authOptions))!;

  const { portal, selectorName, selector, enabled } = await req.json() as {
    portal: string;
    selectorName: string;
    selector: string;
    enabled?: boolean;
  };

  if (!portal || !selectorName || !selector) {
    return NextResponse.json({ error: "portal, selectorName et selector requis" }, { status: 400 });
  }

  const override = await prisma.portalSelectorOverride.upsert({
    where: { portal_selectorName: { portal, selectorName } },
    update: {
      selector,
      enabled: enabled ?? true,
      updatedBy: session.user?.email ?? "admin",
    },
    create: {
      portal,
      selectorName,
      selector,
      enabled: enabled ?? true,
      updatedBy: session.user?.email ?? "admin",
    },
  });

  return NextResponse.json({ ok: true, override });
}

/* DELETE — supprimer un override par id */
export async function DELETE(req: NextRequest) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await req.json() as { id: string };
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  await prisma.portalSelectorOverride.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
