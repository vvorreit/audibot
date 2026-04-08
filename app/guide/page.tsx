import React from "react";
import Link from "next/link";
import { BookOpen, Zap, ArrowRight, Chrome, ExternalLink } from "lucide-react";

import GuideHero from "@/components/guide/GuideHero";
import ExtensionSection from "@/components/guide/sections/ExtensionSection";
import MobileSection from "@/components/guide/sections/MobileSection";
import BilanSection from "@/components/guide/sections/BilanSection";
import OcrSection from "@/components/guide/sections/OcrSection";
import AutofillSection from "@/components/guide/sections/AutofillSection";
import TiersPayantSection from "@/components/guide/sections/TiersPayantSection";
import RejetSection from "@/components/guide/sections/RejetSection";
import RpaSection from "@/components/guide/sections/RpaSection";
import AlertSection from "@/components/guide/sections/AlertSection";
import TeamSection from "@/components/guide/sections/TeamSection";
import AccountSection from "@/components/guide/sections/AccountSection";
import SecuritySection from "@/components/guide/sections/SecuritySection";
import FaqSection from "@/components/guide/sections/FaqSection";

export const metadata = {
  title: "Guide complet — Comment utiliser AudiBot | AudiBot",
  description:
    "Documentation complète AudiBot : installation, scan mobile, bilan auditif, autofill portails, tiers payant, RPA, alertes, équipe, sécurité RGPD, FAQ et résolution de problèmes.",
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-20 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-black text-slate-900 hover:text-blue-600 transition-colors">
            <BookOpen className="w-4 h-4" />
            AudiBot
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
              ← Dashboard
            </Link>
            <Link href="/dashboard" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors">
              Ouvrir l&apos;app
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <GuideHero />

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-20">
        <ExtensionSection />
        <MobileSection />
        <BilanSection />
        <OcrSection />
        <AutofillSection />
        <TiersPayantSection />
        <RejetSection />
        <RpaSection />
        <AlertSection />
        <TeamSection />
        <AccountSection />
        <SecuritySection />
        <FaqSection />

        {/* ── CTA FINAL ── */}
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-12 text-center text-white">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-black mb-3">Prêt à commencer ?</h2>
          <p className="text-blue-200 font-medium mb-8 max-w-lg mx-auto leading-relaxed">
            Installez l&apos;extension et automatisez votre tiers payant en moins de 10 minutes. Essai gratuit sans carte bancaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-xl"
            >
              Commencer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/extension"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-400 transition-all border border-blue-400"
            >
              <Chrome className="w-4 h-4" />
              Installer l&apos;extension
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/30"
            >
              Voir les tarifs
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-8 text-blue-300 text-xs font-medium">
            Des questions ? <Link href="/contact" className="underline hover:text-white">Contactez-nous</Link> — réponse en moins de 4h en semaine.
          </p>
        </section>
      </div>

      {/* ── Footer sticky ── */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t border-slate-100 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-slate-900 hidden sm:block">AudiBot</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-slate-700 transition-colors hidden md:block">Accueil</Link>
            <Link href="/fonctionnalites" className="hover:text-slate-700 transition-colors hidden md:block">Fonctionnalités</Link>
            <Link href="/pricing" className="hover:text-slate-700 transition-colors hidden md:block">Tarifs</Link>
            <Link href="/contact" className="hover:text-slate-700 transition-colors hidden md:block">Contact</Link>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
          >
            ← Dashboard
          </Link>
        </div>
      </footer>

      <div className="h-14" />
    </div>
  );
}
