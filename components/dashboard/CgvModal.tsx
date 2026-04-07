import React from "react";

interface CgvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
  loading: boolean;
}

export default function CgvModal({
  isOpen, onClose, onAccept, isChecked, onCheckedChange, loading
}: CgvModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="cgv-modal-title">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h2 id="cgv-modal-title" className="text-xl font-black text-slate-900">Accepter les CGV</h2>
          <p className="text-sm text-slate-700 font-medium">
            Veuillez lire et accepter nos Conditions Générales de Vente avant de souscrire.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 space-y-1">
          <p className="font-bold">CGV v1.1 — Points clés :</p>
          <ul className="list-disc list-inside space-y-1 text-xs font-medium">
            <li>Abonnement mensuel ou annuel sans engagement minimum</li>
            <li>Résiliation possible à tout moment depuis votre espace</li>
            <li>Facturation automatique via Stripe</li>
            <li>Les données patients restent sur votre poste</li>
            <li>Tarifs mis à jour — voir CGV complètes</li>
          </ul>
          <a href="/legal/cgv" className="text-blue-600 underline text-xs font-bold" target="_blank">
            Lire les CGV complètes →
          </a>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={e => onCheckedChange(e.target.checked)}
            className="mt-1 w-4 h-4 accent-blue-600 shrink-0"
          />
          <span className="text-sm text-slate-700 font-medium">
            J&apos;ai lu et j&apos;accepte les{" "}
            <a href="/legal/cgv" className="text-blue-600 underline" target="_blank">
              Conditions Générales de Vente v1.1
            </a>{" "}
            d&apos;AudiBot.
          </span>
        </label>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-sm"
          >
            Annuler
          </button>
          <button
            onClick={onAccept}
            disabled={!isChecked || loading}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? "Chargement..." : "Accepter et payer"}
          </button>
        </div>
      </div>
    </div>
  );
}
