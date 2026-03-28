"use server";

import { prisma } from "@/lib/db";
import { requireTPUser, tpUserFilter } from "@/lib/tpAccess";

interface ExportFilters {
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
}

async function getDossiers(filters: ExportFilters) {
  const user = await requireTPUser();

  const where: Record<string, unknown> = await tpUserFilter(user);

  if (filters.statut && filters.statut !== "all") {
    where.statut = filters.statut;
  }
  if (filters.dateDebut) {
    where.dateEnvoi = { ...(where.dateEnvoi as object ?? {}), gte: new Date(filters.dateDebut) };
  }
  if (filters.dateFin) {
    where.dateEnvoi = { ...(where.dateEnvoi as object ?? {}), lte: new Date(filters.dateFin) };
  }

  return prisma.dossierTiersPayant.findMany({
    where,
    orderBy: { dateEnvoi: "desc" },
    select: {
      reference: true,
      mutuelle: true,
      montant: true,
      montantRecu: true,
      dateEnvoi: true,
      dateReception: true,
      statut: true,
      motifRejet: true,
      commentaire: true,
    },
  });
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR");
}

function formatEur(v: number | null | undefined): string {
  if (v == null) return "";
  return v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  RECU: "Reçu",
  REJETE: "Rejeté",
  EN_LITIGE: "En litige",
};

export async function exportDossiersCSV(filters: ExportFilters): Promise<string> {
  const dossiers = await getDossiers(filters);

  const header = [
    "Référence",
    "Mutuelle",
    "Montant envoyé (€)",
    "Montant reçu (€)",
    "Date envoi",
    "Date réception",
    "Statut",
    "Motif rejet",
    "Commentaire",
  ].join(";");

  const rows = dossiers.map((d) => {
    const cols = [
      d.reference,
      d.mutuelle,
      formatEur(d.montant),
      formatEur(d.montantRecu),
      formatDate(d.dateEnvoi),
      formatDate(d.dateReception),
      STATUT_LABELS[d.statut] ?? d.statut,
      d.motifRejet ?? "",
      (d.commentaire ?? "").replace(/;/g, ",").replace(/\n/g, " "),
    ];
    return cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";");
  });

  return [header, ...rows].join("\n");
}

export async function exportDossiersPDFHtml(filters: ExportFilters): Promise<string> {
  const dossiers = await getDossiers(filters);

  const rows = dossiers
    .map(
      (d) => `
    <tr>
      <td>${d.reference}</td>
      <td>${d.mutuelle}</td>
      <td style="text-align:right">${formatEur(d.montant)}</td>
      <td style="text-align:right">${formatEur(d.montantRecu)}</td>
      <td>${formatDate(d.dateEnvoi)}</td>
      <td>${formatDate(d.dateReception)}</td>
      <td>${STATUT_LABELS[d.statut] ?? d.statut}</td>
      <td>${d.motifRejet ?? ""}</td>
      <td>${(d.commentaire ?? "").substring(0, 80)}</td>
    </tr>`
    )
    .join("");

  const total = dossiers.reduce((acc, d) => acc + d.montant, 0);
  const totalRecu = dossiers.reduce((acc, d) => acc + (d.montantRecu ?? 0), 0);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Export Tiers Payant — OptiBot</title>
  <style>
    @page { size: A4 landscape; margin: 1.5cm; }
    * { box-sizing: border-box; font-family: Arial, sans-serif; }
    body { font-size: 11px; color: #1e293b; }
    h1 { font-size: 16px; font-weight: 900; margin-bottom: 4px; }
    p.subtitle { font-size: 11px; color: #64748b; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1e40af; color: white; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
    .total-row td { font-weight: 700; background: #eff6ff; border-top: 2px solid #1e40af; }
    @media print {
      button { display: none !important; }
      body { margin: 0; }
    }
    .print-btn {
      margin-bottom: 16px;
      padding: 8px 20px;
      background: #1e40af;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimer / Exporter en PDF</button>
  <h1>Export Tiers Payant</h1>
  <p class="subtitle">Généré le ${new Date().toLocaleDateString("fr-FR")} — ${dossiers.length} dossier${dossiers.length > 1 ? "s" : ""}</p>
  <table>
    <thead>
      <tr>
        <th>Référence</th>
        <th>Mutuelle</th>
        <th>Envoyé (€)</th>
        <th>Reçu (€)</th>
        <th>Date envoi</th>
        <th>Date réception</th>
        <th>Statut</th>
        <th>Motif rejet</th>
        <th>Commentaire</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td colspan="2">TOTAL</td>
        <td style="text-align:right">${formatEur(total)}</td>
        <td style="text-align:right">${formatEur(totalRecu)}</td>
        <td colspan="5"></td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
}
