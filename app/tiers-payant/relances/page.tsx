"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getReglesRelance, createRegleRelance, updateRegleRelance, deleteRegleRelance,
  getDossiersPrevusRelance, executerRelance, reporterRelance, getRelancePortalData,
  previewRelanceEmail,
} from "./actions";
import Link from "next/link";
import {
  Plus, Bell, Send, CalendarClock, Trash2,
  CheckCircle, Pause, Play, ExternalLink, Eye, X,
} from "lucide-react";
import { SkeletonPage } from "@/components/SkeletonRow";
import { inputCls } from "@/components/ui/Input";

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

  const [previewData, setPreviewData] = useState<{ objet: string; contenu: string; html: string; destinataire: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [newDelai, setNewDelai] = useState("45");
  const [newAction, setNewAction] = useState("both");
  const [newMutuelle, setNewMutuelle] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([getReglesRelance(), getDossiersPrevusRelance()])
      .then(([r, p]) => { setRegles(r); setPrevus(p); })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
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
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleToggleRegle = async (id: string, actif: boolean) => {
    try {
      await updateRegleRelance(id, { actif: !actif });
      showSuccessMsg(actif ? "Regle desactivee" : "Regle activee");
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDeleteRegle = async (id: string) => {
    if (!confirm("Supprimer cette regle de relance ?")) return;
    try {
      await deleteRegleRelance(id);
      showSuccessMsg("Regle supprimee");
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleEnvoyer = async (dossierId: string, delaiJours: number, action: string) => {
    setActionLoading(dossierId);
    try {
      const result = await executerRelance(dossierId, delaiJours, action);
      showSuccessMsg(`Relance envoyee pour ${result.reference}`);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePreview = async (dossierId: string, delaiJours: number) => {
    setPreviewLoading(true);
    try {
      const result = await previewRelanceEmail(dossierId, delaiJours);
      setPreviewData(result);
    } catch (e) {
      alert("Erreur preview: " + String(e));
    } finally {
      setPreviewLoading(false);
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

  /* inputCls importé depuis ui/Input */

  return (
    <>


          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              {success}
            </div>
          )}

          {loading ? (
            <SkeletonPage />
          ) : (
            <div className="space-y-8">

              {/* Regles de relance */}
              <div className="bg-white rounded-card shadow-sm border border-slate-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-black text-lg">Regles de relance</h2>
                    <p className="text-xs text-slate-400 font-semibold">Max 3 relances auto par dossier</p>
                  </div>
                  <button
                    onClick={() => setShowAddRegle(!showAddRegle)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-2xl text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>

                {showAddRegle && (
                  <div className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-2xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Delai (jours) *</label>
                        <input type="number" min="1" value={newDelai} onChange={(e) => setNewDelai(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-2xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Action *</label>
                        <select value={newAction} onChange={(e) => setNewAction(e.target.value)} className={inputCls}>
                          <option value="email">Email</option>
                          <option value="dashboard">Dashboard</option>
                          <option value="both">Email + Dashboard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-2xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Mutuelle ciblee</label>
                        <select value={newMutuelle} onChange={(e) => setNewMutuelle(e.target.value)} className={inputCls}>
                          <option value="">Toutes</option>
                          {MUTUELLES_OPTIONS.map((m) => <option key={m} value={m}>{MUTUELLES_LABELS[m]}</option>)}
                        </select>
                      </div>
                    </div>
                    {addError && <p className="text-red-600 text-sm font-bold">{addError}</p>}
                    <div className="flex gap-3">
                      <button onClick={handleAddRegle} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700">Creer</button>
                      <button onClick={() => setShowAddRegle(false)} className="px-5 py-2.5 bg-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-300">Annuler</button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {regles.map((r) => (
                    <div key={r.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${r.actif ? "border-slate-100 bg-white" : "border-slate-50 bg-slate-50 opacity-60"}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm">
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
              <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
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
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-700`}>
                              J+{d.joursEcoules}
                            </span>
                            <span className="text-2xs font-bold text-slate-400">Relance {d.relanceCount + 1}/3</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {MUTUELLES_LABELS[d.mutuelle] || d.mutuelle} — {d.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR — envoye le {new Date(d.dateEnvoi).toLocaleDateString("fr-FR")}
                          </p>
                          {d.dernieresRelances.length > 0 && (
                            <p className="text-2xs text-slate-300 mt-1">
                              Dernieres relances : {d.dernieresRelances.map((r) => `J+${r.delaiJours} (${new Date(r.createdAt).toLocaleDateString("fr-FR")})`).join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handlePreview(d.dossierId, d.regle.delaiJours)}
                            disabled={previewLoading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors disabled:opacity-50"
                          >
                            <Eye className="w-3 h-3" />
                            Aperçu
                          </button>
                          <button
                            onClick={() => handleEnvoyer(d.dossierId, d.regle.delaiJours, d.regle.action)}
                            disabled={actionLoading === d.dossierId}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            Envoyer
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const data = await getRelancePortalData(d.dossierId);
                                const relancePayload = JSON.stringify({
                                  type: "OPTIBOT_RELANCE",
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
                              } catch (err: unknown) {
                                alert(err instanceof Error ? err.message : "Erreur");
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

      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPreviewData(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">Aperçu de l&apos;email</h2>
              <button onClick={() => setPreviewData(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="mb-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Destinataire</span>
              <p className="text-sm font-medium text-slate-700 mt-1">{previewData.destinataire}</p>
            </div>
            <div className="mb-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Objet</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{previewData.objet}</p>
            </div>
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Corps</span>
              <pre className="mt-2 text-sm text-slate-700 font-medium whitespace-pre-wrap bg-slate-50 rounded-xl p-4 leading-relaxed">{previewData.contenu}</pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
