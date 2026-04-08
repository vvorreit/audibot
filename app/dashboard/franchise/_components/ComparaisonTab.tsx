import type { FranchiseKPIs } from "../actions";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "@/components/charts";
import { Trophy } from "lucide-react";

export function ComparaisonTab({ tpData }: { tpData: FranchiseKPIs }) {
  return (
    <>
      {/* Classement par scans */}
      <div className="bg-white rounded-card border border-slate-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-black text-slate-700">Classement des collaborateurs — Tiers payant</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["#", "Collaborateur", "Magasin", "Scans", "Injections", "Dossiers", "Rejetes", "Taux rejet", "En attente"].map((h) => (
                  <th key={h} className="px-5 py-3 text-2xs font-black uppercase tracking-widest text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...tpData.members].sort((a, b) => b.scanCount - a.scanCount).map((m, i) => {
                const taux = m.dossiersTotal > 0 ? Math.round((m.dossiersRejetes / m.dossiersTotal) * 100) : 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      {i === 0 ? (
                        <span className="text-lg">&#129351;</span>
                      ) : i === 1 ? (
                        <span className="text-lg">&#129352;</span>
                      ) : i === 2 ? (
                        <span className="text-lg">&#129353;</span>
                      ) : (
                        <span className="text-sm font-black text-slate-300">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-800">{m.name ?? "\u2014"}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      {m.storeName ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-2xs font-bold rounded-full">{m.storeName}</span>
                      ) : (
                        <span className="text-slate-300 text-sm">{"\u2014"}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-blue-600">{m.scanCount}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-600">{m.injectionCount}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-600">{m.dossiersTotal}</td>
                    <td className="px-5 py-4 text-sm font-bold text-red-600">{m.dossiersRejetes}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-2xs font-black ${taux > 15 ? "bg-red-100 text-red-700" : taux > 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                        {taux}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-amber-600">
                      {m.montantEnAttente.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} &euro;
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar chart comparaison employes */}
      {tpData.members.length > 1 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-card border border-slate-100 p-6">
            <h3 className="text-sm font-black text-slate-700 mb-4">Scans par collaborateur</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[...tpData.members].sort((a, b) => b.scanCount - a.scanCount)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={100}
                  tickFormatter={(v: string) => v?.slice(0, 15) ?? "\u2014"} />
                <Tooltip />
                <Bar dataKey="scanCount" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Scans" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-card border border-slate-100 p-6">
            <h3 className="text-sm font-black text-slate-700 mb-4">Taux de rejet par collaborateur</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[...tpData.members].map((m) => ({
                ...m,
                tauxRejet: m.dossiersTotal > 0 ? Math.round((m.dossiersRejetes / m.dossiersTotal) * 100) : 0,
              })).sort((a, b) => a.tauxRejet - b.tauxRejet)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={100}
                  tickFormatter={(v: string) => v?.slice(0, 15) ?? "\u2014"} />
                <Tooltip />
                <Bar dataKey="tauxRejet" fill="#ef4444" radius={[0, 6, 6, 0]} name="Taux rejet %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}
