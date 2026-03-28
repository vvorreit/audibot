"use client";

import { useEffect, useState } from "react";
import {
  getAllUsersAdmin, grantFreeMonths,
} from "../actions";
import {
  Users, Search, ShieldCheck, Trash2, ChevronDown,
} from "lucide-react";
import Link from "next/link";

const PLANS = ["FREE", "ESSENTIEL", "PRO", "CABINET", "RESEAU", "EQUIPE"] as const;
type Plan = typeof PLANS[number];

const PLAN_COLORS: Record<Plan, string> = {
  FREE:      "bg-slate-100 text-slate-400",
  ESSENTIEL: "bg-green-100 text-green-600",
  PRO:       "bg-purple-100 text-purple-600",
  CABINET:   "bg-violet-100 text-violet-700",
  RESEAU:    "bg-blue-100 text-blue-800",
  EQUIPE:    "bg-blue-100 text-blue-700",
};

export default function UsersContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | Plan>("all");

  useEffect(() => {
    getAllUsersAdmin().then(setUsers).finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(u => {
    const match = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter !== "all") return match && u.plan === filter;
    return match;
  });

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {Array.from({length:8}).map((_,i) => <div key={i} className="h-14 bg-white rounded-2xl border border-slate-100"/>)}
    </div>
  );

  return (
    <div>
      <div className="bg-white p-6 rounded-card shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Rechercher un utilisateur..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full md:w-auto flex-wrap gap-1">
          {(["all", ...PLANS] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${filter === f ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
              {f === "all" ? "Tous" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Utilisateur", "Plan", "Équipe", "Extension", "Remplissages", "Qualité", "Scans OCR", "Relances", "Dernière activité"].map(h => (
                  <th key={h} className="px-6 py-6 text-2xs font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <Link href={`/admin/users/${user.id}`} className="font-bold text-blue-600 hover:underline">
                      {user.name ?? "—"}
                    </Link>
                    <p className="text-sm font-medium text-slate-400">{user.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-2xs font-black uppercase tracking-wide ${PLAN_COLORS[user.plan as Plan] || "bg-slate-100 text-slate-400"}`}>
                      {user.plan}
                    </span>
                    {user.freeUntil && new Date(user.freeUntil) > new Date() && (
                      <p className="mt-1 text-[10px] font-black text-green-600 uppercase">🎁 Offert</p>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {user.teamName ? (
                      <div>
                        <p className="text-xs font-black text-slate-700">{user.teamName}</p>
                        <p className="text-2xs font-bold text-slate-400">{user.isTeamOwner ? "Gérant" : user.teamRole}</p>
                      </div>
                    ) : <span className="text-slate-300 text-xs font-bold">—</span>}
                  </td>
                  <td className="px-6 py-5">
                    {user.extensionInstalled
                      ? <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-2xs font-black rounded-full">✓ Oui</span>
                      : <span className="text-slate-300 text-2xs font-bold">—</span>}
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <span className={`font-black text-lg ${user.clientCount > 0 ? "text-slate-900" : "text-slate-300"}`}>{user.clientCount}</span>
                      {user.lastInjectionSite && (
                        <p className="text-2xs text-slate-400 font-medium truncate max-w-[100px]">{user.lastInjectionSite}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-black ${user.successRate >= 90 ? "text-green-600" : user.successRate >= 70 ? "text-amber-500" : user.successRate > 0 ? "text-red-500" : "text-slate-300"}`}>
                          {user.successRate > 0 ? `${user.successRate}%` : "—"}
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div className={`h-full rounded-full ${user.successRate >= 90 ? "bg-green-500" : user.successRate >= 70 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${user.successRate}%` }} />
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        {user.avgFields > 0 ? `${user.avgFields} champs/rempl.` : "Aucune donnée"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`font-black text-lg ${user.ocrScanCount > 0 ? "text-indigo-600" : "text-slate-300"}`}>{user.ocrScanCount}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`font-black text-lg ${user.relancesEmailCount > 0 ? "text-blue-600" : "text-slate-300"}`}>
                      {user.relancesEmailCount}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-500">
                    {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={9} className="px-8 py-12 text-center text-slate-400 font-bold">Aucun utilisateur trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
