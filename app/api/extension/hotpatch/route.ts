export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getExtCors, optionsCors, authenticateExtension } from "@/lib/extensionAuth";

export async function OPTIONS() {
  return optionsCors();
}

/**
 * GET /api/extension/hotpatch
 * Retourne tous les hot-patches actifs.
 * Appelé par le background service worker toutes les 30 min.
 * Auth requise — les patches de type "js" contiennent du code exécutable.
 */
export async function GET(req: NextRequest) {
  const cors = getExtCors(req.headers.get('origin'));

  const auth = await authenticateExtension(req, undefined, "hotpatch", 30, 60_000);
  if (auth.error) return auth.error;

  try {
    const patches = await prisma.hotPatch.findMany({
      where: { active: true },
      orderBy: { priority: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        type: true,
        hostnames: true,
        data: true,
        priority: true,
      },
    });

    return NextResponse.json(
      { ok: true, patches },
      {
        headers: {
          ...cors,
          "Cache-Control": "private, max-age=300",
        },
      }
    );
  } catch (e) {
    console.error("[hotpatch]", e);
    return NextResponse.json(
      { ok: false, patches: [], error: "Internal error" },
      { status: 500, headers: cors }
    );
  }
}
