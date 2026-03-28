"use client";

import { useEffect, useState, useCallback } from "react";
import { getAlertes, marquerTraitee } from "./actions";
import Link from "next/link";
import {
  Bell, CheckCircle, Clock, AlertTriangle,
} from "lucide-react";
import { SkeletonPage } from "@/components/SkeletonRow";

interface Alerte {
  id: string;
  dossierId: string | null;
  dateOrdonnance: string;
  dateExpiration: string;
  joursAvant: number;
  traitee: boolean;
  traiteePar: string | null;
  traiteeAt: string | null;
  commentaire: string | null;
  notifEmail: boolean;
  userName: string;
  createdAt: string;
}

function joursRestants(dateExpiration: string) {
  const diff = new Date(dateExpiration).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function urgenceColor(jours: number) {
  if (jours <= 7) return "bg-red-100 text-red-700 border-red-200";
  if (jours <= 30) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
}

export default function AlertesPage() {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTraitees, setShowTraitees] = useState(false);
  const [traitementId, setTraitementId] = useState<string | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [marking, setMarking] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    getAlertes(showTraitees)
      .then(setAlertes)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [showTraitees]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMarquer = async (id: string) => {
    setMarking(true);
    try {
      await marquerTraitee(id, commentaire);
      setTraitementId(null);
      setCommentaire("");
      setSuccess("Alerte marquee comme traitee");
      loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setMarking(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-card border border-red-100 max-w-md">
          <h1 className="text-2xl font-black mb-4">Accès Refusé</h1>
          <p className="font-medium mb-6">{error}</p>
          <Link href="/dashboard" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Retour</Link>
        </div>
      </div>
    );
  }

  const nonTraitees = alertes.filter((a) => !a.traitee);
  // const traitees = alertes.filter((a) => a.traitee); // unused for now

  return (
    <>
      {nonTraitees.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-2xl mb-6 w-fit">
          <Bell className="w-4 h-4 text-red-500" />
          <span className="text-sm font-black text-red-600">{nonTraitees.length} alerte{nonTraitees.length > 1 ? "s" : ""}</span>
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
              onClick={() => setShowTraitees(false)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!showTraitees ? "bg-blue-600 text-white shadow" : "bg-white text-slate-400 border border-slate-100"}`}
            >
              A traiter ({nonTraitees.length})
            </button>
            <button
              onClick={() => setShowTraitees(true)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${showTraitees ? "bg-blue-600 text-white shadow" : "bg-white text-slate-400 border border-slate-100"}`}
            >
              Historique
            </button>
          </div>

          {loading ? (
            <SkeletonPage />
          ) : (
            <div className="space-y-4">
              {(showTraitees ? alertes : nonTraitees).length === 0 ? (
                <div className="bg-white rounded-card p-12 text-center border border-slate-100">
                  <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">{showTraitees ? "Aucune alerte dans l'historique." : "Aucune alerte en cours."}</p>
                </div>
              ) : (
                (showTraitees ? alertes : nonTraitees).map((a) => {
                  const jours = joursRestants(a.dateExpiration);
                  const color = urgenceColor(jours);
                  const isExpanded = traitementId === a.id;

                  return (
                    <div key={a.id} className={`bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden ${a.traitee ? "opacity-60" : ""}`}>
                      <div className="p-6 flex items-start gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${jours <= 7 ? "bg-red-100" : jours <= 30 ? "bg-amber-100" : "bg-blue-100"}`}>
                          {jours <= 7 ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <Clock className="w-5 h-5 text-amber-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <span className="font-black text-sm">{a.dossierId ? `#${a.dossierId.slice(-6)}` : "—"}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-2xs font-black uppercase border ${color}`}>
                              {jours > 0 ? `Expire dans ${jours}j` : "Expiree"}
                            </span>
                            <span className="text-2xs font-bold text-slate-400">Alerte J-{a.joursAvant}</span>
                            {a.notifEmail && <span className="text-2xs font-bold text-green-500">Email envoye</span>}
                          </div>
                          <p className="text-xs text-slate-500">
                            Ordonnance du {new Date(a.dateOrdonnance).toLocaleDateString("fr-FR")} — Expire le {new Date(a.dateExpiration).toLocaleDateString("fr-FR")}
                          </p>
                          {a.traitee && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                              Traitee par {a.traiteePar} le {a.traiteeAt ? new Date(a.traiteeAt).toLocaleDateString("fr-FR") : "—"}
                              {a.commentaire && <span className="text-slate-400 italic ml-2">&quot;{a.commentaire}&quot;</span>}
                            </p>
                          )}
                        </div>
                        {!a.traitee && (
                          <div className="flex items-center gap-2 shrink-0">
                            {a.dossierId && (
                              <Link
                                href="/tiers-payant"
                                className="px-3 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                              >
                                Voir dossier
                              </Link>
                            )}
                            <button
                              onClick={() => setTraitementId(isExpanded ? null : a.id)}
                              className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl text-xs hover:bg-green-700 transition-colors"
                            >
                              Traiter
                            </button>
                          </div>
                        )}
                      </div>
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-0 border-t border-slate-50">
                          <div className="bg-slate-50 rounded-2xl p-4 mt-3">
                            <label className="block text-2xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Commentaire (optionnel)</label>
                            <textarea
                              value={commentaire}
                              onChange={(e) => setCommentaire(e.target.value)}
                              placeholder="Ex: Client recontacte, nouvelle ordonnance obtenue"
                              rows={2}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-green-600 outline-none resize-none"
                            />
                            <div className="flex gap-3 mt-3">
                              <button
                                onClick={() => handleMarquer(a.id)}
                                disabled={marking}
                                className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 disabled:opacity-50"
                              >
                                {marking ? "..." : "Marquer traitee"}
                              </button>
                              <button
                                onClick={() => { setTraitementId(null); setCommentaire(""); }}
                                className="px-5 py-2.5 bg-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-300"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
      </>
  );
}
