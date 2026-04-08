import { Star } from "lucide-react";

const testimonials = [
  { name: "Dr. Marc L.", role: "Audioproth\u00e9siste",            city: "Lyon",      quote: "Je passais 15 minutes par dossier \u00e0 recopier la prescription ORL et les donn\u00e9es mutuelle\u2026 Aujourd\u2019hui, AudiBot le fait en 10 secondes." },
  { name: "Sophie R.",   role: "Audioproth\u00e9siste D.E.", city: "Nantes",    quote: "Je gagne plus d\u2019une heure par jour sur la saisie Almerys et Viamedis. Sur un mois, \u00e7a fait 3 jours de travail r\u00e9cup\u00e9r\u00e9s." },
  { name: "Thomas B.",   role: "G\u00e9rant centre audio",       city: "Paris 15e", quote: "Avant je passais 2h le matin sur les dossiers mutuelles. Maintenant c\u2019est 15 minutes. Mes patients patientent moins." },
  { name: "Claire D.",   role: "Audioproth\u00e9siste",            city: "Bordeaux",  quote: "Install\u00e9 en 10 minutes, op\u00e9rationnel le jour m\u00eame. L\u2019int\u00e9gration Auditdata est bluffante." },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">T&eacute;moignages</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Ils utilisent AudiBot au quotidien.</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-card border border-slate-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-700 font-medium leading-relaxed mb-6 italic">&quot;{t.quote}&quot;</p>
              <div>
                <p className="font-black text-slate-900">{t.name}</p>
                <p className="text-sm text-slate-600 font-medium">{t.role} &mdash; {t.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
