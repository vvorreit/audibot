"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function SupprimerComptePage() {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!confirmed) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la suppression");
        setLoading(false);
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-card shadow-sm border border-slate-200 p-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 text-sm mb-8 hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Supprimer mon compte</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
          <p className="text-red-800 text-sm leading-relaxed">
            <strong>Cette action est irréversible.</strong> Votre compte, vos dossiers tiers payant
            et tous vos logs seront définitivement supprimés. Si vous avez un abonnement actif, il
            sera automatiquement résilié.
          </p>
        </div>

        <label className="flex items-start gap-3 mb-8 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm text-slate-600">
            Je comprends que cette action est irréversible et que toutes mes données seront
            définitivement supprimées.
          </span>
        </label>

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleDelete}
          disabled={!confirmed || loading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Suppression en cours..." : "Supprimer définitivement mon compte"}
        </button>
      </div>
    </div>
  );
}
