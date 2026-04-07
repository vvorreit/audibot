"use client";
/**
 * Mutuelle Intelligence panel: benchmarks, rankings, user comparison.
 * Exports: MutuelleIntelPanel (default)
 * ~240 lines
 */

import { useEffect, useState } from "react";
import { getMutuelleBenchmarks, getMutuelleComparison } from "./actions";
import type { BenchmarkRow, MutuelleBenchmarksResult, ComparisonRow } from "./actions";
import MutuelleComparisonTable from "./MutuelleComparisonTable";
import { Award, TrendingDown, AlertTriangle, Loader2, ChevronDown, ChevronUp, Clock, ShieldAlert } from "lucide-react";

function RankCard({ row, rank, variant }: { row: BenchmarkRow; rank: number; variant: "best" | "worst" | "problematic" }) {
  const colors = {
    best: { bg: "bg-green-50", border: "border-green-100", badge: "bg-green-100 text-green-700", icon: "text-green-600" },
    worst: { bg: "bg-red-50", border: "border-red-100", badge: "bg-red-100 text-red-700", icon: "text-red-600" },
    problematic: { bg: "bg-amber-50", border: "border-amber-100", badge: "bg-amber-100 text-amber-700", icon: "text-amber-600" },
  }[variant];

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-2xl p-4 flex items-start gap-3`}>
      <span className={`text-lg font-black ${colors.icon}`}>#{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="font-black text-slate-900 text-sm">{row.label}</p>
        <div className="flex flex-wrap gap-2 mt-1.5">
          <span className={`px-2 py-0.5 rounded-full text-2xs font-black ${colors.badge}`}>
            {row.delaiMoyen != null ? `${row.delaiMoyen}j` : "—"} delai
          </span>
          <span className={`px-2 py-0.5 rounded-full text-2xs font-black ${colors.badge}`}>
            {(row.tauxRejet * 100).toFixed(1)}% rejet
          </span>
          <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-slate-100 text-slate-600">
            {row.totalDossiers} dossiers
          </span>
        </div>
      </div>
    </div>
  );
}

function MotifsSection({ benchmarks }: { benchmarks: BenchmarkRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const withMotifs = benchmarks.filter(b => b.topMotifsRejet.length > 0);
  if (withMotifs.length === 0) return null;

  return (
    <div className="bg-white rounded-card border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" /> Motifs de rejet fréquents
        </h3>
      </div>
      <div className="divide-y divide-slate-50">
        {withMotifs.map((b) => (
          <div key={b.mutuelle}>
            <button
              onClick={() => setExpanded(expanded === b.mutuelle ? null : b.mutuelle)}
              className="w-full flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors text-left"
            >
              <span className="font-bold text-slate-900 text-sm">{b.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-bold text-slate-500">{b.topMotifsRejet.length} motifs</span>
                {expanded === b.mutuelle ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>
            {expanded === b.mutuelle && (
              <div className="px-6 pb-4 space-y-1.5">
                {b.topMotifsRejet.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium truncate flex-1">{m.motif}</span>
                    <span className="text-slate-500 font-bold ml-3">{m.count}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MutuelleIntelPanel() {
  const [benchData, setBenchData] = useState<MutuelleBenchmarksResult | null>(null);
  const [comparisons, setComparisons] = useState<ComparisonRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMutuelleBenchmarks(), getMutuelleComparison()])
      .then(([b, c]) => { setBenchData(b); setComparisons(c); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!benchData?.period) {
    return (
      <div className="text-center py-20 space-y-3">
        <Clock className="w-10 h-10 text-slate-200 mx-auto" />
        <p className="text-slate-600 font-bold">Benchmarks en cours de calcul</p>
        <p className="text-sm text-slate-500 font-medium">
          Les données seront disponibles demain matin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Period indicator */}
      <p className="text-2xs text-slate-400 font-bold uppercase tracking-widest">
        Periode : {benchData.period} · 90 derniers jours · {benchData.benchmarks.length} mutuelles
      </p>

      {/* Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Best payers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-black text-slate-900">Meilleures payeuses</h3>
          </div>
          <div className="space-y-2">
            {benchData.best.map((b, i) => <RankCard key={b.mutuelle} row={b} rank={i + 1} variant="best" />)}
            {benchData.best.length === 0 && <p className="text-xs text-slate-400">Pas assez de données</p>}
          </div>
        </div>

        {/* Worst payers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-black text-slate-900">Pires payeuses</h3>
          </div>
          <div className="space-y-2">
            {benchData.worst.map((b, i) => <RankCard key={b.mutuelle} row={b} rank={i + 1} variant="worst" />)}
            {benchData.worst.length === 0 && <p className="text-xs text-slate-400">Pas assez de données</p>}
          </div>
        </div>

        {/* Most problematic */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-black text-slate-900">Plus problematiques</h3>
          </div>
          <div className="space-y-2">
            {benchData.problematic.map((b, i) => <RankCard key={b.mutuelle} row={b} rank={i + 1} variant="problematic" />)}
            {benchData.problematic.length === 0 && <p className="text-xs text-slate-400">Pas assez de données</p>}
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <MutuelleComparisonTable comparisons={comparisons ?? []} />

      {/* Motifs section */}
      <MotifsSection benchmarks={benchData.benchmarks} />

      {/* Methodology note */}
      <div className="bg-slate-50 rounded-card border border-slate-100 p-5">
        <p className="text-2xs font-bold text-slate-500">
          Donnees agregees et anonymisees sur l&apos;ensemble des utilisateurs AudiBot (min. 5 opticiens par mutuelle).
          Delais calcules entre la date d&apos;envoi et la date de reception. Mise a jour quotidienne.
        </p>
      </div>
    </div>
  );
}
