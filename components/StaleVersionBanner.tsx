"use client";

import { useEffect, useState } from "react";

export default function StaleVersionBanner() {
  const [stale, setStale] = useState(false);

  useEffect(() => {
    // Récupérer le build ID au premier chargement
    let clientBuild: string | null = null;

    const check = async () => {
      try {
        const res = await fetch("/version.json?t=" + Date.now(), { cache: "no-store" });
        const data = await res.json() as { build: string };
        if (!clientBuild) {
          clientBuild = data.build;
          return;
        }
        if (data.build !== clientBuild) {
          setStale(true);
        }
      } catch { /* ignore */ }
    };

    // Premier check au démarrage
    check();

    // Vérifier toutes les 2 minutes
    const interval = setInterval(check, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!stale) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-blue-600 text-white rounded-2xl shadow-xl font-semibold text-sm animate-fade-in">
      <span>🔄 Nouvelle version disponible</span>
      <button
        onClick={() => window.location.reload()}
        className="px-3 py-1 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition text-xs"
      >
        Actualiser
      </button>
    </div>
  );
}
