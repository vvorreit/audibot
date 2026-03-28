export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { exportDossiersPDFHtml } from "@/app/tiers-payant/export";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const filters = {
    dateDebut: searchParams.get("dateDebut") ?? undefined,
    dateFin: searchParams.get("dateFin") ?? undefined,
    statut: searchParams.get("statut") ?? undefined,
  };

  try {
    const html = await exportDossiersPDFHtml(filters);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur export";
    return new NextResponse(`<p>${msg}</p>`, { status: 400, headers: { "Content-Type": "text/html" } });
  }
}
