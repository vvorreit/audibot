import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Glossaire tiers payant audioprothèse — définitions pour audioprothésistes",
  description:
    "Toutes les définitions du tiers payant audioprothèse : codes rejet AMO, Almerys, Viamedis, prescription audiologique… Le glossaire de référence pour les audioprothésistes.",
  alternates: { canonical: "https://audibot.fr/glossaire" },
};

const entries = [
  { slug: "tiers-payant-audioprothese",    label: "Tiers payant audioprothèse",                   desc: "Fonctionnement complet du TP pour les audioprothésistes" },
  { slug: "prescription-audiologique",      label: "Prescription audiologique",                     desc: "Comprendre la prescription et l'audiogramme" },
  { slug: "appareils-auditifs-remboursement", label: "Remboursement appareils auditifs",            desc: "Niveaux 1 et 2, 100% Santé, reste à charge" },
  { slug: "almerys-audioprothesiste",       label: "Almerys pour les audioprothésistes",             desc: "Portail, connexion, saisie et automatisation" },
  { slug: "viamedis-audioprothesiste",      label: "Viamedis pour les audioprothésistes",            desc: "Portail, codes, délais et automatisation" },
  { slug: "wemind-audioprothesiste",        label: "Wemind pour les audioprothésistes",              desc: "Portail Wemind, saisie et gestion des dossiers" },
  { slug: "code-rejet-tiers-payant-audio",  label: "Codes rejet tiers payant (AMO/AMC)",            desc: "Comprendre et corriger les codes rejet" },
  { slug: "smart-fill-audioprothesiste",    label: "Smart Fill — remplissage automatique universel", desc: "Comment fonctionne l'auto-saisie sur tout portail" },
];

export default function GlossairePage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="fixed w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#059669] rounded-xl flex items-center justify-center text-white font-black text-sm">A</div>
            <span className="text-lg font-bold tracking-tight uppercase text-slate-900">AudiBot</span>
          </Link>
          <Link href="/blog" className="text-xs font-bold text-slate-400 hover:text-[#059669] transition-colors uppercase tracking-widest">Blog</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[#059669] text-xs font-black uppercase tracking-widest mb-6">
            <BookOpen className="w-3 h-3" />
            Glossaire
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
            Tiers payant audioprothèse —<br />toutes les définitions
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl">
            Les termes essentiels que tout audioprothésiste doit maîtriser : codes rejet, portails mutuelles, réglementation. Clair, précis, actionnable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <Link
              key={entry.slug}
              href={`/glossaire/${entry.slug}`}
              className="group p-6 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 group-hover:text-[#059669] transition-colors mb-1">
                    {entry.label}
                  </h2>
                  <p className="text-sm text-slate-400 font-medium">{entry.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#059669] shrink-0 mt-0.5 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
