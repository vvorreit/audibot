export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin } from "@/lib/adminAudit";

/**
 * DELETE /api/admin/diagnostic
 * Supprime un ou plusieurs logs de diagnostic.
 * Body: { id: string } pour un seul, ou { ids: string[] } pour plusieurs,
 * ou { all: true, hostname?, trigger? } pour supprimer en masse avec filtres optionnels.
 */
export async function DELETE(req: NextRequest) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();

  // Supprimer un seul log
  if (body.id) {
    await prisma.diagnosticLog.delete({ where: { id: body.id } });
    return NextResponse.json({ ok: true, deleted: 1 });
  }

  // Supprimer plusieurs logs par IDs
  if (body.ids && Array.isArray(body.ids)) {
    const result = await prisma.diagnosticLog.deleteMany({
      where: { id: { in: body.ids } },
    });
    return NextResponse.json({ ok: true, deleted: result.count });
  }

  // Supprimer tous les logs (avec filtres optionnels)
  if (body.all) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (body.hostname) where.hostname = { contains: body.hostname };
    if (body.trigger) where.trigger = body.trigger;
    const result = await prisma.diagnosticLog.deleteMany({ where });
    return NextResponse.json({ ok: true, deleted: result.count });
  }

  return NextResponse.json({ error: "id, ids ou all requis" }, { status: 400 });
}
