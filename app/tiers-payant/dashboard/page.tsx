"use client";

import { useEffect, useState, useCallback } from "react";
import { getTPDashboardData, exportDossiersCSV } from "./actions";
import { exportDossiersCSV as exportCSVGlobal } from "@/app/tiers-payant/export";
import Link from "next/link";
import {
  Clock, CheckCircle, XCircle, AlertTriangle,
  Euro, TrendingUp, Download, Filter,
} from "lucide-react";
import { SkeletonPage } from "@/components/SkeletonRow";
import { inputCls } from "@/components/ui/Input";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "@/components/charts";

const MUTUELLES_LABELS: Record<string, string> = {
  CPAM: "CPAM", ALMERYS: "Almerys", VIAMEDIS: "Viamedis",
  ITELIS: "Itelis", KALIXIA: "Kalixia", CARTE_BLANCHE: "Carte Blanche",
  SANTECLAIR: "Santeclair", SEVEANE: "Seveane", SP_SANTE: "SP Sante",
  AUTRE: "Autre",
};

const MUTUELLES_OPTIONS = [
  "CPAM", "ALMERYS", "VIAMEDIS", "ITELIS", "KALIXIA",
  "CARTE_BLANCHE", "SANTECLAIR", "SEVEANE", "SP_SANTE", "AUTRE",
];

const STATUTS_OPTIONS = ["EN_ATTENTE", "RECU", "REJETE", "EN_LITIGE"];
const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente", RECU: "Recu", REJETE: "Rejete", EN_LITIGE: "En litige",
};

interface KPIs {
  totalEnAttente: number;
  nbEnAttente: number;
  totalRecu: number;
  nbRecu: number;
  totalRejete: number;
  nbRejete: number;
  totalLitige: number;
  nbLitige: number;
  nbTotal: number;
  montantMoyen: number;
  delaiMoyen: number;
}

interface MutuelleRow {
  mutuelle: string;
  montantAttente: number;
  nbDossiers: number;
  nbAttente: number;
  delaiMoyen: number | null;
}

interface TrancheRow {
  label: string;
  count: number;
  montant: number;
}

interface EvolutionRow {
  mois: string;
  envoye: number;
  recu: number;
  rejete: number;
}

interface DashboardData {
  kpis: KPIs;
  parMutuelle: MutuelleRow[];
  tranches: TrancheRow[];
  evolution: EvolutionRow[];
}

function formatEur(v: number) {
  return v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " EUR";
}

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string;
}) {
  const colors: Record<string, string> = {
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };
  return (
    <div className="bg-white p-6 rounded-card shadow-sm border border-slate-100 flex flex-col gap-2">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      {sub && <p className="text-xs font-semibold text-slate-400">{sub}</p>}
    </div>
  );
}

function TrancheBar({ label, count, montant, maxMontant }: {
  label: string; count: number; montant: number; maxMontant: number;
}) {
  const pct = maxMontant > 0 ? (montant / maxMontant) * 100 : 0;
  const isOld = label === ">90";
  return (
    <div className="flex items-center gap-4">
      <span className={`w-14 text-xs font-black text-right ${isOld ? "text-red-600" : "text-slate-500"}`}>{label}j</span>
      <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all ${isOld ? "bg-red-500" : "bg-blue-500"}`}
          style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
        />
      </div>
      <div className="w-40 text-right">
        <span className={`text-sm font-black ${isOld ? "text-red-600" : "text-slate-700"}`}>{formatEur(montant)}</span>
        <span className="text-xs text-slate-400 ml-2">({count})</span>
      </div>
    </div>
  );
}

export default function TPDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"CSV" | "PDF">("CSV");
  const [exportPeriode, setExportPeriode] = useState<"mois" | "3mois" | "6mois" | "tout">("mois");
  const [exportStatut, setExportStatut] = useState("all");

  const [filtreStatut, setFiltreStatut] = useState("all");
  const [filtreMutuelle, setFiltreMutuelle] = useState("all");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const filters = { statut: filtreStatut, mutuelle: filtreMutuelle, dateDebut, dateFin };

  const loadData = useCallback(() => {
    setLoading(true);
    getTPDashboardData(filters)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreStatut, filtreMutuelle, dateDebut, dateFin]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const csv = await exportDossiersCSV(filters);
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dossiers-tp-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur export CSV");
    } finally {
      setExporting(false);
    }
  };

  const getExportDateDebut = () => {
    const now = new Date();
    if (exportPeriode === "mois") {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return d.toISOString().slice(0, 10);
    }
    if (exportPeriode === "3mois") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return d.toISOString().slice(0, 10);
    }
    if (exportPeriode === "6mois") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      return d.toISOString().slice(0, 10);
    }
    return undefined;
  };

  const handleExportModal = async () => {
    setExporting(true);
    const exportFilters = {
      dateDebut: getExportDateDebut(),
      statut: exportStatut !== "all" ? exportStatut : undefined,
    };
    try {
      if (exportFormat === "CSV") {
        const csv = await exportCSVGlobal(exportFilters);
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dossiers-tp-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const params = new URLSearchParams();
        if (exportFilters.dateDebut) params.set("dateDebut", exportFilters.dateDebut);
        if (exportFilters.statut) params.set("statut", exportFilters.statut);
        window.open(`/tiers-payant/export/pdf?${params.toString()}`, "_blank");
      }
      setShowExportModal(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur export");
    } finally {
      setExporting(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-card border border-red-100 max-w-md">
          <h1 className="text-2xl font-black mb-4">Accès Refusé</h1>
          <p className="font-medium mb-6">{error}</p>
          <Link href="/dashboard" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Retour</Link>
        </div>
      </div>
    );
  }

  /* inputCls importé depuis ui/Input */

  return (
    <>

          <div className="flex justify-end mb-6">
            <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors text-sm">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-card shadow-sm border border-slate-100 p-5 mb-8 flex flex-wrap items-center gap-4">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} className={inputCls}>
              <option value="all">Tous les statuts</option>
              {STATUTS_OPTIONS.map((s) => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
            </select>
            <select value={filtreMutuelle} onChange={(e) => setFiltreMutuelle(e.target.value)} className={inputCls}>
              <option value="all">Toutes les mutuelles</option>
              {MUTUELLES_OPTIONS.map((m) => <option key={m} value={m}>{MUTUELLES_LABELS[m]}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Du</span>
              <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className={inputCls} />
              <span className="text-xs font-bold text-slate-400">au</span>
              <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className={inputCls} />
            </div>
            {(filtreStatut !== "all" || filtreMutuelle !== "all" || dateDebut || dateFin) && (
              <button
                onClick={() => { setFiltreStatut("all"); setFiltreMutuelle("all"); setDateDebut(""); setDateFin(""); }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Reinitialiser
              </button>
            )}
          </div>

          {loading ? (
            <SkeletonPage />
          ) : data && (
            <div className="space-y-8">

              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KpiCard label="En attente" value={formatEur(data.kpis.totalEnAttente)} sub={`${data.kpis.nbEnAttente} dossiers`} icon={Clock} color="amber" />
                <KpiCard label="Recus" value={formatEur(data.kpis.totalRecu)} sub={`${data.kpis.nbRecu} dossiers`} icon={CheckCircle} color="green" />
                <KpiCard label="Rejetes" value={formatEur(data.kpis.totalRejete)} sub={`${data.kpis.nbRejete} dossiers`} icon={XCircle} color="red" />
                <KpiCard label="En litige" value={formatEur(data.kpis.totalLitige)} sub={`${data.kpis.nbLitige} dossiers`} icon={AlertTriangle} color="purple" />
                <KpiCard label="Montant moyen" value={formatEur(data.kpis.montantMoyen)} sub={`${data.kpis.nbTotal} dossiers total`} icon={Euro} color="blue" />
                <KpiCard label="Delai moyen" value={`${data.kpis.delaiMoyen}j`} sub="remboursement" icon={TrendingUp} color="indigo" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Tableau par mutuelle */}
                <div className="lg:col-span-2 bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-50">
                    <h2 className="font-black text-lg">Par mutuelle</h2>
                    <p className="text-xs text-slate-400 font-semibold">Montants en attente et delais moyens</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50">
                          {["Mutuelle", "En attente", "Nb attente", "Total dossiers", "Delai moy."].map((h) => (
                            <th key={h} className="px-6 py-4 text-2xs font-black uppercase tracking-widest text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.parMutuelle.map((row) => (
                          <tr key={row.mutuelle} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-sm">{MUTUELLES_LABELS[row.mutuelle] || row.mutuelle}</td>
                            <td className="px-6 py-4 font-black text-sm">{formatEur(row.montantAttente)}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-500">{row.nbAttente}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-500">{row.nbDossiers}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-500">
                              {row.delaiMoyen != null ? `${row.delaiMoyen}j` : "—"}
                            </td>
                          </tr>
                        ))}
                        {data.parMutuelle.length === 0 && (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-bold">Aucune donnee.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tranches d'anciennete */}
                <div className="bg-white rounded-card shadow-sm border border-slate-100 p-8">
                  <h2 className="font-black text-lg mb-1">Anciennete des impayes</h2>
                  <p className="text-xs text-slate-400 font-semibold mb-6">Dossiers en attente + en litige</p>
                  <div className="space-y-4">
                    {data.tranches.map((t) => (
                      <TrancheBar
                        key={t.label}
                        label={t.label}
                        count={t.count}
                        montant={t.montant}
                        maxMontant={Math.max(...data.tranches.map((x) => x.montant), 1)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Graphique evolution mensuelle */}
              <div className="bg-white rounded-card shadow-sm border border-slate-100 p-8">
                <h2 className="font-black text-lg mb-1">Evolution mensuelle</h2>
                <p className="text-xs text-slate-400 font-semibold mb-6">12 derniers mois (EUR)</p>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.evolution} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="mois"
                        tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                        tickFormatter={(v: string) => {
                          const [, m] = v.split("-");
                          const months = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];
                          return months[parseInt(m, 10) - 1] || v;
                        }}
                      />
                      <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }} />
                      <Tooltip
                        formatter={(value, name) => [
                          formatEur(Number(value)),
                          name === "envoye" ? "Envoye" : name === "recu" ? "Recu" : "Rejete",
                        ]}
                        contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", fontWeight: 700, fontSize: 13 }}
                      />
                      <Legend
                        formatter={(value: string) =>
                          value === "envoye" ? "Envoye" : value === "recu" ? "Recu" : "Rejete"
                        }
                        wrapperStyle={{ fontSize: 12, fontWeight: 700 }}
                      />
                      <Bar dataKey="envoye" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="recu" fill="#22c55e" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="rejete" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
      {/* Modal Export */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-5">
            <h3 className="text-lg font-black text-slate-900">Exporter les dossiers</h3>

            {/* Format */}
            <div>
              <label className="block text-2xs font-black uppercase tracking-widest text-slate-400 mb-2">Format</label>
              <div className="flex gap-2">
                {(["CSV", "PDF"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setExportFormat(f)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      exportFormat === f
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Période */}
            <div>
              <label className="block text-2xs font-black uppercase tracking-widest text-slate-400 mb-2">Période</label>
              <select
                value={exportPeriode}
                onChange={(e) => setExportPeriode(e.target.value as "mois" | "3mois" | "6mois" | "tout")}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="mois">Ce mois</option>
                <option value="3mois">3 derniers mois</option>
                <option value="6mois">6 derniers mois</option>
                <option value="tout">Tout</option>
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-2xs font-black uppercase tracking-widest text-slate-400 mb-2">Statut</label>
              <select
                value={exportStatut}
                onChange={(e) => setExportStatut(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="all">Tous</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="RECU">Reçu</option>
                <option value="REJETE">Rejeté</option>
                <option value="EN_LITIGE">En litige</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleExportModal}
                disabled={exporting}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {exporting ? "Export..." : "Télécharger"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
