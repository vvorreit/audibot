"use client";
/**
 * Equipe stats panel — embedded version of FranchiseDashboard without shell/header.
 * Exports: EquipeStatsPanel (default)
 * ~100 lines
 */

import { useEffect, useState, useCallback } from "react";
import { getFranchiseAnalytics, getFranchiseBilanAnalytics, type FranchiseKPIs, type FranchiseBilanKPIs } from "../franchise/actions";
import { Store, ScanLine, Eye, Trophy } from "lucide-react";
import { PERIOD_LABELS, type Period, type Tab } from "../franchise/_components/constants";
import { TiersPayantTab } from "../franchise/_components/TiersPayantTab";
import { BilanTab } from "../franchise/_components/BilanTab";
import { MagasinsTab } from "../franchise/_components/MagasinsTab";
import { ComparaisonTab } from "../franchise/_components/ComparaisonTab";

export default function EquipeStatsPanel() {
  const [period, setPeriod] = useState<Period>("30d");
  const [activeTab, setActiveTab] = useState<Tab>("tiers-payant");

  const [tpData, setTpData] = useState<FranchiseKPIs | null>(null);
  const [bilanData, setBilanData] = useState<FranchiseBilanKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    const promises = [
      getFranchiseAnalytics(period).then(setTpData),
      getFranchiseBilanAnalytics(period).then(setBilanData),
    ];
    Promise.all(promises)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { loadData(); }, [loadData]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="bg-red-50 text-red-600 p-8 rounded-card border border-red-100 max-w-md text-center">
          <h2 className="text-2xl font-black mb-4">Accès Refusé</h2>
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* -- Period selector -- */}
      <div className="flex items-center gap-2">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              period === p ? "bg-blue-600 text-white shadow" : "bg-white text-slate-600 border border-slate-100"
            }`}>
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* -- Tabs -- */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 w-fit">
        <button onClick={() => setActiveTab("tiers-payant")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "tiers-payant" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}>
          <ScanLine className="w-4 h-4" /> Tiers payant
        </button>
        <button onClick={() => setActiveTab("bilan")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "bilan" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}>
          <Eye className="w-4 h-4" /> Bilan visuel
        </button>
        <button onClick={() => setActiveTab("magasins")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "magasins" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}>
          <Store className="w-4 h-4" /> Par magasin
        </button>
        <button onClick={() => setActiveTab("comparaison")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "comparaison" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}>
          <Trophy className="w-4 h-4" /> Comparaison
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-card border border-slate-100 p-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-20 mb-3" />
              <div className="h-8 bg-slate-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {activeTab === "tiers-payant" && tpData && <TiersPayantTab tpData={tpData} />}
          {activeTab === "bilan" && bilanData && <BilanTab bilanData={bilanData} />}
          {activeTab === "magasins" && tpData && <MagasinsTab tpData={tpData} />}
          {activeTab === "comparaison" && tpData && <ComparaisonTab tpData={tpData} />}
        </>
      )}
    </div>
  );
}
