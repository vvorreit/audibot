import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle, XCircle, ArrowRight, Clock, Euro,
  AlertTriangle, TrendingDown, Zap, Shield, Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "OptiBot vs saisie manuelle — comparatif complet pour opticiens",
  description:
    "Combien vous coûte vraiment la saisie manuelle du tiers payant ? Temps perdu, rejets, trésorerie bloquée… Comparatif chiffré OptiBot vs méthode traditionnelle.",
  alternates: { canonical: "https://optibot.fr/comparatif" },
  openGraph: {
    title: "OptiBot vs saisie manuelle — comparatif pour opticiens",
    description: "Calculez ce que vous perdez chaque mois à saisir manuellement vos dossiers tiers payant.",
    type: "website",
  },
};

/* ─── Schema JSON-LD ─── */
const compareSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Combien de temps un opticien passe-t-il à saisir manuellement le tiers payant ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En moyenne, un opticien indépendant passe entre 8 et 15 minutes par dossier tiers payant en saisie manuelle. Sur 15 dossiers par semaine, cela représente entre 2 et 4 heures de saisie pure — soit plus de 150 heures par an.",
      },
    },
    {
      "@type": "Question",
      name: "Combien coûte la saisie manuelle du tiers payant pour un opticien ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En valorisant le temps de l'opticien à 40€/h, 150 heures de saisie annuelle représentent 6 000€ de coût d'opportunité. En ajoutant les rejets non récupérés (environ 3-5% des dossiers), le coût total dépasse souvent 10 000€ par an.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle est la différence entre OptiBot et la saisie manuelle ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OptiBot réduit la saisie d'un dossier tiers payant de 10-15 minutes à moins de 30 secondes grâce à l'OCR local et au remplissage automatique des portails mutuelles. Le taux de rejet est également réduit car l'OCR élimine les erreurs de frappe humaines.",
      },
    },
    {
      "@type": "Question",
      name: "OptiBot remplace-t-il une secrétaire pour le tiers payant ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OptiBot automatise la saisie et le suivi des dossiers tiers payant, ce qui peut remplacer une part significative du travail administratif lié aux mutuelles. Une secrétaire à temps partiel (10h/semaine de TP) représente environ 1 500€/mois vs 39,90€ pour OptiBot Solo.",
      },
    },
  ],
};

const comparaisonRows = [
  {
    critere: "Temps par dossier",
    manuel: "8 à 15 min",
    optibot: "< 30 secondes",
    avantage: "optibot",
  },
  {
    critere: "Erreurs de saisie (inversions NSS, RPPS…)",
    manuel: "Fréquentes — fatigue, urgence",
    optibot: "Quasi nulles — OCR + validation",
    avantage: "optibot",
  },
  {
    critere: "Taux de rejet moyen",
    manuel: "3 à 8% selon les cabinets",
    optibot: "Réduit significativement",
    avantage: "optibot",
  },
  {
    critere: "Suivi dossiers en temps réel",
    manuel: "Tableur Excel ou post-it",
    optibot: "Dashboard centralisé + alertes",
    avantage: "optibot",
  },
  {
    critere: "Détection automatique des rejets",
    manuel: "❌ Manuel — découverte tardive",
    optibot: "✅ Alerte immédiate + motif",
    avantage: "optibot",
  },
  {
    critere: "Relances mutuelles",
    manuel: "Manuelle — souvent oubliée",
    optibot: "Automatique selon règles configurées",
    avantage: "optibot",
  },
  {
    critere: "Compatibilité portails mutuelles",
    manuel: "Tous (accès direct)",
    optibot: "25+ portails + Smart Fill universel",
    avantage: "neutre",
  },
  {
    critere: "Conformité RGPD données patients",
    manuel: "Données saisies sur les portails",
    optibot: "OCR local — aucune donnée envoyée",
    avantage: "optibot",
  },
  {
    critere: "Coût annuel (solo)",
    manuel: "0€ direct + ~6 000€ en temps perdu",
    optibot: "479€/an (plan Solo)",
    avantage: "optibot",
  },
  {
    critere: "Multi-postes",
    manuel: "Possible — mais multiplicatif",
    optibot: "Plans Cabinet (3) et Réseau (5+)",
    avantage: "optibot",
  },
];

const couts = [
  {
    icon: Clock,
    title: "Temps perdu",
    value: "150h+/an",
    desc: "15 min × 15 dossiers/sem × 52 semaines",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: Euro,
    title: "Coût d'opportunité",
    value: "6 000€/an",
    desc: "150h × 40€/h (taux horaire moyen)",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: AlertTriangle,
    title: "Trésorerie bloquée",
    value: "15 000€+",
    desc: "Rejets non traités + délais rallongés",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: TrendingDown,
    title: "Coût réel annuel",
    value: "> 10 000€",
    desc: "Temps + rejets + stress + erreurs",
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

export default function ComparatifPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(compareSchema) }} />

      <main className="min-h-screen bg-white">

        {/* Nav */}
        <nav className="fixed w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm">O</div>
              <span className="text-lg font-bold tracking-tight uppercase text-slate-900">OptiBot</span>
            </Link>
            <Link href="/dashboard" className="px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl text-xs hover:bg-blue-700 transition-all uppercase tracking-widest">
              Essai gratuit 14j
            </Link>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 pt-32 pb-24">

          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-6 border border-blue-100">
              Comparatif
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-5">
              OptiBot vs saisie manuelle —<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                ce que ça vous coûte vraiment
              </span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              La saisie manuelle ne coûte pas que du temps. Elle coûte des rejets non détectés, de la trésorerie bloquée, et du stress quotidien. Voici les chiffres.
            </p>
          </div>

          {/* Coût de la saisie manuelle */}
          <section className="mb-16">
            <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">
              Le coût caché de la saisie manuelle
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {couts.map((c) => (
                <div key={c.title} className={`${c.bg} rounded-2xl p-6 text-center border border-slate-100`}>
                  <c.icon className={`w-6 h-6 ${c.color} mx-auto mb-3`} />
                  <p className={`text-2xl font-black ${c.color} mb-1`}>{c.value}</p>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">{c.title}</p>
                  <p className="text-xs text-slate-400 font-medium leading-snug">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tableau comparatif */}
          <section className="mb-16">
            <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Comparatif point par point</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest w-1/3">Critère</th>
                    <th className="py-4 px-5 text-center text-xs font-black text-red-500 uppercase tracking-widest">Saisie manuelle</th>
                    <th className="py-4 px-5 text-center text-xs font-black text-blue-600 uppercase tracking-widest">OptiBot</th>
                  </tr>
                </thead>
                <tbody>
                  {comparaisonRows.map((row, i) => (
                    <tr key={row.critere} className={`border-b border-slate-100 last:border-0 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                      <td className={`py-4 px-6 text-sm font-bold text-slate-700 ${i % 2 === 1 ? "bg-slate-50/50" : "bg-white"}`}>{row.critere}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-start justify-center gap-2">
                          {row.avantage === "optibot" && <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                          <span className={`text-sm font-medium text-center ${row.avantage === "optibot" ? "text-slate-500" : "text-slate-700"}`}>{row.manuel}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-start justify-center gap-2">
                          {row.avantage === "optibot" && <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
                          <span className={`text-sm font-medium text-center ${row.avantage === "optibot" ? "text-slate-800 font-bold" : "text-slate-700"}`}>{row.optibot}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Calcul ROI simplifié */}
          <section className="mb-16">
            <div className="bg-slate-900 rounded-3xl p-10 md:p-14 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">Le calcul qui ne ment pas</h2>
                <div className="grid md:grid-cols-3 gap-6 text-center mb-10">
                  {[
                    { label: "Saisie manuelle — coût annuel", value: "> 10 000€", sub: "temps + rejets + erreurs", color: "text-red-400" },
                    { label: "OptiBot Solo — coût annuel", value: "479€", sub: "39,90€/mois × 12", color: "text-blue-400" },
                    { label: "Économie nette", value: "~9 500€", sub: "dès la première année", color: "text-green-400" },
                  ].map(c => (
                    <div key={c.label} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{c.label}</p>
                      <p className={`text-3xl font-black ${c.color} mb-1`}>{c.value}</p>
                      <p className="text-xs text-slate-400 font-medium">{c.sub}</p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-slate-400 text-sm font-medium italic">
                  Basé sur 15 dossiers/semaine · 40€/h · 3% de taux de rejet moyen
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Questions fréquentes</h2>
            <div className="space-y-6">
              {compareSchema.mainEntity.map((item, i) => (
                <div key={i} className="border-l-4 border-blue-100 pl-5">
                  <h3 className="text-base font-black text-slate-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-10 text-center">
            <Zap className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-3">
              Arrêtez de payer pour de la saisie
            </h3>
            <p className="text-slate-500 font-medium mb-8 max-w-lg mx-auto">
              14 jours d'essai gratuit. Sans carte bancaire. Votre premier dossier en 30 secondes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 uppercase tracking-widest text-sm group"
              >
                Essayer OptiBot gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
              >
                Voir les tarifs
              </Link>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-4">Sans engagement · Annulable à tout moment · Support français</p>
          </div>

        </div>
      </main>
    </>
  );
}
