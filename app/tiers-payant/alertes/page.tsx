"use client";

import { useEffect, useState, useCallback } from "react";
import { getAlertes, marquerTraitee } from "./actions";
import NavMenu from "@/components/NavMenu";
import AppFooter from "@/components/AppFooter";
import Link from "next/link";
import {
  Bell, CheckCircle, Clock, AlertTriangle, X,
} from "lucide-react";
import TiersPayantNav from "@/components/TiersPayantNav";

interface Alerte {
  id: string;
  dossierId: string | null;
  clientNom: string;
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

function joursRestants(dateExpiration: string): number {
  const now = new Date();
  const exp = new Date(dateExpiration);
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function urgenceColor(jours: number): string {
  if (jours <= 0) return "bg-red-100 text-red-700 border-red-200";
  if (jours <= 30) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-indigo-100 text-indigo-700 border-indigo-200";
}

function urgenceLabel(jours: number): string {
  if (jours <= 0) return "Expiree";
  if (jours <= 30) return `${jours}j restants`;
  return `${jours}j restants`;
}

export default function AlertesPage() {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTraitees, setShowTraitees] = useState(false);

  const [traiterModal, setTraiterModal] = useState<Alerte | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    getAlertes(showTraitees)
      .then(setAlertes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [showTraitees]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleTraiter = async () => {
    if (!traiterModal) return;
    setSubmitting(true);
    try {
      await marquerTraitee(traiterModal.id, commentaire || undefined);
      setSuccess("Alerte marquee comme traitee");
      setTraiterModal(null);
      setCommentaire("");
      loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 max-w-md">
          <h1 className="text-2xl font-black mb-4">Acces Refuse</h1>
          <p className="font-medium mb-6">{error}</p>
          <Link href="/dashboard" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Retour au dashboard</Link>
        </div>
      </div>
    );
  }

  const nonTraitees = alertes.filter((a) => !a.traitee);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavMenu />
      <main className="flex-1 text-slate-900 pb-20">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-black tracking-tight">Prescriptions ORL approchant les 2 ans</h1>
                <p className="text-slate-500 font-medium text-sm">Alertes d&apos;expiration pour les prescriptions ORL</p>
              </div>
              {nonTraitees.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-2xl">
                  <Bell className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-black text-red-600">{nonTraitees.length} alerte{nonTraitees.length > 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
            <TiersPayantNav />
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              {success}
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowTraitees(false)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!showTraitees ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-400 border border-slate-100"}`}
            >
              A traiter
            </button>
            <button
              onClick={() => setShowTraitees(true)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${showTraitees ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-400 border border-slate-100"}`}
            >
              Historique
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 font-bold text-indigo-600">Chargement...</div>
          ) : alertes.length === 0 ? (
            <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100">
              <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">{showTraitees ? "Aucune alerte dans l'historique." : "Aucune alerte en cours."}</p>
              <p className="text-slate-300 text-sm font-medium mt-1">Les alertes sont generees automatiquement.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertes.map((a) => {
                const jours = joursRestants(a.dateExpiration);
                const colorCls = urgenceColor(jours);

                return (
                  <div key={a.id} className={`bg-white rounded-[28px] shadow-sm border border-slate-100 p-6 transition-opacity ${a.traitee ? "opacity-50" : ""}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${jours <= 0 ? "bg-red-100" : jours <= 30 ? "bg-amber-100" : "bg-indigo-100"}`}>
                          {jours <= 0 ? (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          ) : jours <= 30 ? (
                            <Clock className="w-5 h-5 text-amber-600" />
                          ) : (
                            <Bell className="w-5 h-5 text-indigo-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-black text-sm">{a.clientNom}</h3>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${colorCls}`}>
                              {urgenceLabel(jours)}
                            </span>
                            {a.notifEmail && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-green-100 text-green-700">
                                Email envoye
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                            <span>Prescription ORL du {new Date(a.dateOrdonnance).toLocaleDateString("fr-FR")}</span>
                            <span>Expire le {new Date(a.dateExpiration).toLocaleDateString("fr-FR")}</span>
                          </div>
                          {a.traitee && a.traiteePar && (
                            <p className="text-xs text-green-600 font-bold mt-1">
                              Traitee par {a.traiteePar}
                              {a.traiteeAt && ` le ${new Date(a.traiteeAt).toLocaleDateString("fr-FR")}`}
                            </p>
                          )}
                          {a.commentaire && (
                            <p className="text-xs text-slate-400 italic mt-1">&quot;{a.commentaire}&quot;</p>
                          )}
                        </div>
                      </div>
                      {!a.traitee && (
                        <button
                          onClick={() => { setTraiterModal(a); setCommentaire(""); }}
                          className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors shrink-0"
                        >
                          Traiter
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <AppFooter />

      {traiterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setTraiterModal(null)}>
          <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-lg mx-4 p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-black text-lg">Traiter l&apos;alerte</h2>
                <p className="text-xs font-medium text-slate-400">{traiterModal.clientNom}</p>
              </div>
              <button onClick={() => setTraiterModal(null)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                  Commentaire
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Ex: Client contacte, nouvelle prescription ORL obtenue"
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTraiter}
                  disabled={submitting}
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
                >
                  {submitting ? "Enregistrement..." : "Marquer comme traitee"}
                </button>
                <button
                  onClick={() => setTraiterModal(null)}
                  className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
