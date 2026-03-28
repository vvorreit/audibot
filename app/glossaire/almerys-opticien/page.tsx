import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Almerys pour les opticiens — portail, saisie et automatisation",
  description:
    "Guide complet Almerys pour les opticiens : accès au portail, champs à remplir, codes rejet fréquents, délais de remboursement et automatisation avec OptiBot.",
  alternates: { canonical: "https://optibot.fr/glossaire/almerys-opticien" },
};

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Almerys pour les opticiens",
  description: "Almerys est le premier réseau de tiers payant optique en France avec environ 17 millions de bénéficiaires. Les opticiens accèdent au portail Almerys (mutuelle-almerys.com) pour soumettre les demandes de remboursement AMC de leurs patients.",
  inDefinedTermSet: { "@type": "DefinedTermSet", name: "Glossaire tiers payant optique — OptiBot", url: "https://optibot.fr/glossaire" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Comment accéder au portail Almerys en tant qu'opticien ?", acceptedAnswer: { "@type": "Answer", text: "L'accès au portail Almerys se fait via mutuelle-almerys.com avec les identifiants fournis lors de votre adhésion au réseau. Si vous n'avez pas encore de compte, contactez Almerys Pro pour créer votre espace professionnel." } },
    { "@type": "Question", name: "Quels champs faut-il remplir sur Almerys pour un opticien ?", acceptedAnswer: { "@type": "Answer", text: "Sur le portail Almerys optique, vous devez renseigner : le numéro SS de l'ouvrant droit, le nom et prénom du bénéficiaire, la date de l'ordonnance, le numéro RPPS du prescripteur, la date de délivrance, les codes LPP et les montants correspondants." } },
    { "@type": "Question", name: "Quel est le délai de remboursement Almerys pour les opticiens ?", acceptedAnswer: { "@type": "Answer", text: "Almerys rembourse généralement sous 10 à 20 jours ouvrés après validation du dossier. En cas de rejet, un nouveau délai complet commence après la correction et le renvoi." } },
    { "@type": "Question", name: "Peut-on automatiser la saisie sur Almerys ?", acceptedAnswer: { "@type": "Answer", text: "Oui. OptiBot automatise le remplissage du portail Almerys via son extension Chrome. L'OCR lit la carte mutuelle et l'ordonnance, puis injecte automatiquement les données dans les champs Almerys en un clic." } },
  ],
};

export default function AlmerysOpticienPage() {
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
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-4 mb-3">Almerys pour les opticiens</h1>
          <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">Premier réseau de tiers payant optique en France (~17M bénéficiaires). Le portail Almerys est incontournable pour les opticiens qui pratiquent le tiers payant AMC.</p>

          <section className="mb-10">
            <h2 className="text-xl font-black text-slate-900 mb-4">Champs à remplir sur Almerys</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {["N° SS ouvrant droit", "Nom / Prénom bénéficiaire", "Date de l'ordonnance", "N° RPPS prescripteur", "Date de délivrance", "Codes LPP verres OD/OG", "Montant verres", "Montant monture"].map(f => (
                <div key={f} className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />{f}
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
            <h3 className="text-lg font-black text-slate-900 mb-2">Remplissez Almerys en 1 clic avec OptiBot</h3>
            <p className="text-sm text-slate-500 font-medium mb-5">OCR carte mutuelle → injection automatique dans le portail Almerys. De 8 min à 20 secondes.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest group">
              Essayer 14j gratuit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
