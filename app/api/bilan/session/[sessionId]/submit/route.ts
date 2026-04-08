export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBilanCorsHeaders } from "@/lib/cors";
import { computeBilan } from "@/lib/bilan-engine";
import type { BilanFormData } from "@/types/bilan";

export async function OPTIONS(req: NextRequest) {
  const headers = getBilanCorsHeaders(req.headers.get("origin"));
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const corsHeaders = getBilanCorsHeaders(req.headers.get("origin"));
  const { sessionId } = await params;

  const session = await prisma.bilanSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return NextResponse.json(
      { error: "Session introuvable" },
      { status: 404, headers: corsHeaders }
    );
  }

  if (session.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Session expirée" },
      { status: 403, headers: corsHeaders }
    );
  }

  if (session.delivered) {
    return NextResponse.json(
      { error: "Bilan déjà soumis" },
      { status: 403, headers: corsHeaders }
    );
  }

  let body: { payload: BilanFormData; ocrData?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps invalide" },
      { status: 400, headers: corsHeaders }
    );
  }

  const { payload, ocrData } = body;
  if (!payload || !payload.correctionType || !payload.budgetRange) {
    return NextResponse.json(
      { error: "Données de bilan incomplètes" },
      { status: 400, headers: corsHeaders }
    );
  }

  const result = computeBilan(payload);

  const storedPayload: Record<string, unknown> = { formData: payload, result };
  if (ocrData && Object.keys(ocrData).length > 0) {
    storedPayload.ocrData = ocrData;
  }

  // Update atomique conditionnel — empêche le double-submit en cas de requêtes concurrentes
  const updated = await prisma.bilanSession.updateMany({
    where: { id: sessionId, delivered: false },
    data: {
      payload: JSON.stringify(storedPayload),
      delivered: true,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Bilan déjà soumis" },
      { status: 409, headers: corsHeaders }
    );
  }

  return NextResponse.json({ result }, { headers: corsHeaders });
}
