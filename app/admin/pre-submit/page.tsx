export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPreSubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ portail?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const portailFilter = params.portail || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logWhere: any = {};
  if (portailFilter) logWhere.portail = portailFilter;

  let totalValidations = 0;
  let correctedCount = 0;
  let submittedAnywayCount = 0;
  let submittedCleanCount = 0;
  let portailStats: { portail: string; count: number }[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rejetPatterns: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentLogs: any[] = [];

  try {
    totalValidations = await prisma.preSubmitLog.count({ where: logWhere });
    correctedCount = await prisma.preSubmitLog.count({ where: { ...logWhere, action: "corrected" } });
    submittedAnywayCount = await prisma.preSubmitLog.count({ where: { ...logWhere, action: "submitted_anyway" } });
    submittedCleanCount = await prisma.preSubmitLog.count({ where: { ...logWhere, action: "submitted_clean" } });

    // Portail stats — groupBy en DB au lieu de fetch 10k rows
    const portailGroups = await prisma.preSubmitLog.groupBy({
      by: ["portail"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 100,
    });
    portailStats = portailGroups.map((g) => ({ portail: g.portail, count: g._count.id }));

    // Rejection patterns
    const patternWhere = portailFilter ? { portail: portailFilter } : {};
    rejetPatterns = await prisma.rejetPattern.findMany({
      where: patternWhere,
      orderBy: { tauxRejet: "desc" },
      take: 100,
    });

    // Recent logs
    recentLogs = await prisma.preSubmitLog.findMany({
      where: logWhere,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (e) {
    console.error("[admin/pre-submit] DB error:", e);
  }

  const pct = (n: number) => totalValidations > 0 ? ((n / totalValidations) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <p className="text-2xs font-black uppercase tracking-widest text-slate-600 mb-1">Total validations</p>
          <p className="text-3xl font-black text-slate-900">{totalValidations.toLocaleString("fr-FR")}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <p className="text-2xs font-black uppercase tracking-widest text-green-600 mb-1">Taux correction</p>
          <p className="text-3xl font-black text-green-700">{pct(correctedCount)}%</p>
          <p className="text-xs text-slate-600 mt-1">{correctedCount} corrigées</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <p className="text-2xs font-black uppercase tracking-widest text-red-600 mb-1">Soumis quand même</p>
          <p className="text-3xl font-black text-red-700">{pct(submittedAnywayCount)}%</p>
          <p className="text-xs text-slate-600 mt-1">{submittedAnywayCount} soumissions</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <p className="text-2xs font-black uppercase tracking-widest text-blue-600 mb-1">Soumissions propres</p>
          <p className="text-3xl font-black text-blue-700">{pct(submittedCleanCount)}%</p>
          <p className="text-xs text-slate-600 mt-1">{submittedCleanCount} propres</p>
        </div>
      </div>

      {/* Top portails */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-2xs font-black uppercase tracking-widest text-slate-600 mb-4">Top portails</h2>
        <div className="flex flex-wrap gap-2">
          {portailStats.map((s) => (
            <Link
              key={s.portail}
              href={`/admin/pre-submit${s.portail === portailFilter ? "" : `?portail=${encodeURIComponent(s.portail)}`}`}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                portailFilter === s.portail
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s.portail}{" "}
              <span className="opacity-60">({s.count})</span>
            </Link>
          ))}
          {portailFilter && (
            <Link
              href="/admin/pre-submit"
              className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            >
              Effacer filtre
            </Link>
          )}
          {portailStats.length === 0 && (
            <span className="text-xs text-slate-400">Aucun portail enregistré.</span>
          )}
        </div>
      </div>

      {/* Rejection patterns table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-4">Patterns de rejet</h2>
        {rejetPatterns.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm">Aucun pattern de rejet enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-2xs font-black uppercase tracking-widest text-slate-400">Portail</th>
                  <th className="text-left py-2 px-3 text-2xs font-black uppercase tracking-widest text-slate-400">Champ</th>
                  <th className="text-left py-2 px-3 text-2xs font-black uppercase tracking-widest text-slate-400">Pattern</th>
                  <th className="text-left py-2 px-3 text-2xs font-black uppercase tracking-widest text-slate-400">Code rejet</th>
                  <th className="text-right py-2 px-3 text-2xs font-black uppercase tracking-widest text-slate-400">Taux rejet</th>
                  <th className="text-right py-2 px-3 text-2xs font-black uppercase tracking-widest text-slate-400">Count</th>
                </tr>
              </thead>
              <tbody>
                {rejetPatterns.map((rp) => {
                  const tauxPct = (rp.tauxRejet * 100).toFixed(1);
                  const tauxColor =
                    rp.tauxRejet > 0.7
                      ? "text-red-700 bg-red-50"
                      : rp.tauxRejet > 0.4
                      ? "text-amber-700 bg-amber-50"
                      : "text-green-700 bg-green-50";
                  return (
                    <tr key={rp.id} className="border-b border-slate-50 hover:bg-slate-25">
                      <td className="py-2 px-3 font-mono text-xs">{rp.portail}</td>
                      <td className="py-2 px-3 text-xs">{rp.champ}</td>
                      <td className="py-2 px-3 font-mono text-xs text-slate-600 max-w-[200px] truncate">{rp.pattern}</td>
                      <td className="py-2 px-3">
                        {rp.rejetCode ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            {rp.rejetCode}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${tauxColor}`}>
                          {tauxPct}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-xs text-slate-600">
                        {rp.rejetCount} / {rp.totalCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent logs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-4">
          Logs récents
          <span className="ml-2 text-slate-300 font-medium normal-case tracking-normal">
            (derniers 50)
          </span>
        </h2>
        {recentLogs.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm">Aucun log pré-soumission.</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const actionBadge =
                log.action === "corrected"
                  ? "bg-green-100 text-green-700"
                  : log.action === "submitted_anyway"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700";
              const actionLabel =
                log.action === "corrected"
                  ? "Corrigé"
                  : log.action === "submitted_anyway"
                  ? "Soumis quand même"
                  : "Propre";
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono font-semibold text-slate-900">{log.portail}</span>
                      <span className="text-slate-300">|</span>
                      {log.errors > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                          {log.errors} erreur{log.errors > 1 ? "s" : ""}
                        </span>
                      )}
                      {log.warnings > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                          {log.warnings} avert.
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${actionBadge}`}>
                    {actionLabel}
                  </span>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
