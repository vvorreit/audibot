import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PortalFavicon from "@/components/PortalFavicon";

const portals = [
  { name: "Almerys",       favicon: "https://www.google.com/s2/favicons?domain=mutuelle-almerys.com&sz=64" },
  { name: "Viamedis",      favicon: "https://www.google.com/s2/favicons?domain=viamedis.net&sz=64" },
  { name: "Ameli Pro",     favicon: "https://www.google.com/s2/favicons?domain=ameli.fr&sz=64" },
  { name: "Auditdata",     favicon: "https://www.google.com/s2/favicons?domain=auditdata.com&sz=64" },
  { name: "G\u00e9n\u00e9ration",    favicon: "https://www.google.com/s2/favicons?domain=generation.fr&sz=64" },
  { name: "Wemind",        favicon: "https://www.google.com/s2/favicons?domain=wemind.io&sz=64" },
  { name: "TP Plus",       favicon: "https://www.google.com/s2/favicons?domain=ffl-promoteur.com&sz=64" },
  { name: "Oxantis",       favicon: "https://www.google.com/s2/favicons?domain=oxantis.net&sz=64" },
  { name: "APGIS",         favicon: "https://www.google.com/s2/favicons?domain=apgis.com&sz=64" },
  { name: "SP Sant\u00e9",      favicon: "https://www.google.com/s2/favicons?domain=spsante.fr&sz=64" },
  { name: "Solimut",       favicon: "https://www.google.com/s2/favicons?domain=solimut.fr&sz=64" },
  { name: "Mercer",        favicon: "https://www.google.com/s2/favicons?domain=mercernet.fr&sz=64" },
];

export default function PortalsSection() {
  return (
    <section className="py-24 bg-slate-50 px-6 border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Compatibilit&eacute;</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Portails compatibles</h3>
          <p className="text-slate-700 font-medium mt-4 italic">Remplissage automatique &mdash; identit&eacute;, audiogramme, codes LPP</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-items-center">
          {portals.map((portal) => (
            <PortalFavicon key={portal.name} name={portal.name} favicon={portal.favicon} />
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-slate-600 font-medium mb-2">
            Votre portail n&apos;est pas dans la liste ?
          </p>
          <p className="text-sm font-black text-slate-600">
            Smart Fill le remplit quand m&ecirc;me. Et le Recorder vous permet de l&apos;encoder en 5 minutes.
          </p>
          <Link href="/portails" className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Voir tous les portails compatibles <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
