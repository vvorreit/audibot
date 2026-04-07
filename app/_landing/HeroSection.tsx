import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bot } from "lucide-react";
import NavCTA from "@/components/NavCTA";

export default function HeroSection() {
  return (
    <>
      {/* Navigation */}
      <nav className="fixed w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 text-slate-900">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/icon.png" alt="OptiBot" width={36} height={36} className="rounded-xl shadow-lg shadow-blue-200" priority />
            <span className="text-xl font-bold tracking-tight uppercase">OptiBot</span>
          </div>
          <div className="hidden lg:flex gap-10 text-2xs font-black uppercase tracking-widest text-slate-600">
            <a href="#comment-ca-marche" className="hover:text-blue-600 transition-colors">La Solution</a>
            <a href="#avantages" className="hover:text-blue-600 transition-colors">Avantages</a>
            <a href="#tarifs" className="hover:text-blue-600 transition-colors">Tarifs</a>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">Conseils & Astuces</Link>
          </div>
          <div className="flex items-center gap-4">
            <NavCTA />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-2xs font-black uppercase tracking-[0.2em] mb-8">
            <Bot className="w-3 h-3" />
            L&apos;assistant robotisé des opticiens
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.95] text-slate-900">
            Vendez des lunettes,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">pas de la donnée.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            Autofill portails mutuelles &amp; ERP optiques &mdash; pour les opticiens.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              href="/dashboard"
              className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 text-lg group active:scale-95 uppercase tracking-widest"
            >
              Essayer 15 jours gratuit — sans CB
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <p className="text-xs text-slate-600 mt-3 font-medium">Sans carte bancaire · Sans engagement · Annulable à tout moment</p>
          <div className="inline-flex items-center gap-1.5 mt-4 text-xs text-green-700 font-medium">
            <span>🔒</span>
            <span>Données traitées localement — jamais envoyées sur nos serveurs</span>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-14 bg-white border-y border-slate-100 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10s",  label: "Par dossier"              },
            { value: "47",   label: "Portails & ERP compatibles" },
            { value: "∞",    label: "Smart Fill — tout portail"},
            { value: "15j",  label: "Essai gratuit sans CB"    },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="text-3xl md:text-4xl font-black text-slate-900">{s.value}</span>
              <span className="text-2xs font-black uppercase tracking-widest text-slate-600">{s.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
