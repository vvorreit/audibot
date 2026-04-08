import {
  Lock,
  ZapOff,
  Layers,
  Headphones,
  Timer,
} from "lucide-react";

export default function AdvantagesSection() {
  return (
    <section id="avantages" className="py-32 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-2xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Pourquoi AudiBot ?</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-tight">
              La s&eacute;curit&eacute; d&apos;un outil local, la vitesse d&apos;un Bot.
            </h3>
            <div className="space-y-8">
              {[
                { title: "Confidentialit\u00e9 Totale (OCR Local)",
                  desc: "Contrairement aux solutions cloud, l\u2019analyse se fait sur VOTRE ordinateur. Aucune donn\u00e9e de sant\u00e9 de vos patients \u2014 NSS, audiogramme, donn\u00e9es ORL \u2014 n\u2019est stock\u00e9e sur nos serveurs. Le cache local est chiffr\u00e9 AES-256.",
                  icon: Lock },
                { title: "Moins d\u2019erreurs de saisie",
                  desc: "Fini les inversions de chiffres sur le NSS ou les erreurs de classe d\u2019appareillage. Le Bot r\u00e9duit drastiquement les risques d\u2019erreur humaine.",
                  icon: ZapOff },
                { title: "Int\u00e9gration ERP & Mutuelles",
                  desc: "AudiBot fonctionne avec Auditdata et les portails mutuelles du march\u00e9 (Almerys, Viamedis, Ameli Pro et +). Un logiciel ou une mutuelle manquant ? Contactez-nous \u2014 nous l\u2019int\u00e9grons en 5 jours ouvr\u00e9s.",
                  icon: Layers },
                { title: "Accompagnement & Support en France",
                  desc: "Notre \u00e9quipe est bas\u00e9e en France et conna\u00eet votre m\u00e9tier. R\u00e9ponse rapide, interlocuteur unique, onboarding inclus \u2014 on ne vous laisse pas vous d\u00e9brouiller seul.",
                  icon: Headphones },
              ].map((a, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <a.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black mb-2">{a.title}</h4>
                    <p className="text-slate-700 font-medium text-sm leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-card p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px]" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                  <Timer className="w-6 h-6" />
                </div>
                <p className="text-2xl font-black tracking-tight">Le comparatif</p>
              </div>
              <div className="space-y-12">
                <div>
                  <p className="text-slate-600 text-2xs font-black uppercase tracking-widest mb-4">Saisie Manuelle</p>
                  <div className="flex items-center gap-4">
                    <div className="h-4 bg-red-500 rounded-full w-full" />
                    <span className="font-black text-red-500 shrink-0">15 MIN</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-600 text-2xs font-black uppercase tracking-widest mb-4">Avec AudiBot</p>
                  <div className="flex items-center gap-4">
                    <div className="h-4 bg-indigo-600 rounded-full w-12" />
                    <span className="font-black text-indigo-400 shrink-0">10 SEC</span>
                  </div>
                </div>
              </div>
              <div className="mt-16 pt-10 border-t border-white/10">
                <p className="text-xl font-bold italic text-slate-700">
                  &quot;C&apos;est comme avoir un secr&eacute;taire robotis&eacute; ultra-rapide d&eacute;di&eacute; &agrave; la saisie administrative.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
