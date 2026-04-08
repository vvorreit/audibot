import Link from "next/link";
import { ArrowRight, Bot, Ear } from "lucide-react";
import NavCTA from "@/components/NavCTA";

export default function HeroSection() {
  return (
    <>
      {/* Navigation */}
      <nav className="fixed w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 text-slate-900">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
              <Ear className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">AudiBot</span>
          </div>
          <div className="hidden lg:flex gap-10 text-2xs font-black uppercase tracking-widest text-slate-600">
            <a href="#comment-ca-marche" className="hover:text-indigo-600 transition-colors">La Solution</a>
            <a href="#avantages" className="hover:text-indigo-600 transition-colors">Avantages</a>
            <a href="#tarifs" className="hover:text-indigo-600 transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-4">
            <NavCTA />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent -z-10" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-2xs font-black uppercase tracking-[0.2em] mb-8">
            <Bot className="w-3 h-3" />
            L&apos;assistant robotis&eacute; des audioproth&eacute;sistes
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.95] text-slate-900">
            Moins de clavier,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">plus d&apos;&eacute;coute.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            Autofill portails mutuelles &amp; ERP audio &mdash; pour les audioproth&eacute;sistes.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              href="/dashboard"
              className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 text-lg group active:scale-95 uppercase tracking-widest"
            >
              D&eacute;marrer l&apos;essai gratuit
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <p className="text-xs text-slate-600 mt-3 font-medium">Sans carte bancaire &middot; Sans engagement &middot; Annulable &agrave; tout moment</p>
          <div className="inline-flex items-center gap-1.5 mt-4 text-xs text-green-700 font-medium">
            <span>🔒</span>
            <span>Donn&eacute;es trait&eacute;es localement &mdash; jamais envoy&eacute;es sur nos serveurs</span>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-14 bg-white border-y border-slate-100 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10s",    label: "Par dossier"              },
            { value: "15 min", label: "&Eacute;conomis&eacute;es/dossier" },
            { value: "∞",      label: "Smart Fill — tout portail"},
            { value: "0",      label: "Donn&eacute;e stock&eacute;e"      },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="text-3xl md:text-4xl font-black text-slate-900">{s.value}</span>
              <span className="text-2xs font-black uppercase tracking-widest text-slate-600" dangerouslySetInnerHTML={{ __html: s.label }} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
