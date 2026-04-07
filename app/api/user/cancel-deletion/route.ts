export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

/** POST — Annule une demande de suppression via token */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await rateLimit(`cancel-deletion:${ip}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const { token } = await req.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token requis" }, { status: 400 });
  }

  const deletion = await prisma.deletionRequest.findUnique({
    where: { confirmToken: token },
  });

  if (!deletion) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  if (deletion.executedAt) {
    return NextResponse.json({ error: "Le compte a déjà été supprimé" }, { status: 410 });
  }

  if (deletion.cancelledAt) {
    return NextResponse.json({ ok: true, message: "La suppression avait déjà été annulée." });
  }

  await prisma.deletionRequest.update({
    where: { id: deletion.id },
    data: { cancelledAt: new Date() },
  });

  return NextResponse.json({ ok: true, message: "Suppression annulée avec succès." });
}
