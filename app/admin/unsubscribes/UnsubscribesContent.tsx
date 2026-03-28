"use client";

import { useEffect, useState } from "react";
import { UserX, RefreshCw, Download } from "lucide-react";

interface Unsubscribe {
  id: string;
  email: string;
  unsubscribedAt: string;
  reason: string | null;
}

const REASON_LABELS: Record<string, string> = {
  too_many_emails: "Trop d'emails",
  not_relevant: "Contenu non pertinent",
  other: "Autre",
};

export default function UnsubscribesContent() {
  const [rows, setRows] = useState<Unsubscribe[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/unsubscribes");
      const data = await res.json();
      setRows(data.unsubscribes ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleExportCsv() {
    window.open("/api/admin/unsubscribes?format=csv", "_blank");
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-end gap-2 mb-6">
        <button onClick={handleExportCsv} disabled={total === 0} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
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
            <div className="py-20 text-center text-slate-400 text-sm font-medium">Aucune d&eacute;sinscription pour l&apos;instant.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Email</th>
                  <th className="px-6 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-6 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Raison</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{r.email}</td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(r.unsubscribedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {r.reason ? (REASON_LABELS[r.reason] ?? r.reason) : <span className="text-slate-300">&mdash;</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

    </div>
  );
}
