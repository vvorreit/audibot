"use client";

import { useEffect, useState, useCallback } from "react";
import { getFranchiseAnalytics, type FranchiseKPIs } from "./actions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "@/components/charts";
import {
  Store,
  ScanLine,
  Clock,
  TrendingDown,
  Banknote,
  CheckCircle,
} from "lucide-react";

type Period = "7d" | "30d" | "90d" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 jours",
  "30d": "30 jours",
  "90d": "90 jours",
  all: "Tout",
};

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export default function FranchiseDashboard() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<FranchiseKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    getFranchiseAnalytics(period)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-red-50 text-red-600 p-8 rounded-card border border-red-100 max-w-md text-center">
          <h1 className="text-2xl font-black mb-4">Acces Refuse</h1>
          <p className="font-medium">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Store className="w-8 h-8 text-blue-600" />
              Dashboard Franchise
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Vue agregee de tous vos magasins
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  period === p
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-slate-400 border border-slate-100"
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {loading || !data ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-card border border-slate-100 p-6 animate-pulse"
              >
                <div className="h-4 bg-slate-100 rounded w-20 mb-3" />
                <div className="h-8 bg-slate-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KPICard
                icon={ScanLine}
                label="Scans totaux"
                value={data.totalScans.toLocaleString("fr-FR")}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <KPICard
                icon={Clock}
                label="ROI (heures economisees)"
                value={`${data.roiHeures}h`}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
              />
              <KPICard
                icon={TrendingDown}
                label="Taux de rejet"
                value={`${data.tauxRejet}%`}
                color="text-red-600"
                bgColor="bg-red-50"
              />
              <KPICard
                icon={Banknote}
                label="En attente"
                value={`${data.montantEnAttente.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR`}
                color="text-amber-600"
                bgColor="bg-amber-50"
              />
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Scans par jour */}
              <div className="bg-white rounded-card border border-slate-100 p-6">
                <h3 className="text-sm font-black text-slate-700 mb-4">
                  Volume de scans par jour
                </h3>
                {data.scansByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={aggregateScansByDay(data.scansByDay, data.members)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        tickFormatter={(d: string) =>
                          new Date(d).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                          })
                        }
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip />
                      <Legend />
                      {data.members.map((m, i) => (
                        <Line
                          key={m.id}
                          type="monotone"
                          dataKey={m.storeName ?? m.name ?? m.id.slice(-6)}
                          stroke={COLORS[i % COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-sm font-medium text-center py-8">
                    Aucun scan sur cette periode.
                  </p>
                )}
              </div>

              {/* Rejets par mutuelle */}
              <div className="bg-white rounded-card border border-slate-100 p-6">
                <h3 className="text-sm font-black text-slate-700 mb-4">
                  Rejets par mutuelle
                </h3>
                {data.rejetsByMutuelle.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.rejetsByMutuelle}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="mutuelle"
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} name="Rejets" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-sm font-medium text-center py-8">
                    Aucun rejet sur cette periode.
                  </p>
                )}
              </div>
            </div>

            {/* Members table */}
            <div className="bg-white rounded-card border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50">
                <h3 className="text-sm font-black text-slate-700">
                  Performance par membre
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {[
                        "Membre",
                        "Magasin",
                        "Scans",
                        "Injections",
                        "Dossiers",
                        "Rejetes",
                        "Taux rejet",
                        "En attente",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-2xs font-black uppercase tracking-widest text-slate-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.members.map((m) => {
                      const taux =
                        m.dossiersTotal > 0
                          ? Math.round(
                              (m.dossiersRejetes / m.dossiersTotal) * 100
                            )
                          : 0;
                      return (
                        <tr
                          key={m.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-5 py-4 text-sm font-bold text-slate-700">
                            {m.name ?? m.email ?? "—"}
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-slate-500">
                            {m.storeName ?? "—"}
                          </td>
                          <td className="px-5 py-4 text-sm font-black text-blue-600">
                            {m.scanCount}
                          </td>
                          <td className="px-5 py-4 text-sm font-bold text-slate-600">
                            {m.injectionCount}
                          </td>
                          <td className="px-5 py-4 text-sm font-bold text-slate-600">
                            {m.dossiersTotal}
                          </td>
                          <td className="px-5 py-4 text-sm font-bold text-red-600">
                            {m.dossiersRejetes}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-0.5 rounded text-2xs font-black ${
                                taux > 15
                                  ? "bg-red-100 text-red-700"
                                  : taux > 5
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {taux}%
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm font-black text-amber-600">
                            {m.montantEnAttente.toLocaleString("fr-FR", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            EUR
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: typeof ScanLine;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-card border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${bgColor}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-2xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function aggregateScansByDay(
  scansByDay: { date: string; count: number; memberId: string; memberName: string }[],
  members: { id: string; name: string | null; storeName: string | null }[]
): Record<string, string | number>[] {
  const dateMap = new Map<string, Record<string, number>>();

  for (const entry of scansByDay) {
    if (!dateMap.has(entry.date)) {
      dateMap.set(entry.date, {});
    }
    const dayData = dateMap.get(entry.date)!;
    const memberLabel =
      members.find((m) => m.id === entry.memberId)?.storeName ??
      members.find((m) => m.id === entry.memberId)?.name ??
      entry.memberId.slice(-6);
    dayData[memberLabel] = (dayData[memberLabel] ?? 0) + entry.count;
  }

  return Array.from(dateMap.entries())
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
    .sort((a, b) => (a.date as string).localeCompare(b.date as string));
}
