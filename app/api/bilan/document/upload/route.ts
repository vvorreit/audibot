export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { getBilanCorsHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  const headers = getBilanCorsHeaders(req.headers.get("origin"));
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(req: NextRequest) {
  const corsHeaders = getBilanCorsHeaders(req.headers.get("origin"));
  try {
    const body = await req.json();
    const { bilanId, blob } = body as { bilanId?: string; blob?: string };

    if (typeof bilanId !== 'string' || bilanId.length === 0 || bilanId.length > 50) {
      return NextResponse.json({ error: "bilanId invalide" }, { status: 400, headers: corsHeaders });
    }
    if (typeof blob !== 'string' || blob.length === 0 || blob.length > 2_000_000) {
      return NextResponse.json({ error: "blob invalide ou trop volumineux" }, { status: 400, headers: corsHeaders });
    }

    // Rate limit: 3/hour per bilanId
    const allowed = await rateLimit(`doc-upload:${bilanId}`, 3, 3600_000);
    if (!allowed) {
      return NextResponse.json({ error: "Trop de requêtes" }, { status: 429, headers: corsHeaders });
    }

    // Verify bilanId exists and session is still valid
    const session = await prisma.bilanSession.findUnique({
      where: { id: bilanId },
      select: { id: true, expiresAt: true, delivered: true },
    });
    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404, headers: corsHeaders });
    }
    if (session.expiresAt < new Date() || session.delivered) {
      return NextResponse.json({ error: "Session expirée ou déjà soumise" }, { status: 403, headers: corsHeaders });
    }

    await prisma.documentBlob.create({
      data: {
        bilanId,
        blob,
        expiresAt: new Date(Date.now() + 4 * 3600 * 1000),
      },
    });

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500, headers: corsHeaders });
  }
}
