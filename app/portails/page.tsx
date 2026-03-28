import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Wand2, Video, Zap } from "lucide-react";
import { FaviconWithFallback } from "./FaviconWithFallback";
import { prisma } from "@/lib/db";

function getFaviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

/* ── Types ── */
type RecorderStatus = "Disponible" | "Enregistrez-le" | "Enregistré";

interface Portail {
  name: string;
  url: string;
  favicon: string;
  recorder: RecorderStatus;
}

/* ── Mutuelles ── */
const mutuelles: Portail[] = [
  // ── Hardcodées ──
  {
    name: "Almerys",
    url: "mutuelle-almerys.com",
    favicon: getFaviconUrl("mutuelle-almerys.com"),
    recorder: "Disponible",
  },
  {
    name: "Wemind",
    url: "pro.wemind.io",
    favicon: getFaviconUrl("wemind.io"),
    recorder: "Disponible",
  },
  {
    name: "Génération",
    url: "professionnel.generation.fr",
    favicon: getFaviconUrl("generation.fr"),
    recorder: "Disponible",
  },
  {
    name: "Oxantis",
    url: "oxantis.net",
    favicon: getFaviconUrl("oxantis.net"),
    recorder: "Disponible",
  },
  {
    name: "TP Plus / Santeclair",
    url: "optique-tpplus.ffl-promoteur.com",
    favicon: getFaviconUrl("santeclair.fr"),
    recorder: "Disponible",
  },
  {
    name: "Viamedis",
    url: "pro.viamedis.net",
    favicon: getFaviconUrl("viamedis.net"),
    recorder: "Disponible",
  },
  {
    name: "Itelis",
    url: "pro.ism-tp.fr",
    favicon: getFaviconUrl("ism-tp.fr"),
    recorder: "Disponible",
  },
  {
    name: "SP Santé",
    url: "spsante.fr",
    favicon: getFaviconUrl("spsante.fr"),
    recorder: "Disponible",
  },
  {
    name: "Solimut",
    url: "solimut.fr",
    favicon: getFaviconUrl("solimut.fr"),
    recorder: "Disponible",
  },
  {
    name: "APGIS",
    url: "espaceprofessionnel.apgis.com",
    favicon: getFaviconUrl("apgis.com"),
    recorder: "Disponible",
  },
  {
    name: "Actil (Kalixia)",
    url: "actil.com",
    favicon: getFaviconUrl("actil.com"),
    recorder: "Disponible",
  },
  {
    name: "Mercer",
    url: "mercernet.fr",
    favicon: getFaviconUrl("mercernet.fr"),
    recorder: "Disponible",
  },
  {
    name: "Ameli (CPAM)",
    url: "ameli.fr",
    favicon: getFaviconUrl("ameli.fr"),
    recorder: "Disponible",
  },
  // ── Top mutuelles FR — Smart Fill + Recorder ──
  {
    name: "Harmonie Mutuelle",
    url: "harmonie-mutuelle.fr",
    favicon: getFaviconUrl("harmonie-mutuelle.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "MGEN",
    url: "mgen.fr",
    favicon: getFaviconUrl("mgen.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Malakoff Humanis",
    url: "malakoffhumanis.com",
    favicon: getFaviconUrl("malakoffhumanis.com"),
    recorder: "Enregistrez-le",
  },
  {
    name: "AG2R La Mondiale",
    url: "ag2rlamondiale.fr",
    favicon: getFaviconUrl("ag2rlamondiale.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Groupama Santé",
    url: "groupama.fr",
    favicon: getFaviconUrl("groupama.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Swiss Life",
    url: "swisslife.fr",
    favicon: getFaviconUrl("swisslife.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Carte Blanche Partenaires",
    url: "carte-blanche-partenaires.fr",
    favicon: getFaviconUrl("carte-blanche-partenaires.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Mutex",
    url: "mutex.fr",
    favicon: getFaviconUrl("mutex.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Apivia",
    url: "apivia.fr",
    favicon: getFaviconUrl("apivia.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Intériale",
    url: "interiale.fr",
    favicon: getFaviconUrl("interiale.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "MAAF Santé",
    url: "maaf.fr",
    favicon: getFaviconUrl("maaf.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "GMF",
    url: "gmf.fr",
    favicon: getFaviconUrl("gmf.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Mutuelle Nationale Territoriale",
    url: "mnt.fr",
    favicon: getFaviconUrl("mnt.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Mutuelle Générale",
    url: "mutuellegenerale.fr",
    favicon: getFaviconUrl("mutuellegenerale.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Alptis",
    url: "alptis.org",
    favicon: getFaviconUrl("alptis.org"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Neoliane",
    url: "neoliane.fr",
    favicon: getFaviconUrl("neoliane.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "April Santé",
    url: "april.fr",
    favicon: getFaviconUrl("april.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Eovi-MCD",
    url: "eovi-mcd.fr",
    favicon: getFaviconUrl("eovi-mcd.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Ociane Matmut",
    url: "ociane.fr",
    favicon: getFaviconUrl("ociane.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Henner",
    url: "henner.com",
    favicon: getFaviconUrl("henner.com"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Previfrance",
    url: "previfrance.fr",
    favicon: getFaviconUrl("previfrance.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Uniprévoyance",
    url: "uniprevoyance.fr",
    favicon: getFaviconUrl("uniprevoyance.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Coverlife",
    url: "coverlife.fr",
    favicon: getFaviconUrl("coverlife.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Vyv",
    url: "vyv.fr",
    favicon: getFaviconUrl("vyv.fr"),
    recorder: "Enregistrez-le",
  },
];

/* ── ERPs ── */
const erps: Portail[] = [
  {
    name: "Cosium (CosiumShop)",
    url: "cosium.com",
    favicon: getFaviconUrl("cosium.com"),
    recorder: "Disponible",
  },
  {
    name: "I-Optics (Cegid / Cristallin)",
    url: "cegid.com",
    favicon: getFaviconUrl("cegid.com"),
    recorder: "Disponible",
  },
  {
    name: "PVO (Ginkoia)",
    url: "ginkoia.com",
    favicon: getFaviconUrl("ginkoia.com"),
    recorder: "Disponible",
  },
  {
    name: "IDM Optic (Axess)",
    url: "axess-groupe.fr",
    favicon: getFaviconUrl("axess-groupe.fr"),
    recorder: "Disponible",
  },
  {
    name: "MyEasyOptic",
    url: "myeasyoptic.com",
    favicon: getFaviconUrl("myeasyoptic.com"),
    recorder: "Disponible",
  },
  {
    name: "WinOptics",
    url: "winoptics.fr",
    favicon: getFaviconUrl("winoptics.fr"),
    recorder: "Disponible",
  },
  {
    name: "Optimum (CIT)",
    url: "livebyoptimum.com",
    favicon: getFaviconUrl("livebyoptimum.com"),
    recorder: "Disponible",
  },
  {
    name: "Osmose (Amonis)",
    url: "amonis.fr",
    favicon: getFaviconUrl("amonis.fr"),
    recorder: "Disponible",
  },
  {
    name: "Acuitas 3 (Ocuco)",
    url: "ocuco.com",
    favicon: getFaviconUrl("ocuco.com"),
    recorder: "Disponible",
  },
  {
    name: "Archimed",
    url: "archimed.fr",
    favicon: getFaviconUrl("archimed.fr"),
    recorder: "Disponible",
  },
  {
    name: "Lyra Optique",
    url: "lyra-optique.fr",
    favicon: getFaviconUrl("lyra-optique.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Irium",
    url: "irium-software.fr",
    favicon: getFaviconUrl("irium-software.fr"),
    recorder: "Enregistrez-le",
  },
];

/* ── Cellules ── */
function RecorderCell({ status }: { status: RecorderStatus }) {
  if (status === "Disponible")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-black whitespace-nowrap">
        <CheckCircle className="w-3.5 h-3.5" /> Disponible
      </span>
    );
  if (status === "Enregistré")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-black whitespace-nowrap">
        <CheckCircle className="w-3.5 h-3.5" /> Enregistré ✨
      </span>
    );
  return (
    <Link
      href="/extension#recorder"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-black whitespace-nowrap hover:bg-red-100 transition-colors"
    >
      <Video className="w-3.5 h-3.5" /> Enregistrez-le →
    </Link>
  );
}

function SmartFillCell() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-full text-xs font-black whitespace-nowrap">
      <Wand2 className="w-3.5 h-3.5" /> Universel
    </span>
  );
}


function PortailMatrix({ items, label }: { items: Portail[]; label: string }) {
  return (
    <div>
      {/* En-tête section */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">{label}</p>
        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-black">
          {items.length}
        </span>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                Portail
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> Recorder
                </span>
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" /> Smart Fill
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.name} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                {/* Portail */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FaviconWithFallback name={p.name} favicon={p.favicon} />
                    <div>
                      <div className="font-bold text-sm text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-400 font-medium">{p.url}</div>
                    </div>
                  </div>
                </td>
                {/* Recorder */}
                <td className="px-6 py-4 text-center">
                  <RecorderCell status={p.recorder} />
                </td>
                {/* Smart Fill */}
                <td className="px-6 py-4 text-center">
                  <SmartFillCell />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const revalidate = 300; // Revalidation ISR toutes les 5 minutes

export default async function PortailsPage() {
  // Récupérer les parcours validés depuis la base
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parcoursValides: { hostname: string }[] = await (prisma as any).parcoursRPA
    .findMany({ where: { valide: true }, select: { hostname: true } })
    .catch(() => []);

  const hostnamesEnregistres = new Set(
    parcoursValides.map((p: { hostname: string }) =>
      p.hostname.replace(/^www\./, "").toLowerCase()
    )
  );

  // Enrichir les données statiques avec les parcours dynamiques
  const mutuellesEnrichies = mutuelles.map((m) => {
    const domain = m.url.replace(/^www\./, "").toLowerCase();
    const isEnregistre = hostnamesEnregistres.has(domain);
    return {
      ...m,
      recorder: (isEnregistre && m.recorder === "Enregistrez-le"
        ? "Enregistré"
        : m.recorder) as RecorderStatus,
    };
  });

  const erpsEnrichis = erps.map((e) => {
    const domain = e.url.replace(/^www\./, "").toLowerCase();
    const isEnregistre = hostnamesEnregistres.has(domain);
    return {
      ...e,
      recorder: (isEnregistre && e.recorder === "Enregistrez-le"
        ? "Enregistré"
        : e.recorder) as RecorderStatus,
    };
  });

  const enregistresCount = [...mutuellesEnrichies, ...erpsEnrichis].filter(
    (p) => p.recorder === "Enregistré"
  ).length;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <nav className="bg-slate-900 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Image src="/icon.png" alt="OptiBot" width={28} height={28} className="rounded-lg" priority />
            </div>
            <span className="text-lg font-bold tracking-tight uppercase">OptiBot</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <CheckCircle className="w-3.5 h-3.5" /> 50+ portails mutuelles & ERP supportés
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Votre portail est{" "}
            <span className="text-blue-600">déjà supporté</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            Smart Fill couvre automatiquement tous les portails — sans configuration, dès l&apos;installation. Le Recorder permet d&apos;enregistrer un parcours personnalisé en 5 minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-black text-slate-600">
            <span className="flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-100 rounded-xl text-violet-700">
              <Wand2 className="w-4 h-4" /> Smart Fill universel
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600">
              <Video className="w-4 h-4" /> Recorder 5 min
            </span>
          </div>
        </div>
      </section>

      {/* Légende */}
      <section className="py-10 px-6 border-b border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">Comment ça fonctionne</p>
          <div className="grid sm:grid-cols-2 gap-6">

            {/* Recorder */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-red-500" />
                <p className="text-sm font-black text-slate-900">Recorder</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Enregistrez votre parcours une fois — OptiBot le rejoue automatiquement pour tous les dossiers suivants.</p>
              <div className="flex flex-col gap-1.5">
                <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-black">
                  <CheckCircle className="w-3 h-3" /> Disponible — prêt à l&apos;emploi
                </span>
                <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-black">
                  <Video className="w-3 h-3" /> À configurer — 5 minutes
                </span>
              </div>
            </div>

            {/* Smart Fill */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-violet-600" />
                <p className="text-sm font-black text-slate-900">Smart Fill</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Détection automatique des champs. Fonctionne sur <strong>tous les portails</strong> sans aucune configuration.</p>
              <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-full text-xs font-black">
                <Wand2 className="w-3 h-3" /> Universel — actif partout, toujours
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Tableaux */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-16">

          <PortailMatrix items={mutuellesEnrichies} label="Portails mutuelles" />
          <PortailMatrix items={erpsEnrichis} label="Logiciels métiers (ERP)" />

          {/* CTA */}
          <div className="bg-slate-900 rounded-[40px] p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[100px]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-[0.2em] mb-5">
                <CheckCircle className="w-3.5 h-3.5" /> Smart Fill couvre tous les autres portails
              </div>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
                Prêt à automatiser votre tiers-payant ?
              </h3>
              <p className="text-slate-400 font-medium mb-8 max-w-md mx-auto">
                Installez l&apos;extension — elle détecte votre portail automatiquement et commence à remplir dès la première utilisation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/extension"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20"
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
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/legal/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/legal/cgu" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/legal/cgv" className="hover:text-white transition-colors">CGV</Link>
            <Link href="/legal/mentions-legales" className="hover:text-white transition-colors">Mentions</Link>
          </div>
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">© 2026 OptiBot</div>
        </div>
      </footer>

    </div>
  );
}
