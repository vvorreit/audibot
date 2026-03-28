"use client";

import { useEffect, useState } from "react";
import {
  getOcrAnalytics, getOcrUsers,
} from "../actions";
import {
  Eye, CheckCircle, Zap, MessageSquare, CreditCard, FileText, ChevronRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "@/components/charts";

function TrancheBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-slate-500 w-16 text-right">{label}</span>
      <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-black text-slate-600 w-12">{count}</span>
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600", green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600", indigo: "bg-indigo-100 text-indigo-600",
    rose: "bg-rose-100 text-rose-600", purple: "bg-purple-100 text-purple-600",
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
    </div>
  );
}

export default function AdminOcrPage() {
  const [ocrData, setOcrData] = useState<any>(null);
  const [ocrPeriod, setOcrPeriod] = useState<"day" | "week" | "month">("month");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrUserId, setOcrUserId] = useState<string>("");
  const [ocrUsers, setOcrUsers] = useState<any[]>([]);
  const [ocrDayDetail, setOcrDayDetail] = useState<any>(null);
  const [ocrDayLoading, setOcrDayLoading] = useState(false);

  useEffect(() => {
    getOcrAnalytics("month").then(setOcrData);
    getOcrUsers().then(setOcrUsers);
  }, []);

  const handleOcrPeriodChange = async (p: "day" | "week" | "month", uid?: string) => {
    setOcrPeriod(p);
    setOcrLoading(true);
    try {
      const data = await getOcrAnalytics(p, (uid ?? ocrUserId) || undefined);
      setOcrData(data);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleOcrUserChange = async (uid: string) => {
    setOcrUserId(uid);
    setOcrLoading(true);
    try {
      const data = await getOcrAnalytics(ocrPeriod, uid || undefined);
      setOcrData(data);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleOcrDayClick = async (dateISO: string) => {
    if (!dateISO) return;
    const cleanDate = dateISO.slice(0, 10);
    setOcrDayLoading(true);
    setOcrDayDetail(null);
    try {
      const res = await fetch(`/api/admin/ocr-day?date=${encodeURIComponent(cleanDate)}`);
      const data = await res.json();
      setOcrDayDetail(data);
      setTimeout(() => document.getElementById("ocr-day-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } finally {
      setOcrDayLoading(false);
    }
  };

  if (!ocrData) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({length:4}).map((_,i) => <div key={i} className="h-28 bg-white rounded-card border border-slate-100"/>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-black uppercase tracking-widest text-slate-400">Période</span>
          <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl gap-1">
            {([["day", "Jour"], ["week", "Semaine"], ["month", "Mois"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => handleOcrPeriodChange(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${ocrPeriod === key ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-700"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {ocrUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xs font-black uppercase tracking-widest text-slate-400">Utilisateur</span>
            <select
              value={ocrUserId}
              onChange={(e) => handleOcrUserChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none max-w-[220px]"
            >
              <option value="">Tous les utilisateurs</option>
              {ocrUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name ?? u.email ?? u.id}</option>
              ))}
            </select>
          </div>
        )}
        {ocrLoading && <span className="text-xs text-blue-500 font-bold animate-pulse ml-auto">Chargement...</span>}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total scans" value={ocrData.totalScans} icon={Eye} color="blue" />
        <KpiCard label="Taux réussite" value={`${ocrData.successRate}%`} icon={CheckCircle} color="green" />
        <KpiCard label="Score moyen" value={`${ocrData.avgScore}`} sub="sur 100" icon={Zap} color="amber" />
        <KpiCard label="Feedbacks négatifs" value={ocrData.feedbackCount} icon={MessageSquare} color="rose" />
      </div>

      {/* Chart */}
      <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
        <h2 className="font-black text-lg mb-6">Évolution des scans</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ocrData.timeSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", fontWeight: 700 }} />
            <Legend />
            <Bar dataKey="mutuelle" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} onClick={(data: any) => { if (data?.date) handleOcrDayClick(data.date); }} />
            <Bar dataKey="ordonnance" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} onClick={(data: any) => { if (data?.date) handleOcrDayClick(data.date); }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ocrData.byType.map((t: any) => (
          <div key={t.type} className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${t.type === "mutuelle" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                {t.type === "mutuelle" ? <CreditCard className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <h3 className="font-black text-lg capitalize">{t.type === "mutuelle" ? "Cartes Mutuelle" : "Ordonnances"}</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Scans</p><p className="text-2xl font-black">{t.count}</p></div>
              <div><p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Réussite</p><p className={`text-2xl font-black ${t.successRate >= 70 ? "text-green-600" : "text-amber-500"}`}>{t.successRate}%</p></div>
              <div><p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Score moy.</p><p className="text-2xl font-black text-slate-700">{t.avgScore}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Détail jour */}
      {(ocrDayLoading || ocrDayDetail) && (
        <div id="ocr-day-detail" className="bg-white rounded-card shadow-sm border border-blue-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50">
            <div>
              <h2 className="font-black text-blue-900">{ocrDayLoading ? "Chargement..." : `Détail — ${ocrDayDetail?.date}`}</h2>
              {ocrDayDetail && <p className="text-xs text-blue-600 font-medium mt-0.5">{ocrDayDetail.total} scans · {ocrDayDetail.successes} réussis ({ocrDayDetail.successRate}%)</p>}
            </div>
            <button onClick={() => setOcrDayDetail(null)} className="text-slate-400 hover:text-slate-700 font-black text-lg px-2">×</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Heure</th>
                  <th className="px-5 py-3 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Utilisateur</th>
                  <th className="px-5 py-3 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Type</th>
                  <th className="px-5 py-3 text-right text-2xs font-black uppercase tracking-widest text-slate-400">Score</th>
                  <th className="px-5 py-3 text-center text-2xs font-black uppercase tracking-widest text-slate-400">Statut</th>
                </tr>
              </thead>
              <tbody>
                {ocrDayDetail?.scans?.map((s: any) => (
                  <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3 text-xs text-slate-500 font-mono">{new Date(s.createdAt).toLocaleTimeString("fr-FR")}</td>
                    <td className="px-5 py-3"><div className="text-xs font-bold">{s.user?.name ?? "—"}</div><div className="text-2xs text-slate-400">{s.user?.email}</div></td>
                    <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-black ${s.type === "mutuelle" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{s.type}</span></td>
                    <td className="px-5 py-3 text-right font-black">{Math.round(s.globalScore)}%</td>
                    <td className="px-5 py-3 text-center">{s.success ? <span className="text-green-500">✓</span> : <span className="text-red-500">✗</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Distribution */}
      <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
        <h2 className="font-black text-lg mb-5">Distribution des scores</h2>
        <div className="space-y-3">
          <TrancheBar label="75-100" count={ocrData.scoreBuckets[3]} total={ocrData.totalScans} color="bg-green-500" />
          <TrancheBar label="50-75" count={ocrData.scoreBuckets[2]} total={ocrData.totalScans} color="bg-blue-500" />
          <TrancheBar label="25-50" count={ocrData.scoreBuckets[1]} total={ocrData.totalScans} color="bg-amber-500" />
          <TrancheBar label="0-25" count={ocrData.scoreBuckets[0]} total={ocrData.totalScans} color="bg-red-500" />
        </div>
      </div>
    </div>
  );
}
