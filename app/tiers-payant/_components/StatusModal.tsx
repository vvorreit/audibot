"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { inputCls } from "@/components/ui/Input";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { updateStatutDossierTP } from "../actions";
import { STATUT_CONFIG, MOTIFS_REJET, todayString } from "./constants";
import type { DossierTP } from "./types";

export function StatusModal({ dossier, targetStatut, onClose, onSuccess }: {
  dossier: DossierTP;
  targetStatut: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const trapRef = useFocusTrap(true, onClose);
  const [montantRecu, setMontantRecu] = useState(String(dossier.montant));
  const [dateReception, setDateReception] = useState(todayString());
  const [motifRejet, setMotifRejet] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = STATUT_CONFIG[targetStatut];
  const Icon = cfg.icon;

  const labelCls = "block text-2xs font-black uppercase tracking-widest text-slate-600 mb-1.5";

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div ref={trapRef} role="dialog" aria-modal="true" aria-labelledby="status-modal-title" className="bg-white rounded-card shadow-2xl border border-slate-100 w-full max-w-lg mx-4 p-5 sm:p-8 relative z-10 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${cfg.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="status-modal-title" className="font-black text-lg">Passer en &quot;{cfg.label}&quot;</h2>
              <p className="text-xs font-medium text-slate-600">{dossier.reference}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {targetStatut === "RECU" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status-montant" className={labelCls}>Montant reçu (EUR) *</label>
                <input
                  id="status-montant"
                  type="number" step="0.01" min="0.01"
                  value={montantRecu}
                  onChange={(e) => setMontantRecu(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="status-date" className={labelCls}>Date réception *</label>
                <input
                  id="status-date"
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
              <label htmlFor="status-motif" className={labelCls}>Motif du rejet</label>
              <select id="status-motif" value={motifRejet} onChange={(e) => setMotifRejet(e.target.value)} className={inputCls}>
                <option value="">Aucun motif</option>
                {MOTIFS_REJET.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="status-commentaire" className={labelCls}>
              Commentaire {targetStatut === "EN_LITIGE" ? "*" : ""}
            </label>
            <textarea
              id="status-commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder={targetStatut === "EN_LITIGE" ? "Décrivez le litige..." : "Optionnel..."}
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
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? "Mise à jour..." : "Confirmer"}
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
