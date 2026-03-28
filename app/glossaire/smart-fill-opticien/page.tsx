import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Smart Fill — remplissage automatique universel pour opticiens",
  description:
    "Qu'est-ce que le Smart Fill ? Comment fonctionne le remplissage automatique universel sur les portails mutuelles et ERP optiques ? Guide complet OptiBot.",
  alternates: { canonical: "https://optibot.fr/glossaire/smart-fill-opticien" },
};

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Smart Fill — remplissage automatique universel",
  description: "Le Smart Fill est une technologie d'auto-complétion intelligente qui détecte automatiquement les champs d'un formulaire web (portail mutuelle, ERP) et les remplit avec les données extraites par OCR. Contrairement aux intégrations spécifiques par portail, le Smart Fill fonctionne sur n'importe quel formulaire sans configuration préalable.",
  inDefinedTermSet: { "@type": "DefinedTermSet", name: "Glossaire tiers payant optique — OptiBot", url: "https://optibot.fr/glossaire" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Qu'est-ce que le Smart Fill en optique ?", acceptedAnswer: { "@type": "Answer", text: "Le Smart Fill est un module d'OptiBot qui permet de remplir automatiquement n'importe quel formulaire web avec les données extraites par OCR (carte mutuelle, ordonnance). Il détecte les champs NSS, nom, prénom, date… sans avoir besoin d'une intégration spécifique au portail." } },
    { "@type": "Question", name: "Quelle est la différence entre Smart Fill et une intégration portail classique ?", acceptedAnswer: { "@type": "Answer", text: "Une intégration portail classique nécessite un développement spécifique pour chaque portail (Almerys, Viamedis…). Le Smart Fill, lui, s'adapte automatiquement à n'importe quel formulaire web en analysant la structure de la page en temps réel — ce qui le rend compatible avec tous les portails, y compris ceux sans intégration dédiée." } },
    { "@type": "Question", name: "Le Smart Fill apprend-il au fil du temps ?", acceptedAnswer: { "@type": "Answer", text: "Oui. Quand un opticien corrige manuellement un champ mal rempli, OptiBot enregistre la correction et améliore la précision pour les prochaines saisies sur ce même portail. Le Smart Fill est auto-apprenant et devient plus précis avec l'usage." } },
    { "@type": "Question", name: "Le Smart Fill fonctionne-t-il sur les ERP optiques ?", acceptedAnswer: { "@type": "Answer", text: "Oui. Le Smart Fill d'OptiBot est compatible avec les ERP optiques accessibles via navigateur (iGestion, WinOptics, OptiFlex…). Les données de l'ordonnance (sphère, cylindre, axe, addition) et de la carte mutuelle sont injectées directement dans les champs de l'ERP." } },
  ],
};

export default function SmartFillPage() {
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
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-4 mb-3">Smart Fill — remplissage automatique universel</h1>
          <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">Technologie d'auto-complétion qui détecte et remplit automatiquement les champs de n'importe quel formulaire web — portails mutuelles, ERP, ou tout autre outil.</p>

          <section className="mb-10">
            <h2 className="text-xl font-black text-slate-900 mb-4">Comment ça marche</h2>
            <ol className="space-y-4">
              {[
                "L'OCR lit la carte mutuelle ou l'ordonnance sur votre appareil (traitement local, aucune donnée envoyée)",
                "Les données sont extraites : NSS, nom, prénom, corrections, date, RPPS…",
                "Le Smart Fill analyse la page web ouverte dans votre navigateur et identifie les champs correspondants",
                "L'extension Chrome injecte les données dans les bons champs en un clic",
                "Vous vérifiez et validez — correction corrigée automatiquement pour la prochaine fois",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-7 h-7 shrink-0 bg-blue-600 text-white rounded-full text-xs font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                  <span className="text-slate-600 font-medium text-sm">{step}</span>
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
            <h3 className="text-lg font-black text-slate-900 mb-2">Smart Fill inclus dans tous les plans OptiBot</h3>
            <p className="text-sm text-slate-500 font-medium mb-5">Fonctionne sur Almerys, Viamedis, Wemind, et tous vos portails — même sans intégration dédiée.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest group">
              Essayer 14j gratuit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
