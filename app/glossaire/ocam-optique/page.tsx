import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "OCAM optique — complémentaire santé et tiers payant",
  description:
    "Qu'est-ce qu'un OCAM en optique ? Rôle des organismes complémentaires, circuit de remboursement, portails AMC et gestion du tiers payant côté opticien.",
  alternates: { canonical: "https://optibot.fr/glossaire/ocam-optique" },
};

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "OCAM optique",
  description: "Un OCAM (Organisme Complémentaire d'Assurance Maladie) est une mutuelle, une compagnie d'assurance ou une institution de prévoyance qui prend en charge la part complémentaire des dépenses de santé non remboursées par l'Assurance Maladie Obligatoire (AMO). En optique, l'OCAM rembourse la part AMC via des portails tiers payant dédiés (Almerys, Viamedis…).",
  inDefinedTermSet: { "@type": "DefinedTermSet", name: "Glossaire tiers payant optique — OptiBot", url: "https://optibot.fr/glossaire" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Qu'est-ce qu'un OCAM en optique ?", acceptedAnswer: { "@type": "Answer", text: "Un OCAM (Organisme Complémentaire d'Assurance Maladie) est une complémentaire santé — mutuelle, assurance ou prévoyance — qui rembourse la part AMC des équipements optiques. En tiers payant, l'opticien soumet le dossier AMC directement sur le portail de l'OCAM (ou via son réseau Almerys/Viamedis)." } },
    { "@type": "Question", name: "Comment l'opticien identifie-t-il l'OCAM du patient ?", acceptedAnswer: { "@type": "Answer", text: "L'OCAM est identifiable via la carte de tiers payant du patient ou l'attestation de droits. Le code OCAM, le numéro adhérent et la date de validité sont nécessaires pour soumettre le dossier AMC sur le bon portail." } },
    { "@type": "Question", name: "Quelle est la différence entre AMO et AMC en optique ?", acceptedAnswer: { "@type": "Answer", text: "L'AMO (Assurance Maladie Obligatoire) est la Sécurité Sociale — elle rembourse selon la nomenclature LPP à taux fixes. L'AMC (Assurance Maladie Complémentaire) est la mutuelle — elle rembourse selon le contrat du patient, souvent en complément de l'AMO." } },
    { "@type": "Question", name: "Tous les OCAM remboursent-ils via Almerys ou Viamedis ?", acceptedAnswer: { "@type": "Answer", text: "Non. Les OCAM sont regroupés en réseaux : Almerys regroupe environ 17 millions de bénéficiaires, Viamedis environ 10 millions. Mais certains OCAM ont leur propre portail ou passent par Noémie ou ACTIL. L'opticien doit identifier le bon circuit pour chaque patient." } },
  ],
};

export default function OCAMOptiquePage() {
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
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-4 mb-3">OCAM — complémentaire santé optique</h1>
          <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">Organisme Complémentaire d'Assurance Maladie — la mutuelle qui rembourse la part AMC. En optique, chaque OCAM a son propre portail ou réseau tiers payant.</p>

          <section className="mb-10">
            <h2 className="text-xl font-black text-slate-900 mb-4">Les principaux réseaux OCAM en optique</h2>
            <div className="space-y-3">
              {[
                { network: "Almerys", count: "~17M bénéficiaires", portail: "mutuelle-almerys.com" },
                { network: "Viamedis", count: "~10M bénéficiaires", portail: "viamedis.fr" },
                { network: "Noémie", count: "Protocole d'échange direct CPAM ↔ OCAM", portail: "Automatique via SESAM-Vitale" },
                { network: "ACTIL", count: "Réseau alternatif", portail: "actil.fr" },
              ].map(r => (
                <div key={r.network} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-black text-slate-900 text-sm">{r.network}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{r.count}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{r.portail}</span>
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
            <h3 className="text-lg font-black text-slate-900 mb-2">OptiBot gère tous les portails OCAM</h3>
            <p className="text-sm text-slate-500 font-medium mb-5">Almerys, Viamedis, Wemind et plus — un seul outil pour tous vos portails mutuelles.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest group">
              Essayer 14j gratuit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
