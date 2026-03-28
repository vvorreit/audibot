"use client";

import { useEffect, useState } from "react";
import {
  getAllTeamsAdmin, purgeOrphanTeams, setUserPlan,
} from "../actions";
import {
  Building2, ChevronDown,
} from "lucide-react";

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

function PlanSelector({ userId, currentPlan, onChange }: {
  userId: string; currentPlan: string; onChange: (plan: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (plan: Plan) => {
    setOpen(false);
    setLoading(true);
    try {
      await setUserPlan(userId, plan);
      onChange(plan);
    } catch (err: any) {
      alert(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const plan = (PLANS.includes(currentPlan as Plan) ? currentPlan : "FREE") as Plan;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-2xs font-black uppercase tracking-wide transition-all ${PLAN_COLORS[plan]} hover:opacity-80`}
      >
        {loading ? "..." : plan}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden min-w-[110px]">
          {PLANS.map(p => (
            <button
              key={p}
              onClick={() => handleSelect(p)}
              className={`w-full text-left px-4 py-2.5 text-2xs font-black uppercase tracking-wide hover:bg-slate-50 transition-colors ${p === plan ? "text-blue-600" : "text-slate-600"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FillBar({ used, pending, limit }: { used: number; pending: number; limit: number }) {
  const pct = Math.min(100, ((used + pending) / limit) * 100);
  const full = used >= limit;
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${full ? "bg-red-500" : pct > 70 ? "bg-amber-400" : "bg-green-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-black ${full ? "text-red-500" : "text-slate-500"}`}>
        {used}/{limit}
        {pending > 0 && <span className="text-slate-300 font-semibold"> (+{pending} en attente)</span>}
      </span>
    </div>
  );
}

export default function TeamsContent() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  useEffect(() => {
    getAllTeamsAdmin().then(setTeams).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {Array.from({length:4}).map((_,i) => <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100"/>)}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={async () => {
            if (!confirm("Supprimer toutes les équipes sans membres ?")) return;
            const r = await purgeOrphanTeams();
            alert(`${r.count} équipe(s) orpheline(s) supprimée(s).`);
            getAllTeamsAdmin().then(setTeams);
          }}
          className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors border border-red-100"
        >
          🗑 Purger équipes orphelines
        </button>
      </div>
      {teams.length === 0 && (
        <div className="bg-white rounded-card p-12 text-center text-slate-400 font-bold border border-slate-100">Aucune équipe créée.</div>
      )}
      {teams.map(team => {
        const isFull = team.membersCount >= team.limit;
        const isExpanded = expandedTeam === team.id;
        return (
          <div key={team.id} className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
            <div
              className="px-8 py-6 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
            >
              {/* Team name + owner */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                    {team.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{team.name}</p>
                    <p className="text-xs font-medium text-slate-400">Gérant : {team.ownerName} — {team.ownerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Plan du gérant */}
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Plan gérant</p>
                  <PlanSelector
                    userId={team.ownerId}
                    currentPlan={team.ownerPlan}
                    onChange={plan => setTeams(prev => prev.map(t => t.id === team.id ? { ...t, ownerPlan: plan, limit: plan === "EQUIPE" ? 5 : plan === "TEAM_5" ? 5 : plan === "TEAM_3" ? 3 : 1 } : t))}
                  />
                </div>

                {/* Taux de remplissage */}
                <div>
                  <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-2">Remplissage</p>
                  <FillBar used={team.membersCount} pending={team.pendingCount} limit={team.limit} />
                </div>

                {/* Badge statut */}
                <span className={`px-3 py-1 rounded-full text-2xs font-black uppercase shrink-0 ${isFull ? "bg-red-100 text-red-500" : "bg-green-100 text-green-600"}`}>
                  {isFull ? "Complet" : "Places dispo"}
                </span>

                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>

            {/* Members list (expanded) */}
            {isExpanded && (
              <div className="border-t border-slate-50 px-8 py-5 space-y-3">
                <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-3">Membres ({team.membersCount}/{team.limit})</p>
                {team.members.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{m.name || "Inconnu"}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-2xs font-black uppercase ${m.teamRole === "OWNER" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                      {m.teamRole === "OWNER" ? "Gérant" : "Membre"}
                    </span>
                  </div>
                ))}
                {team.pendingInvites.length > 0 && (
                  <>
                    <p className="text-2xs font-black uppercase tracking-widest text-amber-500 mt-4 mb-2">Invitations en attente</p>
                    {team.pendingInvites.map((inv: any) => (
                      <div key={inv.id} className="flex items-center justify-between py-1.5">
                        <p className="text-sm text-slate-400 font-medium">{inv.email}</p>
                        <span className="px-3 py-1 bg-amber-50 text-amber-500 text-2xs font-black rounded-full uppercase">En attente</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
