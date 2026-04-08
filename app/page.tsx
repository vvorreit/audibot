import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ChevronDown, ChevronUp, Ear } from "lucide-react";
import HeroSection from "./_landing/HeroSection";
import HowItWorksSection from "./_landing/HowItWorksSection";
import AdvantagesSection from "./_landing/AdvantagesSection";
import SmartFillSection from "./_landing/SmartFillSection";
import PhoneScanSection from "./_landing/PhoneScanSection";
import PortalsSection from "./_landing/PortalsSection";
import TestimonialsSection from "./_landing/TestimonialsSection";
import { JsonLd, softwareAppSchema, buildFaqSchema } from "./_landing/schema-data";
import PricingSection from "./_landing/PricingSection";
import FAQAccordion from "./_landing/FAQAccordion";

export const metadata: Metadata = {
  title: "AudiBot — L\u2019assistant robotis\u00e9 des audioproth\u00e9sistes",
  description:
    "AudiBot automatise la saisie sur les portails mutuelles et ERP audio. Extraction OCR locale de la prescription ORL et de la carte mutuelle. Z\u00e9ro donn\u00e9e patient stock\u00e9e. Essai gratuit sans CB.",
  openGraph: {
    title: "AudiBot — Autofill portails mutuelles & ERP audio",
    description:
      "Moins de clavier, plus d\u2019\u00e9coute. L\u2019extension Chrome qui remplit vos portails mutuelles et votre logiciel m\u00e9tier en 10 secondes.",
    url: "https://audibot.fr",
    siteName: "AudiBot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AudiBot — Autofill portails mutuelles & ERP audio",
    description:
      "Moins de clavier, plus d\u2019\u00e9coute. L\u2019extension Chrome qui remplit vos portails mutuelles et votre logiciel m\u00e9tier en 10 secondes.",
  },
  alternates: { canonical: "https://audibot.fr" },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <JsonLd data={softwareAppSchema} />
      <JsonLd data={buildFaqSchema()} />

      <HeroSection />
      <HowItWorksSection />
      <AdvantagesSection />
      <SmartFillSection />
      <PhoneScanSection />
      <PortalsSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQAccordion />

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-indigo-500/50">
            <Ear className="w-8 h-8" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-12 tracking-tight">Moins de clavier,<br /> plus d&apos;&eacute;coute.</h2>
          <Link href="/dashboard" className="px-12 py-6 bg-white text-slate-900 font-black rounded-[32px] hover:bg-indigo-50 transition-all text-2xl shadow-2xl active:scale-95 inline-block uppercase tracking-widest">
            Essayer AudiBot Gratuitement
          </Link>
          <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Link href="/legal/confidentialite" className="hover:text-white transition-colors">Confidentialit&eacute;</Link>
              <Link href="/legal/cgu" className="hover:text-white transition-colors">Conditions</Link>
              <Link href="/legal/mentions-legales" className="hover:text-white transition-colors">Mentions</Link>
            </div>
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              &copy; 2026 AudiBot &mdash; Pour les Audioproth&eacute;sistes
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
