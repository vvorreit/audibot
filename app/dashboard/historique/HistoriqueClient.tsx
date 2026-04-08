"use client";

import { useState, useMemo, useRef } from "react";
import { ChevronDown, ChevronUp, RefreshCw, CheckCircle, XCircle, BarChart3, Star, ScanLine } from "lucide-react";

interface ScanLog {
  id: string;
  type: string;
  success: boolean;
  ocrConfidence: number;
  dataScore: number;
  globalScore: number;
  level: string;
  fileName: string | null;
  createdAt: string;
}

interface Props {
  scans: ScanLog[];
  isPlanLimite: boolean;
  plan: string;
}

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  high:   { label: "Excellent", color: "bg-green-100 text-green-700" },
  medium: { label: "Moyen",     color: "bg-amber-100 text-amber-700" },
  low:    { label: "Faible",    color: "bg-red-100 text-red-700" },
};

const PERIODE_OPTIONS = [
  { value: "7",   label: "7 jours" },
  { value: "30",  label: "30 jours" },
  { value: "90",  label: "90 jours" },
  { value: "all", label: "Tout" },
];

// `plan` is reserved for future display (e.g., upsell badge); destructured with _ to satisfy no-unused-vars
export default function HistoriqueClient({ scans, isPlanLimite, plan: _plan }: Props) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [periodeFilter, setPeriodeFilter] = useState<string>(isPlanLimite ? "30" : "all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // eslint-disable-next-line react-hooks/purity -- useRef initial value is evaluated once, not on every render
  const nowRef = useRef(Date.now());

  const filtered = useMemo(() => {
    const now = nowRef.current;
    return scans.filter((s) => {
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (periodeFilter !== "all") {
        const days = parseInt(periodeFilter, 10);
        if (now - new Date(s.createdAt).getTime() > days * 24 * 60 * 60 * 1000) return false;
      }
      return true;
    });
  }, [scans, typeFilter, periodeFilter]);

  const kpis = useMemo(() => {
    if (filtered.length === 0) return { avg: 0, excellentPct: 0, count: filtered.length };
    const avg = Math.round(filtered.reduce((sum, s) => sum + s.globalScore, 0) / filtered.length);
    const excellentCount = filtered.filter((s) => s.level === "high").length;
    const excellentPct = Math.round((excellentCount / filtered.length) * 100);
    return { avg, excellentPct, count: filtered.length };
  }, [filtered]);

  const handleReload = () => {
    window.dispatchEvent(new CustomEvent("audibot_scan_reload", { detail: { scans: filtered } }));
  };

  return (
    <main className="bg-slate-50 min-h-screen pb-10">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Historique des scans OCR</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {scans.length} scan{scans.length > 1 ? "s" : ""} au total
              {isPlanLimite && <span className="ml-2 text-xs text-amber-600 font-bold">(30 derniers jours)</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPlanLimite && (
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-2xs font-black rounded-full uppercase">
                PRO pour illimité
              </span>
            )}
            <button
              onClick={handleReload}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Recharger
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <label className="block text-2xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Tous</option>
              <option value="mutuelle">Mutuelle</option>
              <option value="ordonnance">Ordonnance</option>
            </select>
          </div>
          <div>
            <label className="block text-2xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Période</label>
            <select
              value={periodeFilter}
              onChange={(e) => setPeriodeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {PERIODE_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={isPlanLimite && opt.value === "all"}
                >
                  {opt.label}
                  {isPlanLimite && opt.value === "all" ? " (Pro)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-sm text-slate-400 font-medium pb-2">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* KPIs */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xs font-black uppercase tracking-widest text-slate-400">Score moyen</p>
                <p className="text-2xl font-black text-slate-900">{kpis.avg}%</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xs font-black uppercase tracking-widest text-slate-400">Excellent</p>
                <p className="text-2xl font-black text-slate-900">{kpis.excellentPct}%</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xs font-black uppercase tracking-widest text-slate-400">Scans (période)</p>
                <p className="text-2xl font-black text-slate-900">{kpis.count}</p>
              </div>
            </div>
          </div>
        )}

        {/* US-M06 — Vue mobile cards */}
        <div className="block md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400 font-medium">
              Aucun scan trouvé pour ces filtres.
            </div>
          ) : filtered.map((scan) => {
            const lvl = LEVEL_CONFIG[scan.level] ?? { label: scan.level, color: "bg-slate-100 text-slate-600" };
            const isExpanded = expandedId === scan.id;
            return (
              <div
                key={scan.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : scan.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(scan.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div className="flex items-center gap-2">
                    {scan.success ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold capitalize text-slate-700 text-sm">
                    {scan.type === "mutuelle" ? "Mutuelle" : "Ordonnance"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{Math.round(scan.globalScore)}%</span>
                    <span className={`px-2 py-0.5 rounded-full text-2xs font-black ${lvl.color}`}>{lvl.label}</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">OCR</p>
                      <p className="font-black text-slate-900">{Math.round(scan.ocrConfidence)}%</p>
                    </div>
                    <div>
                      <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Data</p>
                      <p className="font-black text-slate-900">{Math.round(scan.dataScore)}%</p>
                    </div>
                    <div>
                      <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Global</p>
                      <p className="font-black text-slate-900">{Math.round(scan.globalScore)}%</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Table desktop */}
        {filtered.length === 0 ? (
          <div className="hidden md:block bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400 font-medium">
            Aucun scan trouvé pour ces filtres.
          </div>
        ) : (
          <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="text-left px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-400">Type</th>
                    <th className="text-left px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-400">Fichier</th>
                    <th className="text-left px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-400">Score</th>
                    <th className="text-left px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-400">Niveau</th>
                    <th className="text-left px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-400">Succès</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((scan) => {
                    const lvl = LEVEL_CONFIG[scan.level] ?? { label: scan.level, color: "bg-slate-100 text-slate-600" };
                    const isExpanded = expandedId === scan.id;
                    return (
                      <>
                        <tr
                          key={scan.id}
                          className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : scan.id)}
                        >
                          <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                            {new Date(scan.createdAt).toLocaleDateString("fr-FR", {
                              day: "2-digit", month: "2-digit", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold capitalize text-slate-700">
                              {scan.type === "mutuelle" ? "Mutuelle" : "Ordonnance"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-medium max-w-[160px] truncate">
                            {scan.fileName ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-black text-slate-900">{Math.round(scan.globalScore)}%</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-2xs font-black ${lvl.color}`}>
                              {lvl.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {scan.success
                              ? <CheckCircle className="w-4 h-4 text-green-500" />
                              : <XCircle className="w-4 h-4 text-red-400" />
                            }
                          </td>
                          <td className="px-4 py-3">
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4 text-slate-400" />
                              : <ChevronDown className="w-4 h-4 text-slate-400" />
                            }
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${scan.id}-detail`} className="bg-blue-50 border-b border-slate-100">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">OCR Confidence</p>
                                  <p className="font-black text-slate-900">{Math.round(scan.ocrConfidence)}%</p>
                                </div>
                                <div>
                                  <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Data Score</p>
                                  <p className="font-black text-slate-900">{Math.round(scan.dataScore)}%</p>
                                </div>
                                <div>
                                  <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Global Score</p>
                                  <p className="font-black text-slate-900">{Math.round(scan.globalScore)}%</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
