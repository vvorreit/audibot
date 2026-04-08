"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp, Download, Plug, MousePointerClick, ArrowRight } from "lucide-react";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-indigo-600 transition-colors group"
      >
        <span className="text-lg font-bold text-slate-800 group-hover:text-indigo-600">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-6" : "max-h-0"}`}>
        <p className="text-slate-500 leading-relaxed font-medium">{answer}</p>
      </div>
    </div>
  );
}

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 text-slate-900">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.png" alt="AudiBot" width={36} height={36} className="rounded-xl shadow-lg shadow-blue-200" />
            <span className="text-xl font-bold tracking-tight uppercase">AudiBot</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Tableau de bord
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-48 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-2xs font-black uppercase tracking-[0.2em] mb-8">
            <Plug className="w-3 h-3" />
            Extension Chrome
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[0.95] text-slate-900">
            Installez l&apos;extension AudiBot
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">2 minutes chrono</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Suivez ces 3 étapes simples pour commencer à remplir automatiquement vos portails mutuelles.
          </p>
        </div>
      </section>

      {/* Guide en 3 étapes */}
      <section className="py-24 bg-slate-50 px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-2xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Installation</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Guide en 3 étapes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Étape 01 */}
            <div className="relative group">
              <div className="text-8xl font-black text-slate-100 absolute -top-10 -left-4 group-hover:text-blue-50 transition-colors">01</div>
              <div className="relative z-10 bg-white p-10 rounded-card shadow-sm border border-slate-100 group-hover:shadow-xl group-hover:-translate-y-2 transition-all">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100">
                  <Download className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black mb-4">Téléchargez le fichier ZIP</h4>
                <p className="text-slate-500 font-medium leading-relaxed mb-6">
                  Allez sur <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">chrome://extensions</code> — activez le <strong>mode développeur</strong> — cliquez <strong>&quot;Charger l&apos;extension décompressée&quot;</strong>.
                </p>
                <a
                  href="/audibot-extension.zip"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  <Download className="w-4 h-4" />
                  Télécharger l&apos;extension (.zip)
                </a>
              </div>
            </div>

            {/* Étape 02 */}
            <div className="relative group">
              <div className="text-8xl font-black text-slate-100 absolute -top-10 -left-4 group-hover:text-blue-50 transition-colors">02</div>
              <div className="relative z-10 bg-white p-10 rounded-card shadow-sm border border-slate-100 group-hover:shadow-xl group-hover:-translate-y-2 transition-all">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100">
                  <Plug className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black mb-4">Connectez l&apos;extension à votre compte</h4>
                <p className="text-slate-500 font-medium leading-relaxed mb-6">
                  Ouvrez <strong>audibot.fr/dashboard</strong> — l&apos;extension se connecte automatiquement à votre compte.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Connexion automatique — aucune saisie requise
                </div>
              </div>
            </div>

            {/* Étape 03 */}
            <div className="relative group">
              <div className="text-8xl font-black text-slate-100 absolute -top-10 -left-4 group-hover:text-blue-50 transition-colors">03</div>
              <div className="relative z-10 bg-white p-10 rounded-card shadow-sm border border-slate-100 group-hover:shadow-xl group-hover:-translate-y-2 transition-all">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100">
                  <MousePointerClick className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black mb-4">Cliquez &quot;Remplir&quot; sur un portail</h4>
                <p className="text-slate-500 font-medium leading-relaxed mb-4">
                  Le bouton AudiBot apparaît en bas à droite sur tous les portails compatibles.
                </p>
                <Link href="/portails" className="inline-flex items-center gap-2 text-indigo-600 font-black text-sm hover:text-indigo-700 transition-colors group/link">
                  Voir les portails compatibles
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tight">Questions fréquentes</h2>
            <p className="text-slate-500 font-medium italic">Tout ce qu&apos;il faut savoir sur l&apos;extension.</p>
          </div>
          <div className="bg-slate-50 rounded-card p-8 md:p-12 border border-slate-100 text-slate-900">
            <FAQItem
              question="Pourquoi le bouton Remplir n'apparaît pas ?"
              answer="Vérifiez que vous êtes connecté sur audibot.fr et que l'extension est bien activée dans Chrome."
            />
            <FAQItem
              question="L'extension est-elle sécurisée ?"
              answer="Oui — aucune donnée patient ne transite par nos serveurs. Tout est traité localement."
            />
            <FAQItem
              question="Fonctionne-t-elle sur Firefox ?"
              answer="L'extension est optimisée pour Chrome. Firefox n'est pas officiellement supporté."
            />
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 bg-slate-50 px-6 border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Vous êtes prêt.</h2>
          <p className="text-slate-500 font-medium mb-10">L&apos;extension est installée ? Retournez sur le dashboard pour scanner votre premier document.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 text-lg group uppercase tracking-widest active:scale-95"
          >
            Aller sur le dashboard
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-10 text-2xs font-black uppercase tracking-[0.2em] text-slate-500">
              <Link href="/legal/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link href="/legal/cgu" className="hover:text-white transition-colors">CGU</Link>
              <Link href="/legal/cgv" className="hover:text-white transition-colors">CGV</Link>
            </div>
            <div className="text-slate-500 text-2xs font-black uppercase tracking-widest">
              © 2026 AudiBot — Pour les Audioprothésistes
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
