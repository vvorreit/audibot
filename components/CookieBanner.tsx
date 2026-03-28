"use client";

import { useState, useEffect } from "react";
import { Shield, X, ChevronDown } from "lucide-react";
import Link from "next/link";

const CONSENT_KEY = "optibot_cookie_consent";
const ANALYTICS_KEY = "optibot_analytics_consent";
const MARKETING_KEY = "optibot_marketing_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      /* Bandeau affiché — aucun cookie non-essentiel activé avant consentement explicite (CNIL 2020) */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  function acceptAll() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    localStorage.setItem(ANALYTICS_KEY, "granted");
    localStorage.setItem(MARKETING_KEY, "granted");
    window.dispatchEvent(new Event("optibot_consent_accepted"));
    setVisible(false);
  }

  function acceptSelected() {
    localStorage.setItem(CONSENT_KEY, analytics || marketing ? "partial" : "declined");
    localStorage.setItem(ANALYTICS_KEY, analytics ? "granted" : "denied");
    localStorage.setItem(MARKETING_KEY, marketing ? "granted" : "denied");
    if (analytics) window.dispatchEvent(new Event("optibot_consent_accepted"));
    setVisible(false);
  }

  function declineAll() {
    localStorage.setItem(CONSENT_KEY, "declined");
    localStorage.setItem(ANALYTICS_KEY, "denied");
    localStorage.setItem(MARKETING_KEY, "denied");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
    >
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Respect de votre vie privée
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nous utilisons des cookies pour améliorer OptiBot. Vos données patients ne sont{" "}
              <strong>jamais</strong> concernées.{" "}
              <Link href="/legal/confidentialite" className="text-blue-600 hover:underline font-semibold">
                Politique de confidentialité
              </Link>
            </p>
          </div>
          <button
            onClick={declineAll}
            aria-label="Fermer la bannière cookies"
            className="text-slate-400 hover:text-slate-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Détails granulaires */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? "rotate-180" : ""}`} />
          Personnaliser mes choix
        </button>

        {showDetails && (
          <div className="space-y-3 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700">Nécessaires</span>
                <p className="text-2xs text-slate-400">Authentification, sécurité, fonctionnement</p>
              </div>
              <div className="w-10 h-5 bg-blue-500 rounded-full relative cursor-not-allowed opacity-60">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700">Analytics</span>
                <p className="text-2xs text-slate-400">Mesure d&apos;audience anonyme (Google Analytics)</p>
              </div>
              <button
                onClick={() => setAnalytics(!analytics)}
                className={`w-10 h-5 rounded-full relative transition-colors ${analytics ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${analytics ? "right-0.5" : "left-0.5"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700">Marketing</span>
                <p className="text-2xs text-slate-400">Emails promotionnels et communications</p>
              </div>
              <button
                onClick={() => setMarketing(!marketing)}
                className={`w-10 h-5 rounded-full relative transition-colors ${marketing ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${marketing ? "right-0.5" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 justify-end">
          {showDetails ? (
            <button
              onClick={acceptSelected}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors rounded-lg"
            >
              Enregistrer mes choix
            </button>
          ) : (
            <button
              onClick={declineAll}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Tout refuser
            </button>
          )}
          <button
            onClick={acceptAll}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
