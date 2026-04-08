"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { ComparisonRow } from "./actions";

function DeltaBadge({ value, unit, inverse }: { value: number | null; unit: string; inverse?: boolean }) {
  if (value == null) return <span className="text-slate-400 text-xs">—</span>;
  const isGood = inverse ? value > 0 : value < 0;
  const isBad = inverse ? value < 0 : value > 0;
  const abs = Math.abs(value);
  const formatted = unit === "%" ? `${(abs * 100).toFixed(1)}%` : `${abs.toFixed(1)}j`;

  if (abs < 0.001) return <span className="flex items-center gap-1 text-slate-500 text-xs font-bold"><Minus className="w-3 h-3" /> =</span>;

  return (
    <span className={`flex items-center gap-1 text-xs font-black ${isGood ? "text-green-600" : isBad ? "text-red-600" : "text-slate-500"}`}>
      {isGood ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
      {isBad ? "+" : "-"}{formatted}
    </span>
  );
}

export default function MutuelleComparisonTable({ comparisons }: { comparisons: ComparisonRow[] }) {
  if (comparisons.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 font-medium text-sm">
        Pas assez de dossiers pour comparer vos performances.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-900">Votre performance vs moyenne AudiBot</h3>
        <p className="text-2xs text-slate-500 font-medium mt-0.5">90 derniers jours</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-600">Mutuelle</th>
              <th className="text-right px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-600">Votre delai</th>
              <th className="text-right px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-600">Moy. AudiBot</th>
              <th className="text-right px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-600">Ecart</th>
              <th className="text-right px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-600">Votre rejet</th>
              <th className="text-right px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-600">Moy. AudiBot</th>
              <th className="text-right px-4 py-3 text-2xs font-black uppercase tracking-widest text-slate-600">Ecart</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c) => (
              <tr key={c.mutuelle} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-black text-slate-900">{c.label}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-700">
                  {c.userDelai != null ? `${c.userDelai}j` : "—"}
                </td>
                <td className="px-4 py-3 text-right text-slate-500 font-medium">
                  {c.globalDelai != null ? `${c.globalDelai}j` : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeltaBadge value={c.deltaDelai} unit="j" />
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-700">
                  {(c.userTauxRejet * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right text-slate-500 font-medium">
                  {(c.globalTauxRejet * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right">
                  <DeltaBadge value={c.deltaTauxRejet} unit="%" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
