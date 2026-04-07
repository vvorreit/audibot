import type { FranchiseBilanKPIs } from "../actions";
import {
  Ear, CheckCircle2, Activity, Smile,
  ShoppingCart, AlertTriangle, TrendingUp,
} from "lucide-react";
import { KPICard } from "./KPICard";
import { GENE_LABELS, OPPO_LABELS } from "./constants";

export function BilanTab({ bilanData }: { bilanData: FranchiseBilanKPIs }) {
  return (
    <>
      {/* KPIs globaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard icon={Ear} label="Bilans realises" value={bilanData.totalDelivered.toString()}
          color="text-blue-600" bgColor="bg-blue-50" />
        <KPICard icon={CheckCircle2} label="Taux de completion" value={`${bilanData.completionRateGlobal}%`}
          color="text-green-600" bgColor="bg-green-50" />
        <KPICard icon={Activity} label="Complexite moy." value={`${bilanData.avgComplexiteGlobal} / 5`}
          color="text-amber-600" bgColor="bg-amber-50" />
        <KPICard icon={Smile} label="NPS global" value={bilanData.npsGlobal !== null ? bilanData.npsGlobal.toString() : "\u2014"}
          color={bilanData.npsGlobal !== null && bilanData.npsGlobal >= 50 ? "text-green-600" : "text-amber-600"}
          bgColor={bilanData.npsGlobal !== null && bilanData.npsGlobal >= 50 ? "bg-green-50" : "bg-amber-50"} />
      </div>

      {/* Classement magasins */}
      <div className="bg-white rounded-card border border-slate-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800">Classement des magasins — Bilan Auditif</h3>
          <span className="text-xs text-slate-400 font-medium">{bilanData.totalBilans} bilans crees</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["#", "Magasin", "Bilans", "Completes", "Taux", "Complexite", "Opportunites/bilan", "Alertes urgentes", "NPS"].map((h) => (
                  <th key={h} className="px-5 py-3 text-2xs font-black uppercase tracking-widest text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bilanData.members.map((m, i) => (
                <tr key={m.userId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-black text-slate-300">{i + 1}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-800">{m.storeName ?? m.name ?? "\u2014"}</p>
                    <p className="text-xs text-slate-400">{m.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-600">{m.total}</td>
                  <td className="px-5 py-4 text-sm font-black text-blue-600">{m.delivered}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-2xs font-black ${
                      m.completionRate >= 80 ? "bg-green-100 text-green-700"
                      : m.completionRate >= 50 ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                      {m.completionRate}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-2xs font-black ${
                      m.avgComplexite >= 4 ? "bg-red-100 text-red-700"
                      : m.avgComplexite >= 3 ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                    }`}>
                      {m.avgComplexite > 0 ? m.avgComplexite : "\u2014"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-700">
                    {m.delivered > 0 ? (
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                        {m.avgOpportunitesPerBilan}
                      </span>
                    ) : "\u2014"}
                  </td>
                  <td className="px-5 py-4">
                    {m.alertesUrgentes > 0 ? (
                      <span className="flex items-center gap-1 text-red-600 font-black text-sm">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {m.alertesUrgentes}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-sm">{"\u2014"}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {m.npsScore !== null ? (
                      <span className={`px-2 py-0.5 rounded text-2xs font-black ${
                        m.npsScore >= 50 ? "bg-green-100 text-green-700"
                        : m.npsScore >= 0 ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                      }`}>
                        {m.npsScore}
                      </span>
                    ) : <span className="text-slate-300 text-sm">{"\u2014"}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights par magasin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bilanData.members.filter((m) => m.delivered > 0).map((m) => (
          <div key={m.userId} className="bg-white rounded-card border border-slate-100 p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <p className="text-sm font-black text-slate-800">{m.storeName ?? m.name ?? "\u2014"}</p>
                <p className="text-xs text-slate-400">{m.delivered} bilans completes</p>
              </div>
              {m.alertesUrgentes > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-black rounded-lg">
                  <AlertTriangle className="w-3 h-3" /> {m.alertesUrgentes}
                </span>
              )}
            </div>

            {m.topOpportunites.length > 0 && (
              <div className="mb-3">
                <p className="text-2xs font-bold uppercase tracking-widest text-slate-400 mb-2">Top opportunites</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.topOpportunites.map((o) => (
                    <span key={o.type} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg border border-slate-100">
                      {OPPO_LABELS[o.type] ?? o.type} <span className="text-slate-400">x{o.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {m.topGenes.length > 0 && (
              <div>
                <p className="text-2xs font-bold uppercase tracking-widest text-slate-400 mb-2">Genes frequentes</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.topGenes.map((g) => (
                    <span key={g} className="px-2 py-1 bg-slate-50 text-slate-500 text-xs font-medium rounded-lg border border-slate-100">
                      {GENE_LABELS[g] ?? g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">
                  {m.avgOpportunitesPerBilan} oppo/bilan
                </span>
              </div>
              {m.npsScore !== null && (
                <span className={`text-xs font-bold ${m.npsScore >= 50 ? "text-green-600" : "text-amber-600"}`}>
                  NPS {m.npsScore}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {bilanData.members.every((m) => m.delivered === 0) && (
        <div className="text-center py-16">
          <Ear className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-600 font-bold">Aucun bilan complete sur cette periode</p>
          <p className="text-sm text-slate-400 mt-1">Activez le questionnaire bilan depuis votre dashboard magasin.</p>
        </div>
      )}
    </>
  );
}
