"use client";

import { useEffect, useState } from "react";
import { getRpaLogs, getRpaStats } from "./actions";
import { Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "@/components/charts";

export default function AdminRpaPage() {
  const [rpaLogs, setRpaLogs] = useState<any[]>([]);
  const [rpaStats, setRpaStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterMutuelle, setFilterMutuelle] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterDays, setFilterDays] = useState(30);

  const fetchData = async (mutuelle?: string, statut?: string, days?: number) => {
    setLoading(true);
    try {
      const [logs, stats] = await Promise.all([
        getRpaLogs({ mutuelle: mutuelle || undefined, statut: statut || undefined, days: days ?? filterDays }),
        getRpaStats(),
      ]);
      setRpaLogs(logs);
      setRpaStats(stats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Filtres */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <select value={filterMutuelle} onChange={(e) => { setFilterMutuelle(e.target.value); fetchData(e.target.value, filterStatut, filterDays); }}
          className="px-3 py-2 bg-slate-50 rounded-xl text-sm font-bold border-0 focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Toutes mutuelles</option>
          {[...new Set(rpaLogs.map((l) => l.mutuelle))].sort().map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterStatut} onChange={(e) => { setFilterStatut(e.target.value); fetchData(filterMutuelle, e.target.value, filterDays); }}
          className="px-3 py-2 bg-slate-50 rounded-xl text-sm font-bold border-0 focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Tous statuts</option>
          <option value="succes">Succès</option>
          <option value="echec">Échec</option>
          <option value="bloque">Bloqué</option>
        </select>
        <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
          {([7, 30, 90] as const).map((d) => (
            <button key={d} onClick={() => { setFilterDays(d); fetchData(filterMutuelle, filterStatut, d); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${filterDays === d ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-700"}`}>
              {d}j
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      {rpaStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "RPA lancés", value: rpaStats.totalLances },
            { label: "Taux succès", value: `${rpaStats.tauxSucces}%` },
            { label: "Taux échec", value: `${rpaStats.tauxEchec}%` },
            { label: "Mutuelles actives", value: rpaStats.parMutuelle.length },
          ].map((k) => (
            <div key={k.label} className="bg-white p-6 rounded-card border border-slate-100 shadow-sm">
              <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">{k.label}</p>
              <p className="text-3xl font-black text-slate-900">{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {rpaStats && rpaStats.parMutuelle.length > 0 && (
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <h2 className="font-black text-base mb-6">Succès vs Échecs par mutuelle</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rpaStats.parMutuelle.map((m: any) => ({ mutuelle: m.mutuelle, succes: m.succes, echecs: m.echecs }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mutuelle" tick={{ fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
              <Legend />
              <Bar dataKey="succes" fill="#10b981" radius={[4, 4, 0, 0]} name="Succès" />
              <Bar dataKey="echecs" fill="#ef4444" radius={[4, 4, 0, 0]} name="Échecs" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Date", "Mutuelle", "Étape", "Statut", "Erreur"].map((h) => (
                  <th key={h} className="px-5 py-4 text-2xs font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-blue-500 font-bold animate-pulse">Chargement...</td></tr>
              ) : rpaLogs.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">Aucun log RPA.</td></tr>
              ) : rpaLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-4"><span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-2xs font-black rounded-full uppercase">{log.mutuelle}</span></td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-700">{log.etape}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-2xs font-black rounded-full uppercase ${
                      log.statut === "succes" ? "bg-green-100 text-green-600" :
                      log.statut === "echec" ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"
                    }`}>{log.statut}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400 max-w-[180px] truncate" title={log.erreur || ""}>{log.erreur || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
