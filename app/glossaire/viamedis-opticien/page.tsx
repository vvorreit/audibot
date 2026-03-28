import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Viamedis pour les opticiens — portail, codes et automatisation",
  description:
    "Guide complet Viamedis pour les opticiens : accès portail, champs requis, codes rejet fréquents, délais de remboursement et automatisation avec OptiBot.",
  alternates: { canonical: "https://optibot.fr/glossaire/viamedis-opticien" },
};

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Viamedis pour les opticiens",
  description: "Viamedis est le deuxième réseau de tiers payant optique en France avec environ 10 millions de bénéficiaires. Les opticiens utilisent le portail Viamedis pour soumettre les demandes de remboursement AMC de leurs patients couverts par les mutuelles du réseau.",
  inDefinedTermSet: { "@type": "DefinedTermSet", name: "Glossaire tiers payant optique — OptiBot", url: "https://optibot.fr/glossaire" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Comment accéder au portail Viamedis en tant qu'opticien ?", acceptedAnswer: { "@type": "Answer", text: "L'accès au portail Viamedis professionnel se fait via viamedis.fr/espace-pro avec vos identifiants de praticien. Si vous n'êtes pas encore référencé, la création de compte nécessite votre SIRET et votre numéro ADELI ou RPPS." } },
    { "@type": "Question", name: "Quelles mutuelles passent par Viamedis ?", acceptedAnswer: { "@type": "Answer", text: "Le réseau Viamedis regroupe notamment Malakoff Humanis, Apicil, Groupama, April et plusieurs autres mutuelles et institutions de prévoyance. Environ 10 millions de Français sont couverts via Viamedis." } },
    { "@type": "Question", name: "Quel est le délai de remboursement Viamedis ?", acceptedAnswer: { "@type": "Answer", text: "Viamedis traite les dossiers en général sous 15 à 30 jours. Le délai dépend aussi de la mutuelle membre du réseau. En cas de rejet, un nouveau délai complet démarre après correction." } },
    { "@type": "Question", name: "Peut-on automatiser la saisie sur Viamedis avec OptiBot ?", acceptedAnswer: { "@type": "Answer", text: "Oui. OptiBot prend en charge le portail Viamedis via son extension Chrome. L'OCR extrait les données de la carte mutuelle et les injecte automatiquement dans les champs du portail Viamedis en moins de 30 secondes." } },
  ],
};

export default function ViamedisOpticienPage() {
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
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-4 mb-3">Viamedis pour les opticiens</h1>
          <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">Deuxième réseau de tiers payant optique en France (~10M bénéficiaires). Portail incontournable pour les opticiens dont les patients sont couverts par Malakoff Humanis, Apicil ou Groupama.</p>

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

          <div className="flex flex-wrap gap-3 mb-14">
            <Link href="/glossaire/almerys-opticien" className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">→ Almerys pour les opticiens</Link>
            <Link href="/glossaire/code-rejet-tiers-payant" className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">→ Codes rejet tiers payant</Link>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-black text-slate-900 mb-2">Automatisez Viamedis avec OptiBot</h3>
            <p className="text-sm text-slate-500 font-medium mb-5">OCR + remplissage automatique du portail Viamedis. Aussi disponible pour Almerys et 10+ autres portails.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest group">
              Essayer 14j gratuit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
