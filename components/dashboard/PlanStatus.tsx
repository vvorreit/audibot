import React from "react";
import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";

interface PlanStatusProps {
  userData: {
    isPro: boolean;
    plan: string;
    pendingPlan: string | null;
    freeUntil: string | Date | null;
    isFreeActive: boolean;
  } | null;
  bilansWeek?: number;
  hasBilanAccess?: boolean;
}

export default function PlanStatus({ userData, bilansWeek, hasBilanAccess }: PlanStatusProps) {
  if (!userData) {
    return (
      <div className="bg-white rounded-card border border-slate-100 shadow-sm p-5 space-y-3 animate-pulse min-h-[220px]">
        <div className="h-3 w-24 bg-slate-100 rounded" />
        <div className="h-7 w-32 bg-slate-100 rounded" />
        <div className="h-2 w-full bg-slate-100 rounded-full" />
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-[220px]">
      {/* Accès offert — badge cadeau */}
      {userData.isFreeActive && userData.freeUntil && (
        <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-green-50 border border-green-200 rounded-xl">
          <span className="text-lg">🎁</span>
          <div>
            <p className="text-xs font-black text-green-800">Accès offert</p>
            <p className="text-2xs text-green-600 font-medium">
              Valable jusqu&apos;au {new Date(userData.freeUntil).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      )}

      {/* Downgrade planifié */}
      {userData.pendingPlan && (
        <div className="flex items-center justify-between px-3 py-2 mb-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-2xs text-amber-700 font-bold">
            ⏳ Passage à {userData.pendingPlan} au prochain cycle
          </p>
          <Link href="/dashboard/account" className="text-2xs text-amber-600 underline font-semibold shrink-0">
            Gérer
          </Link>
        </div>
      )}

      {/* Plan compact — lien vers account */}
      <Link
        href="/dashboard/account"
        className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-colors group"
      >
        <div>
          <p className="text-2xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Plan actuel</p>
          <p className="text-sm font-black text-slate-900">
            {userData.isPro
              ? (userData.plan === "EQUIPE" || userData.plan === "TEAM_5" || userData.plan === "TEAM_3" ? "Équipe" : userData.plan)
              : "Essai gratuit"}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </Link>

      {/* Bilans cette semaine */}
      {hasBilanAccess && bilansWeek != null && (
        <Link
          href="/dashboard/bilans"
          className="flex items-center gap-3 mt-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-2xl transition-colors group"
        >
          <Eye className="w-4 h-4 text-purple-500" />
          <div className="flex-1">
            <p className="text-sm font-black text-purple-900">{bilansWeek}</p>
            <p className="text-2xs text-purple-500 font-medium">bilan{bilansWeek !== 1 ? "s" : ""} cette semaine</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-purple-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
        </Link>
      )}
    </div>
  );
}
