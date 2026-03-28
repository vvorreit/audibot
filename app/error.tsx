"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    // Sentry capture si disponible
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-6xl font-black text-blue-600 mb-4">500</div>
        <h1 className="text-2xl font-black text-slate-900 mb-3">Une erreur est survenue</h1>
        <p className="text-slate-500 font-medium mb-8">
          Quelque chose ne s&apos;est pas passé comme prévu. Notre équipe a été notifiée automatiquement.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
          >
            Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
