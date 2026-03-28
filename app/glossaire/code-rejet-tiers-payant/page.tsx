import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Codes rejet tiers payant optique — guide complet AMO et AMC",
  description:
    "Tous les codes rejet tiers payant en optique : code 10, 14, 30, 52, 56, 63, 100… Signification, cause et correction pour chaque code AMO et AMC.",
  alternates: { canonical: "https://optibot.fr/glossaire/code-rejet-tiers-payant" },
};

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Codes rejet tiers payant optique",
  description:
    "Les codes rejet tiers payant sont des codes numériques envoyés par l'Assurance Maladie (AMO) ou les complémentaires santé (AMC) pour indiquer pourquoi un dossier de tiers payant a été refusé. Chaque code correspond à une erreur précise dans le dossier soumis.",
  inDefinedTermSet: {
    "@type": "DefinedTermSet",
    name: "Glossaire tiers payant optique — OptiBot",
    url: "https://optibot.fr/glossaire",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Qu'est-ce que le code rejet 14 en tiers payant optique ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le code rejet 14 signifie que le prescripteur (médecin ou ophtalmologue) n'est pas reconnu dans la base de l'Assurance Maladie. Cela arrive souvent avec un remplaçant ou un médecin qui vient de changer de numéro RPPS. Correction : vérifier et mettre à jour le numéro RPPS du prescripteur dans votre logiciel.",
      },
    },
    {
      "@type": "Question",
      name: "Qu'est-ce que le code rejet 30 en tiers payant ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le code 30 indique que l'assuré n'était pas couvert à la date de délivrance des équipements. Il faut vérifier les droits ouverts via Ameli Pro à la date exacte de la remise des verres, pas à la date de la commande.",
      },
    },
    {
      "@type": "Question",
      name: "Qu'est-ce que le code rejet 52 ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le code 52 signifie qu'un accord préalable était nécessaire et qu'il est absent ou expiré. En optique, cela concerne principalement les cas hors nomenclature ou les renouvellements précoces. Correction : retrouver l'accord préalable ou en redemander un.",
      },
    },
    {
      "@type": "Question",
      name: "Comment corriger un code rejet 56 ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le code 56 indique une incompatibilité entre le code LPP utilisé et le diagnostic ou la classe d'équipement prescrite. Vérifiez que le code LPP correspond bien à la correction prescrite sur l'ordonnance (classe A, B, ou prescription renforcée).",
      },
    },
    {
      "@type": "Question",
      name: "Quel est le délai pour corriger un rejet AMO ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En règle générale, vous disposez de 2 ans à partir de la date de délivrance pour soumettre un dossier corrigé à l'Assurance Maladie. Passé ce délai, le remboursement est définitivement perdu.",
      },
    },
  ],
};

const rejets = [
  { code: "10", cause: "Numéro de Sécurité Sociale invalide ou non reconnu", correction: "Vérifier le N° SS sur la carte Vitale physique ou via Ameli Pro" },
  { code: "14", cause: "Prescripteur non enregistré (RPPS inconnu ou remplaçant)", correction: "Mettre à jour le numéro RPPS dans votre logiciel" },
  { code: "30", cause: "Assuré non couvert à la date de délivrance", correction: "Vérifier les droits ouverts via Ameli Pro à J0" },
  { code: "52", cause: "Accord préalable manquant ou expiré", correction: "Retrouver ou redemander l'accord ; vérifier la date de validité" },
  { code: "56", cause: "Code LPP incompatible avec le diagnostic ou la classe prescrite", correction: "Vérifier la classe d'équipement et le code LPP utilisé" },
  { code: "63", cause: "Date de prescription incohérente avec la date de délivrance", correction: "Corriger la date ou obtenir une réécriture de l'ordonnance" },
  { code: "100", cause: "Dossier incomplet (pièce justificative manquante)", correction: "Identifier la pièce manquante dans le retour CPAM et la joindre" },
];

export default function CodeRejetPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="min-h-screen bg-white">
        <nav className="fixed w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm">O</div>
              <span className="text-lg font-bold tracking-tight uppercase text-slate-900">OptiBot</span>
            </Link>
            <Link href="/glossaire" className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
              <ChevronLeft className="w-3 h-3" /> Glossaire
            </Link>
          </div>
        </nav>

        <article className="max-w-3xl mx-auto px-6 pt-32 pb-24">
          <div className="mb-2">
            <Link href="/glossaire" className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">← Glossaire</Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-4 mb-3">
            Codes rejet tiers payant optique
          </h1>
          <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
            Les codes rejet sont des codes numériques envoyés par l'Assurance Maladie (AMO) ou les complémentaires santé (AMC) pour indiquer pourquoi un dossier a été refusé. Voici les plus courants en optique, avec leur cause et la correction à apporter.
          </p>

          {/* Table des codes */}
          <section className="mb-14">
            <h2 className="text-xl font-black text-slate-900 mb-6">Codes rejet AMO — tableau de référence</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-3 px-5 font-black text-slate-500 uppercase tracking-widest text-xs w-20">Code</th>
                    <th className="text-left py-3 px-5 font-black text-slate-500 uppercase tracking-widest text-xs">Cause</th>
                    <th className="text-left py-3 px-5 font-black text-slate-500 uppercase tracking-widest text-xs">Correction</th>
                  </tr>
                </thead>
                <tbody>
                  {rejets.map((r, i) => (
                    <tr key={r.code} className={`border-b border-slate-100 last:border-0 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center justify-center w-10 h-7 bg-red-50 text-red-600 font-black text-xs rounded-lg">{r.code}</span>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-700">{r.cause}</td>
                      <td className="py-3.5 px-5 text-slate-500">{r.correction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-14">
            <h2 className="text-xl font-black text-slate-900 mb-6">Questions fréquentes sur les codes rejet</h2>
            <div className="space-y-6">
              {faqSchema.mainEntity.map((item, i) => (
                <div key={i} className="border-l-4 border-blue-100 pl-5">
                  <h3 className="text-base font-black text-slate-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-black text-slate-900 mb-2">Évitez les rejets avec OptiBot</h3>
            <p className="text-sm text-slate-500 font-medium mb-5">OptiBot détecte les rejets en temps réel et vous indique la correction à apporter — sans chercher dans les codes.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest group">
              Essayer 14j gratuit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
