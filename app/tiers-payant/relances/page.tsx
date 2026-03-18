"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getReglesRelance, createRegleRelance, updateRegleRelance, deleteRegleRelance,
  getDossiersPrevusRelance, executerRelance, reporterRelance, getRelancePortalData,
} from "./actions";
import NavMenu from "@/components/NavMenu";
import AppFooter from "@/components/AppFooter";
import Link from "next/link";
import {
  Plus, Bell, Clock, Send, CalendarClock, Trash2,
  CheckCircle, AlertTriangle, Pause, Play, ExternalLink,
} from "lucide-react";
import TiersPayantNav from "@/components/TiersPayantNav";

const MUTUELLES_LABELS: Record<string, string> = {
  CPAM: "CPAM", ALMERYS: "Almerys", VIAMEDIS: "Viamedis",
  ITELIS: "Itelis", KALIXIA: "Kalixia", CARTE_BLANCHE: "Carte Blanche",
  SANTECLAIR: "Santeclair", SEVEANE: "Seveane", SP_SANTE: "SP Sante",
  AUTRE: "Autre",
};

const MUTUELLES_OPTIONS = Object.keys(MUTUELLES_LABELS);

const ACTION_LABELS: Record<string, string> = {
  email: "Email", dashboard: "Dashboard", both: "Email + Dashboard",
};

interface Regle {
  id: string;
  delaiJours: number;
  action: string;
  mutuelle: string | null;
  actif: boolean;
}

interface DossierPrevu {
  dossierId: string;
  reference: string;
  mutuelle: string;
  montant: number;
  dateEnvoi: string;
  joursEcoules: number;
  relanceCount: number;
  regle: { delaiJours: number; action: string };
  createdBy: string;
  dernieresRelances: Array<{ type: string; delaiJours: number; createdAt: string }>;
}

export default function RelancesPage() {
  const [regles, setRegles] = useState<Regle[]>([]);
  const [prevus, setPrevus] = useState<DossierPrevu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddRegle, setShowAddRegle] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [newDelai, setNewDelai] = useState("45");
  const [newAction, setNewAction] = useState("both");
  const [newMutuelle, setNewMutuelle] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([getReglesRelance(), getDossiersPrevusRelance()])
      .then(([r, p]) => { setRegles(r); setPrevus(p); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showSuccessMsg = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleAddRegle = async () => {
    setAddError(null);
    const delai = parseInt(newDelai, 10);
    if (isNaN(delai) || delai < 1) { setAddError("Delai invalide."); return; }

    try {
      await createRegleRelance({ delaiJours: delai, action: newAction, mutuelle: newMutuelle || undefined });
      setShowAddRegle(false);
      setNewDelai("45");
      setNewAction("both");
      setNewMutuelle("");
      showSuccessMsg("Regle ajoutee");
      loadData();
    } catch (err: any) {
      setAddError(err.message);
    }
  };

  const handleToggleRegle = async (id: string, actif: boolean) => {
    try {
      await updateRegleRelance(id, { actif: !actif });
      showSuccessMsg(actif ? "Regle desactivee" : "Regle activee");
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRegle = async (id: string) => {
    if (!confirm("Supprimer cette regle de relance ?")) return;
    try {
      await deleteRegleRelance(id);
      showSuccessMsg("Regle supprimee");
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEnvoyer = async (dossierId: string, delaiJours: number, action: string) => {
    setActionLoading(dossierId);
    try {
      const result = await executerRelance(dossierId, delaiJours, action);
      showSuccessMsg(`Relance envoyee pour ${result.reference}`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReporter = async (dossierId: string, delaiJours: number) => {
    setActionLoading(dossierId);
    try {
      const result = await reporterRelance(dossierId, delaiJours);
      showSuccessMsg(`Relance reportee au ${new Date(result.dateReportee).toLocaleDateString("fr-FR")}`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 max-w-md">
          <h1 className="text-2xl font-black mb-4">Acces Refuse</h1>
          <p className="font-medium mb-6">{error}</p>
          <Link href="/dashboard" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Retour</Link>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavMenu />
      <main className="flex-1 text-slate-900 pb-20">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-black tracking-tight">Relances automatiques</h1>
                <p className="text-slate-500 font-medium text-sm">Configuration et suivi des relances TP</p>
              </div>
            </div>
            <TiersPayantNav />
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20 font-bold text-indigo-600">Chargement...</div>
          ) : (
            <div className="space-y-8">

              {/* Regles de relance */}
              <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-black text-lg">Regles de relance</h2>
                    <p className="text-xs text-slate-400 font-semibold">Max 3 relances auto par dossier</p>
                  </div>
                  <button
                    onClick={() => setShowAddRegle(!showAddRegle)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-2xl text-sm hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>

                {showAddRegle && (
                  <div className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Delai (jours) *</label>
                        <input type="number" min="1" value={newDelai} onChange={(e) => setNewDelai(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Action *</label>
                        <select value={newAction} onChange={(e) => setNewAction(e.target.value)} className={inputCls}>
                          <option value="email">Email</option>
                          <option value="dashboard">Dashboard</option>
                          <option value="both">Email + Dashboard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Mutuelle ciblee</label>
                        <select value={newMutuelle} onChange={(e) => setNewMutuelle(e.target.value)} className={inputCls}>
                          <option value="">Toutes</option>
                          {MUTUELLES_OPTIONS.map((m) => <option key={m} value={m}>{MUTUELLES_LABELS[m]}</option>)}
                        </select>
                      </div>
                    </div>
                    {addError && <p className="text-red-600 text-sm font-bold">{addError}</p>}
                    <div className="flex gap-3">
                      <button onClick={handleAddRegle} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700">Creer</button>
                      <button onClick={() => setShowAddRegle(false)} className="px-5 py-2.5 bg-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-300">Annuler</button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {regles.map((r) => (
                    <div key={r.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${r.actif ? "border-slate-100 bg-white" : "border-slate-50 bg-slate-50 opacity-60"}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">
                          J+{r.delaiJours}
                        </div>
                        <div>
                          <p className="font-bold text-sm">
                            Relance a J+{r.delaiJours}
                            {r.mutuelle && <span className="text-slate-400"> — {MUTUELLES_LABELS[r.mutuelle] || r.mutuelle}</span>}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">{ACTION_LABELS[r.action] || r.action}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRegle(r.id, r.actif)}
                          className={`p-2 rounded-xl transition-colors ${r.actif ? "hover:bg-amber-50 text-amber-500" : "hover:bg-green-50 text-green-500"}`}
                          title={r.actif ? "Desactiver" : "Activer"}
                        >
                          {r.actif ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteRegle(r.id)}
                          className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {regles.length === 0 && (
                    <p className="text-center text-slate-400 font-bold py-6">Aucune regle configuree.</p>
                  )}
                </div>
              </div>

              {/* Dossiers prevus pour relance */}
              <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <div>
                    <h2 className="font-black text-lg">Relances prevues</h2>
                    <p className="text-xs text-slate-400 font-semibold">{prevus.length} dossier{prevus.length !== 1 ? "s" : ""} a relancer</p>
                  </div>
                </div>

                {prevus.length === 0 ? (
                  <div className="px-8 py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Aucune relance prevue pour le moment.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {prevus.map((d) => (
                      <div key={d.dossierId} className="px-8 py-5 flex items-center gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-black text-sm">{d.reference}</span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-700">
                              J+{d.joursEcoules}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Relance {d.relanceCount + 1}/3</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {MUTUELLES_LABELS[d.mutuelle] || d.mutuelle} — {d.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR — envoye le {new Date(d.dateEnvoi).toLocaleDateString("fr-FR")}
                          </p>
                          {d.dernieresRelances.length > 0 && (
                            <p className="text-[10px] text-slate-300 mt-1">
                              Dernieres relances : {d.dernieresRelances.map((r) => `J+${r.delaiJours} (${new Date(r.createdAt).toLocaleDateString("fr-FR")})`).join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEnvoyer(d.dossierId, d.regle.delaiJours, d.regle.action)}
                            disabled={actionLoading === d.dossierId}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            Envoyer
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const data = await getRelancePortalData(d.dossierId);
                                const relancePayload = JSON.stringify({
                                  type: "AUDIBOT_RELANCE",
                                  reference: data.reference,
                                  mutuelle: data.mutuelle,
                                  montant: data.montant,
                                  dateEnvoi: data.dateEnvoi,
                                  referenceInterne: data.referenceInterne,
                                });
                                await navigator.clipboard.writeText(relancePayload);
                                if (data.portalUrl) {
                                  window.open(data.portalUrl, "_blank");
                                } else {
                                  alert("Pas de portail connu pour cette mutuelle.");
                                }
                              } catch (err: any) {
                                alert(err.message);
                              }
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-100 border border-indigo-200 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Portail
                          </button>
                          <button
                            onClick={() => handleReporter(d.dossierId, d.regle.delaiJours)}
                            disabled={actionLoading === d.dossierId}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors disabled:opacity-50"
                          >
                            <CalendarClock className="w-3 h-3" />
                            +7j
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
