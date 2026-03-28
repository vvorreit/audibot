"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { acceptCgv } from "@/app/actions/legal";
import Link from "next/link";

export default function CgvRequiredPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (session?.user && (session as any).cgvAccepted === true) {
    router.push("/dashboard");
    return null;
  }
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!checked) return;
    setLoading(true);
    setError(null);
    try {
      await acceptCgv("1.1");
      await update({ cgvAccepted: true });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-card shadow-sm border border-slate-100 p-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Mise à jour des CGV</h1>
          <p className="text-sm text-slate-500 font-medium">
            Nos conditions générales de vente ont été mises à jour.
            Veuillez les lire et les accepter pour continuer.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 space-y-1">
          <p className="font-bold">CGV v1.1 — Points clés :</p>
          <ul className="list-disc list-inside space-y-1 text-xs font-medium">
            <li>Abonnement mensuel ou annuel sans engagement minimum</li>
            <li>Résiliation possible à tout moment depuis votre espace</li>
            <li>Facturation automatique par Stripe</li>
            <li>Les données patients restent sur votre poste</li>
          </ul>
          <Link href="/legal/cgv" className="text-blue-600 underline text-xs font-bold" target="_blank">
            Lire les CGV complètes →
          </Link>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 w-4 h-4 accent-blue-600 shrink-0"
          />
          <span className="text-sm text-slate-700 font-medium">
            J&apos;ai lu et j&apos;accepte les{" "}
            <Link href="/legal/cgv" className="text-blue-600 underline" target="_blank">
              Conditions Générales de Vente v1.1
            </Link>{" "}
            d&apos;OptiBot.
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-600 font-semibold text-center">{error}</p>
        )}

        <button
          onClick={handleAccept}
          disabled={!checked || loading}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Enregistrement..." : "Accepter et continuer"}
        </button>
      </div>
    </main>
  );
}
