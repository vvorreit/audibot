import type { FranchiseKPIs } from "../actions";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "@/components/charts";
import { Store } from "lucide-react";

export function MagasinsTab({ tpData }: { tpData: FranchiseKPIs }) {
  if (tpData.storeStats.length === 0) {
    return (
      <div className="text-center py-16">
        <Store className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-600 font-bold">Aucun magasin configure</p>
        <p className="text-sm text-slate-400 mt-1">Creez des magasins depuis la page Mon equipe pour voir les stats consolidees.</p>
      </div>
    );
  }

  return (
    <>
      {/* Store KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {tpData.storeStats.map((s) => (
          <div key={s.storeId} className="bg-white rounded-card border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{s.storeName}</p>
                <p className="text-xs text-slate-500">{s.memberCount} membre{s.memberCount !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xs font-bold uppercase tracking-wide text-slate-400">Scans</p>
                <p className="text-lg font-black text-blue-600">{s.scanCount}</p>
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wide text-slate-400">Dossiers</p>
                <p className="text-lg font-black text-slate-700">{s.dossiersTotal}</p>
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wide text-slate-400">Taux rejet</p>
                <p className={`text-lg font-black ${s.tauxRejet > 15 ? "text-red-600" : s.tauxRejet > 5 ? "text-amber-600" : "text-green-600"}`}>
                  {s.tauxRejet}%
                </p>
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wide text-slate-400">En attente</p>
                <p className="text-lg font-black text-amber-600">
                  {s.montantEnAttente.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} &euro;
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Store comparison table */}
      <div className="bg-white rounded-card border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h3 className="text-sm font-black text-slate-700">Comparaison entre magasins</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Magasin", "Membres", "Scans", "Injections", "Dossiers", "Rejetes", "Taux rejet", "En attente"].map((h) => (
                  <th key={h} className="px-5 py-3 text-2xs font-black uppercase tracking-widest text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tpData.storeStats.map((s) => (
                <tr key={s.storeId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-bold text-slate-800">{s.storeName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-600">{s.memberCount}</td>
                  <td className="px-5 py-4 text-sm font-black text-blue-600">{s.scanCount}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-600">{s.injectionCount}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-600">{s.dossiersTotal}</td>
                  <td className="px-5 py-4 text-sm font-bold text-red-600">{s.dossiersRejetes}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-2xs font-black ${s.tauxRejet > 15 ? "bg-red-100 text-red-700" : s.tauxRejet > 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                      {s.tauxRejet}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-amber-600">
                    {s.montantEnAttente.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} &euro;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Store bar chart comparison */}
      {tpData.storeStats.length > 1 && (
        <div className="bg-white rounded-card border border-slate-100 p-6 mt-6">
          <h3 className="text-sm font-black text-slate-700 mb-4">Volume de scans par magasin</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tpData.storeStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="storeName" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip />
              <Bar dataKey="scanCount" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Scans" />
              <Bar dataKey="dossiersTotal" fill="#10b981" radius={[6, 6, 0, 0]} name="Dossiers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
