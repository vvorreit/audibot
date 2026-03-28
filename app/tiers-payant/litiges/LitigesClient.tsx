"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getLitigeCandidates,
  getRejectedDossiers,
  logLitigePdfGeneration,
  type LitigeCandidate,
} from "./actions";
import SkeletonRow from "@/components/SkeletonRow";
import { Scale, FileText, AlertTriangle, Clock, CheckCircle } from "lucide-react";

type Tab = "impayes" | "rejetes";

export default function LitigesClient() {
  const [tab, setTab] = useState<Tab>("impayes");
  const [dossiers, setDossiers] = useState<LitigeCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    const fetcher =
      tab === "impayes" ? getLitigeCandidates : getRejectedDossiers;
    fetcher()
      .then(setDossiers)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerate = async (
    dossierId: string,
    type: "mise_en_demeure" | "contestation_rejet"
  ) => {
    setGenerating(dossierId);
    try {
      await logLitigePdfGeneration(dossierId, type);
      window.open(
        `/tiers-payant/litiges/pdf?dossierId=${dossierId}&type=${type}`,
        "_blank"
      );
      setSuccess(
        type === "mise_en_demeure"
          ? "Mise en demeure generee — le dossier passe en litige"
          : "Contestation generee — le dossier passe en litige"
      );
      loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setGenerating(null);
    }
  };

  const totalMontant = dossiers.reduce((s, d) => s + d.montant, 0);

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-card border border-red-100 max-w-md">
          <h1 className="text-2xl font-black mb-4">Accès Refusé</h1>
          <p className="font-medium mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
        {dossiers.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
              <Scale className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-black text-slate-600">{dossiers.length} dossier{dossiers.length > 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-black text-slate-600">{totalMontant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR</span>
            </div>
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
            onClick={() => setTab("impayes")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === "impayes"
                ? "bg-violet-600 text-white shadow"
                : "bg-white text-slate-400 border border-slate-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5 inline mr-1.5" />
            Impayes +90j
          </button>
          <button
            onClick={() => setTab("rejetes")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === "rejetes"
                ? "bg-violet-600 text-white shadow"
                : "bg-white text-slate-400 border border-slate-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
            Rejetes
          </button>
        </div>

        {loading ? (
          <table className="w-full">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={6} />
              ))}
            </tbody>
          </table>
        ) : dossiers.length === 0 ? (
          <div className="bg-white rounded-card p-12 text-center border border-slate-100">
            <Scale className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">
              {tab === "impayes"
                ? "Aucun dossier impaye de plus de 90 jours."
                : "Aucun dossier rejete."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {[
                      "Reference",
                      "Mutuelle",
                      "Montant",
                      "Date envoi",
                      tab === "impayes" ? "Jours" : "Motif",
                      "Relances",
                      "Actions",
                    ].map((h, i) => (
                      <th
                        key={i}
                        className="px-5 py-4 text-2xs font-black uppercase tracking-widest text-slate-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dossiers.map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-bold text-slate-700">
                        {d.reference}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-2xs font-black uppercase bg-indigo-100 text-indigo-700">
                          {d.mutuelle}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-black text-slate-900">
                        {d.montant.toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        EUR
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-500">
                        {new Date(d.dateEnvoi).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5 py-4">
                        {tab === "impayes" ? (
                          <span
                            className={`px-2 py-0.5 rounded text-2xs font-black ${
                              d.nombreJours > 120
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            J+{d.nombreJours}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-slate-500 max-w-[150px] truncate block">
                            {d.motifRejet || "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-400">
                        {d.relanceCount}/3
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {tab === "impayes" && (
                            <button
                              onClick={() =>
                                handleGenerate(d.id, "mise_en_demeure")
                              }
                              disabled={generating === d.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-violet-100 text-violet-700 font-bold rounded-lg text-2xs hover:bg-violet-200 transition-colors disabled:opacity-50"
                            >
                              <FileText className="w-3 h-3" />
                              Mise en demeure
                            </button>
                          )}
                          {tab === "rejetes" && (
                            <button
                              onClick={() =>
                                handleGenerate(d.id, "contestation_rejet")
                              }
                              disabled={generating === d.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 font-bold rounded-lg text-2xs hover:bg-amber-200 transition-colors disabled:opacity-50"
                            >
                              <FileText className="w-3 h-3" />
                              Contestation
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </>
  );
}
