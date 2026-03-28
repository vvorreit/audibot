"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getRejetsAutoDetectes, marquerRejetTraite } from "./actions";
import { getGuidancesForRejets } from "./guidance-actions";
import Link from "next/link";
import {
  Zap, CheckCircle, AlertTriangle, ExternalLink, Lightbulb,
} from "lucide-react";
import SkeletonRow from "@/components/SkeletonRow";
import GuidancePanel from "./GuidancePanel";

const PORTAIL_LABELS: Record<string, string> = {
  CPAM: "CPAM",
  ALMERYS: "Almerys",
  VIAMEDIS: "Viamedis",
  ITELIS: "Itelis",
  KALIXIA: "Kalixia",
  CARTE_BLANCHE: "Carte Blanche",
  SANTECLAIR: "Santeclair",
  SEVEANE: "Seveane",
  SP_SANTE: "SP Santé",
  WEMIND: "Wemind",
  GENERATION: "Génération",
  AUTRE: "Autre",
};

interface Rejet {
  id: string;
  portail: string;
  numeroDossier: string | null;
  motif: string | null;
  dateRejet: string | null;
  montant: number | null;
  dossierId: string | null;
  matched: boolean;
  traite: boolean;
  createdAt: string;
}

interface GuidanceData {
  id: string;
  titre: string;
  description: string;
  actionType: string;
  actionUrl: string | null;
  portail: string;
}

export default function RejetsPage() {
  const [rejets, setRejets] = useState<Rejet[]>([]);
  const [guidances, setGuidances] = useState<Record<string, GuidanceData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTraites, setShowTraites] = useState(false);
  const [expandedGuidance, setExpandedGuidance] = useState<Set<string>>(new Set());

  const loadData = useCallback(() => {
    setLoading(true);
    getRejetsAutoDetectes(showTraites)
      .then(async (data) => {
        setRejets(data);
        const g = await getGuidancesForRejets(
          data.map((r) => ({ id: r.id, motif: r.motif, portail: r.portail }))
        );
        setGuidances(g);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [showTraites]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const handleTraiter = async (id: string) => {
    try {
      await marquerRejetTraite(id);
      setSuccess("Rejet marque comme traite");
      loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-card border border-red-100 max-w-md">
          <h1 className="text-2xl font-black mb-4">Accès Refusé</h1>
          <p className="font-medium mb-6">{error}</p>
          <Link href="/dashboard" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Retour au dashboard</Link>
        </div>
      </div>
    );
  }

  const nonTraites = rejets.filter((r) => !r.traite);

  return (
    <>
      {nonTraites.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-2xl mb-6 w-fit">
          <Zap className="w-4 h-4 text-red-500" />
          <span className="text-sm font-black text-red-600">{nonTraites.length} nouveau{nonTraites.length > 1 ? "x" : ""}</span>
        </div>
      )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              {success}
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowTraites(false)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!showTraites ? "bg-blue-600 text-white shadow" : "bg-white text-slate-400 border border-slate-100"}`}
            >
              A traiter
            </button>
            <button
              onClick={() => setShowTraites(true)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${showTraites ? "bg-blue-600 text-white shadow" : "bg-white text-slate-400 border border-slate-100"}`}
            >
              Historique
            </button>
          </div>

          {loading ? (
            <table className="w-full"><tbody>{Array.from({length: 5}).map((_, i) => <SkeletonRow key={i} cols={5} />)}</tbody></table>
          ) : rejets.length === 0 ? (
            <div className="bg-white rounded-card p-12 text-center border border-slate-100">
              <Zap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">{showTraites ? "Aucun rejet dans l'historique." : "Aucun rejet detecte."}</p>
              <p className="text-slate-300 text-sm font-medium mt-1">Les rejets seront automatiquement importes par l&apos;extension Chrome.</p>
            </div>
          ) : (
            <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Portail", "N. Dossier", "Motif", "Date rejet", "Montant", "Match", "Detecte le", ""].map((h, i) => (
                        <th key={i} className="px-5 py-4 text-2xs font-black uppercase tracking-widest text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rejets.map((r) => {
                      const g = guidances[r.id];
                      const isExpanded = expandedGuidance.has(r.id);
                      return (
                        <React.Fragment key={r.id}>
                          <tr className={`hover:bg-slate-50/50 transition-colors ${r.traite ? "opacity-50" : ""}`}>
                            <td className="px-5 py-4">
                              <span className="px-2.5 py-1 rounded-lg text-2xs font-black uppercase bg-indigo-100 text-indigo-700">{PORTAIL_LABELS[r.portail] ?? r.portail}</span>
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-slate-700">{r.numeroDossier || "—"}</td>
                            <td className="px-5 py-4 text-sm font-medium text-slate-500 max-w-[200px] truncate">{r.motif || "—"}</td>
                            <td className="px-5 py-4 text-sm font-bold text-slate-500">
                              {r.dateRejet ? new Date(r.dateRejet).toLocaleDateString("fr-FR") : "—"}
                            </td>
                            <td className="px-5 py-4 text-sm font-black">
                              {r.montant != null ? `${r.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR` : "—"}
                            </td>
                            <td className="px-5 py-4">
                              {r.matched ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-2xs font-black">
                                  <CheckCircle className="w-3 h-3" /> Associe
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-2xs font-black">
                                  <AlertTriangle className="w-3 h-3" /> Non identifie
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-xs font-bold text-slate-400">
                              {new Date(r.createdAt).toLocaleString("fr-FR")}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                {g && !r.traite && (
                                  <button
                                    onClick={() => {
                                      setExpandedGuidance((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(r.id)) next.delete(r.id);
                                        else next.add(r.id);
                                        return next;
                                      });
                                    }}
                                    title="Resolution guidee"
                                    className={`p-2 rounded-lg transition-colors ${isExpanded ? "bg-amber-100 text-amber-600" : "hover:bg-amber-50 text-amber-400"}`}
                                  >
                                    <Lightbulb className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {!r.traite && r.dossierId && (
                                  <Link href="/tiers-payant" className="p-2 rounded-lg hover:bg-blue-50 text-blue-500">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                )}
                                {!r.traite && (
                                  <button
                                    onClick={() => handleTraiter(r.id)}
                                    className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg text-2xs hover:bg-slate-200 transition-colors"
                                  >
                                    Traiter
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {g && isExpanded && <GuidancePanel guidance={g} />}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </>
  );
}
