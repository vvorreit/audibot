"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { ShieldCheck, LogOut } from "lucide-react";

export default function OnboardingDPAPage() {
  const router = useRouter();
  const { update } = useSession();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = async () => {
    if (!accepted) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/legal/dpa/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dpa_version: "1.1" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'enregistrement.");
      }

      // Mettre à jour le token JWT pour refléter l'acceptation
      await update({ dpaAccepted: true });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-200">
              O
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">OptiBot</span>
          </Link>
        </div>

        <div className="bg-white p-10 rounded-card shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6 text-blue-600">
            <ShieldCheck className="w-8 h-8" />
            <h1 className="text-2xl font-black text-slate-900">Avant de continuer</h1>
          </div>

          <p className="text-slate-600 font-medium mb-4 leading-relaxed">
            OptiBot traite des <strong>données de santé</strong> en qualité de sous-traitant au sens de l&apos;article 28 du RGPD.
          </p>
          <p className="text-slate-600 font-medium mb-6 leading-relaxed">
            En tant que professionnel de santé, vous êtes <strong>Responsable de traitement</strong>. Veuillez lire et accepter l&apos;Accord de Traitement des Données avant d&apos;utiliser le service.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 space-y-2 text-sm text-blue-800">
            <p className="font-bold">En résumé, OptiBot s&apos;engage à :</p>
            <ul className="space-y-1 pl-2">
              <li>✅ Ne jamais stocker vos données de santé sur ses serveurs</li>
              <li>✅ Héberger l&apos;infrastructure en France (Scaleway HDS)</li>
              <li>✅ Ne jamais utiliser vos données pour de l&apos;IA tierce</li>
              <li>✅ Vous notifier en cas de violation de données sous 48h</li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold">
              {error}
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-600 font-medium">
              J&apos;ai lu et j&apos;accepte l&apos;
              <Link href="/legal/dpa" target="_blank" className="text-blue-600 font-bold underline">
                Accord de Traitement des Données (DPA)
              </Link>{" "}
              conformément à l&apos;article 28 du RGPD.
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!accepted || loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enregistrement..." : "Accepter et continuer →"}
          </button>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-6 mx-auto flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
