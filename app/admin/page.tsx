"use client";

import { useEffect, useState } from "react";
import {
  getAllUsersAdmin,
  getAdminAnalytics,
  toggleUserProStatus,
  toggleUserAdminRole,
} from "./actions";
import {
  Users, CreditCard, Activity, Search, CheckCircle, XCircle,
  ShieldCheck, ShieldOff, LogOut, TrendingUp, BarChart2, Euro,
  UserCheck, UserX, Building2, Zap,
} from "lucide-react";
import NavMenu from "@/components/NavMenu";
import AppFooter from "@/components/AppFooter";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  isPro: boolean;
  plan: string;
  clientCount: number;
  createdAt: string;
  role: string;
}

interface Analytics {
  totalUsers: number;
  proUsers: number;
  soloUsers: number;
  duoUsers: number;
  freeUsers: number;
  newThisMonth: number;
  newLastMonth: number;
  totalScans: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  teamsCount: number;
  conversionRate: number;
  mrrEstimate: number;
  signupsLast30Days: Record<string, number>;
}

function SignupsChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  const chartHeight = 80;

  return (
    <div className="flex items-end gap-[3px] h-[80px] w-full">
      {entries.map(([date, count]) => {
        const height = Math.max((count / max) * chartHeight, count > 0 ? 4 : 1);
        const label = new Date(date).getDate();
        return (
          <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-400"
              style={{ height: `${height}px` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
              {count} — {date}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KpiCard({
  label, value, sub, icon: Icon, color, trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; label: string };
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
    indigo: "bg-indigo-100 text-indigo-600",
    rose: "bg-rose-100 text-rose-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white p-7 rounded-[28px] shadow-sm border border-slate-100 flex flex-col gap-3">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
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

export default function AdminDashboard() {
  const [tab, setTab] = useState<"analytics" | "users">("analytics");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "FREE" | "SOLO" | "DUO">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAllUsersAdmin(), getAdminAnalytics()])
      .then(([u, a]) => {
        setUsers(u);
        setAnalytics(a);
      })
      .catch((err) => setError(err.message || "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePro = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      await toggleUserProStatus(userId, currentStatus);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isPro: !currentStatus } : u));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    if (!confirm(currentRole === "ADMIN" ? "Rétrograder en utilisateur standard ?" : "Promouvoir en administrateur ?")) return;
    setAdminLoading(userId);
    try {
      const updated = await toggleUserAdminRole(userId, currentRole);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: updated.role } : u));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdminLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const match = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter !== "all") return match && u.plan === filter;
    return match;
  });

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-blue-600">
      Chargement du dashboard admin...
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 max-w-md">
        <h1 className="text-2xl font-black mb-4">Accès Refusé</h1>
        <p className="font-medium mb-6">{error}</p>
        <Link href="/dashboard" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">
          Retour au dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavMenu />
      <main className="flex-1 text-slate-900 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Administration</h1>
              <p className="text-slate-500 font-medium">Suivi de l'activité globale d'AudiBot.</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm w-fit mb-8 gap-1">
            {([["analytics", "Analytiques", BarChart2], ["users", "Utilisateurs", Users]] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${tab === key ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-700"}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ── ANALYTICS TAB ── */}
          {tab === "analytics" && analytics && (
            <div className="space-y-8">

              {/* KPI Row 1 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KpiCard
                  label="MRR estimé"
                  value={`${analytics.mrrEstimate.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €`}
                  sub="base €32.90/Pro"
                  icon={Euro}
                  color="green"
                />
                <KpiCard
                  label="Utilisateurs"
                  value={analytics.totalUsers}
                  sub={`+${analytics.newThisMonth} ce mois`}
                  icon={Users}
                  color="blue"
                  trend={{ value: analytics.newThisMonth - analytics.newLastMonth, label: "vs mois préc." }}
                />
                <KpiCard
                  label="Comptes Pro"
                  value={analytics.proUsers}
                  icon={CreditCard}
                  color="indigo"
                />
                <KpiCard
                  label="Conversion"
                  value={`${analytics.conversionRate}%`}
                  sub="Free → Pro"
                  icon={TrendingUp}
                  color="purple"
                />
                <KpiCard
                  label="Scans totaux"
                  value={analytics.totalScans.toLocaleString("fr-FR")}
                  icon={Zap}
                  color="amber"
                />
                <KpiCard
                  label="Équipes"
                  value={analytics.teamsCount}
                  icon={Building2}
                  color="rose"
                />
              </div>

              {/* Chart + Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Signups chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-black text-lg">Nouveaux inscrits</h2>
                      <p className="text-xs text-slate-400 font-semibold">30 derniers jours</p>
                    </div>
                    <span className="text-2xl font-black text-blue-600">{analytics.newThisMonth}</span>
                  </div>
                  <SignupsChart data={analytics.signupsLast30Days} />
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-300">
                    <span>J-30</span>
                    <span>Aujourd'hui</span>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-5">
                  <h2 className="font-black text-lg">Répartition</h2>

                  {/* Pro vs Free */}
                  <div>
                    <div className="flex justify-between text-xs font-black text-slate-500 mb-2">
                      <span>Pro</span>
                      <span>{analytics.proUsers} / {analytics.totalUsers}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${analytics.totalUsers > 0 ? (analytics.proUsers / analytics.totalUsers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Email vérifiés */}
                  <div>
                    <div className="flex justify-between text-xs font-black text-slate-500 mb-2">
                      <span>Emails vérifiés</span>
                      <span>{analytics.verifiedUsers} / {analytics.totalUsers}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${analytics.totalUsers > 0 ? (analytics.verifiedUsers / analytics.totalUsers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-4 space-y-3 mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <UserCheck className="w-4 h-4 text-green-500" /> Vérifiés
                      </div>
                      <span className="font-black">{analytics.verifiedUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <UserX className="w-4 h-4 text-amber-500" /> Non vérifiés
                      </div>
                      <span className="font-black">{analytics.unverifiedUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <Activity className="w-4 h-4 text-slate-400" /> Gratuits
                      </div>
                      <span className="font-black">{analytics.freeUsers}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Month comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                  <h2 className="font-black mb-5">Inscriptions — comparaison mensuelle</h2>
                  <div className="flex items-end gap-6">
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Mois précédent</p>
                      <p className="text-4xl font-black text-slate-300">{analytics.newLastMonth}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ce mois-ci</p>
                      <p className="text-4xl font-black text-blue-600">{analytics.newThisMonth}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-black px-3 py-1 rounded-full ${analytics.newThisMonth >= analytics.newLastMonth ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                      <TrendingUp className="w-4 h-4" />
                      {analytics.newThisMonth >= analytics.newLastMonth ? "+" : ""}
                      {analytics.newThisMonth - analytics.newLastMonth}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                  <h2 className="font-black mb-5">MRR projeté</h2>
                  <p className="text-4xl font-black text-green-600 mb-1">
                    {analytics.mrrEstimate.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </p>
                  <p className="text-xs text-slate-400 font-semibold mb-4">
                    {analytics.soloUsers} Solo × 32,90 € + {analytics.duoUsers} Duo × 49,90 €
                  </p>
                  <p className="text-sm font-bold text-slate-400">ARR estimé : <span className="text-slate-700">{(analytics.mrrEstimate * 12).toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €</span></p>
                </div>
              </div>

            </div>
          )}

          {/* ── USERS TAB ── */}
          {tab === "users" && (
            <div>
              {/* Filters */}
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur (nom, email)..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full md:w-auto">
                  {(["all", "FREE", "SOLO", "DUO"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${filter === f ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {f === "all" ? "Tous" : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["Utilisateur", "Status", "Rôle", "Scans", "Inscription", "Actions"].map((h) => (
                          <th key={h} className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <p className="font-black text-slate-900">{user.name || "Inconnu"}</p>
                            <p className="text-sm font-medium text-slate-400">{user.email}</p>
                          </td>
                          <td className="px-8 py-6">
                            {user.plan === "DUO"
                              ? <span className="px-3 py-1 bg-purple-100 text-purple-600 text-[10px] font-black rounded-full uppercase">DUO</span>
                              : user.plan === "SOLO"
                              ? <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black rounded-full uppercase">SOLO</span>
                              : <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black rounded-full uppercase">FREE</span>}
                          </td>
                          <td className="px-8 py-6">
                            {user.role === "ADMIN"
                              ? <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-black rounded-full uppercase flex items-center gap-1 w-fit"><ShieldCheck className="w-3 h-3" /> Admin</span>
                              : <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black rounded-full uppercase">User</span>}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-lg">{user.clientCount}</span>
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, (user.clientCount / 50) * 100)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-500">
                            {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleTogglePro(user.id, user.isPro)}
                                disabled={actionLoading === user.id}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-sm ${user.isPro ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-600 text-white hover:bg-green-700"}`}
                              >
                                {actionLoading === user.id ? "..." : user.isPro
                                  ? <><XCircle className="w-4 h-4" />Standard</>
                                  : <><CheckCircle className="w-4 h-4" />Pro</>}
                              </button>
                              <button
                                onClick={() => handleToggleAdmin(user.id, user.role)}
                                disabled={adminLoading === user.id}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-sm ${user.role === "ADMIN" ? "bg-slate-100 text-slate-500 hover:bg-slate-200" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                              >
                                {adminLoading === user.id ? "..." : user.role === "ADMIN"
                                  ? <><ShieldOff className="w-4 h-4" />Rétrograder</>
                                  : <><ShieldCheck className="w-4 h-4" />Admin</>}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold">
                            Aucun utilisateur trouvé.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      <AppFooter />
    </div>
  );
}
