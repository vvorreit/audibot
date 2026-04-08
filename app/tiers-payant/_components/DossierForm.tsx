"use client";
/** Create-dossier form with doublon detection. Exports: DossierForm. ~120 lignes */

import { inputCls } from "@/components/ui/Input";
import { MUTUELLES, todayString } from "./constants";

const labelCls = "block text-2xs font-black uppercase tracking-widest text-slate-600 mb-1.5";

interface DossierFormProps {
  mutuelle: string;
  setMutuelle: (v: string) => void;
  montant: string;
  setMontant: (v: string) => void;
  dateEnvoi: string;
  setDateEnvoi: (v: string) => void;
  numeroAdherent: string;
  setNumeroAdherent: (v: string) => void;
  referenceInterne: string;
  setReferenceInterne: (v: string) => void;
  formError: string | null;
  submitting: boolean;
  doublonAlerte: { reference: string; dateEnvoi: string; statut: string; montant: number } | null;
  setDoublonAlerte: (v: null) => void;
  setDoublonConfirme: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function DossierForm({
  mutuelle, setMutuelle,
  montant, setMontant,
  dateEnvoi, setDateEnvoi,
  numeroAdherent, setNumeroAdherent,
  referenceInterne, setReferenceInterne,
  formError, submitting,
  doublonAlerte, setDoublonAlerte, setDoublonConfirme,
  onSubmit, onCancel,
}: DossierFormProps) {
  return (
    <div className="bg-white rounded-card shadow-sm border border-slate-100 p-8 mb-8">
      <h2 className="text-lg font-black mb-6">Enregistrer un dossier</h2>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Mutuelle *</label>
            <select value={mutuelle} onChange={(e) => setMutuelle(e.target.value)} className={inputCls}>
              <option value="">Sélectionner...</option>
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
            <label className={labelCls}>N. adhérent</label>
            <input type="text" value={numeroAdherent} onChange={(e) => setNumeroAdherent(e.target.value)} placeholder="Ex: 123456789" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Référence interne</label>
            <input type="text" value={referenceInterne} onChange={(e) => setReferenceInterne(e.target.value)} placeholder="Ex: CMD-2026-042" className={inputCls} />
          </div>
        </div>

        {doublonAlerte && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-2">
            <p className="text-sm font-black text-amber-700">⚠️ Doublon détecté</p>
            <p className="text-sm text-amber-700">
              Un dossier similaire existe déjà pour ce patient et cette mutuelle dans les 30 derniers jours :
            </p>
            <div className="bg-white border border-amber-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 space-y-1">
              <div>Référence : <span className="text-amber-700">{doublonAlerte.reference}</span></div>
              <div>Envoyé le : {doublonAlerte.dateEnvoi}</div>
              <div>Statut : {doublonAlerte.statut}</div>
              <div>Montant : {doublonAlerte.montant.toFixed(2)} EUR</div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setDoublonConfirme(true); setDoublonAlerte(null); }}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition-colors"
              >
                Confirmer quand même
              </button>
              <button
                type="button"
                onClick={() => { setDoublonAlerte(null); setDoublonConfirme(false); }}
                className="px-4 py-2 bg-white border border-amber-200 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">{formError}</div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={submitting || !!doublonAlerte} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50">
            {submitting ? "Enregistrement..." : "Enregistrer le dossier"}
          </button>
          <button type="button" onClick={onCancel} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-sm">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
