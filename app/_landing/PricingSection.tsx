"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  const price = (monthly: number) => {
    if (!isAnnual) return { label: `${monthly.toFixed(2).replace(".", ",")}€`, suffix: "/mois HT" };
    const perMonth = (monthly * 0.85).toFixed(2).replace(".", ",");
    const annual = (monthly * 12 * 0.85).toFixed(2).replace(".", ",");
    return { label: `${perMonth}€`, suffix: "/mois HT", annual: `${annual}€/an HT` };
  };

  return (
    <section id="tarifs" className="py-24 bg-slate-50 px-6 border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Tarifs</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Investissez dans votre temps.</h3>
          <p className="text-slate-500 font-medium mt-4">Sans engagement. Annulable en un clic.</p>
        </div>

        {/* Annual / Monthly toggle */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <span className={`text-sm font-black uppercase tracking-widest ${!isAnnual ? "text-slate-900" : "text-slate-400"}`}>Mensuel</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${isAnnual ? "bg-indigo-600" : "bg-slate-200"}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isAnnual ? "translate-x-7" : ""}`} />
          </button>
          <span className={`text-sm font-black uppercase tracking-widest ${isAnnual ? "text-slate-900" : "text-slate-400"}`}>
            Annuel
            <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-black bg-green-100 text-green-700 rounded-full tracking-widest">-15%</span>
          </span>
        </div>

        {/* Solo plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch text-slate-900">

          <div className="p-10 rounded-[40px] border border-slate-100 bg-white flex flex-col group hover:shadow-2xl transition-all duration-500">
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Pack Solo <br/><span className="text-indigo-600">Mutuelle</span></h3>
            <p className="text-slate-500 text-sm mb-8 font-medium italic">Sp&eacute;cialiste du Tiers-Payant audioproth&egrave;se.</p>
            <div className="mb-8">
              <div className="text-4xl sm:text-5xl font-black whitespace-nowrap">{price(32.90).label}<span className="text-base sm:text-lg text-slate-400 font-bold">{price(32.90).suffix}</span></div>
              {isAnnual && <div className="text-xs text-green-600 font-bold mt-1">{price(32.90).annual}</div>}
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> Saisie Mutuelles Illimit&eacute;e</li>
              <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> Almerys, Viamedis & +</li>
              <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> Extension Chrome Pro</li>
            </ul>
            <Link href="/dashboard" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all text-center uppercase tracking-widest text-xs">
              Commencer l&apos;essai
            </Link>
          </div>

          <div className="p-12 rounded-[50px] border-4 border-indigo-600 bg-white shadow-[0_50px_80px_-20px_rgba(99,102,241,0.25)] flex flex-col relative scale-105 z-10">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-full shadow-xl">Recommand&eacute;</div>
            <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">Pack Duo <br/><span className="text-indigo-600">Complet</span></h3>
            <p className="text-slate-500 text-sm mb-8 font-medium italic">Saisie compl&egrave;te dossier audioproth&egrave;se.</p>
            <div className="mb-8">
              <div className="text-4xl sm:text-5xl font-black whitespace-nowrap">{price(49.90).label}<span className="text-base sm:text-lg text-slate-400 font-bold">{price(49.90).suffix}</span></div>
              {isAnnual && <div className="text-xs text-green-600 font-bold mt-1">{price(49.90).annual}</div>}
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm font-black text-slate-800"><CheckCircle className="w-5 h-5 text-indigo-600" /> <strong>Saisie ERP Inclus (Auditdata)</strong></li>
              <li className="flex items-center gap-3 text-sm font-black text-slate-800"><CheckCircle className="w-5 h-5 text-indigo-600" /> Toutes Mutuelles + Ameli Pro</li>
              <li className="flex items-center gap-3 text-sm font-black text-slate-800"><CheckCircle className="w-5 h-5 text-indigo-600" /> Support Prioritaire</li>
              <li className="flex items-center gap-3 text-sm font-black text-slate-800"><CheckCircle className="w-5 h-5 text-indigo-600" /> Multi-postes inclus</li>
            </ul>
            <Link href="/dashboard" className="w-full py-5 bg-indigo-600 text-white font-black rounded-[24px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
              Essayer le Pack Duo
            </Link>
          </div>

          <div className="p-10 rounded-[40px] border border-slate-100 bg-white flex flex-col group hover:shadow-2xl transition-all duration-500">
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Pack Solo <br/><span className="text-violet-600">ERP / Auditdata</span></h3>
            <p className="text-slate-500 text-sm mb-8 font-medium italic">Sp&eacute;cialiste de la fiche patient audio.</p>
            <div className="mb-8">
              <div className="text-4xl sm:text-5xl font-black whitespace-nowrap">{price(32.90).label}<span className="text-base sm:text-lg text-slate-400 font-bold">{price(32.90).suffix}</span></div>
              {isAnnual && <div className="text-xs text-green-600 font-bold mt-1">{price(32.90).annual}</div>}
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-violet-500" /> Saisie ERP Illimit&eacute;e</li>
              <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-violet-500" /> Sp&eacute;cialis&eacute; Auditdata</li>
              <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-violet-500" /> Autofill Prescription ORL</li>
            </ul>
            <Link href="/dashboard" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-violet-600 transition-all text-center uppercase tracking-widest text-xs">
              Commencer l&apos;essai
            </Link>
          </div>
        </div>

        {/* Team Plans */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]">Pour les &eacute;quipes</span>
            <h4 className="text-2xl font-black tracking-tight text-slate-900 mt-4">Un abonnement, toute l&apos;&eacute;quipe.</h4>
            <p className="text-slate-500 font-medium text-sm mt-2">Partagez AudiBot entre plusieurs postes depuis un seul compte.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">

            <div className="p-10 rounded-[40px] border border-indigo-100 bg-white flex flex-col group hover:shadow-2xl transition-all duration-500">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">3 postes</span>
              </div>
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Team <br/><span className="text-indigo-600">Trio</span></h3>
              <p className="text-slate-500 text-sm mb-8 font-medium italic">Id&eacute;al pour un centre avec une petite &eacute;quipe.</p>
              <div className="mb-8">
                <div className="text-4xl sm:text-5xl font-black whitespace-nowrap">{price(99).label}<span className="text-base sm:text-lg text-slate-400 font-bold">{price(99).suffix}</span></div>
                {isAnnual && <div className="text-xs text-green-600 font-bold mt-1">{price(99).annual}</div>}
                <p className="text-slate-400 text-xs font-bold mt-1">soit {isAnnual ? "28,05" : "33,00"}&euro;/poste/mois</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> 3 postes inclus</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> ERP + Mutuelles</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> Gestion d&apos;&eacute;quipe centralis&eacute;e</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> Support prioritaire</li>
              </ul>
              <Link href="/dashboard" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all text-center uppercase tracking-widest text-xs">
                Essayer en &eacute;quipe
              </Link>
            </div>

            <div className="p-10 rounded-[40px] border-2 border-indigo-300 bg-white flex flex-col group hover:shadow-2xl transition-all duration-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">Meilleur rapport</div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">5 postes</span>
              </div>
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Team <br/><span className="text-indigo-600">Pro</span></h3>
              <p className="text-slate-500 text-sm mb-8 font-medium italic">Pour les r&eacute;seaux ou centres multi-postes.</p>
              <div className="mb-8">
                <div className="text-4xl sm:text-5xl font-black whitespace-nowrap">{price(149).label}<span className="text-base sm:text-lg text-slate-400 font-bold">{price(149).suffix}</span></div>
                {isAnnual && <div className="text-xs text-green-600 font-bold mt-1">{price(149).annual}</div>}
                <p className="text-slate-400 text-xs font-bold mt-1">soit {isAnnual ? "25,33" : "29,80"}&euro;/poste/mois</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> 5 postes inclus</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> ERP + Mutuelles</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> Gestion d&apos;&eacute;quipe centralis&eacute;e</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> Support prioritaire d&eacute;di&eacute;</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> Onboarding personnalis&eacute;</li>
              </ul>
              <Link href="/dashboard" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all text-center uppercase tracking-widest text-xs shadow-xl shadow-indigo-100">
                Essayer en &eacute;quipe
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
