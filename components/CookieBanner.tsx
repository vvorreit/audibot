"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("audibot_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("audibot_cookie_consent", "accepted");
    setVisible(false);
    window.dispatchEvent(new Event("audibot_consent_accepted"));
  };

  const decline = () => {
    localStorage.setItem("audibot_cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-slate-200 shadow-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <p className="text-sm text-slate-600 max-w-2xl">
        Nous utilisons des cookies d'analyse (Google Analytics) pour améliorer notre service.
        Vos données patients ne sont <strong>jamais</strong> concernées.{" "}
        <Link href="/legal/confidentialite" className="text-indigo-600 underline hover:text-indigo-800">
          En savoir plus
        </Link>
      </p>
      <div className="flex gap-3 shrink-0">
        <button
          onClick={decline}
          className="px-5 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          Refuser
        </button>
        <button
          onClick={accept}
          className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
