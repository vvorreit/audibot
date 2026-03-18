"use client";

import { Fragment, useEffect, useState } from "react";
import { createDossierTP, getDossiersTP, updateStatutDossierTP } from "./actions";
import NavMenu from "@/components/NavMenu";
import AppFooter from "@/components/AppFooter";
import Link from "next/link";
import {
  Plus, FileText, Clock, CheckCircle, XCircle, AlertTriangle,
  X, History, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import TiersPayantNav from "@/components/TiersPayantNav";

const MUTUELLES = [
  { value: "CPAM", label: "CPAM" },
  { value: "ALMERYS", label: "Almerys" },
  { value: "VIAMEDIS", label: "Viamedis" },
  { value: "ITELIS", label: "Itelis" },
  { value: "KALIXIA", label: "Kalixia" },
  { value: "CARTE_BLANCHE", label: "Carte Blanche" },
  { value: "SANTECLAIR", label: "Santeclair" },
  { value: "SEVEANE", label: "Seveane" },
  { value: "SP_SANTE", label: "SP Sante" },
  { value: "AUTRE", label: "Autre" },
] as const;

const STATUT_CONFIG: Record<string, { label: string; color: string; bgBtn: string; icon: React.ElementType }> = {
  EN_ATTENTE: { label: "En attente", color: "bg-amber-100 text-amber-700", bgBtn: "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200", icon: Clock },
  RECU: { label: "Recu", color: "bg-green-100 text-green-700", bgBtn: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200", icon: CheckCircle },
  REJETE: { label: "Rejete", color: "bg-red-100 text-red-700", bgBtn: "bg-red-50 text-red-600 hover:bg-red-100 border-red-200", icon: XCircle },
  EN_LITIGE: { label: "En litige", color: "bg-purple-100 text-purple-700", bgBtn: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200", icon: AlertTriangle },
};

const MOTIFS_REJET = [
  { value: "doublon", label: "Doublon" },
  { value: "piece_manquante", label: "Piece manquante" },
  { value: "delai_depasse", label: "Delai depasse" },
  { value: "droits_expires", label: "Droits expires" },
  { value: "autre", label: "Autre" },
] as const;

interface HistoriqueEntry {
  id: string;
  ancienStatut: string;
  nouveauStatut: string;
  commentaire: string | null;
  auteurNom: string;
  createdAt: string;
}

interface DossierTP {
  id: string;
  reference: string;
  mutuelle: string;
  montant: number;
  dateEnvoi: string;
  numeroAdherent: string | null;
  referenceInterne: string | null;
  statut: string;
  montantRecu: number | null;
  dateReception: string | null;
  motifRejet: string | null;
  commentaire: string | null;
  mode: string | null;
  createdBy: string;
  createdAt: string;
  historique: HistoriqueEntry[];
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function StatusModal({ dossier, targetStatut, onClose, onSuccess }: {
  dossier: DossierTP;
  targetStatut: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [montantRecu, setMontantRecu] = useState(String(dossier.montant));
  const [dateReception, setDateReception] = useState(todayString());
  const [motifRejet, setMotifRejet] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = STATUT_CONFIG[targetStatut];
  const Icon = cfg.icon;

  const labelCls = "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5";
  const inputCls = "w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await updateStatutDossierTP({
        dossierId: dossier.id,
        nouveauStatut: targetStatut,
        montantRecu: targetStatut === "RECU" ? parseFloat(montantRecu) : undefined,
        dateReception: targetStatut === "RECU" ? dateReception : undefined,
        motifRejet: targetStatut === "REJETE" ? motifRejet || undefined : undefined,
        commentaire: commentaire || undefined,
      });
      onSuccess(`${result.reference} passe en "${cfg.label}"`);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise a jour.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-lg mx-4 p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${cfg.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg">Passer en &quot;{cfg.label}&quot;</h2>
              <p className="text-xs font-medium text-slate-400">{dossier.reference}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {targetStatut === "RECU" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Montant recu (EUR) *</label>
                <input
                  type="number" step="0.01" min="0.01"
                  value={montantRecu}
                  onChange={(e) => setMontantRecu(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Date reception *</label>
                <input
                  type="date"
                  value={dateReception}
                  max={todayString()}
                  onChange={(e) => setDateReception(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          )}

          {targetStatut === "REJETE" && (
            <div>
              <label className={labelCls}>Motif du rejet</label>
              <select value={motifRejet} onChange={(e) => setMotifRejet(e.target.value)} className={inputCls}>
                <option value="">Aucun motif</option>
                {MOTIFS_REJET.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelCls}>
              Commentaire {targetStatut === "EN_LITIGE" ? "*" : ""}
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder={targetStatut === "EN_LITIGE" ? "Decrivez le litige..." : "Optionnel..."}
              rows={3}
              className={inputCls + " resize-none"}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? "Mise a jour..." : "Confirmer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-sm"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusButtons({ dossier, onAction }: {
  dossier: DossierTP;
  onAction: (statut: string) => void;
}) {
  const availableStatuts = (["EN_ATTENTE", "RECU", "REJETE", "EN_LITIGE"] as const).filter(
    (s) => s !== dossier.statut
  );

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {availableStatuts.map((s) => {
        const cfg = STATUT_CONFIG[s];
        const Icon = cfg.icon;
        return (
          <button
            key={s}
            onClick={() => onAction(s)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border transition-all ${cfg.bgBtn}`}
          >
            <Icon className="w-3 h-3" />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

function HistoriquePanel({ historique }: { historique: HistoriqueEntry[] }) {
  if (historique.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {historique.map((h) => {
        const fromCfg = STATUT_CONFIG[h.ancienStatut] || STATUT_CONFIG.EN_ATTENTE;
        const toCfg = STATUT_CONFIG[h.nouveauStatut] || STATUT_CONFIG.EN_ATTENTE;
        return (
          <div key={h.id} className="flex items-start gap-3 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-600">{h.auteurNom}</span>
              {" : "}
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black ${fromCfg.color}`}>{fromCfg.label}</span>
              <span className="mx-1 text-slate-300">&rarr;</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black ${toCfg.color}`}>{toCfg.label}</span>
              <span className="text-slate-300 ml-2">{new Date(h.createdAt).toLocaleString("fr-FR")}</span>
              {h.commentaire && (
                <p className="text-slate-400 mt-0.5 italic">&quot;{h.commentaire}&quot;</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TiersPayantPage() {
  const [dossiers, setDossiers] = useState<DossierTP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{ dossier: DossierTP; statut: string } | null>(null);

  type SortKey = "reference" | "mutuelle" | "montant" | "dateEnvoi" | "statut" | "mode";
  const [sortKey, setSortKey] = useState<SortKey>("dateEnvoi");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "montant" || key === "dateEnvoi" ? "desc" : "asc");
    }
  };

  /* Masquer les dossiers <= 1€ (pas de relance nécessaire) */
  const filteredDossiers = dossiers.filter((d) => d.montant > 1);

  const sortedDossiers = [...filteredDossiers].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "reference":
        cmp = a.reference.localeCompare(b.reference);
        break;
      case "mutuelle":
        cmp = a.mutuelle.localeCompare(b.mutuelle);
        break;
      case "montant":
        cmp = a.montant - b.montant;
        break;
      case "dateEnvoi":
        cmp = new Date(a.dateEnvoi).getTime() - new Date(b.dateEnvoi).getTime();
        break;
      case "statut":
        cmp = a.statut.localeCompare(b.statut);
        break;
      case "mode":
        cmp = (a.mode || "").localeCompare(b.mode || "");
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const [mutuelle, setMutuelle] = useState("");
  const [montant, setMontant] = useState("");
  const [dateEnvoi, setDateEnvoi] = useState(todayString());
  const [numeroAdherent, setNumeroAdherent] = useState("");
  const [referenceInterne, setReferenceInterne] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const loadDossiers = () => {
    getDossiersTP()
      .then(setDossiers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDossiers(); }, []);

  const resetForm = () => {
    setMutuelle("");
    setMontant("");
    setDateEnvoi(todayString());
    setNumeroAdherent("");
    setReferenceInterne("");
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!mutuelle) { setFormError("Veuillez selectionner une mutuelle."); return; }
    const montantNum = parseFloat(montant);
    if (isNaN(montantNum) || montantNum <= 0) { setFormError("Le montant doit etre superieur a 0."); return; }
    if (!dateEnvoi) { setFormError("La date d'envoi est requise."); return; }
    const dateObj = new Date(dateEnvoi);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateObj > today) { setFormError("La date d'envoi ne peut pas etre dans le futur."); return; }

    setSubmitting(true);
    try {
      const result = await createDossierTP({
        mutuelle,
        montant: montantNum,
        dateEnvoi,
        numeroAdherent: numeroAdherent || undefined,
        referenceInterne: referenceInterne || undefined,
      });
      setSuccess(`Dossier ${result.reference} enregistre`);
      resetForm();
      setShowForm(false);
      setLoading(true);
      loadDossiers();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setFormError(err.message || "Erreur lors de la creation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusSuccess = (msg: string) => {
    setStatusModal(null);
    setSuccess(msg);
    setLoading(true);
    loadDossiers();
    setTimeout(() => setSuccess(null), 5000);
  };

  if (loading && dossiers.length === 0) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-indigo-600">Chargement...</div>;
  }

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

  const labelCls = "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5";
  const inputCls = "w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavMenu />
      <main className="flex-1 text-slate-900 pb-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-black tracking-tight">Dossiers Tiers-Payant</h1>
                <p className="text-slate-500 font-medium text-sm">Suivi des remboursements mutuelles</p>
              </div>
              <button
                onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Nouveau dossier
              </button>
            </div>
            <TiersPayantNav />
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              {success}
            </div>
          )}

          {showForm && (
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 mb-8">
              <h2 className="text-lg font-black mb-6">Enregistrer un dossier</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Mutuelle *</label>
                    <select value={mutuelle} onChange={(e) => setMutuelle(e.target.value)} className={inputCls}>
                      <option value="">Selectionner...</option>
                      {MUTUELLES.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Montant (EUR) *</label>
                    <input type="number" step="0.01" min="0.01" value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Date d&apos;envoi *</label>
                    <input type="date" value={dateEnvoi} max={todayString()} onChange={(e) => setDateEnvoi(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>N. adherent</label>
                    <input type="text" value={numeroAdherent} onChange={(e) => setNumeroAdherent(e.target.value)} placeholder="Ex: 123456789" className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Reference interne</label>
                    <input type="text" value={referenceInterne} onChange={(e) => setReferenceInterne(e.target.value)} placeholder="Ex: CMD-2026-042" className={inputCls} />
                  </div>
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">{formError}</div>
                )}
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50">
                    {submitting ? "Enregistrement..." : "Enregistrer le dossier"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-sm">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex gap-6 items-start">
          <div className="flex-1 bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden min-w-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {([
                      { key: "reference", label: "Reference" },
                      { key: "mutuelle", label: "Mutuelle" },
                      { key: "mode", label: "Mode" },
                      { key: "montant", label: "Montant" },
                      { key: "dateEnvoi", label: "Date envoi" },
                      { key: "statut", label: "Statut" },
                      { key: null, label: "Actions" },
                      { key: null, label: "" },
                    ] as { key: SortKey | null; label: string }[]).map((col, i) => (
                      <th key={i} className="px-5 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {col.key ? (
                          <button
                            onClick={() => toggleSort(col.key!)}
                            className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors group"
                          >
                            {col.label}
                            {sortKey === col.key ? (
                              sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-500" /> : <ArrowDown className="w-3 h-3 text-indigo-500" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                            )}
                          </button>
                        ) : col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedDossiers.map((d) => {
                    const statutCfg = STATUT_CONFIG[d.statut] || STATUT_CONFIG.EN_ATTENTE;
                    const StatutIcon = statutCfg.icon;
                    const mutLabel = MUTUELLES.find((m) => m.value === d.mutuelle)?.label || d.mutuelle;
                    const isExpanded = expandedRow === d.id;
                    const motifLabel = d.motifRejet ? MOTIFS_REJET.find((m) => m.value === d.motifRejet)?.label || d.motifRejet : null;

                    return (
                      <Fragment key={d.id}>
                        <tr className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 align-top">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-indigo-500" />
                              <div>
                                <span className="font-black text-sm">{d.reference}</span>
                                {d.referenceInterne && <p className="text-[10px] text-slate-400 font-medium">{d.referenceInterne}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm font-bold text-slate-700 align-top">
                            {mutLabel}
                            {d.numeroAdherent && <p className="text-[10px] text-slate-400 font-medium">N. {d.numeroAdherent}</p>}
                          </td>
                          <td className="px-5 py-4 align-top">
                            {d.mode ? (
                              <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                                d.mode === "B2" ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"
                              }`}>
                                {d.mode}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span className="text-sm font-black">{d.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR</span>
                            {d.montantRecu != null && (
                              <p className="text-[10px] font-bold text-green-600">Recu : {d.montantRecu.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR</p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm font-bold text-slate-500 align-top">
                            {new Date(d.dateEnvoi).toLocaleDateString("fr-FR")}
                            {d.dateReception && (
                              <p className="text-[10px] font-bold text-green-600">Recu le {new Date(d.dateReception).toLocaleDateString("fr-FR")}</p>
                            )}
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${statutCfg.color}`}>
                              <StatutIcon className="w-3 h-3" />
                              {statutCfg.label}
                            </span>
                            {motifLabel && <p className="text-[10px] text-red-400 font-medium mt-1">Motif : {motifLabel}</p>}
                            {d.commentaire && <p className="text-[10px] text-slate-400 italic mt-1 max-w-[200px] truncate">&quot;{d.commentaire}&quot;</p>}
                          </td>
                          <td className="px-5 py-4 align-top">
                            <StatusButtons dossier={d} onAction={(statut) => setStatusModal({ dossier: d, statut })} />
                          </td>
                          <td className="px-5 py-4 align-top">
                            {d.historique.length > 0 && (
                              <button
                                onClick={() => setExpandedRow(isExpanded ? null : d.id)}
                                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <History className="w-3 h-3" />
                                {d.historique.length}
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="px-5 pb-4 pt-0">
                              <div className="bg-slate-50 rounded-2xl p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Historique des changements</p>
                                <HistoriquePanel historique={d.historique} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                  {filteredDossiers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-8 py-16 text-center">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">Aucun dossier tiers-payant enregistre.</p>
                        <p className="text-slate-300 text-sm font-medium mt-1">Cliquez sur &quot;Nouveau dossier&quot; pour commencer.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Légende codes NOEMIE */}
          <div className="hidden xl:block w-64 shrink-0 bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 sticky top-24">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Codes NOEMIE</h3>
            <div className="space-y-2.5 text-xs">
              {[
                { code: "57", label: "Rejet signature", desc: "Signature electronique invalide" },
                { code: "100", label: "Doublon FSE", desc: "FSE deja transmise" },
                { code: "200", label: "Beneficiaire inconnu", desc: "Droits non ouverts" },
                { code: "210", label: "Droits expires", desc: "Droits du beneficiaire clos" },
                { code: "300", label: "Prescripteur", desc: "N. prescripteur invalide" },
                { code: "400", label: "Acte non pris en charge", desc: "Code LPP non reconnu" },
                { code: "500", label: "Date prescription", desc: "Prescription ORL expiree" },
                { code: "600", label: "Complement info", desc: "Pieces justificatives manquantes" },
                { code: "896", label: "Rejet technique", desc: "Erreur technique NOEMIE" },
                { code: "1946", label: "Organisme inconnu", desc: "Centre payeur non identifie" },
              ].map((n) => (
                <div key={n.code} className="flex gap-2">
                  <span className="shrink-0 w-10 text-center font-black text-red-500 bg-red-50 rounded px-1 py-0.5">{n.code}</span>
                  <div>
                    <p className="font-bold text-slate-700 leading-tight">{n.label}</p>
                    <p className="text-slate-400 text-[10px] leading-tight">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </main>
      <AppFooter />

      {statusModal && (
        <StatusModal
          dossier={statusModal.dossier}
          targetStatut={statusModal.statut}
          onClose={() => setStatusModal(null)}
          onSuccess={handleStatusSuccess}
        />
      )}
    </div>
  );
}
