import Link from "next/link";
import { ArrowLeft, CheckCircle, Wand2, Video, Zap, Ear } from "lucide-react";
import { prisma } from "@/lib/db";
import { mutuelles, erps, type RecorderStatus } from "./portails-data";
import { PortailMatrix } from "./PortailMatrix";

export const revalidate = 300;

export default async function PortailsPage() {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const parcoursValides: { hostname: string }[] = await (prisma as any).parcoursRPA
    .findMany({ where: { valide: true }, select: { hostname: true } })
    .catch(() => []);

  const hostnamesEnregistres = new Set(
    parcoursValides.map((p: { hostname: string }) =>
      p.hostname.replace(/^www\./, "").toLowerCase()
    )
  );

  const mutuellesEnrichies = mutuelles.map((m) => {
    const domain = m.url.replace(/^www\./, "").toLowerCase();
    const isEnregistre = hostnamesEnregistres.has(domain);
    return {
      ...m,
      recorder: (isEnregistre && m.recorder === "Enregistrez-le"
        ? "Enregistr\u00e9"
        : m.recorder) as RecorderStatus,
    };
  });

  const erpsEnrichis = erps.map((e) => {
    const domain = e.url.replace(/^www\./, "").toLowerCase();
    const isEnregistre = hostnamesEnregistres.has(domain);
    return {
      ...e,
      recorder: (isEnregistre && e.recorder === "Enregistrez-le"
        ? "Enregistr\u00e9"
        : e.recorder) as RecorderStatus,
    };
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <nav className="bg-slate-900 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Ear className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight uppercase">AudiBot</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <CheckCircle className="w-3.5 h-3.5" /> {mutuellesEnrichies.length + erpsEnrichis.length} portails mutuelles & ERP audio support&eacute;s
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Votre portail est{" "}
            <span className="text-indigo-600">d&eacute;j&agrave; support&eacute;</span>
          </h1>
          <p className="text-slate-700 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            Smart Fill couvre automatiquement tous les portails &mdash; sans configuration, d&egrave;s l&apos;installation. Le Recorder permet d&apos;enregistrer un parcours personnalis&eacute; en 5 minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-black text-slate-600">
            <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-600">
              <Wand2 className="w-4 h-4" /> Smart Fill universel
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600">
              <Video className="w-4 h-4" /> Recorder 5 min
            </span>
          </div>
        </div>
      </section>

      {/* L&eacute;gende */}
      <section className="py-10 px-6 border-b border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-5">Comment &ccedil;a fonctionne</p>
          <div className="grid sm:grid-cols-2 gap-6">

            {/* Recorder */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-red-500" />
                <p className="text-sm font-black text-slate-900">Recorder</p>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">Enregistrez votre parcours une fois &mdash; AudiBot le rejoue automatiquement pour tous les dossiers suivants.</p>
              <div className="flex flex-col gap-1.5">
                <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-black">
                  <CheckCircle className="w-3 h-3" /> Disponible &mdash; pr&ecirc;t &agrave; l&apos;emploi
                </span>
                <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-black">
                  <Video className="w-3 h-3" /> &Agrave; configurer &mdash; 5 minutes
                </span>
              </div>
            </div>

            {/* Smart Fill */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-violet-600" />
                <p className="text-sm font-black text-slate-900">Smart Fill</p>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">D&eacute;tection automatique des champs. Fonctionne sur <strong>tous les portails</strong> sans aucune configuration.</p>
              <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-black">
                <Wand2 className="w-3 h-3" /> Universel &mdash; actif partout, toujours
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Tableaux */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-16">

          <PortailMatrix items={mutuellesEnrichies} label="Portails mutuelles" />
          <PortailMatrix items={erpsEnrichis} label="Logiciels m&eacute;tiers audio (ERP)" />

          {/* CTA */}
          <div className="bg-slate-900 rounded-[40px] p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[100px]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-[0.2em] mb-5">
                <CheckCircle className="w-3.5 h-3.5" /> Smart Fill couvre tous les autres portails
              </div>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
                Pr&ecirc;t &agrave; automatiser votre saisie ?
              </h3>
              <p className="text-slate-600 font-medium mb-8 max-w-md mx-auto">
                Installez l&apos;extension &mdash; elle d&eacute;tecte votre portail automatiquement et commence &agrave; remplir d&egrave;s la premi&egrave;re utilisation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/extension"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20"
                >
                  <Zap className="w-4 h-4" /> Installer l&apos;extension
                </Link>
                <Link
                  href="/extension#recorder"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 font-black rounded-2xl hover:bg-white/20 transition-all uppercase tracking-widest text-xs"
                >
                  <Video className="w-4 h-4" /> Configurer le Recorder
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
            <Link href="/legal/confidentialite" className="hover:text-white transition-colors">Confidentialit&eacute;</Link>
            <Link href="/legal/cgu" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/legal/cgv" className="hover:text-white transition-colors">CGV</Link>
            <Link href="/legal/mentions-legales" className="hover:text-white transition-colors">Mentions</Link>
          </div>
          <div className="text-slate-700 text-[10px] font-black uppercase tracking-widest">&copy; 2026 AudiBot</div>
        </div>
      </footer>

    </div>
  );
}
