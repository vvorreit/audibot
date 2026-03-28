import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Tiers payant optique — définition, fonctionnement et portails",
  description:
    "Tout comprendre sur le tiers payant en optique : définition, circuit AMO/AMC, portails Almerys et Viamedis, délais, rejets. Le guide complet pour les opticiens.",
  alternates: { canonical: "https://optibot.fr/glossaire/tiers-payant-optique" },
};

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Tiers payant optique",
  description:
    "Le tiers payant en optique est un dispositif permettant à l'opticien d'être remboursé directement par l'Assurance Maladie et/ou la complémentaire santé du patient, sans que celui-ci ait à avancer les frais. L'opticien transmet les dossiers via des portails dédiés (Almerys, Viamedis, Noémie…).",
  inDefinedTermSet: { "@type": "DefinedTermSet", name: "Glossaire tiers payant optique — OptiBot", url: "https://optibot.fr/glossaire" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Comment fonctionne le tiers payant en optique ?",
      acceptedAnswer: { "@type": "Answer", text: "L'opticien avance les frais pour le patient et soumet un dossier de remboursement à la CPAM (part AMO via SESAM-Vitale) et à la mutuelle (part AMC via le portail de la mutuelle — Almerys, Viamedis, etc.). Les deux remboursements arrivent directement sur le compte de l'opticien." },
    },
    {
      "@type": "Question",
      name: "Quels sont les portails tiers payant pour les opticiens ?",
      acceptedAnswer: { "@type": "Answer", text: "Les principaux portails tiers payant utilisés par les opticiens sont Almerys (17 millions de bénéficiaires), Viamedis (env. 10 millions), Wemind, Génération Mutuelle, Harmonie Mutuelle, Malakoff Humanis, AG2R La Mondiale et ACTIL. Chaque portail a son interface et ses règles spécifiques." },
    },
    {
      "@type": "Question",
      name: "Quel est le délai de remboursement en tiers payant optique ?",
      acceptedAnswer: { "@type": "Answer", text: "La part AMO est généralement remboursée sous 7 à 15 jours si le dossier est correct. La part AMC varie selon la mutuelle : de 10 jours pour les plus rapides à 45-60 jours pour certaines. En cas de rejet, les délais recommencent à zéro." },
    },
    {
      "@type": "Question",
      name: "Le tiers payant est-il obligatoire pour les opticiens ?",
      acceptedAnswer: { "@type": "Answer", text: "Depuis 2017, le tiers payant AMO est de droit pour les bénéficiaires de la CSS et de l'ALD. Pour les autres assurés, l'opticien peut choisir de le pratiquer ou non, mais le refuser peut être un frein commercial, notamment dans le cadre du 100% Santé." },
    },
    {
      "@type": "Question",
      name: "Combien de temps faut-il pour traiter un dossier tiers payant opticien ?",
      acceptedAnswer: { "@type": "Answer", text: "La saisie manuelle d'un dossier complet (AMO + AMC) prend entre 8 et 15 minutes par dossier. Avec une solution d'automatisation comme OptiBot, ce temps est réduit à moins de 30 secondes via l'OCR et le remplissage automatique des portails." },
    },
  ],
};

export default function TiersPayantOptiquePage() {
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
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-4 mb-3">Tiers payant optique</h1>
          <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">Dispositif permettant à l'opticien d'être remboursé directement par l'Assurance Maladie et la mutuelle du patient — sans avance de frais pour le patient.</p>

          <section className="mb-10">
            <h2 className="text-xl font-black text-slate-900 mb-4">Définition</h2>
            <p className="text-slate-600 font-medium leading-relaxed mb-4">Le tiers payant en optique repose sur deux circuits distincts mais souvent simultanés :</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { title: "Part AMO (Sécu)", desc: "Transmise via SESAM-Vitale. Remboursée par la CPAM. Concerne la base remboursable fixée par la nomenclature (codes LPP)." },
                { title: "Part AMC (mutuelle)", desc: "Transmise via le portail de la complémentaire (Almerys, Viamedis…). Concerne le complément au-delà de la base Sécu." },
              ].map(b => (
                <div key={b.title} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="font-black text-slate-900 mb-2 text-sm">{b.title}</h3>
                  <p className="text-sm text-slate-500 font-medium">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black text-slate-900 mb-4">Les principaux portails mutuelles</h2>
            <div className="flex flex-wrap gap-2">
              {["Almerys", "Viamedis", "Wemind", "Harmonie Mutuelle", "Malakoff Humanis", "AG2R La Mondiale", "Génération Mutuelle", "ACTIL"].map(p => (
                <span key={p} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-black rounded-full border border-blue-100">{p}</span>
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
            <h3 className="text-lg font-black text-slate-900 mb-2">Automatisez votre tiers payant avec OptiBot</h3>
            <p className="text-sm text-slate-500 font-medium mb-5">OCR local + remplissage automatique des portails mutuelles. De 15 min à 30 secondes par dossier.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest group">
              Essayer 14j gratuit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
