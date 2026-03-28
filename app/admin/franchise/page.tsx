"use client";

import { useEffect, useState } from "react";
import {
  getFranchiseLeads, updateFranchiseLeadStatus, getFranchiseAlerts,
} from "../actions";
import {
  Briefcase, AlertTriangle, ChevronRight,
} from "lucide-react";

const STATUS_FR: Record<string, string> = {
  NEW: "Nouveau",
  CONTACTED: "Contacté",
  QUALIFIED: "Qualifié",
  CLOSED_WON: "Signé",
  CLOSED_LOST: "Perdu",
};

export default function AdminFranchisePage() {
  const [franchiseLeads, setFranchiseLeads] = useState<any[]>([]);
  const [franchiseAlertCount, setFranchiseAlertCount] = useState(0);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFranchiseLeads(),
      getFranchiseAlerts(),
    ]).then(([leads, alerts]) => {
      setFranchiseLeads(leads);
      setFranchiseAlertCount(alerts.count);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {Array.from({length:5}).map((_,i) => <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100"/>)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-black text-xl">Leads Franchise ({franchiseLeads.length})</h2>
          {franchiseAlertCount > 0 && (
            <span className="flex items-center gap-1.5 bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              {franchiseAlertCount} non contacté(s) &gt;48h
            </span>
          )}
        </div>
      </div>

      {franchiseLeads.length === 0 ? (
        <div className="bg-white rounded-card border border-slate-100 p-16 text-center text-slate-400 font-bold">
          Aucun lead franchise pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {franchiseLeads.map((lead) => {
            const isAlert = lead.status === "NEW" && (Date.now() - new Date(lead.createdAt).getTime()) > 48 * 60 * 60 * 1000;
            const isExpanded = expandedLeadId === lead.id;
            const statusColors: Record<string, string> = {
              NEW: "bg-blue-100 text-blue-600",
              CONTACTED: "bg-amber-100 text-amber-600",
              QUALIFIED: "bg-purple-100 text-purple-600",
              CLOSED_WON: "bg-green-100 text-green-600",
              CLOSED_LOST: "bg-slate-100 text-slate-500",
            };
            return (
              <div
                key={lead.id}
                className={`bg-white rounded-card border shadow-sm p-6 transition-all ${isAlert ? "border-red-300 ring-1 ring-red-200" : "border-slate-100"}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-black text-slate-900 text-lg">{lead.company}</span>
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-black uppercase ${statusColors[lead.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {STATUS_FR[lead.status] ?? lead.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      {lead.name} · <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a> · {lead.phone}
                    </p>
                    <p className="text-xs text-slate-400 font-bold mt-1">
                      {lead.stores} magasins
                      {lead.reseau ? ` · Réseau: ${lead.reseau}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 items-end">
                    <select
                      value={lead.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        await updateFranchiseLeadStatus(lead.id, newStatus);
                        setFranchiseLeads((prev) => prev.map((l) =>
                          l.id === lead.id ? { ...l, status: newStatus } : l
                        ));
                      }}
                      className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 focus-visible:outline-none"
                    >
                      <option value="NEW">Nouveau</option>
                      <option value="CONTACTED">Contacté</option>
                      <option value="QUALIFIED">Qualifié</option>
                      <option value="CLOSED_WON">Signé</option>
                      <option value="CLOSED_LOST">Perdu</option>
                    </select>
                    <span className="text-2xs text-slate-400 font-bold">{new Date(lead.createdAt).toLocaleDateString("fr-FR")}</span>
                    {lead.statusHistory.length > 0 && (
                      <button
                        onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                        className="flex items-center gap-1 text-2xs text-slate-500 font-bold hover:text-blue-600 transition-colors"
                      >
                        <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        Historique ({lead.statusHistory.length})
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && lead.statusHistory.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-2xs font-black text-slate-400 uppercase tracking-widest mb-2">Historique des statuts</p>
                    <div className="space-y-1.5">
                      {lead.statusHistory.map((h: any) => (
                        <div key={h.id} className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400 font-medium shrink-0">{new Date(h.createdAt).toLocaleString("fr-FR")}</span>
                          <span className={`px-1.5 py-0.5 rounded text-2xs font-black ${statusColors[h.oldStatus] ?? "bg-slate-100 text-slate-500"}`}>{STATUS_FR[h.oldStatus] ?? h.oldStatus}</span>
                          <span className="text-slate-300">→</span>
                          <span className={`px-1.5 py-0.5 rounded text-2xs font-black ${statusColors[h.newStatus] ?? "bg-slate-100 text-slate-500"}`}>{STATUS_FR[h.newStatus] ?? h.newStatus}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
