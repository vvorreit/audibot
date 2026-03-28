"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Download } from "lucide-react";

interface ChurnRow {
  id: string;
  reason: string;
  comment: string | null;
  plan: string;
  retained: boolean;
  retentionOffer: string | null;
  createdAt: string;
  user: { name: string | null; email: string | null; plan: string };
}

const REASON_LABELS: Record<string, string> = {
  too_expensive: "Trop cher",
  missing_feature: "Fonctionnalité manquante",
  no_longer_needed: "Plus besoin",
};

const OFFER_LABELS: Record<string, string> = {
  free_month: "1 mois offert",
  feature_request: "Feature request",
};

export default function AdminChurnPage() {
  const [rows, setRows] = useState<ChurnRow[]>([]);
  const [stats, setStats] = useState({ total: 0, retained: 0, lost: 0 });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/churn");
      const data = await res.json();
      setRows(data.churnReasons ?? []);
      setStats(data.stats ?? { total: 0, retained: 0, lost: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-10">
      <div className="flex justify-end gap-2 mb-6">
        <button onClick={() => window.open("/api/admin/churn?format=csv", "_blank")} disabled={stats.total === 0} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
        <button onClick={() => load()} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm font-medium">Chargement&hellip;</div>
          ) : rows.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm font-medium">Aucune demande de churn pour l&apos;instant.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="px-5 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Utilisateur</th>
                    <th className="px-5 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Plan</th>
                    <th className="px-5 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Raison</th>
                    <th className="px-5 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Commentaire</th>
                    <th className="px-5 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Offre</th>
                    <th className="px-5 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-xs">
                        {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 text-xs">{r.user.name || "—"}</div>
                        <div className="text-slate-400 text-xs">{r.user.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-black rounded-full uppercase">
                          {r.plan}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium text-xs">
                        {REASON_LABELS[r.reason] ?? r.reason}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs max-w-[200px] truncate" title={r.comment ?? ""}>
                        {r.comment || <span className="text-slate-300">&mdash;</span>}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {r.retentionOffer ? (
                          <span className="text-amber-600 font-bold">{OFFER_LABELS[r.retentionOffer] ?? r.retentionOffer}</span>
                        ) : (
                          <span className="text-slate-300">&mdash;</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {r.retained ? (
                          <span className="inline-flex px-2.5 py-1 bg-green-50 text-green-700 text-xs font-black rounded-full">Retenu</span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 bg-red-50 text-red-600 text-xs font-black rounded-full">Perdu</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

    </div>
  );
}
