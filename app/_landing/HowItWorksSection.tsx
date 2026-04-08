import {
  FileText,
  Activity,
  MousePointerClick,
  Globe,
} from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-24 bg-slate-50 px-6 border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-2xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">La Solution</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Comment &ccedil;a marche ?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              title: "D&eacute;posez",
              desc: "Glissez la prescription ORL ou la carte mutuelle (PDF/Photo) sur votre tableau de bord AudiBot — depuis votre PC ou directement depuis votre t&eacute;l&eacute;phone via QR code.",
              icon: FileText,
              color: "bg-indigo-600 shadow-indigo-100",
            },
            {
              step: "02",
              title: "AudiBot analyse",
              desc: "NSS, audiogramme (OD/OG), classe d\u2019appareillage, num\u00e9ro adh\u00e9rent, donn\u00e9es mutuelle \u2014 tout est extrait en quelques secondes, sur votre machine.",
              icon: Activity,
              color: "bg-indigo-600 shadow-indigo-100",
            },
            {
              step: "03",
              title: "Un clic remplit",
              desc: "L\u2019extension Chrome remplit le portail mutuelle ou votre logiciel m\u00e9tier automatiquement. Almerys, Viamedis, Auditdata, Ameli Pro\u2026",
              icon: MousePointerClick,
              color: "bg-indigo-600 shadow-indigo-100",
            },
            {
              step: "04",
              title: "Portail inconnu ?",
              desc: "Smart Fill d\u00e9tecte et remplit n\u2019importe quel portail. Nouveau portail ? Enregistrez une fois, AudiBot le rejoue pour toujours.",
              icon: Globe,
              color: "bg-indigo-600 shadow-indigo-100",
              badge: "Nouveau",
            },
          ].map((s, idx) => (
            <div key={idx} className="relative group">
              <div className="text-8xl font-black text-slate-100 absolute -top-10 -left-4 group-hover:text-indigo-50 transition-colors">{s.step}</div>
              <div className="relative z-10 bg-white p-8 rounded-card shadow-sm border border-slate-100 group-hover:shadow-xl group-hover:-translate-y-2 transition-all h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    <s.icon className="w-7 h-7" />
                  </div>
                  {s.badge && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      {s.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-xl font-black mb-3" dangerouslySetInnerHTML={{ __html: s.title }} />
                <p className="text-slate-700 font-medium leading-relaxed text-sm flex-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
