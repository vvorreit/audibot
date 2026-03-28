import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { renderLitigeTemplate } from "@/lib/litige-templates";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const dossierId = searchParams.get("dossierId");
  const type = searchParams.get("type") as
    | "mise_en_demeure"
    | "contestation_rejet"
    | null;

  if (!dossierId || !type || !["mise_en_demeure", "contestation_rejet"].includes(type)) {
    return NextResponse.json(
      { error: "Parametres manquants: dossierId et type requis" },
      { status: 400 }
    );
  }

  const dossier = await prisma.dossierTiersPayant.findUnique({
    where: { id: dossierId },
    include: { user: { select: { name: true } } },
  });

  if (!dossier) {
    return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  }

  const nomOpticien =
    process.env.OPTICIEN_NOM ?? dossier.user.name ?? "Votre opticien";
  const adresseOpticien =
    process.env.OPTICIEN_ADRESSE ?? "[Adresse a configurer]";
  const siretOpticien = process.env.OPTICIEN_SIRET ?? "[SIRET a configurer]";

  const body = renderLitigeTemplate(type, {
    reference: dossier.reference,
    mutuelle: dossier.mutuelle,
    montant: dossier.montant,
    dateEnvoi: dossier.dateEnvoi,
    motifRejet: dossier.motifRejet,
    numeroAdherent: dossier.numeroAdherent,
  }, {
    nomOpticien,
    adresseOpticien,
    siretOpticien,
  });

  const titre =
    type === "mise_en_demeure"
      ? "Mise en demeure"
      : "Contestation de rejet";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${titre} — Dossier ${dossier.reference}</title>
  <style>
    @page {
      size: A4;
      margin: 25mm 20mm;
    }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Times New Roman", Georgia, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 210mm;
      margin: 0 auto;
      padding: 25mm 20mm;
      background: #fff;
    }
    .toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #1e293b;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 100;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
    }
    .toolbar button {
      background: #3b82f6;
      color: #fff;
      border: none;
      padding: 8px 20px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    .toolbar button:hover { background: #2563eb; }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
    }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <span style="font-weight:700">${titre} — ${dossier.reference}</span>
    <div style="flex:1"></div>
    <button onclick="window.print()">Imprimer / Enregistrer en PDF</button>
  </div>
  <pre>${escapeHtml(body)}</pre>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
