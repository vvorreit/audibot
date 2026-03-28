import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CheckCircle, Circle, Wand2, ScanLine, Globe, MousePointerClick } from "lucide-react";
import FaviconImg from "@/components/FaviconImg";

export interface PortailDetailData {
  name: string;
  type: "mutuelle" | "erp";
  domain: string;
  networkDescription: string;
  portailUrl: string;
  status: "Partiel" | "Smart Fill disponible";
  filledFields: string[];
  manualFields: string[];
  blogSlug: string;
  blogLabel: string;
}

function getFaviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function StatusBadge({ status }: { status: PortailDetailData["status"] }) {
  if (status === "Partiel")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-black whitespace-nowrap">
        <Circle className="w-3 h-3 fill-amber-400 text-amber-400" /> Partiel
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-full text-xs font-black whitespace-nowrap">
      <Wand2 className="w-3 h-3" /> Smart Fill disponible
    </span>
  );
}

const steps = [
  {
    icon: ScanLine,
    title: "Scannez la carte mutuelle",
    desc: "Depuis l\u2019appli OptiBot ou l\u2019extension Chrome, scannez la carte du patient. Toutes les infos sont extraites automatiquement.",
  },
  {
    icon: Globe,
    title: "Ouvrez le portail",
    desc: "Rendez-vous sur le portail mutuelle ou ERP concern\u00e9. OptiBot d\u00e9tecte automatiquement la page.",
  },
  {
    icon: MousePointerClick,
    title: 'Cliquez "Remplir"',
    desc: "Un seul clic sur le bouton OptiBot et tous les champs reconnus sont remplis instantan\u00e9ment.",
  },
];

export default function PortailDetailPage({ data }: { data: PortailDetailData }) {
  const showSmartFill = data.status === "Smart Fill disponible" || data.manualFields.length > 0;
  const typeLabel = data.type === "mutuelle" ? "Mutuelle" : "ERP";

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Nav */}
      <nav className="bg-slate-900 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/icon.png" alt="OptiBot" width={32} height={32} className="rounded-xl" />
            <span className="text-lg font-bold tracking-tight uppercase">OptiBot</span>
          </Link>
          <Link
            href="/portails"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Tous les portails
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-2xs font-black uppercase tracking-[0.2em] mb-6">
            {typeLabel}
          </div>
          <div className="flex items-center justify-center gap-4 mb-6">
            <FaviconImg name={data.name} favicon={getFaviconUrl(data.domain)} />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              OptiBot &times; {data.name}
            </h1>
          </div>
          <StatusBadge status={data.status} />
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed mt-6">
            {data.networkDescription}
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Portail&nbsp;: <span className="font-bold text-slate-500">{data.portailUrl}</span>
          </p>
        </div>
      </section>

      {/* Ce qu'OptiBot remplit */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-2xs font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Automatisation</p>
          <h2 className="text-2xl font-black tracking-tight mb-8">Ce qu&apos;OptiBot remplit sur {data.name}</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Champs automatisés */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-4">
                Champs remplis automatiquement
              </p>
              <ul className="space-y-2">
                {data.filledFields.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Champs manuels */}
            {data.manualFields.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-4">
                  Champs encore manuels
                </p>
                <ul className="space-y-2">
                  {data.manualFields.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Circle className="w-4 h-4 text-amber-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comment utiliser */}
      <section className="py-16 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-2xs font-black uppercase tracking-[0.3em] text-blue-600 mb-2">En 3 étapes</p>
          <h2 className="text-2xl font-black tracking-tight mb-10">
            Comment utiliser OptiBot avec {data.name}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6" />
                </div>
                <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  Étape {i + 1}
                </p>
                <h3 className="font-black text-sm mb-2">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Fill */}
      {showSmartFill && (
        <section className="py-12 px-6 bg-violet-50 border-b border-violet-100">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0">
              <Wand2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 mb-1">
                Disponible sur TOUS les portails
              </p>
              <h3 className="text-xl font-black text-slate-900 mb-1">Smart Fill — remplissage universel</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                M&ecirc;me si le mapping d&eacute;di&eacute; {data.name} n&apos;est pas encore complet, le{" "}
                <strong>Smart Fill</strong> fonctionne d&eacute;j&agrave; : OptiBot d&eacute;tecte et remplit
                automatiquement tous les champs reconnus (NSS, nom, pr&eacute;nom, date&hellip;) sans aucune
                configuration.
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-2xl text-xs font-black">
                <Wand2 className="w-4 h-4" /> Inclus dans tous les plans
              </span>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-900 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[100px]" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-4">
                Essayez OptiBot gratuitement
              </h3>
              <p className="text-slate-400 font-medium mb-8 max-w-lg mx-auto leading-relaxed">
                7 jours d&apos;essai gratuit, sans engagement. Automatisez vos saisies tiers payant d&egrave;s
                aujourd&apos;hui.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
                >
                  Essai gratuit
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/portails"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 font-black rounded-2xl hover:bg-white/20 transition-all uppercase tracking-widest text-xs"
                >
                  Voir tous les portails
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog lié */}
      <section className="py-10 px-6 border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-2xs font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Article lié</p>
          <Link
            href={data.blogSlug}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 font-bold text-sm transition-colors"
          >
            {data.blogLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer mini */}
      <footer className="bg-slate-900 text-white py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-8 text-2xs font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/legal/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/legal/cgu" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/legal/cgv" className="hover:text-white transition-colors">CGV</Link>
            <Link href="/legal/mentions-legales" className="hover:text-white transition-colors">Mentions</Link>
          </div>
          <div className="text-slate-500 text-2xs font-black uppercase tracking-widest">&copy; 2026 OptiBot</div>
        </div>
      </footer>
    </div>
  );
}
