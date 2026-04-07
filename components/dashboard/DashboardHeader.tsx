import React from "react";
import Link from "next/link";
import { Timer } from "lucide-react";

interface DashboardHeaderProps {
  clientCount: number;
  monthlyStats: { scansThisMonth: number; dossiersThisMonth: number; montantTPThisMonth: number } | null;
}

export default function DashboardHeader({ clientCount, monthlyStats }: DashboardHeaderProps) {
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-card shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden">
      <div className="w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black">Tableau de bord</h1>
            <p className="text-2xs text-slate-600 font-medium mt-0.5">
              {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </p>
          </div>
          {clientCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-xl border border-green-100">
              <Timer className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-black text-green-700">
                {clientCount * 7 >= 60
                  ? `${Math.floor((clientCount * 7) / 60)}h${String((clientCount * 7) % 60).padStart(2, "0")}`
                  : `${clientCount * 7} min`} économisées
              </span>
            </div>
          )}
        </div>
        <Link href="/dashboard/historique" className="grid grid-cols-3 gap-3 group">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 group-hover:shadow-md transition-all">
            <p className="text-2xs font-black text-blue-200 uppercase tracking-widest mb-1.5">Scans ce mois</p>
            <p className="text-2xl font-black text-white">{monthlyStats?.scansThisMonth ?? "—"}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 group-hover:bg-slate-100 transition-all">
            <p className="text-2xs font-black text-slate-600 uppercase tracking-widest mb-1.5">Dossiers TP</p>
            <p className="text-2xl font-black text-slate-900">{monthlyStats?.dossiersThisMonth ?? "—"}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 group-hover:bg-slate-100 transition-all">
            <p className="text-2xs font-black text-slate-600 uppercase tracking-widest mb-1.5">Montant géré</p>
            <p className="text-2xl font-black text-slate-900">
              {monthlyStats ? `${monthlyStats.montantTPThisMonth.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €` : "—"}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
