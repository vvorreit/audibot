import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Rejet AMO en optique — causes, codes et corrections",
  description:
    "Comprendre et corriger les rejets AMO (Assurance Maladie Obligatoire) en optique. Causes fréquentes, codes rejet, délais et procédure de correction.",
  alternates: { canonical: "https://optibot.fr/glossaire/rejet-amo-optique" },
};

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Rejet AMO en optique",
  description:
    "Un rejet AMO (Assurance Maladie Obligatoire) en optique est un refus de remboursement émis par la CPAM suite à une erreur ou une incomplétude dans le dossier de tiers payant soumis par l'opticien.",
  inDefinedTermSet: { "@type": "DefinedTermSet", name: "Glossaire tiers payant optique — OptiBot", url: "https://optibot.fr/glossaire" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quelle est la différence entre un rejet AMO et un rejet AMC en optique ?",
      acceptedAnswer: { "@type": "Answer", text: "Un rejet AMO vient de l'Assurance Maladie Obligatoire (CPAM) et concerne la part Sécu du remboursement. Un rejet AMC vient d'une complémentaire santé (mutuelle) et concerne la part complémentaire. Les deux peuvent arriver sur le même dossier." },
    },
    {
      "@type": "Question",
      name: "Quelles sont les causes les plus fréquentes de rejet AMO en optique ?",
      acceptedAnswer: { "@type": "Answer", text: "Les 3 causes principales sont : (1) le prescripteur non reconnu dans la base CPAM (numéro RPPS incorrect ou remplaçant), (2) les droits de l'assuré non ouverts à la date de délivrance, (3) le code LPP incompatible avec la classe prescrite sur l'ordonnance." },
    },
    {
      "@type": "Question",
      name: "Comment savoir si un rejet AMO est récupérable ?",
      acceptedAnswer: { "@type": "Answer", text: "Un rejet AMO est récupérable si vous êtes dans le délai de 2 ans après la date de délivrance, si l'erreur est corrigible (RPPS, code LPP, pièce manquante), et si les droits de l'assuré étaient réellement ouverts à J0. Un rejet sur droits fermés avec un assuré non couvert est rarement récupérable sans action de l'assuré lui-même." },
    },
    {
      "@type": "Question",
      name: "Quel est le délai de traitement après correction d'un rejet AMO ?",
      acceptedAnswer: { "@type": "Answer", text: "Après renvoi d'un dossier corrigé, la CPAM traite généralement sous 7 à 15 jours ouvrés. Si le dossier est de nouveau rejeté, un recours amiable auprès de la commission de recours (CRA) est possible." },
    },
  ],
};

export default function RejetAMOPage() {
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
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-4 mb-3">Rejet AMO en optique</h1>
          <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
            Un rejet AMO est un refus de remboursement émis par la CPAM après soumission d'un dossier de tiers payant. Il est signalé par un code numérique et peut être corrigé dans un délai de 2 ans.
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-black text-slate-900 mb-4">Définition</h2>
            <p className="text-slate-600 font-medium leading-relaxed mb-4">
              L'AMO (Assurance Maladie Obligatoire) est la part de remboursement prise en charge par la Sécurité Sociale. Dans le cadre du tiers payant optique, l'opticien avance les frais et transmet le dossier à la CPAM via SESAM-Vitale. Si le dossier contient une erreur, la CPAM émet un rejet avec un code spécifique.
            </p>
            <p className="text-slate-600 font-medium leading-relaxed">
              Les rejets AMO les plus fréquents en optique concernent : le prescripteur (code 14), la couverture de l'assuré (code 30), l'accord préalable (code 52), et le code LPP (code 56).
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black text-slate-900 mb-4">Procédure de correction</h2>
            <ol className="space-y-4">
              {[
                "Identifier le code rejet dans votre interface SESAM-Vitale ou Ameli Pro",
                "Corriger uniquement le champ concerné par le code",
                "Resoumettre via feuille de soins électronique rectificative",
                "Suivre la réponse sous 7-15 jours ouvrés",
                "En cas de 2e rejet : saisir la Commission de Recours Amiable (CRA)",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-7 h-7 shrink-0 bg-blue-600 text-white rounded-full text-xs font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                  <span className="text-slate-600 font-medium">{step}</span>
                </li>
              ))}
            </ol>
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
            <h3 className="text-lg font-black text-slate-900 mb-2">OptiBot détecte les rejets AMO automatiquement</h3>
            <p className="text-sm text-slate-500 font-medium mb-5">Alerte en temps réel, motif identifié, correction suggérée. Plus besoin de chercher ce que signifie le code.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest group">
              Essayer 14j gratuit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
