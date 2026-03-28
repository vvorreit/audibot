"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  target: string | null;
  ip: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
  user: { name: string | null; email: string | null };
}

const ACTION_COLORS: Record<string, string> = {
  // Parcours Recorder
  "parcours.create":            "bg-green-100 text-green-700",
  "parcours.update":            "bg-blue-100 text-blue-700",
  "parcours.validate":          "bg-indigo-100 text-indigo-700",
  "parcours.restore":           "bg-amber-100 text-amber-700",
  "parcours.delete":            "bg-red-100 text-red-700",
  // Gestion utilisateurs
  "user.plan.change":           "bg-blue-100 text-blue-700",
  "user.role.change":           "bg-orange-100 text-orange-700",
  "user.pro.toggle":            "bg-violet-100 text-violet-700",
  "user.free_months.grant":     "bg-emerald-100 text-emerald-700",
  "user.free_months.revoke":    "bg-rose-100 text-rose-700",
  // Système
  "test-mail.send":             "bg-purple-100 text-purple-700",
};

const ACTION_LABELS: Record<string, string> = {
  "parcours.create":            "Parcours créé",
  "parcours.update":            "Parcours modifié",
  "parcours.validate":          "Parcours validé",
  "parcours.restore":           "Parcours restauré",
  "parcours.delete":            "Parcours supprimé",
  "user.plan.change":           "Plan modifié",
  "user.role.change":           "Rôle modifié",
  "user.pro.toggle":            "Statut Pro modifié",
  "user.free_months.grant":     "Mois gratuits offerts",
  "user.free_months.revoke":    "Mois gratuits révoqués",
  "test-mail.send":             "Email de test envoyé",
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 50;

  async function load(p: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?page=${p}&limit=${LIMIT}`);
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => load(page)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm font-medium">Chargement…</div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm font-medium">Aucun log d&apos;audit pour l&apos;instant.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-6 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Admin</th>
                  <th className="px-6 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Action</th>
                  <th className="px-6 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Cible</th>
                  <th className="px-6 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">IP</th>
                  <th className="px-6 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Détails</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("fr-FR", {
                        day: "2-digit", month: "2-digit", year: "2-digit",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-xs">{log.user.name ?? "—"}</div>
                      <div className="text-slate-400 text-2xs">{log.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-2xs font-black ${ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-600"}`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono max-w-[160px] truncate">
                      {log.target ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {log.ip ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono max-w-[200px] truncate">
                      {log.meta ? JSON.stringify(log.meta) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Précédent
            </button>
            <span className="text-xs font-bold text-slate-400">Page {page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Suivant <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

    </>
  );
}
