"use client";

import { useEffect, useState } from "react";
import { getTPDashboardData } from "@/app/tiers-payant/dashboard/actions";
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TPStatsPanel() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getTPDashboardData>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTPDashboardData()
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function formatEur(v: number) {
    return v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  }

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-white rounded-card border border-slate-100" />)}
      </div>
    </div>
  );

  if (!data) return <p className="text-sm text-slate-500">Impossible de charger les données.</p>;

  const { kpis } = data;

  const cards = [
    { label: "En attente", count: kpis.nbEnAttente, montant: kpis.totalEnAttente, icon: Clock, color: "amber" },
    { label: "Reçu", count: kpis.nbRecu, montant: kpis.totalRecu, icon: CheckCircle, color: "green" },
    { label: "Rejeté", count: kpis.nbRejete, montant: kpis.totalRejete, icon: XCircle, color: "red" },
    { label: "En litige", count: kpis.nbLitige, montant: kpis.totalLitige, icon: AlertTriangle, color: "orange" },
  ];
  const colorMap: Record<string, string> = {
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, count, montant, icon: Icon, color }) => (
          <div key={label} className="bg-white p-6 rounded-card shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xs font-black uppercase tracking-widest text-slate-600 mb-1">{label}</p>
              <p className="text-3xl font-black text-slate-900">{count}</p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">{formatEur(montant)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-card shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-700">{kpis.nbTotal} dossiers au total</p>
          <p className="text-xs text-slate-500">Montant moyen : {formatEur(kpis.montantMoyen)} · Délai moyen : {Math.round(kpis.delaiMoyen ?? 0)} j</p>
        </div>
        <Link href="/tiers-payant/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
          Tableau complet <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
