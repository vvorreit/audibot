import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Code LPP optique — Liste des Produits et Prestations remboursables",
  description:
    "Tout comprendre sur les codes LPP en optique : classes d'équipement, tarifs de remboursement, 100% Santé, et comment éviter les erreurs de codification.",
  alternates: { canonical: "https://optibot.fr/glossaire/lpp-optique" },
};

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Code LPP optique",
  description: "Les codes LPP (Liste des Produits et Prestations remboursables) en optique sont des identifiants numériques attribués par l'Assurance Maladie à chaque type d'équipement optique remboursable (verres, montures, lentilles). Ils déterminent le tarif de remboursement applicable.",
  inDefinedTermSet: { "@type": "DefinedTermSet", name: "Glossaire tiers payant optique — OptiBot", url: "https://optibot.fr/glossaire" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Qu'est-ce qu'un code LPP en optique ?", acceptedAnswer: { "@type": "Answer", text: "Un code LPP est un identifiant de la Liste des Produits et Prestations remboursables. En optique, il désigne le type exact de verre ou de monture, sa classe (A ou B), et détermine le montant de remboursement par l'Assurance Maladie." } },
    { "@type": "Question", name: "Quelle est la différence entre la classe A et la classe B en LPP optique ?", acceptedAnswer: { "@type": "Answer", text: "La classe A (équipements du panier 100% Santé) regroupe les verres et montures sans reste à charge. La classe B regroupe les équipements à tarif libre, dont le remboursement est plafonné. Un même patient peut choisir un verre classe A pour un œil et classe B pour l'autre." } },
    { "@type": "Question", name: "Que se passe-t-il si j'utilise le mauvais code LPP ?", acceptedAnswer: { "@type": "Answer", text: "L'Assurance Maladie émet un rejet avec le code 56 (incompatibilité entre le code LPP et le diagnostic ou la prescription). Il faut corriger le code LPP et resoumettre le dossier. En cas d'erreur répétée, un contrôle de la CPAM est possible." } },
    { "@type": "Question", name: "Comment trouver le bon code LPP pour un équipement ?", acceptedAnswer: { "@type": "Answer", text: "Le code LPP se détermine selon la correction prescrite (sphère, cylindre, addition), la classe de l'équipement choisi par le patient, et le type de verre (unifocal, progressif, photochromique…). La CPAM publie la nomenclature complète sur ameli.fr." } },
  ],
};

export default function LPPOptiquePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="min-h-screen bg-white">
        <nav className="fixed w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm">O</div><span className="text-lg font-bold tracking-tight uppercase text-slate-900">OptiBot</span></Link>
            <Link href="/glossaire" className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"><ChevronLeft className="w-3 h-3" /> Glossaire</Link>
          </div>
        </nav>
        <article className="max-w-3xl mx-auto px-6 pt-32 pb-24">
          <Link href="/glossaire" className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">← Glossaire</Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-4 mb-3">Code LPP optique</h1>
          <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">La Liste des Produits et Prestations remboursables détermine le montant de remboursement de chaque équipement optique par l'Assurance Maladie. Mal coder un équipement = rejet assuré.</p>

          <section className="mb-10">
            <h2 className="text-xl font-black text-slate-900 mb-4">Classes d'équipement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { cls: "Classe A", color: "bg-green-50 border-green-100 text-green-700", desc: "Panier 100% Santé — zéro reste à charge. Remboursement intégral CPAM + mutuelle. Tarifs plafonnés par la nomenclature." },
                { cls: "Classe B", color: "bg-blue-50 border-blue-100 text-blue-700", desc: "Tarif libre. Remboursement CPAM plafonné au tarif de base. La mutuelle complète selon le contrat." },
              ].map(c => (
                <div key={c.cls} className={`p-5 rounded-2xl border ${c.color}`}>
                  <h3 className={`font-black mb-2 text-sm ${c.color.split(" ")[2]}`}>{c.cls}</h3>
                  <p className="text-sm font-medium text-slate-600">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="text-xl font-black text-slate-900 mb-6">Questions fréquentes</h2>
            <div className="space-y-6">
              {faqSchema.mainEntity.map((item, i) => (
                <div key={i} className="border-l-4 border-blue-100 pl-5">
                  <h3 className="text-base font-black text-slate-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-black text-slate-900 mb-2">OptiBot lit l'ordonnance et suggère le bon code LPP</h3>
            <p className="text-sm text-slate-500 font-medium mb-5">OCR local sur la prescription — correction, cylindre, addition — pour remplir automatiquement le bon code LPP.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest group">
              Essayer 14j gratuit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
