"use client";

import { useEffect } from "react";

const MUTUELLES_LABELS: Record<string, string> = {
  CPAM: "CPAM",
  ALMERYS: "Almerys",
  VIAMEDIS: "Viamedis",
  ITELIS: "Itelis",
  KALIXIA: "Kalixia",
  CARTE_BLANCHE: "Carte Blanche",
  SANTECLAIR: "Santeclair",
  SEVEANE: "Seveane",
  SP_SANTE: "SP Santé",
  AUTRE: "Autre",
};

interface MutuelleRow {
  mutuelle: string;
  nbDossiers: number;
  montantSoumis: number;
  montantRecu: number;
  nbRejetes: number;
}

interface ReportData {
  userName: string;
  monthLabel: string;
  month: string;
  kpis: {
    nbTotal: number;
    totalSoumis: number;
    totalRecu: number;
    tauxRejet: number;
    delaiMoyen: number;
  };
  parMutuelle: MutuelleRow[];
  generatedAt: string;
}

function formatEur(v: number): string {
  return v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function AsciiBar({ value, max, width = 20 }: { value: number; max: number; width?: number }) {
  const filled = max > 0 ? Math.round((value / max) * width) : 0;
  return (
    <span style={{ fontFamily: "monospace", fontSize: 12 }}>
      {"█".repeat(filled)}{"░".repeat(width - filled)}
    </span>
  );
}

export default function RapportPDFClient({ data }: { data: ReportData }) {
  useEffect(() => {
    // Auto-print si paramètre ?print=1 dans l'URL
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("print") === "1") {
      setTimeout(() => window.print(), 500);
    }
  }, []);

  const maxMontant = Math.max(...data.parMutuelle.map((r) => r.montantSoumis), 1);

  return (
    <>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
          @page { margin: 20mm 15mm; }
        }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; }
        .container { max-width: 800px; margin: 0 auto; padding: 32px 24px; background: white; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 28px; }
        .logo { display: flex; align-items: center; gap: 10px; }
        .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #2563eb, #6366f1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px; }
        .logo-text { font-size: 22px; font-weight: 800; color: #0f172a; }
        .header-meta { text-align: right; font-size: 13px; color: #64748b; }
        .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 28px; }
        .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 12px; text-align: center; }
        .kpi-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px; }
        .kpi-value { font-size: 18px; font-weight: 800; color: #0f172a; }
        .kpi-value.green { color: #16a34a; }
        .kpi-value.red { color: #dc2626; }
        .kpi-value.blue { color: #2563eb; }
        .section-title { font-size: 15px; font-weight: 800; color: #0f172a; margin: 24px 0 12px; border-left: 4px solid #2563eb; padding-left: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
        td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 500; color: #334155; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #f8fafc; }
        .bar-cell { font-family: monospace; font-size: 11px; color: #2563eb; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        .print-btn { display: flex; gap: 12px; justify-content: flex-end; margin-bottom: 24px; }
        .btn { padding: 10px 20px; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; }
        .btn-primary { background: #2563eb; color: white; }
        .btn-secondary { background: #f1f5f9; color: #475569; }
        .btn:hover { opacity: 0.85; }
        .empty-msg { text-align: center; color: #94a3b8; padding: 24px; font-style: italic; }
      `}</style>

      <div className="container">
        {/* Boutons d'action — masqués à l'impression */}
        <div className="print-btn no-print">
          <button className="btn btn-secondary" onClick={() => { window.close(); window.location.href = "/tiers-payant/dashboard"; }}>← Retour</button>
          <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Imprimer / Sauvegarder PDF</button>
        </div>

        {/* En-tête */}
        <div className="header">
          <div className="logo">
            <div className="logo-icon">O</div>
            <span className="logo-text">AudiBot</span>
          </div>
          <div className="header-meta">
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>
              Rapport mensuel tiers-payant
            </div>
            <div style={{ marginTop: 4 }}>
              {data.userName}
            </div>
            <div style={{ marginTop: 2, textTransform: "capitalize", fontWeight: 600 }}>
              {data.monthLabel}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Total dossiers</div>
            <div className="kpi-value blue">{data.kpis.nbTotal}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Montant soumis</div>
            <div className="kpi-value">{formatEur(data.kpis.totalSoumis)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Montant reçu</div>
            <div className="kpi-value green">{formatEur(data.kpis.totalRecu)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Taux de rejet</div>
            <div className={`kpi-value ${data.kpis.tauxRejet > 15 ? "red" : data.kpis.tauxRejet > 5 ? "" : "green"}`}>
              {data.kpis.tauxRejet}%
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Délai moyen</div>
            <div className="kpi-value">{data.kpis.delaiMoyen > 0 ? `${data.kpis.delaiMoyen}j` : "—"}</div>
          </div>
        </div>

        {/* Tableau par mutuelle */}
        <div className="section-title">Dossiers par mutuelle</div>

        {data.parMutuelle.length === 0 ? (
          <p className="empty-msg">Aucun dossier ce mois-ci.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mutuelle</th>
                <th>Dossiers</th>
                <th>Montant soumis</th>
                <th>Montant reçu</th>
                <th>Rejets</th>
                <th>Volume (visuel)</th>
              </tr>
            </thead>
            <tbody>
              {data.parMutuelle.map((row) => (
                <tr key={row.mutuelle}>
                  <td style={{ fontWeight: 700 }}>{MUTUELLES_LABELS[row.mutuelle] || row.mutuelle}</td>
                  <td>{row.nbDossiers}</td>
                  <td>{formatEur(row.montantSoumis)}</td>
                  <td style={{ color: "#16a34a", fontWeight: 700 }}>{formatEur(row.montantRecu)}</td>
                  <td style={{ color: row.nbRejetes > 0 ? "#dc2626" : "#94a3b8" }}>{row.nbRejetes}</td>
                  <td className="bar-cell">
                    <AsciiBar value={row.montantSoumis} max={maxMontant} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Récapitulatif ASCII */}
        {data.parMutuelle.length > 0 && (
          <>
            <div className="section-title">Répartition visuelle (montants soumis)</div>
            <table style={{ fontFamily: "monospace" }}>
              <tbody>
                {data.parMutuelle.map((row) => (
                  <tr key={row.mutuelle} style={{ borderBottom: "none" }}>
                    <td style={{ width: 120, fontWeight: 700, fontSize: 12, paddingRight: 8, borderBottom: "none" }}>
                      {(MUTUELLES_LABELS[row.mutuelle] || row.mutuelle).padEnd(15).slice(0, 15)}
                    </td>
                    <td style={{ borderBottom: "none" }}>
                      <AsciiBar value={row.montantSoumis} max={maxMontant} width={30} />
                      <span style={{ marginLeft: 8, fontSize: 11, color: "#64748b" }}>{formatEur(row.montantSoumis)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Footer */}
        <div className="footer">
          Rapport généré le {data.generatedAt} — AudiBot &copy; {new Date().getFullYear()}
          {" "}· Données confidentielles
        </div>
      </div>
    </>
  );
}
