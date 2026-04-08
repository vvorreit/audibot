"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Users, Network, Building2 } from "lucide-react";

function price(monthly: number, isAnnual: boolean) {
  if (!isAnnual)
    return { label: `${monthly.toFixed(2).replace(".", ",")}€`, suffix: "/mois HT", oldPrice: "", savings: "", annual: "" };
  const annual = (monthly * 12 * 0.85).toFixed(2).replace(".", ",");
  const perMonth = (monthly * 0.85).toFixed(2).replace(".", ",");
  const saved = (monthly * 12 * 0.15).toFixed(2).replace(".", ",");
  return { label: `${perMonth}€`, suffix: "/mois HT", oldPrice: `${monthly.toFixed(2).replace(".", ",")}€`, savings: `${saved}€`, annual: `${annual}€/an HT` };
}

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="tarifs" className="py-24 bg-slate-50 px-6 border-y border-slate-100">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xs font-black uppercase tracking-[0.3em] text-blue-600 mb-4">Tarifs</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Investissez dans votre temps.
          </h3>
          <p className="text-slate-500 font-medium mt-4">Sans engagement. Annulable en un clic.</p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className={`text-sm font-black uppercase tracking-widest ${!isAnnual ? "text-slate-900" : "text-slate-400"}`}>
            Mensuel
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isAnnual ? "bg-blue-600" : "bg-slate-200"}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isAnnual ? "translate-x-7" : ""}`} />
          </button>
          <span className={`text-sm font-black uppercase tracking-widest ${isAnnual ? "text-slate-900" : "text-slate-400"}`}>
            Annuel
            <span className="ml-2 inline-block px-2 py-0.5 text-xs font-black bg-green-100 text-green-700 rounded-full">−15%</span>
          </span>
        </div>

        {/* Ancrage valeur */}
        <p className="text-center text-sm text-slate-400 font-medium mb-14">
          La saisie manuelle coûte{" "}
          <span className="font-black text-red-500">15 000€/an</span> en temps perdu.
          AudiBot commence à{" "}
          <span className="font-black text-green-600">{isAnnual ? "33,92" : "39,90"}€/mois HT</span>.
        </p>

        {/* ── Plans solo ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">

          {/* ESSENTIEL */}
          <div className="p-8 rounded-2xl border border-slate-200 bg-white flex flex-col hover:shadow-xl transition-all duration-300">
            <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-1">Essentiel</h4>
            <p className="text-slate-400 text-sm italic mb-6">Pour l&apos;opticien indépendant</p>
            <div className="mb-6">
              {isAnnual && <div className="text-sm text-slate-400 line-through mb-1">{price(39.90, isAnnual).oldPrice}/mois</div>}
              <div className="text-4xl font-black text-slate-900">
                {price(39.90, isAnnual).label}
                <span className="text-base text-slate-400 font-bold">{price(39.90, isAnnual).suffix}</span>
              </div>
              {isAnnual && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">{price(39.90, isAnnual).annual}</span>
                  <span className="px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-xs font-black text-green-600">
                    Éco. {price(39.90, isAnnual).savings}/an
                  </span>
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-8 flex-grow text-sm font-bold text-slate-700">
              {[
                "Lecture auto carte mutuelle & ordonnance",
                "Autofill portails & Smart Fill",
                "80 scans/mois",
                "Extension Chrome",
                "Support email (48h)",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl text-center uppercase tracking-widest text-xs hover:bg-blue-700 transition-all">
              Commencer l&apos;essai
            </Link>
          </div>

          {/* PRO */}
          <div className="p-8 rounded-2xl border-2 border-indigo-600 bg-white flex flex-col hover:shadow-xl transition-all duration-300 relative shadow-[0_20px_40px_-10px_rgba(79,70,229,0.15)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest px-5 py-1.5 rounded-full">
              Populaire
            </div>
            <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-1">Pro</h4>
            <p className="text-slate-400 text-sm italic mb-6">Pour l&apos;opticien exigeant</p>
            <div className="mb-6">
              {isAnnual && <div className="text-sm text-slate-400 line-through mb-1">{price(69.90, isAnnual).oldPrice}/mois</div>}
              <div className="text-4xl font-black text-slate-900">
                {price(69.90, isAnnual).label}
                <span className="text-base text-slate-400 font-bold">{price(69.90, isAnnual).suffix}</span>
              </div>
              {isAnnual && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">{price(69.90, isAnnual).annual}</span>
                  <span className="px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-xs font-black text-green-600">
                    Éco. {price(69.90, isAnnual).savings}/an
                  </span>
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-8 flex-grow text-sm font-bold text-slate-800">
              {[
                "Tout le plan Essentiel, sans limite de scans",
                "Suivi tiers payant complet",
                "Relances automatiques + alertes rejets",
                "Export CSV",
                "Support prioritaire (< 4h)",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl text-center uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
              Essayer le plan Pro
            </Link>
          </div>
        </div>

        {/* ── Séparateur équipe ── */}
        <div className="flex items-center gap-4 max-w-3xl mx-auto mb-8">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Pour les équipes</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* ── Plans équipe ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">

          {/* CABINET */}
          <div className="p-7 rounded-2xl border border-slate-200 bg-white flex flex-col hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h4 className="text-base font-black uppercase tracking-tight text-slate-900">Cabinet</h4>
                <p className="text-2xs text-slate-400 font-medium">3 utilisateurs · Flat</p>
              </div>
            </div>
            <div className="mb-1">
              <div className="text-3xl font-black text-slate-900">
                {isAnnual ? "152,15" : "179,00"}€
                <span className="text-sm text-slate-400 font-bold">/mois HT</span>
              </div>
            </div>
            <p className="text-xs font-black text-violet-600 mb-5">
              Soit {isAnnual ? "50,72" : "59,67"}€/poste/mois
            </p>
            <ul className="space-y-2.5 mb-7 flex-grow text-sm font-bold text-slate-700">
              {[
                "Tout le plan Pro ×3 postes",
                "Dashboard équipe centralisé",
                "Invitation des collaborateurs",
                "Facturation unique",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="w-full py-3.5 bg-violet-600 text-white font-black rounded-xl text-center uppercase tracking-widest text-xs hover:bg-violet-700 transition-all">
              Démarrer en cabinet
            </Link>
          </div>

          {/* RÉSEAU */}
          <div className="p-7 rounded-2xl border-2 border-blue-600 bg-white flex flex-col relative shadow-[0_20px_40px_-10px_rgba(37,99,235,0.12)] hover:shadow-xl transition-all duration-300">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full">
              Recommandé équipe
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Network className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-base font-black uppercase tracking-tight text-slate-900">Réseau</h4>
                <p className="text-2xs text-slate-400 font-medium">5 inclus · +30€/poste</p>
              </div>
            </div>
            <div className="mb-1">
              <div className="text-3xl font-black text-slate-900">
                {isAnnual ? "254,15" : "299,00"}€
                <span className="text-sm text-slate-400 font-bold">/mois HT</span>
              </div>
            </div>
            <p className="text-xs font-black text-blue-600 mb-5">
              +{isAnnual ? "25,50" : "30"}€ HT/utilisateur supplémentaire
            </p>
            <ul className="space-y-2.5 mb-7 flex-grow text-sm font-bold text-slate-700">
              {[
                "Tout le plan Cabinet +",
                "Gestion avancée des rôles",
                "Stats agrégées multi-magasins",
                "Onboarding visio inclus (1h)",
                "Support dédié",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="w-full py-3.5 bg-blue-600 text-white font-black rounded-xl text-center uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
              Démarrer mon réseau
            </Link>
          </div>

          {/* FRANCHISE */}
          <div className="p-7 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 blur-[60px] pointer-events-none" />
            <div className="relative z-10 flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <h4 className="text-base font-black uppercase tracking-tight text-white">Franchise</h4>
                <p className="text-2xs text-blue-300 font-medium">Illimité · Sur devis</p>
              </div>
            </div>
            <div className="relative z-10 mb-1">
              <div className="text-3xl font-black text-white">Sur devis</div>
            </div>
            <p className="relative z-10 text-xs font-black text-blue-300 mb-5">
              À partir de 500€ HT/mois · Contrat annuel
            </p>
            <ul className="relative z-10 space-y-2.5 mb-7 flex-grow text-sm font-bold text-slate-300">
              {[
                "Postes illimités",
                "Déploiement multi-sites",
                "Intégration ERP prioritaire",
                "SLA + DPA RGPD",
                "Interlocuteur dédié",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
            <Link
              href="/franchise"
              className="relative z-10 w-full py-3.5 bg-blue-600 text-white font-black rounded-xl text-center uppercase tracking-widest text-xs hover:bg-blue-500 transition-all flex items-center justify-center gap-2 group"
            >
              Demander une démo
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* CTA vers page pricing complète */}
        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest group"
          >
            Voir le comparatif complet
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
