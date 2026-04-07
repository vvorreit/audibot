"use client";

import { useEffect, useState } from "react";
import { ClipboardList, CheckCircle2, Clock, Smile, Euro, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getUserBilanDashboard } from "@/app/dashboard/rapport/actions";
import { getTPDashboardData } from "@/app/tiers-payant/dashboard/actions";

interface SynthesePanelProps {
  hasBilanAccess: boolean;
  hasTPAccess: boolean;
  hasEquipeAccess: boolean;
}

function formatEur(v: number) {
  return v.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
}

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600", green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600", rose: "bg-rose-100 text-rose-600",
  };
  return (
    <div className="bg-white p-7 rounded-card shadow-sm border border-slate-100 flex flex-col gap-3">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xs font-black uppercase tracking-widest text-slate-600 mb-1 leading-tight">{label}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs font-semibold text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function SynthesePanel({ hasBilanAccess, hasTPAccess, hasEquipeAccess }: SynthesePanelProps) {
  const [bilanData, setBilanData] = useState<Awaited<ReturnType<typeof getUserBilanDashboard>> | null>(null);
  const [tpData, setTpData] = useState<Awaited<ReturnType<typeof getTPDashboardData>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promises: Promise<void>[] = [];
    if (hasBilanAccess) {
      promises.push(
        getUserBilanDashboard(undefined, "week").then(setBilanData).catch(() => {})
      );
    }
    if (hasTPAccess) {
      promises.push(
        getTPDashboardData().then(setTpData).catch(() => {})
      );
    }
    Promise.all(promises).finally(() => setLoading(false));
  }, [hasBilanAccess, hasTPAccess]);

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({length: 4}).map((_,i) => <div key={i} className="h-36 bg-white rounded-card border border-slate-100" />)}
      </div>
      <div className="h-48 bg-white rounded-card border border-slate-100" />
      <div className="h-48 bg-white rounded-card border border-slate-100" />
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Hero row — 4 métriques clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {hasBilanAccess && (
          <KpiCard label="Bilans" value={bilanData?.total ?? "—"} sub="cette semaine" icon={ClipboardList} color="blue" />
        )}
        {hasBilanAccess && (
          <KpiCard label="Complétion" value={bilanData ? bilanData.completionRate + "%" : "—"} sub={bilanData ? bilanData.delivered + " complétés" : undefined} icon={CheckCircle2} color="green" />
        )}
        {hasTPAccess && (
          <KpiCard label="TP en attente" value={tpData ? formatEur(tpData.kpis.totalEnAttente) : "—"} sub={tpData ? tpData.kpis.nbEnAttente + " dossiers" : undefined} icon={Clock} color="amber" />
        )}
        {hasBilanAccess && bilanData?.npsScore !== null && bilanData?.npsScore !== undefined && (
          <KpiCard label="NPS" value={bilanData.npsScore} sub="score client" icon={Smile} color={bilanData.npsScore >= 50 ? "green" : "amber"} />
        )}
      </div>

      {/* Section bilans */}
      {hasBilanAccess && bilanData && (
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-black text-lg">Bilans — 7 derniers jours</h2>
                <p className="text-xs text-slate-500 font-semibold">Créés, complétés, complexité moyenne</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-2xl">
              <p className="text-2xs font-black uppercase text-blue-400 mb-1">Créés</p>
              <p className="text-3xl font-black text-blue-600">{bilanData.total}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-2xl">
              <p className="text-2xs font-black uppercase text-green-400 mb-1">Complétés</p>
              <p className="text-3xl font-black text-green-600">{bilanData.delivered}</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-2xl">
              <p className="text-2xs font-black uppercase text-amber-400 mb-1">Complexité moy.</p>
              <p className="text-3xl font-black text-amber-600">{bilanData.avgComplexite}<span className="text-sm font-semibold text-slate-500">/5</span></p>
            </div>
          </div>
          {(bilanData.alertesCount.urgent > 0 || bilanData.alertesCount.attention > 0) && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm font-bold text-slate-700">
                {bilanData.alertesCount.urgent > 0 && (
                  <span className="text-red-600">{bilanData.alertesCount.urgent} alerte{bilanData.alertesCount.urgent > 1 ? "s" : ""} urgente{bilanData.alertesCount.urgent > 1 ? "s" : ""}</span>
                )}
                {bilanData.alertesCount.urgent > 0 && bilanData.alertesCount.attention > 0 && " · "}
                {bilanData.alertesCount.attention > 0 && (
                  <span className="text-amber-600">{bilanData.alertesCount.attention} à surveiller</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Section tiers-payant */}
      {hasTPAccess && tpData && (
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                <Euro className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="font-black text-lg">Tiers-Payant</h2>
                <p className="text-xs text-slate-500 font-semibold">État actuel des dossiers</p>
              </div>
            </div>
            <Link href="/tiers-payant/dashboard" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
              Tableau complet <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-4 bg-amber-50 rounded-2xl">
              <p className="text-2xs font-black uppercase text-amber-400 mb-1">En attente</p>
              <p className="text-2xl font-black text-amber-600">{tpData.kpis.nbEnAttente}</p>
              <p className="text-2xs text-slate-500 mt-1">{formatEur(tpData.kpis.totalEnAttente)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-2xl">
              <p className="text-2xs font-black uppercase text-green-400 mb-1">Reçu</p>
              <p className="text-2xl font-black text-green-600">{tpData.kpis.nbRecu}</p>
              <p className="text-2xs text-slate-500 mt-1">{formatEur(tpData.kpis.totalRecu)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-2xl">
              <p className="text-2xs font-black uppercase text-red-400 mb-1">Rejeté</p>
              <p className="text-2xl font-black text-red-600">{tpData.kpis.nbRejete}</p>
              <p className="text-2xs text-slate-500 mt-1">{formatEur(tpData.kpis.totalRejete)}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-2xl">
              <p className="text-2xs font-black uppercase text-orange-400 mb-1">En litige</p>
              <p className="text-2xl font-black text-orange-600">{tpData.kpis.nbLitige}</p>
              <p className="text-2xs text-slate-500 mt-1">{formatEur(tpData.kpis.totalLitige)}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
