"use client";
/**
 * Admin bilan analytics dashboard: KPIs, charts, per-user stats, monthly trends.
 * Exports: AdminBilanPage (default)
 * ~550 lines
 */

import { useEffect, useState } from "react";
import { getAdminBilanDashboard, getBilanUsers } from "../actions";
import {
  ClipboardList, CheckCircle2, TrendingUp, TrendingDown, AlertTriangle,
  ShoppingCart, Smile, Users, Activity, Eye, Clock, Layers, BarChart2,
  Target, Glasses, Heart, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "@/components/charts";

/* ── Helpers ──────────────────────────────────────────────────────── */

function pct(n: number, total: number) {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}
function delta(current: number, prev: number) {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 100);
}
function formatMonth(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

const LABEL_MAP: Record<string, string> = {
  tablette: "Tablette (QR)", email: "Email", sms: "SMS",
  myopie: "Myopie", hypermetropie: "Hypermétropie", astigmatisme: "Astigmatisme",
  presbytie: "Presbytie", aucune: "Aucune",
  halos_nuit: "Halos nocturnes", fatigue_visuelle: "Fatigue visuelle",
  maux_de_tete: "Maux de tête", vision_floue_pres: "Vision floue (près)",
  vision_floue_loin: "Vision floue (loin)", eblouissement: "Éblouissements",
  moins_150: "< 150 €", "150_300": "150–300 €", "300_500": "300–500 €",
  plus_500: "> 500 €", ne_sais_pas: "NSP",
  toujours: "Toujours", souvent: "Souvent", parfois: "Parfois", rarement: "Rarement",
  discret: "Discret", moderne: "Moderne", classique: "Classique", original: "Original",
  sport: "Sport", bureau: "Bureau", exterieur: "Extérieur", mixte: "Mixte", conduite: "Conduite",
  verre: "Verre", monture: "Monture", paire_supplementaire: "Paire supp.", accessoire: "Accessoire",
};
const lbl = (key: string) => LABEL_MAP[key] ?? key;

const COMPLEXITE_COLORS: Record<number, string> = { 1: "#10b981", 2: "#3b82f6", 3: "#f59e0b", 4: "#f97316", 5: "#ef4444" };
const COMPLEXITE_LABELS: Record<number, string> = { 1: "Std", 2: "Opt.", 3: "App.", 4: "Cpx", 5: "Urg." };
const COMPLEXITE_FULL: Record<number, string> = { 1: "Standard", 2: "Options", 3: "Approfondi", 4: "Complexe", 5: "Urgence" };
const COMPLEXITE_BG: Record<number, string> = { 1: "#f0fdf4", 2: "#eff6ff", 3: "#fffbeb", 4: "#fff7ed", 5: "#fef2f2" };

/* ── Primitives ───────────────────────────────────────────────────── */

function KpiCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
  trend?: number;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600", green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600", indigo: "bg-indigo-100 text-indigo-600",
    rose: "bg-rose-100 text-rose-600", purple: "bg-purple-100 text-purple-600",
    cyan: "bg-cyan-100 text-cyan-600", orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
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
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend >= 0 ? "+" : ""}{trend}% vs mois préc.
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, color, title, sub }: {
  icon: React.ElementType; color: string; title: string; sub?: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600", green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600", purple: "bg-purple-100 text-purple-600",
    rose: "bg-rose-100 text-rose-600", cyan: "bg-cyan-100 text-cyan-600",
    orange: "bg-orange-100 text-orange-600", red: "bg-red-100 text-red-600",
    indigo: "bg-indigo-100 text-indigo-600", slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="font-black text-lg">{title}</h2>
        {sub && <p className="text-xs text-slate-600 font-semibold">{sub}</p>}
      </div>
    </div>
  );
}

function DistribBar({ data, total }: { data: Record<string, number>; total: number }) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
  if (entries.length === 0) return <p className="text-xs text-slate-600">Aucune donnée</p>;
  return (
    <div className="space-y-2.5">
      {entries.map(([key, count]) => (
        <div key={key}>
          <div className="flex justify-between text-xs font-black text-slate-600 mb-1">
            <span>{lbl(key)}</span>
            <span>{count} <span className="text-slate-600 font-semibold">({pct(count, total)}%)</span></span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct(count, total)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

type DashboardData = Awaited<ReturnType<typeof getAdminBilanDashboard>>;
type Period = "day" | "week" | "month";

export default function AdminBilanPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => new Date());
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [period, setPeriod] = useState<Period>("month");
  const [userId, setUserId] = useState<string>("");
  const [users, setUsers] = useState<{ id: string; label: string }[]>([]);

  const fetchData = async (y: number, m: number, p: Period, uid: string) => {
    setLoading(true);
    try { setData(await getAdminBilanDashboard(p === "month" ? formatMonth(y, m) : undefined, p, uid || undefined)); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData(year, month, period, userId);
    getBilanUsers().then(setUsers);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goMonth = (dir: -1 | 1) => {
    let ny = year, nm = month + dir;
    if (nm < 0) { nm = 11; ny--; }
    if (nm > 11) { nm = 0; ny++; }
    setYear(ny); setMonth(nm);
    fetchData(ny, nm, "month", userId);
  };

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    fetchData(year, month, p, userId);
  };

  const handleUserChange = (uid: string) => {
    setUserId(uid);
    fetchData(year, month, period, uid);
  };

  const monthLabel = new Date(year, month).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  if (loading || !data) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 bg-white rounded-card border border-slate-100" />)}
      </div>
    </div>
  );

  const d = data.demographics;
  const vs = data.vsLastMonth;

  return (
    <div className="space-y-8">

      {/* ── Filtres ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4">
        {/* Période */}
        <div className="flex items-center gap-2">
          <span className="text-2xs font-black uppercase tracking-widest text-slate-600">Période</span>
          <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl gap-1">
            {(["day", "week", "month"] as Period[]).map((p) => (
              <button key={p} onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  period === p ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:text-slate-700"
                }`}>
                {p === "day" ? "Jour" : p === "week" ? "Semaine" : "Mois"}
              </button>
            ))}
          </div>
        </div>

        {/* Nav mois (visible uniquement si period=month) */}
        {period === "month" && (
          <div className="flex items-center gap-2">
            <button onClick={() => goMonth(-1)} className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all">
              <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <span className="text-xs font-black capitalize min-w-[110px] text-center text-slate-700">{monthLabel}</span>
            <button onClick={() => goMonth(1)} disabled={year === now.getFullYear() && month === now.getMonth()}
              className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all disabled:opacity-30">
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        )}

        {/* Filtre utilisateur */}
        {users.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xs font-black uppercase tracking-widest text-slate-600">Utilisateur</span>
            <select
              value={userId}
              onChange={(e) => handleUserChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none max-w-[220px]"
            >
              <option value="">Tous les utilisateurs</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
        )}

        {loading && <span className="text-xs text-blue-500 font-bold animate-pulse ml-auto">Chargement...</span>}
        {!loading && <span className="text-xs text-slate-400 font-semibold ml-auto">{data.totalAllTime} bilans all-time</span>}
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="Bilans créés" value={data.total} sub={`${data.delivered} complétés`} icon={ClipboardList} color="blue" trend={delta(data.total, vs.total)} />
        <KpiCard label="Complétion" value={`${data.completionRate}%`} sub={`${vs.completionRate}% mois préc.`} icon={CheckCircle2} color="green" />
        <KpiCard label="Complexité moy." value={data.avgComplexite} sub={`${vs.avgComplexite} mois préc.`} icon={Activity} color="amber" />
        <KpiCard label="Opportunités / bilan" value={data.avgOpportunitesPerBilan} sub={`${data.totalOpportunites} au total`} icon={ShoppingCart} color="purple" />
        <KpiCard label="NPS" value={data.npsScore !== null ? data.npsScore : "—"} sub={`${data.npsResponseRate}% de réponse`} icon={Smile} color={data.npsScore !== null && data.npsScore >= 50 ? "green" : data.npsScore !== null && data.npsScore >= 0 ? "amber" : "red"} />
        <KpiCard label="Utilisateurs actifs" value={data.uniqueUsers} sub={`${data.topUsers.length} ce mois`} icon={Users} color="cyan" />
      </div>

      {/* ── Volume + Statut + Sources ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <SectionHeader icon={BarChart2} color="blue" title="Volume journalier" sub="Bilans créés & complétés par jour" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart barSize={10} data={Object.entries(data.dailyVolume).map(([date, v]) => {
              const dv = v as { created: number; delivered: number };
              return { date: date.slice(5), created: dv.created, delivered: dv.delivered };
            })}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="created" name="Créés" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delivered" name="Complétés" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
            <SectionHeader icon={Clock} color="amber" title="Statut" />
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-amber-50 rounded-2xl">
                <p className="text-2xs font-black uppercase text-amber-400">En attente</p>
                <p className="text-2xl font-black text-amber-600">{data.waiting}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-2xl">
                <p className="text-2xs font-black uppercase text-blue-400">En cours</p>
                <p className="text-2xl font-black text-blue-600">{data.inProgress}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-2xl">
                <p className="text-2xs font-black uppercase text-green-400">Terminé</p>
                <p className="text-2xl font-black text-green-600">{data.done}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
            <SectionHeader icon={Layers} color="purple" title="Sources" />
            <DistribBar data={data.sourceDistrib} total={data.total} />
          </div>
        </div>
      </div>

      {/* ── Complexité + Alertes ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <SectionHeader icon={Target} color="amber" title="Score de complexité" sub={`Moyenne : ${data.avgComplexite} / 5`} />
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((n) => {
              const count = data.complexiteDistrib[n] ?? 0;
              return (
                <div key={n} title={COMPLEXITE_FULL[n]} className="text-center p-3 rounded-2xl cursor-default" style={{ backgroundColor: COMPLEXITE_BG[n] }}>
                  <p className="text-2xs font-black uppercase leading-tight" style={{ color: COMPLEXITE_COLORS[n] }}>
                    {COMPLEXITE_LABELS[n]}
                  </p>
                  <p className="text-2xl font-black mt-1" style={{ color: COMPLEXITE_COLORS[n] }}>{count}</p>
                  <p className="text-2xs text-slate-600">{pct(count, data.delivered)}%</p>
                </div>
              );
            })}
          </div>
          {/* Légende */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-3 border-t border-slate-100">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="flex items-center gap-1.5 text-2xs font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COMPLEXITE_COLORS[n] }} />
                {COMPLEXITE_LABELS[n]} = {COMPLEXITE_FULL[n]}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <SectionHeader icon={AlertTriangle} color="red" title="Alertes cliniques" sub={`${data.avgAlertesPerBilan} alertes/bilan en moyenne`} />
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-4 bg-red-50 rounded-2xl">
              <p className="text-2xs font-black uppercase text-red-400">Urgentes</p>
              <p className="text-3xl font-black text-red-600">{data.alertesCount.urgent}</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-2xl">
              <p className="text-2xs font-black uppercase text-amber-400">Attention</p>
              <p className="text-3xl font-black text-amber-600">{data.alertesCount.attention}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-2xl">
              <p className="text-2xs font-black uppercase text-blue-400">Info</p>
              <p className="text-3xl font-black text-blue-600">{data.alertesCount.info}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Opportunités + Top reco verres ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <SectionHeader icon={ShoppingCart} color="green" title="Opportunités commerciales" sub={`${data.totalOpportunites} détectées — ${data.avgOpportunitesPerBilan}/bilan`} />
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.opportunitesTypes).sort(([, a], [, b]) => b - a).map(([type, count], i) => {
              const bgs = ["bg-blue-50", "bg-purple-50", "bg-green-50", "bg-amber-50"];
              const texts = ["text-blue-600", "text-purple-600", "text-green-600", "text-amber-600"];
              return (
                <div key={type} className={`p-4 rounded-2xl ${bgs[i % bgs.length]}`}>
                  <p className={`text-2xs font-black uppercase ${texts[i % texts.length]}`}>{lbl(type)}</p>
                  <p className="text-2xl font-black text-slate-900">{count}</p>
                  <p className="text-2xs text-slate-600">{pct(count, data.delivered)} par bilan</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <SectionHeader icon={Eye} color="indigo" title="Top recommandations verres" sub="Les plus fréquemment prescrites" />
          {data.lensTopReco.length > 0 ? (
            <div className="space-y-2.5">
              {data.lensTopReco.map((r, i) => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs font-black text-slate-600 mb-1">
                    <span className="flex items-center gap-2">
                      <span className="text-2xs font-black text-slate-600 w-5">#{i + 1}</span>
                      {r.label}
                    </span>
                    <span>{r.count} <span className="text-slate-600 font-semibold">({r.pct}%)</span></span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-slate-600">Aucune recommandation ce mois</p>}
        </div>
      </div>

      {/* ── NPS ──────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
        <SectionHeader
          icon={Smile}
          color={data.npsScore !== null && data.npsScore >= 50 ? "green" : "amber"}
          title="NPS client"
          sub={`${data.npsResponseRate}% de taux de réponse — ${data.npsCounts.promoteurs + data.npsCounts.passifs + data.npsCounts.detracteurs} réponses`}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-2xl">
                <p className="text-2xs font-black uppercase text-green-400">Promoteurs</p>
                <p className="text-3xl font-black text-green-600">{data.npsCounts.promoteurs}</p>
                <p className="text-2xs text-slate-600">9-10</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-2xl">
                <p className="text-2xs font-black uppercase text-amber-400">Passifs</p>
                <p className="text-3xl font-black text-amber-600">{data.npsCounts.passifs}</p>
                <p className="text-2xs text-slate-600">7-8</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-2xl">
                <p className="text-2xs font-black uppercase text-red-400">Détracteurs</p>
                <p className="text-3xl font-black text-red-600">{data.npsCounts.detracteurs}</p>
                <p className="text-2xs text-slate-600">0-6</p>
              </div>
            </div>
            {data.npsScore !== null && (
              <div className="p-4 rounded-2xl border border-slate-100 text-center">
                <p className="text-2xs font-black uppercase tracking-widest text-slate-600 mb-1">Score NPS</p>
                <p className={`text-5xl font-black ${data.npsScore >= 50 ? "text-green-600" : data.npsScore >= 0 ? "text-amber-600" : "text-red-600"}`}>
                  {data.npsScore}
                </p>
                {vs.nps !== null && <p className="text-xs text-slate-600 mt-1">{vs.nps} mois précédent</p>}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-black text-slate-600 mb-3">Derniers commentaires</p>
            {data.npsComments.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {data.npsComments.map((c, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${c.score >= 9 ? "bg-green-100 text-green-700" : c.score >= 7 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {c.score}/10
                      </span>
                      <span className="text-2xs text-slate-600">{new Date(c.date).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <p className="text-sm text-slate-700">{c.comment}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-slate-600">Aucun commentaire ce mois</p>}
          </div>
        </div>
      </div>

      {/* ── Démographie ── corrections + gênes ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <SectionHeader icon={Glasses} color="blue" title="Types de correction" sub={`${d.totalWithFormData} bilans avec données`} />
          <DistribBar data={d.correctionTypes} total={d.totalWithFormData} />
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-2xs font-black uppercase text-blue-400">Progressifs</p>
              <p className="text-xl font-black text-blue-600">{d.progressifCount} <span className="text-xs text-slate-600">({pct(d.progressifCount, d.totalWithFormData)}%)</span></p>
            </div>
            <div className="p-3 bg-cyan-50 rounded-xl">
              <p className="text-2xs font-black uppercase text-cyan-400">Lentilles</p>
              <p className="text-xl font-black text-cyan-600">{d.lentillesCount} <span className="text-xs text-slate-600">({pct(d.lentillesCount, d.totalWithFormData)}%)</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <SectionHeader icon={AlertTriangle} color="rose" title="Gênes rapportées" sub="Symptômes les plus fréquents" />
          <DistribBar data={d.genesActuelles} total={d.totalWithFormData} />
        </div>
      </div>

      {/* ── Démographie ── mode de vie + budget ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <SectionHeader icon={Activity} color="orange" title="Mode de vie" sub="Activité, sport, conduite" />
          <DistribBar data={d.mainActivity} total={d.totalWithFormData} />
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
            <div className="p-3 bg-orange-50 rounded-xl text-center">
              <p className="text-2xs font-black uppercase text-orange-400">Écran moy.</p>
              <p className="text-xl font-black text-orange-600">{d.avgScreenTime}h</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-center">
              <p className="text-2xs font-black uppercase text-green-400">Sportifs</p>
              <p className="text-xl font-black text-green-600">{d.sportCount} <span className="text-2xs text-slate-600">({pct(d.sportCount, d.totalWithFormData)}%)</span></p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl text-center">
              <p className="text-2xs font-black uppercase text-slate-600">Conduite nuit</p>
              <p className="text-xl font-black text-slate-700">{d.conduitNuitCount} <span className="text-2xs text-slate-600">({pct(d.conduitNuitCount, d.totalWithFormData)}%)</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <SectionHeader icon={ShoppingCart} color="green" title="Budget & projet" sub="Fourchette de budget déclarée" />
          <DistribBar data={d.budgetDistrib} total={d.totalWithFormData} />
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
            <div className="p-3 bg-purple-50 rounded-xl text-center">
              <p className="text-2xs font-black uppercase text-purple-400">2e paire</p>
              <p className="text-xl font-black text-purple-600">{d.secondePaireCount} <span className="text-2xs text-slate-600">({pct(d.secondePaireCount, d.totalWithFormData)}%)</span></p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-center">
              <p className="text-2xs font-black uppercase text-amber-400">Mutuelle ?</p>
              <p className="text-xl font-black text-amber-600">{d.mutuelleInconnueCount} <span className="text-2xs text-slate-600">inconnus</span></p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-center">
              <p className="text-2xs font-black uppercase text-red-400">Antécédents</p>
              <p className="text-xl font-black text-red-600">{d.antecedentsCount} <span className="text-2xs text-slate-600">({pct(d.antecedentsCount, d.totalWithFormData)}%)</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Style + Fréquence ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <SectionHeader icon={Heart} color="rose" title="Préférence de style" />
          <DistribBar data={d.stylePreference} total={d.totalWithFormData} />
        </div>
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
          <SectionHeader icon={Clock} color="cyan" title="Fréquence de port" />
          <DistribBar data={d.frequencePort} total={d.totalWithFormData} />
        </div>
      </div>

      {/* ── Top utilisateurs ──────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
        <SectionHeader icon={Users} color="blue" title="Top utilisateurs" sub="Les plus actifs ce mois" />
        {data.topUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-600">#</th>
                  <th className="text-left py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-600">Magasin</th>
                  <th className="text-left py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-600">Email</th>
                  <th className="text-left py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-600">Plan</th>
                  <th className="text-right py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-600">Créés</th>
                  <th className="text-right py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-600">Complétés</th>
                  <th className="text-right py-3 px-4 text-2xs font-black uppercase tracking-widest text-slate-600">Taux</th>
                </tr>
              </thead>
              <tbody>
                {data.topUsers.map((u, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4 font-black text-slate-600">{i + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{u.store || u.name || "—"}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{u.email}</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-black rounded-lg">{u.plan}</span></td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-600">{u.total}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-800">{u.delivered}</td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">{u.total > 0 ? Math.round((u.delivered / u.total) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-xs text-slate-600">Aucune activité ce mois</p>}
      </div>

    </div>
  );
}
