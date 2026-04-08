"use client";

import { useEffect, useState } from "react";
import { getNpsMetrics } from "../actions";

export default function NpsContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNpsMetrics().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-white rounded-card border border-slate-100" />
      <div className="h-48 bg-white rounded-card border border-slate-100" />
    </div>
  );

  if (!data || data.nps === null) return (
    <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100 text-center">
      <p className="text-slate-400 font-semibold">Aucune réponse NPS pour le moment.</p>
    </div>
  );

  const npsColor = data.nps > 30 ? "text-green-600" : data.nps >= 0 ? "text-amber-500" : "text-red-500";
  const npsBg = data.nps > 30 ? "bg-green-50" : data.nps >= 0 ? "bg-amber-50" : "bg-red-50";

  const maxDist = Math.max(...Object.values(data.distribution as Record<string, number>), 1);

  return (
    <div className="space-y-6">
      {/* NPS Score + répartition */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${npsBg} p-8 rounded-card border border-slate-100 text-center flex flex-col justify-center`}>
          <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-2">Score NPS</p>
          <p className={`text-5xl font-black ${npsColor}`}>{data.nps}</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">{data.total} réponses</p>
          <p className="text-2xs text-slate-400 mt-2">&gt;50 excellent · 20-50 bien · &lt;0 problème</p>
        </div>
        <div className="bg-white p-6 rounded-card shadow-sm border border-slate-100">
          <p className="text-2xs font-black uppercase tracking-widest text-green-400 mb-1">Promoteurs</p>
          <p className="text-3xl font-black text-green-600">{data.promoters}</p>
          <p className="text-xs text-slate-400 font-semibold mb-2">{data.total > 0 ? Math.round(data.promoters / data.total * 100) : 0}% — score 9-10</p>
          <p className="text-2xs text-slate-400 font-medium">Recommanderont AudiBot activement. À solliciter pour des témoignages.</p>
        </div>
        <div className="bg-white p-6 rounded-card shadow-sm border border-slate-100">
          <p className="text-2xs font-black uppercase tracking-widest text-amber-400 mb-1">Passifs</p>
          <p className="text-3xl font-black text-amber-500">{data.passives}</p>
          <p className="text-xs text-slate-400 font-semibold mb-2">{data.total > 0 ? Math.round(data.passives / data.total * 100) : 0}% — score 7-8</p>
          <p className="text-2xs text-slate-400 font-medium">Satisfaits mais pas enthousiastes. Cibles pour améliorer l'expérience.</p>
        </div>
        <div className="bg-white p-6 rounded-card shadow-sm border border-slate-100">
          <p className="text-2xs font-black uppercase tracking-widest text-red-400 mb-1">Détracteurs</p>
          <p className="text-3xl font-black text-red-500">{data.detractors}</p>
          <p className="text-xs text-slate-400 font-semibold mb-2">{data.total > 0 ? Math.round(data.detractors / data.total * 100) : 0}% — score 0-6</p>
          <p className="text-2xs text-slate-400 font-medium">Risque de churn et bouche-à-oreille négatif. À contacter en priorité.</p>
        </div>
      </div>

      {/* Distribution 1-10 */}
      <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
        <h3 className="font-black text-lg mb-4">Distribution des scores</h3>
        <div className="flex items-end gap-2 h-[120px]">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(score => {
            const count = (data.distribution as Record<string, number>)[String(score)] ?? 0;
            const height = Math.max((count / maxDist) * 100, count > 0 ? 4 : 1);
            const color = score >= 9 ? "bg-green-500" : score >= 7 ? "bg-amber-400" : "bg-red-400";
            return (
              <div key={score} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className={`w-full ${color} rounded-t-md transition-all`} style={{ height: `${height}px` }} />
                <span className="text-2xs font-black text-slate-400">{score}</span>
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-2xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                  {count} réponses
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dernières réponses */}
      {data.responses.length > 0 && (
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <h3 className="font-black text-lg mb-4">Dernières réponses</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-400">Score</th>
                  <th className="text-left py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-400">Message</th>
                  <th className="text-left py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-400">Email</th>
                  <th className="text-left py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.responses.map((r: any, i: number) => {
                  const scoreColor = r.score >= 9 ? "bg-green-100 text-green-700" : r.score >= 7 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
                  return (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black ${scoreColor}`}>{r.score}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{r.message || <span className="text-slate-300">—</span>}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">{r.email || "—"}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs whitespace-nowrap">{new Date(r.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
