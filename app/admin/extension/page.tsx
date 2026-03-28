"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getAdminAnalytics, getExtensionUsageStats, getInjectionByMode,
  getUserInjectionHistory, getAllUsersAdmin,
} from "../actions";
import {
  getSelectorHealthSummary, getSelectorHealthAlerts, getSelectorHealthTimeline,
  getSelectorOverrides, upsertSelectorOverride, deleteSelectorOverride, toggleSelectorOverride,
} from "./actions";
import { getRpaLogs, getRpaStats } from "../rpa/actions";
import {
  Activity, ShieldCheck, Plug, AlertTriangle, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  Plus, Settings, Trash2, ToggleLeft, ToggleRight, Pencil, Check, X, RefreshCw, Eye, Users, Bot,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "@/components/charts";
import { ALLOWED_SELECTOR_NAMES } from "@/lib/selectorsSchema";


const KNOWN_PORTALS = [
  "generation.fr", "livebyoptimum.com", "pro.wemind.io", "espaceprofessionnel.apgis.com",
  "www.actil.com", "mercer", "tp-plus", "ffl-promoteur.com", "solimut.fr", "ameli.fr",
  "mutuelle-almerys.com", "oxantis",
];

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600", green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600", rose: "bg-rose-100 text-rose-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };
  return (
    <div className="bg-white p-6 rounded-card shadow-sm border border-slate-100 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs font-semibold text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminExtensionPage() {
  const [tab, setTab] = useState<"selectors" | "portals" | "usage" | "rpa">("selectors");

  /* ── SELECTORS TAB STATE ── */
  const [healthPeriod, setHealthPeriod] = useState<"24h" | "7d">("24h");
  const [healthRows, setHealthRows] = useState<any[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<any[]>([]);
  const [healthLoading, setHealthLoading] = useState(true);
  const [overrides, setOverrides] = useState<any[]>([]);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);

  /* ── PORTALS TAB STATE ── */
  const [portalHealth, setPortalHealth] = useState<any>(null);
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);

  /* ── USAGE TAB STATE ── */
  const [usageStats, setUsageStats] = useState<any>(null);
  const [modeStats, setModeStats] = useState<{ mode: string; total: number; successRate: number; topSites: { site: string; count: number }[] }[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [allUsers, setAllUsers] = useState<{ id: string; name: string | null; email: string | null }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userHistory, setUserHistory] = useState<any[] | null>(null);
  const [userHistoryLoading, setUserHistoryLoading] = useState(false);

  /* ── RPA TAB STATE ── */
  const [rpaLogs, setRpaLogs] = useState<any[]>([]);
  const [rpaStats, setRpaStats] = useState<any>(null);
  const [rpaLoading, setRpaLoading] = useState(false);
  const [rpaFilterMutuelle, setRpaFilterMutuelle] = useState("");
  const [rpaFilterStatut, setRpaFilterStatut] = useState("");
  const [rpaFilterDays, setRpaFilterDays] = useState(30);

  /* ── REFRESH ── */
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const loadRpa = async (mutuelle?: string, statut?: string, days?: number) => {
    setRpaLoading(true);
    try {
      const [logs, stats] = await Promise.all([
        getRpaLogs({ mutuelle: mutuelle || undefined, statut: statut || undefined, days: days ?? rpaFilterDays }),
        getRpaStats(),
      ]);
      setRpaLogs(logs);
      setRpaStats(stats);
    } finally {
      setRpaLoading(false);
    }
  };

  useEffect(() => {
    setRefreshing(true);
    if (tab === "selectors") {
      setHealthLoading(true);
      Promise.all([
        getSelectorHealthSummary(healthPeriod),
        getSelectorHealthAlerts(),
        getSelectorOverrides(),
      ]).then(([health, alerts, ovs]) => {
        setHealthRows(health);
        setHealthAlerts(alerts);
        setOverrides(ovs);
        setLastRefresh(new Date());
      }).finally(() => { setHealthLoading(false); setRefreshing(false); });
    } else if (tab === "portals") {
      fetch("/api/admin/bookmarklet-health", { cache: "no-store" })
        .then(r => r.json())
        .then(data => { setPortalHealth(data); setLastRefresh(new Date()); })
        .finally(() => setRefreshing(false));
    } else if (tab === "usage") {
      getExtensionUsageStats()
        .then(data => { setUsageStats(data); setLastRefresh(new Date()); })
      getInjectionByMode(30)
        .then(data => setModeStats(data))
        .catch(() => {})
        .finally(() => setRefreshing(false));
      getAllUsersAdmin()
        .then(users => setAllUsers(users.map(u => ({ id: u.id, name: u.name, email: u.email }))))
        .catch(() => {});
    } else if (tab === "rpa") {
      loadRpa(rpaFilterMutuelle, rpaFilterStatut, rpaFilterDays);
    }
  }, [tab, healthPeriod, refreshKey]);

  const toggleTimeline = async (portal: string, selectorName: string) => {
    const key = `${portal}::${selectorName}`;
    if (expandedKey === key) { setExpandedKey(null); return; }
    setExpandedKey(key);
    const data = await getSelectorHealthTimeline(portal, selectorName, healthPeriod === "24h" ? 1 : 7);
    setTimeline(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
          {[
            { id: "selectors", label: "Sélecteurs", icon: Settings },
            { id: "portals",   label: "Santé Portails", icon: Activity },
            { id: "usage",     label: "Usage", icon: Plug },
            { id: "rpa",       label: "RPA", icon: Bot },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${tab === t.id ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm disabled:opacity-50"
          title="Rafraîchir"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
        {lastRefresh && (
          <span className="text-2xs font-bold text-slate-300">
            MAJ {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>

      {/* ── SELECTORS TAB ── */}
      {tab === "selectors" && (
        <div className="space-y-8">
          {/* Alerts */}
          {healthAlerts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-black text-red-700">{healthAlerts.length} sélecteur(s) en alerte (échecs récents)</p>
              </div>
            </div>
          )}

          {/* Health Summary Table */}
          <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-black text-lg">Santé des sélecteurs</h2>
              <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                {(["24h", "7d"] as const).map(p => (
                  <button key={p} onClick={() => setHealthPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${healthPeriod === p ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-50 text-2xs font-black uppercase text-slate-400 text-left">
                    <th className="px-6 py-3">Portail</th>
                    <th className="px-4 py-3">Sélecteur</th>
                    <th className="px-4 py-3 text-right">Echecs</th>
                    <th className="px-4 py-3 text-right">Taux</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {healthRows.slice(0, 10).map((r) => {
                    const isExpanded = expandedKey === `${r.portal}::${r.selectorName}`;
                    return (
                      <tr key={`${r.portal}::${r.selectorName}`} onClick={() => toggleTimeline(r.portal, r.selectorName)} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                        <td className="px-6 py-4 font-bold text-slate-700">{r.portal}</td>
                        <td className="px-4 py-4 font-medium text-slate-500">{r.selectorName}</td>
                        <td className="px-4 py-4 text-right font-black text-red-500">{r.failures}</td>
                        <td className="px-4 py-4 text-right font-black text-slate-700">{r.failureRate}%</td>
                        <td className="px-4 py-4 text-slate-300">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manual Overrides */}
          <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-black text-lg text-slate-900">Overrides manuels</h2>
              <span className="text-xs font-black text-slate-400">{overrides.length} override{overrides.length > 1 ? "s" : ""}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-2xs font-black uppercase text-slate-400 text-left">
                    <th className="px-6 py-3">Portail</th>
                    <th className="px-6 py-3">Nom</th>
                    <th className="px-6 py-3">Sélecteur CSS</th>
                    <th className="px-6 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {overrides.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-bold text-slate-700">{o.portal}</td>
                      <td className="px-6 py-3 text-slate-500">{o.selectorName}</td>
                      <td className="px-6 py-3"><code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{o.selector}</code></td>
                      <td className="px-6 py-3">{o.enabled ? <span className="text-green-500 font-black">Actif</span> : <span className="text-slate-300 font-bold">Inactif</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PORTALS TAB ── */}
      {tab === "portals" && (
        <div className="space-y-8">
          {!portalHealth ? <div className="animate-pulse h-40 bg-white rounded-card border border-slate-100" /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard label="Taux santé global" value={`${portalHealth.healthRate}%`} icon={CheckCircle} color="green" />
              <KpiCard label="Total pings 7j" value={portalHealth.total} icon={Activity} color="blue" />
              <KpiCard label="Erreurs récentes" value={portalHealth.recentErrors.length} icon={XCircle} color="rose" />
            </div>
          )}
          {portalHealth && (
            <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-2xs font-black uppercase text-slate-400">
                    <th className="px-6 py-4">Portail</th>
                    <th className="px-6 py-4">Succès</th>
                    <th className="px-6 py-4">Dernière v.</th>
                    <th className="px-6 py-4">Dernier ping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {Object.entries(portalHealth.byPortal).map(([name, stats]: [string, any]) => {
                    const total = stats.ok + stats.broken + stats.partial;
                    const rate = total > 0 ? Math.round((stats.ok / total) * 100) : 0;
                    return (
                      <tr key={name} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-black text-slate-900 capitalize">{name}</td>
                        <td className="px-6 py-4 font-black text-lg text-green-600">{rate}%</td>
                        <td className="px-6 py-4 font-mono text-xs">{stats.lastVersion}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{new Date(stats.lastSeen).toLocaleString("fr-FR")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── USAGE TAB ── */}
      {tab === "usage" && (
        <div className="space-y-8">
          {!usageStats ? <div className="animate-pulse h-40 bg-white rounded-card border border-slate-100" /> : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard label="Remplissages 30j" value={usageStats.totalInjections30d.toLocaleString("fr-FR")} icon={Plug} color="blue" />
                <KpiCard label="Users actifs 30j" value={usageStats.activeExtUsers30d} icon={Users} color="indigo" />
                <KpiCard label="Sites distincts" value={usageStats.topSites.length} icon={Activity} color="amber" />
                <KpiCard label="Taux succès" value={`${Math.round(usageStats.topSites.reduce((s: any, site: any) => s + site.successRate, 0) / (usageStats.topSites.length || 1))}%`} icon={CheckCircle} color="green" />
              </div>

              {/* Filtre par utilisateur */}
              <div className="bg-white rounded-card shadow-sm border border-slate-100 p-5">
                <h2 className="font-black text-slate-900 mb-3">Détail par utilisateur</h2>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur (nom, email)..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {selectedUserId && (
                    <button onClick={() => { setSelectedUserId(null); setUserHistory(null); setUserSearch(""); }}
                      className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200">
                      Effacer
                    </button>
                  )}
                </div>
                {userSearch.length > 1 && !selectedUserId && (
                  <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden">
                    {allUsers
                      .filter(u => (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) || (u.email || "").toLowerCase().includes(userSearch.toLowerCase()))
                      .slice(0, 8)
                      .map(u => (
                        <button key={u.id}
                          onClick={async () => {
                            setSelectedUserId(u.id);
                            setUserSearch(u.email || u.name || "");
                            setUserHistoryLoading(true);
                            setUserHistory(null);
                            const history = await getUserInjectionHistory(u.id).catch(() => []);
                            setUserHistory(history);
                            setUserHistoryLoading(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                          <p className="text-sm font-bold text-slate-800">{u.name || "—"}</p>
                          <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                        </button>
                      ))}
                  </div>
                )}
                {selectedUserId && userHistoryLoading && (
                  <div className="mt-4 animate-pulse h-20 bg-slate-50 rounded-xl" />
                )}
                {selectedUserId && userHistory && (
                  <div className="mt-4">
                    {userHistory.length === 0 ? (
                      <p className="text-sm text-slate-400 font-medium py-4 text-center">Aucun remplissage pour cet utilisateur.</p>
                    ) : (
                      <table className="w-full text-sm mt-2">
                        <thead>
                          <tr className="bg-slate-50 text-2xs font-black uppercase text-slate-400">
                            <th className="px-4 py-3 text-left">Site</th>
                            <th className="px-4 py-3">Champs</th>
                            <th className="px-4 py-3">Statut</th>
                            <th className="px-4 py-3 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {userHistory.slice(0, 20).map((log: any) => (
                            <tr key={log.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-bold text-slate-800 truncate max-w-[200px]">{log.site}</td>
                              <td className="px-4 py-3 text-center font-black text-slate-700">{log.fieldsCount}</td>
                              <td className="px-4 py-3 text-center">
                                {log.success
                                  ? <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-black">✓</span>
                                  : <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-black">✗</span>}
                              </td>
                              <td className="px-4 py-3 text-right text-xs text-slate-400 font-medium">
                                {new Date(log.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-black text-lg">Top Sites (30 derniers jours)</h2>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-2xs font-black uppercase text-slate-400">
                      <th className="px-6 py-3">Site</th>
                      <th className="px-6 py-3">Remplissages</th>
                      <th className="px-6 py-3 text-right">Succès</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {usageStats.topSites.map((site: any) => (
                      <tr key={site.site} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-800 truncate max-w-xs">{site.site}</td>
                        <td className="px-6 py-4 font-black text-slate-900">{site.injections}</td>
                        <td className="px-6 py-4 text-right"><span className={`px-2 py-1 rounded-full font-black text-xs ${site.successRate >= 80 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{site.successRate}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── Répartition par mode ── */}
          {modeStats.length > 0 && (
            <div className="bg-white rounded-card shadow-sm border border-slate-100 p-6 mt-6">
              <h2 className="font-black text-lg mb-5">Répartition par mode — 30 derniers jours</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {modeStats.map(m => {
                  const labels: Record<string, { label: string; emoji: string; color: string }> = {
                    smartfill: { label: "Smart Fill", emoji: "🤖", color: "bg-purple-50 border-purple-200" },
                    bot:       { label: "Standard Fill", emoji: "⚡", color: "bg-blue-50 border-blue-200" },
                    recorder:  { label: "Recorder",   emoji: "⏺",  color: "bg-green-50 border-green-200" },
                  };
                  const meta = labels[m.mode] ?? { label: m.mode, emoji: "🔌", color: "bg-slate-50 border-slate-200" };
                  return (
                    <div key={m.mode} className={`rounded-2xl border p-5 ${meta.color}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{meta.emoji}</span>
                        <span className="font-black text-slate-800">{meta.label}</span>
                      </div>
                      <p className="text-3xl font-black text-slate-900 mb-1">{m.total.toLocaleString("fr-FR")}</p>
                      <p className="text-xs text-slate-500 font-medium mb-3">remplissages</p>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">Taux succès</span>
                        <span className={m.successRate >= 80 ? "text-green-600" : m.successRate >= 50 ? "text-amber-500" : "text-red-500"}>
                          {m.successRate}%
                        </span>
                      </div>
                      {m.topSites.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                          {m.topSites.map(s => (
                            <div key={s.site} className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 truncate max-w-[140px]">{s.site}</span>
                              <span className="font-black text-slate-700">{s.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RPA TAB ── */}
      {tab === "rpa" && (
        <div className="space-y-6">
          {/* Filtres */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-wrap items-center gap-4">
            <select value={rpaFilterMutuelle} onChange={(e) => { setRpaFilterMutuelle(e.target.value); loadRpa(e.target.value, rpaFilterStatut, rpaFilterDays); }}
              className="px-3 py-2 bg-slate-50 rounded-xl text-sm font-bold border-0 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Toutes mutuelles</option>
              {[...new Set(rpaLogs.map((l) => l.mutuelle))].sort().map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={rpaFilterStatut} onChange={(e) => { setRpaFilterStatut(e.target.value); loadRpa(rpaFilterMutuelle, e.target.value, rpaFilterDays); }}
              className="px-3 py-2 bg-slate-50 rounded-xl text-sm font-bold border-0 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Tous statuts</option>
              <option value="succes">Succès</option>
              <option value="echec">Échec</option>
              <option value="bloque">Bloqué</option>
            </select>
            <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
              {([7, 30, 90] as const).map((d) => (
                <button key={d} onClick={() => { setRpaFilterDays(d); loadRpa(rpaFilterMutuelle, rpaFilterStatut, d); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${rpaFilterDays === d ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-700"}`}>
                  {d}j
                </button>
              ))}
            </div>
          </div>

          {/* KPIs */}
          {rpaStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "RPA lancés", value: rpaStats.totalLances },
                { label: "Taux succès", value: `${rpaStats.tauxSucces}%` },
                { label: "Taux échec", value: `${rpaStats.tauxEchec}%` },
                { label: "Mutuelles actives", value: rpaStats.parMutuelle.length },
              ].map((k) => (
                <div key={k.label} className="bg-white p-6 rounded-card border border-slate-100 shadow-sm">
                  <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">{k.label}</p>
                  <p className="text-3xl font-black text-slate-900">{k.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Table logs */}
          <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Date", "Mutuelle", "Étape", "Statut", "Erreur"].map((h) => (
                      <th key={h} className="px-5 py-4 text-2xs font-black uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rpaLoading ? (
                    <tr><td colSpan={5} className="px-8 py-12 text-center text-blue-500 font-bold animate-pulse">Chargement...</td></tr>
                  ) : rpaLogs.length === 0 ? (
                    <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">Aucun log RPA.</td></tr>
                  ) : rpaLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-5 py-4"><span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-2xs font-black rounded-full uppercase">{log.mutuelle}</span></td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-700">{log.etape}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-2xs font-black rounded-full uppercase ${
                          log.statut === "succes" ? "bg-green-100 text-green-600" :
                          log.statut === "echec" ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"
                        }`}>{log.statut}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 max-w-[180px] truncate" title={log.erreur || ""}>{log.erreur || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
