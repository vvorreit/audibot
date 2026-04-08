import { Star } from "lucide-react";

const testimonials = [
  { name: "Laurent P.", role: "Opticien",              city: "Nantes",    quote: "Je passais 10 minutes par dossier \u00e0 recopier des num\u00e9ros de s\u00e9cu... Aujourd\u2019hui, OptiBot le fait en 10 secondes." },
  { name: "Marie D.",   role: "Opticien ind\u00e9pendant", city: "Lyon",      quote: "Je gagne 1h20 par jour sur la saisie Almerys et Viamedis. Sur un mois, \u00e7a fait 3 jours de travail r\u00e9cup\u00e9r\u00e9s." },
  { name: "Thomas R.",  role: "G\u00e9rant",               city: "Paris 11e", quote: "Avant je passais 2h le matin sur les dossiers mutuelles. Maintenant c\u2019est 15 minutes. Mes patients patientent moins." },
  { name: "Sophie L.",  role: "Opticienne",            city: "Bordeaux",  quote: "Install\u00e9 en 10 minutes, op\u00e9rationnel le jour m\u00eame. J\u2019ai r\u00e9cup\u00e9r\u00e9 6h la premi\u00e8re semaine." },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xs font-black uppercase tracking-[0.3em] text-blue-600 mb-4">T&eacute;moignages</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Ils utilisent OptiBot au quotidien.</h3>
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
