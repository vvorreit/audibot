import type { FranchiseKPIs } from "../actions";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "@/components/charts";
import { ScanLine, Clock, TrendingDown, Banknote } from "lucide-react";
import { KPICard } from "./KPICard";
import { COLORS } from "./constants";

/* -- aggregateScansByDay -- */
function aggregateScansByDay(
  scansByDay: { date: string; count: number; memberId: string; memberName: string }[],
  members: { id: string; name: string | null; storeName: string | null }[]
): Record<string, string | number>[] {
  const dateMap = new Map<string, Record<string, number>>();
  for (const entry of scansByDay) {
    if (!dateMap.has(entry.date)) dateMap.set(entry.date, {});
    const dayData = dateMap.get(entry.date)!;
    const memberLabel = members.find((m) => m.id === entry.memberId)?.storeName
      ?? members.find((m) => m.id === entry.memberId)?.name
      ?? entry.memberId.slice(-6);
    dayData[memberLabel] = (dayData[memberLabel] ?? 0) + entry.count;
  }
  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));
}

export function TiersPayantTab({ tpData }: { tpData: FranchiseKPIs }) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard icon={ScanLine} label="Scans totaux" value={tpData.totalScans.toLocaleString("fr-FR")} color="text-blue-600" bgColor="bg-blue-50" />
        <KPICard icon={Clock} label="ROI (heures eco.)" value={`${tpData.roiHeures}h`} color="text-green-600" bgColor="bg-green-50" />
        <KPICard icon={TrendingDown} label="Taux de rejet" value={`${tpData.tauxRejet}%`} color="text-red-600" bgColor="bg-red-50" />
        <KPICard icon={Banknote} label="En attente" value={`${tpData.montantEnAttente.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} \u20ac`} color="text-amber-600" bgColor="bg-amber-50" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-card border border-slate-100 p-6">
          <h3 className="text-sm font-black text-slate-700 mb-4">Volume de scans par jour</h3>
          {tpData.scansByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={aggregateScansByDay(tpData.scansByDay, tpData.members)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip />
                <Legend />
                {tpData.members.map((m, i) => (
                  <Line key={m.id} type="monotone"
                    dataKey={m.storeName ?? m.name ?? m.id.slice(-6)}
                    stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-600 text-sm text-center py-8">Aucun scan sur cette periode.</p>}
        </div>

        <div className="bg-white rounded-card border border-slate-100 p-6">
          <h3 className="text-sm font-black text-slate-700 mb-4">Rejets par mutuelle</h3>
          {tpData.rejetsByMutuelle.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tpData.rejetsByMutuelle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mutuelle" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} name="Rejets" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-600 text-sm text-center py-8">Aucun rejet sur cette periode.</p>}
        </div>
      </div>

      <div className="bg-white rounded-card border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h3 className="text-sm font-black text-slate-700">Performance par magasin</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Magasin", "Scans", "Injections", "Dossiers", "Rejetes", "Taux rejet", "En attente"].map((h) => (
                  <th key={h} className="px-5 py-3 text-2xs font-black uppercase tracking-widest text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tpData.members.map((m) => {
                const taux = m.dossiersTotal > 0 ? Math.round((m.dossiersRejetes / m.dossiersTotal) * 100) : 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-800">{m.storeName ?? m.name ?? "\u2014"}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-blue-600">{m.scanCount}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-600">{m.injectionCount}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-600">{m.dossiersTotal}</td>
                    <td className="px-5 py-4 text-sm font-bold text-red-600">{m.dossiersRejetes}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-2xs font-black ${taux > 15 ? "bg-red-100 text-red-700" : taux > 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                        {taux}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-amber-600">
                      {m.montantEnAttente.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} &euro;
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
