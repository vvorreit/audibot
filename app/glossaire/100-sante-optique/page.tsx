import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "100% Santé optique — guide complet pour les opticiens",
  description:
    "Tout savoir sur le 100% Santé en optique : panier A, montures éligibles, verres, obligations de l'opticien et impact sur le tiers payant.",
  alternates: { canonical: "https://optibot.fr/glossaire/100-sante-optique" },
};

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "100% Santé optique",
  description: "Le 100% Santé en optique (aussi appelé réforme zéro reste à charge ou RAC 0) est un dispositif réglementaire qui oblige les complémentaires santé à rembourser intégralement certains équipements optiques (panier A), sans reste à charge pour le patient.",
  inDefinedTermSet: { "@type": "DefinedTermSet", name: "Glossaire tiers payant optique — OptiBot", url: "https://optibot.fr/glossaire" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Qu'est-ce que le 100% Santé en optique ?", acceptedAnswer: { "@type": "Answer", text: "Le 100% Santé optique est une réforme entrée en vigueur en 2020 qui impose aux mutuelles de rembourser intégralement (sans reste à charge) les équipements du panier A : montures à tarif plafonné et verres avec critères spécifiques de correction." } },
    { "@type": "Question", name: "Quelles montures sont éligibles au 100% Santé ?", acceptedAnswer: { "@type": "Answer", text: "Les montures 100% Santé doivent avoir un prix de vente inférieur ou égal à 30€ pour les adultes et 30€ pour les enfants. Elles doivent proposer au moins 17 modèles adultes et 10 modèles enfants, en deux tailles. L'opticien doit en proposer au moins dans ces critères." } },
    { "@type": "Question", name: "Le 100% Santé s'applique-t-il au tiers payant ?", acceptedAnswer: { "@type": "Answer", text: "Oui. Pour les équipements du panier A, l'opticien doit obligatoirement pratiquer le tiers payant intégral (AMO + AMC). Le patient ne débourse rien. L'opticien est remboursé directement par la CPAM et la mutuelle." } },
    { "@type": "Question", name: "Quelle est la différence entre panier A et panier B en optique ?", acceptedAnswer: { "@type": "Answer", text: "Le panier A correspond aux équipements 100% Santé sans reste à charge. Le panier B correspond aux équipements à tarif libre, avec reste à charge possible pour le patient selon son contrat mutuelle. Un patient peut panacher A et B sur le même équipement." } },
  ],
};

export default function CentSanteOptiquePage() {
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
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-4 mb-3">100% Santé optique</h1>
          <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">Réforme entrée en vigueur en 2020 imposant un remboursement intégral sur les équipements du panier A — sans reste à charge pour le patient.</p>

          <section className="mb-10">
            <h2 className="text-xl font-black text-slate-900 mb-4">Les obligations pour l'opticien</h2>
            <ul className="space-y-3">
              {[
                "Proposer au moins une gamme de montures 100% Santé (≤ 30€ adults)",
                "Pratiquer le tiers payant intégral sur les équipements panier A",
                "Informer le patient de son droit au 100% Santé avant toute vente",
                "Distinguer clairement les devis panier A et panier B",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600 font-medium text-sm">
                  <span className="w-5 h-5 shrink-0 bg-green-100 text-green-700 rounded-full text-xs font-black flex items-center justify-center mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
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
            <h3 className="text-lg font-black text-slate-900 mb-2">Gérez le tiers payant 100% Santé sans paperasse</h3>
            <p className="text-sm text-slate-500 font-medium mb-5">OptiBot automatise la saisie sur tous les portails mutuelles, classe A comme classe B.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest group">
              Essayer 14j gratuit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
