"use client";

import { useEffect, useState } from "react";
import {
  getAdminAnalytics, getFunnelMetrics,
  getTimeToValueMetrics, getEngagementMetrics, getFeatureAdoptionMetrics, getExpansionMetrics,
} from "../actions";
import {
  Users, CreditCard, TrendingUp, BarChart2, Euro, Building2, Zap, UserCheck, UserX, Activity,
  Clock, Flame, Layers, ArrowUpRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "@/components/charts";
import Link from "next/link";

function SignupsChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div className="flex items-end gap-[3px] h-[80px] w-full">
      {entries.map(([date, count]) => {
        const height = Math.max((count / max) * 80, count > 0 ? 4 : 1);
        return (
          <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="w-full bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-400" style={{ height: `${height}px` }} />
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-2xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
              {count} — {date}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
  trend?: { value: number; label: string };
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600", green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600", indigo: "bg-indigo-100 text-indigo-600",
    rose: "bg-rose-100 text-rose-600", purple: "bg-purple-100 text-purple-600",
    cyan: "bg-cyan-100 text-cyan-600", orange: "bg-orange-100 text-orange-600",
  };
  return (
    <div className="bg-white p-7 rounded-card shadow-sm border border-slate-100 flex flex-col gap-3">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs font-semibold text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold ${trend.value >= 0 ? "text-green-600" : "text-red-500"}`}>
          <TrendingUp className="w-3 h-3" />
          {trend.value >= 0 ? "+" : ""}{trend.value} {trend.label}
        </div>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [funnelPeriod, setFunnelPeriod] = useState<7 | 30 | 90>(30);
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [ttv, setTtv] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [adoption, setAdoption] = useState<any>(null);
  const [expansion, setExpansion] = useState<any>(null);

  useEffect(() => {
    getAdminAnalytics().then(setAnalytics).finally(() => setLoading(false));
    getFunnelMetrics(30).then(setFunnelData);
    getTimeToValueMetrics().then(setTtv);
    getEngagementMetrics().then(setEngagement);
    getFeatureAdoptionMetrics().then(setAdoption);
    getExpansionMetrics().then(setExpansion);
  }, []);

  const handleFunnelPeriodChange = async (p: 7 | 30 | 90) => {
    setFunnelPeriod(p);
    setFunnelLoading(true);
    try {
      const data = await getFunnelMetrics(p);
      setFunnelData(data);
    } finally {
      setFunnelLoading(false);
    }
  };

  if (loading || !analytics) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({length:6}).map((_,i) => <div key={i} className="h-28 bg-white rounded-card border border-slate-100"/>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="MRR réel" value={`${analytics.mrrEstimate.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €`} sub="Stripe actif uniquement" icon={Euro} color="green" />
        <KpiCard label="Utilisateurs" value={analytics.totalUsers} sub={`+${analytics.newThisMonth} ce mois`} icon={Users} color="blue" trend={{ value: analytics.newThisMonth - analytics.newLastMonth, label: "vs mois préc." }} />
        <KpiCard label="Payants réels" value={analytics.totalPayants} icon={CreditCard} color="indigo" />
        <KpiCard label="Conversion" value={`${analytics.conversionRate}%`} sub="Inscrits → Payants Stripe" icon={TrendingUp} color="purple" />
        <KpiCard label="Scans totaux" value={analytics.totalScans.toLocaleString("fr-FR")} icon={Zap} color="amber" />
        <KpiCard label="Équipes" value={analytics.teamsCount} icon={Building2} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="font-black text-lg">Nouveaux inscrits</h2><p className="text-xs text-slate-400 font-semibold">30 derniers jours</p></div>
            <span className="text-2xl font-black text-blue-600">{analytics.newThisMonth}</span>
          </div>
          <SignupsChart data={analytics.signupsLast30Days} />
          <div className="flex justify-between mt-2 text-2xs font-bold text-slate-300"><span>J-30</span><span>Aujourd&apos;hui</span></div>
        </div>
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100 flex flex-col gap-5">
          <h2 className="font-black text-lg">Répartition</h2>
          <div>
            <div className="flex justify-between text-xs font-black text-slate-500 mb-2"><span>Payants réels</span><span>{analytics.totalPayants} / {analytics.totalUsers}</span></div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${analytics.totalUsers > 0 ? (analytics.totalPayants / analytics.totalUsers) * 100 : 0}%` }} /></div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-black text-slate-500 mb-2"><span>Emails vérifiés</span><span>{analytics.verifiedUsers} / {analytics.totalUsers}</span></div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${analytics.totalUsers > 0 ? (analytics.verifiedUsers / analytics.totalUsers) * 100 : 0}%` }} /></div>
          </div>
          <div className="border-t border-slate-50 pt-4 space-y-3 mt-auto">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><UserCheck className="w-4 h-4 text-green-500" />Vérifiés</div><span className="font-black">{analytics.verifiedUsers}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><UserX className="w-4 h-4 text-amber-500" />Non vérifiés</div><span className="font-black">{analytics.unverifiedUsers}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Activity className="w-4 h-4 text-slate-400" />Gratuits</div><span className="font-black">{analytics.freeUsers}</span></div>
          </div>
        </div>
      </div>

      {/* Funnel & Rétention */}
      <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="font-black text-slate-900">Funnel & Rétention</h2>
            <Link href="/admin/churn" className="text-xs font-black text-blue-600 hover:underline">Voir le détail Churn →</Link>
          </div>
          <div className="flex bg-slate-50 p-1 rounded-2xl gap-1">
            {([7, 30, 90] as const).map((p) => (
              <button key={p} onClick={() => handleFunnelPeriodChange(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${funnelPeriod === p ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                {p}j
              </button>
            ))}
          </div>
        </div>

        {funnelLoading || !funnelData ? (
          <div className="animate-pulse space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-10 bg-slate-100 rounded-xl"/>)}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Inscrits</p>
                <p className="text-3xl font-black text-slate-900">{funnelData.newUsers}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-2xl">
                <p className="text-2xs font-black uppercase tracking-widest text-blue-400 mb-1">Activation</p>
                <p className="text-3xl font-black text-blue-600">{funnelData.activationRate}%</p>
                <p className="text-2xs text-slate-400">{funnelData.activatedUsers} users</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-2xl">
                <p className="text-2xs font-black uppercase tracking-widest text-green-400 mb-1">Conversion</p>
                <p className="text-3xl font-black text-green-600">{funnelData.conversionRate}%</p>
                <p className={`text-2xs font-bold ${funnelData.conversionDelta >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {funnelData.conversionDelta >= 0 ? "+" : ""}{funnelData.conversionDelta}% vs période préc.
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-2xl">
                <p className="text-2xs font-black uppercase tracking-widest text-red-400 mb-1">Churn</p>
                <p className="text-3xl font-black text-red-500">{funnelData.churnedUsers}</p>
                <p className="text-2xs text-slate-400">annulations</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnelData.funnelSteps} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [v, "utilisateurs"]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="value" radius={[8,8,0,0]}>
                  {funnelData.funnelSteps.map((_: any, i: number) => (
                    <Cell key={i} fill={["#94a3b8","#3b82f6","#10b981"][i] ?? "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500">MRR actuel</p>
              <p className="text-2xl font-black text-green-600">{funnelData.mrr.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</p>
            </div>
          </>
        )}
      </div>

      {/* Time-to-Value */}
      {ttv && (
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
            <div><h2 className="font-black text-lg">Time-to-Value</h2><p className="text-xs text-slate-400 font-semibold">Délai inscription → 1er scan OCR ({ttv.total} users)</p></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-cyan-50 rounded-2xl">
              <p className="text-2xs font-black uppercase tracking-widest text-cyan-400 mb-1">Moyenne</p>
              <p className="text-3xl font-black text-cyan-700 mb-1">{ttv.avg}h</p>
              <p className="text-2xs text-slate-400 font-medium">Idéal &lt; 24h. Au-delà, l'onboarding est trop complexe.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Médiane</p>
              <p className="text-3xl font-black text-slate-900 mb-1">{ttv.median}h</p>
              <p className="text-2xs text-slate-400 font-medium">50% des users ont scanné en moins de ce délai.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">P90</p>
              <p className="text-3xl font-black text-slate-900 mb-1">{ttv.p90}h</p>
              <p className="text-2xs text-slate-400 font-medium">Si &gt; 72h, revoir l'email J+1.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl">
              <p className="text-2xs font-black uppercase tracking-widest text-green-400 mb-1">&lt; 1h</p>
              <p className="text-3xl font-black text-green-600 mb-1">{ttv.lt1h}</p>
              <p className="text-2xs text-slate-400 font-medium">Utilisateurs très engagés dès l'inscription.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl">
              <p className="text-2xs font-black uppercase tracking-widest text-blue-400 mb-1">&lt; 24h</p>
              <p className="text-3xl font-black text-blue-600 mb-1">{ttv.lt24h}</p>
              <p className="text-2xs text-slate-400 font-medium">Cible : maximiser ce chiffre.</p>
            </div>
            <div className="p-4 bg-red-50 rounded-2xl">
              <p className="text-2xs font-black uppercase tracking-widest text-red-400 mb-1">&gt; 48h</p>
              <p className="text-3xl font-black text-red-500 mb-1">{ttv.gt48h}</p>
              <p className="text-2xs text-slate-400 font-medium">Risque de churn élevé — relance email nécessaire.</p>
            </div>
          </div>
        </div>
      )}

      {/* Engagement DAU/WAU/MAU */}
      {engagement && (
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center"><Flame className="w-5 h-5" /></div>
            <div><h2 className="font-black text-lg">Engagement</h2><p className="text-xs text-slate-400 font-semibold">DAU / WAU / MAU — Stickiness</p></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-orange-50 rounded-2xl">
              <p className="text-2xs font-black uppercase tracking-widest text-orange-400 mb-1">DAU</p>
              <p className="text-3xl font-black text-orange-600 mb-1">{engagement.dau}</p>
              <p className="text-2xs text-slate-400 font-medium">Actifs aujourd'hui (scan ou connexion).</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl">
              <p className="text-2xs font-black uppercase tracking-widest text-amber-400 mb-1">WAU</p>
              <p className="text-3xl font-black text-amber-600 mb-1">{engagement.wau}</p>
              <p className="text-2xs text-slate-400 font-medium">Actifs sur les 7 derniers jours.</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-2xl">
              <p className="text-2xs font-black uppercase tracking-widest text-yellow-500 mb-1">MAU</p>
              <p className="text-3xl font-black text-yellow-600 mb-1">{engagement.mau}</p>
              <p className="text-2xs text-slate-400 font-medium">Actifs sur les 30 derniers jours.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl">
              <p className="text-2xs font-black uppercase tracking-widest text-green-400 mb-1">Stickiness</p>
              <p className="text-3xl font-black text-green-600 mb-1">{engagement.stickiness}%</p>
              <p className="text-2xs text-slate-400 font-medium">DAU/MAU. &gt;20% = usage quotidien. &lt;10% = occasionnel.</p>
            </div>
          </div>
          {engagement.dauCurve.length > 0 && (
            <div>
              <p className="text-xs font-black text-slate-400 mb-3">Utilisateurs actifs / jour (30j)</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={engagement.dauCurve} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={4} tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="count" fill="#f97316" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Feature Adoption */}
      {adoption && (
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center"><Layers className="w-5 h-5" /></div>
            <div><h2 className="font-black text-lg">Feature Adoption</h2><p className="text-xs text-slate-400 font-semibold">{adoption.totalUsers} users — {adoption.proUsers} PRO</p></div>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-5">Quelles features sont réellement utilisées. Les % PRO indiquent l'usage des features avancées parmi les payants.</p>
          <div className="space-y-4">
            {adoption.features.map((f: any) => (
              <div key={f.label}>
                <div className="flex justify-between text-sm font-black text-slate-600 mb-1.5">
                  <span>{f.label}{f.note ? <span className="text-2xs text-slate-400 font-semibold ml-2">({f.note})</span> : null}</span>
                  <span>{f.users} <span className="text-slate-400 font-semibold">({f.pct}%)</span></span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min(f.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expansion MRR */}
      {expansion && (
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center"><ArrowUpRight className="w-5 h-5" /></div>
            <div><h2 className="font-black text-lg">Expansion MRR</h2><p className="text-xs text-slate-400 font-semibold">MRR par plan — ARR estimé</p></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-2xl">
              <p className="text-2xs font-black uppercase tracking-widest text-green-400 mb-1">MRR Total</p>
              <p className="text-3xl font-black text-green-600 mb-1">{expansion.totalMrr.toLocaleString("fr-FR")} €</p>
              <p className="text-2xs text-slate-400 font-medium">Revenus récurrents mensuels (abonnements Stripe actifs uniquement).</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl">
              <p className="text-2xs font-black uppercase tracking-widest text-blue-400 mb-1">ARR</p>
              <p className="text-3xl font-black text-blue-600 mb-1">{expansion.arr.toLocaleString("fr-FR")} €</p>
              <p className="text-2xs text-slate-400 font-medium">MRR × 12 — revenu annuel projeté si 0 churn.</p>
            </div>
            {expansion.essentielNearLimit > 0 && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <p className="text-2xs font-black uppercase tracking-widest text-amber-500 mb-1">Candidats upgrade</p>
                <p className="text-3xl font-black text-amber-600 mb-1">{expansion.essentielNearLimit}</p>
                <p className="text-2xs text-amber-700 font-medium">Users ESSENTIEL ayant consommé &gt;80% du quota ce mois. Segment prioritaire à cibler pour l'upgrade Pro.</p>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-400">Plan</th>
                  <th className="text-right py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-400">Abonnés</th>
                  <th className="text-right py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-400">MRR</th>
                </tr>
              </thead>
              <tbody>
                {expansion.mrrByPlan.map((p: any) => (
                  <tr key={p.plan} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4 font-black text-slate-700">{p.plan}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-600">{p.count}</td>
                    <td className="py-3 px-4 text-right font-black text-green-600">{p.mrr.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
