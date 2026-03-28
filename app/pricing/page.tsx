"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle, Minus, ArrowRight, ChevronDown, ChevronUp,
  Users, Building2, Network, Zap, Phone,
} from "lucide-react";
import ROICalculator from "@/components/ROICalculator";
import { useSession } from "next-auth/react";

/* ─── Helpers ─── */
function price(monthly: number, isAnnual: boolean) {
  if (!isAnnual)
    return { label: `${monthly.toFixed(2).replace(".", ",")}€`, suffix: "/mois HT", oldPrice: "", savings: "", annual: "" };
  const annual = (monthly * 12 * 0.85).toFixed(2).replace(".", ",");
  const perMonth = (monthly * 0.85).toFixed(2).replace(".", ",");
  const saved = (monthly * 12 * 0.15).toFixed(2).replace(".", ",");
  return { label: `${perMonth}€`, suffix: "/mois HT", oldPrice: `${monthly.toFixed(2).replace(".", ",")}€`, savings: `${saved}€`, annual: `${annual}€/an HT` };
}

/* ─── Plans solo ─── */
const soloPlans = [
  {
    key: "ESSENTIEL",
    name: "Essentiel",
    monthly: 39.9,
    tagline: "Pour découvrir OptiBot — sans engagement",
    color: "blue" as const,
    badge: null,
    trialBadge: "14 jours gratuits",
    features: [
      "Lecture automatique carte mutuelle & ordonnance",
      "Autofill portails & Smart Fill",
      "Extension Chrome",
      "80 scans/mois (≈ 4 clients/jour)",
      "Support email (48h)",
    ],
  },
  {
    key: "PRO",
    name: "Pro",
    monthly: 69.9,
    tagline: "Pour l'opticien actif — scans illimités",
    color: "indigo" as const,
    badge: "Le plus choisi",
    trialBadge: "14 jours gratuits",
    features: [
      "Tout le plan Essentiel, sans limite de scans",
      "Suivi tiers payant complet",
      "Relances automatiques + alertes rejets",
      "Support prioritaire (réponse < 4h)",
      "Alertes d'expiration d'ordonnances",
    ],
  },
] as const;

/* ─── Plans équipe ─── */
const teamPlans = [
  {
    key: "CABINET",
    name: "Cabinet",
    monthly: 179,
    tagline: "Pour les petits cabinets",
    icon: Users,
    color: "violet" as const,
    badge: null,
    seats: "3 utilisateurs inclus",
    perSeat: null,
    features: [
      "Tout le plan Pro ×3 postes",
      "Tableau de bord équipe centralisé",
      "Invitation des collaborateurs",
      "Facturation unique",
      "Support prioritaire",
    ],
    highlight: "Soit 59,67€/poste/mois",
    cta: "Démarrer en équipe",
    ctaHref: null, // self-serve → checkout
  },
  {
    key: "RESEAU",
    name: "Réseau",
    monthly: 299,
    tagline: "Pour les réseaux multi-magasins",
    icon: Network,
    color: "blue" as const,
    badge: "Recommandé équipe",
    seats: "5 utilisateurs inclus",
    perSeat: 30,
    features: [
      "Tout le plan Cabinet +",
      "5 postes inclus, +30€/poste/mois",
      "Gestion avancée des rôles",
      "Stats agrégées multi-magasins",
      "Onboarding visio inclus (1h)",
      "Support dédié",
    ],
    highlight: null,
    cta: "Démarrer mon réseau",
    ctaHref: null,
  },
  {
    key: "FRANCHISE",
    name: "Franchise",
    monthly: null,
    tagline: "Pour les enseignes nationales",
    icon: Building2,
    color: "slate" as const,
    badge: "Sur devis",
    seats: "Postes illimités",
    perSeat: null,
    features: [
      "Tout le plan Réseau +",
      "Déploiement multi-sites accompagné",
      "Intégration ERP prioritaire",
      "SLA & garanties de disponibilité",
      "DPA & conformité RGPD avancée",
      "Interlocuteur commercial dédié",
      "Facturation annuelle sur contrat",
    ],
    highlight: "À partir de 500€/mois HT",
    cta: "Demander une démo",
    ctaHref: "/franchise",
  },
] as const;

/* ─── Comparison table ─── */
type CellValue = true | false | string;
const comparisonRows: { label: string; values: [CellValue, CellValue, CellValue, CellValue, CellValue] }[] = [
  { label: "Lecture auto carte & ordonnance",          values: [true,       true,          true,      true,       true] },
  { label: "Autofill portails",        values: [true,       true,          true,      true,       true] },
  { label: "Extension Chrome",         values: [true,       true,          true,      true,       true] },
  { label: "Scans/mois",               values: ["80/mois",  "Illimité",    "Illimité","Illimité", "Illimité"] },
  { label: "Suivi tiers payant",       values: [false,      true,          true,      true,       true] },
  { label: "Relances automatiques",   values: [false,      true,          true,      true,       true] },
  { label: "Alertes rejets auto",     values: [false,      true,          true,      true,       true] },
  { label: "Export CSV",              values: [false,      true,          true,      true,       true] },

  { label: "Nombre de postes",         values: ["1",        "1",           "3",       "5+",       "Illimité"] },
  { label: "Dashboard équipe",         values: [false,      false,         true,      true,       true] },
  { label: "Stats multi-magasins",     values: [false,      false,         false,     true,       true] },
  { label: "Onboarding visio",         values: [false,      false,         false,     "1h incluse","Sur mesure"] },
  { label: "Support",                  values: ["48h",      "Prioritaire", "Prioritaire","Dédié", "Dédié + SLA"] },
  { label: "Intégration ERP",          values: [false,      false,         false,     false,      true] },
  { label: "Contrat annuel / DPA",     values: [false,      false,         false,     false,      true] },
];

/* ─── FAQ ─── */
const faqItems = [
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement est immédiat et le prorata est calculé automatiquement par Stripe.",
  },
  {
    q: "Comment fonctionne le per-seat sur le plan Réseau ?",
    a: "Le plan Réseau inclut 5 utilisateurs. Chaque utilisateur supplémentaire est facturé 30€ HT/mois, ajouté automatiquement à votre abonnement Stripe.",
  },
  {
    q: "Y a-t-il un engagement ?",
    a: "Non, les plans Cabinet et Réseau sont sans engagement mensuel. Le plan Franchise est sur contrat annuel. Vous pouvez annuler à tout moment depuis votre dashboard.",
  },
  {
    q: "Comment est gérée la facturation pour une équipe ?",
    a: "Une seule facture mensuelle pour toute l'équipe. Le propriétaire du compte gère la facturation, les membres accèdent librement.",
  },
  {
    q: "Le plan Franchise est-il disponible en self-serve ?",
    a: "Non, le plan Franchise est sur devis annuel avec un accompagnement dédié. Contactez-nous via le formulaire pour démarrer la conversation.",
  },
  {
    q: "Puis-je avoir une démo avant de souscrire ?",
    a: "Bien sûr. Pour les plans Cabinet et Réseau, vous bénéficiez d'un essai de 14 jours. Pour le plan Franchise, on planifie une démo personnalisée de 30 min.",
  },
];

/* ─── Cell renderer ─── */
function Cell({ value }: { value: CellValue }) {
  if (value === true)  return <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />;
  if (value === false) return <Minus className="w-5 h-5 text-slate-200 mx-auto" />;
  return <span className="text-sm font-bold text-slate-700">{value}</span>;
}

/* ════════════════════════════════════════════
   SEAT CALCULATOR — Plan Réseau
   ════════════════════════════════════════════ */
function SeatCalculator({ isAnnual }: { isAnnual: boolean }) {
  const [seats, setSeats] = useState(5);
  const baseMonthly  = 299;
  const extraPerSeat = 30;
  const included     = 5;

  const extraSeats   = Math.max(0, seats - included);
  const totalMonthly = baseMonthly + extraSeats * extraPerSeat;
  const perSeat      = totalMonthly / seats;

  const display = isAnnual
    ? { total: (totalMonthly * 0.85).toFixed(2), seat: (perSeat * 0.85).toFixed(2) }
    : { total: totalMonthly.toFixed(2),           seat: perSeat.toFixed(2) };

  return (
    <div className="mt-6 p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-blue-600">Calculateur de sièges</p>
        <span className="text-xs font-bold text-slate-400">{seats} utilisateur{seats > 1 ? "s" : ""}</span>
      </div>

      <input
        type="range"
        min={1}
        max={30}
        value={seats}
        onChange={(e) => setSeats(Number(e.target.value))}
        className="w-full accent-blue-600"
      />

      <div className="flex justify-between items-end">
        <div>
          <p className="text-3xl font-black text-slate-900">
            {display.total.replace(".", ",")}€
            <span className="text-sm font-bold text-slate-400">/mois HT</span>
          </p>
          <p className="text-xs text-slate-400 font-bold mt-1">
            soit {display.seat.replace(".", ",")}€/poste/mois
          </p>
          {isAnnual && (
            <p className="text-xs text-green-600 font-bold mt-1">
              Facturé annuellement — économisez 15%
            </p>
          )}
        </div>
        <div className="text-right text-xs text-slate-400 font-medium">
          <p>Base : 299€</p>
          {extraSeats > 0 && <p>+{extraSeats} siège{extraSeats > 1 ? "s" : ""} × 30€</p>}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════ */
export default function PricingPage() {
  const [isAnnual, setIsAnnual]   = useState(false);
  const [openFaq, setOpenFaq]     = useState<number | null>(null);
  const { data: session }         = useSession();

  const ctaHref  = session ? "/dashboard" : "/auth/signup";
  const ctaLabel = session ? "Accéder au dashboard" : "Commencer l'essai gratuit";

  return (
    <main className="bg-white min-h-screen">

      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">O</span>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">OptiBot</span>
          </Link>
          <Link
            href={ctaHref}
            className="px-6 py-2.5 bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
          >
            {session ? "Dashboard" : "Essai gratuit"}
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-6 border border-blue-100">
            Tarifs
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6">
            Le plan adapté à{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              votre cabinet
            </span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10">
            14 jours d&apos;essai gratuit. Sans engagement. Sans carte bancaire.
          </p>

          {/* Toggle mensuel / annuel */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-black uppercase tracking-widest ${!isAnnual ? "text-slate-900" : "text-slate-400"}`}>
              Mensuel
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isAnnual ? "bg-blue-600" : "bg-slate-200"}`}
            >
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isAnnual ? "translate-x-7" : ""}`} />
            </button>
            <span className={`text-sm font-black uppercase tracking-widest ${isAnnual ? "text-slate-900" : "text-slate-400"}`}>
              Annuel
              <span className="ml-2 inline-block px-2 py-0.5 text-xs font-black bg-green-100 text-green-700 rounded-full">
                −15%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PLANS SOLO
          ═══════════════════════════════════════ */}
      <section className="pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Pour les indépendants</p>
            <h2 className="text-3xl font-black text-slate-900">Plans individuels</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {soloPlans.map((plan) => {
              const p        = price(plan.monthly, isAnnual);
              const isPopular = !!plan.badge;

              return (
                <div
                  key={plan.key}
                  className={`relative rounded-2xl bg-white p-8 flex flex-col transition-all duration-300 hover:shadow-xl ${
                    isPopular
                      ? "border-2 border-indigo-600 shadow-[0_20px_50px_-10px_rgba(79,70,229,0.18)]"
                      : "border border-slate-200"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest px-5 py-1.5 rounded-full shadow">
                      {plan.badge}
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{plan.name}</h3>
                    <span className="text-2xs font-black bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">{(plan as {trialBadge?: string}).trialBadge}</span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium italic mb-6">{plan.tagline}</p>

                  {/* Prix */}
                  <div className="mb-6">
                    {isAnnual && p.oldPrice && (
                      <div className="text-sm text-slate-400 font-bold line-through mb-1">{p.oldPrice}/mois</div>
                    )}
                    <div className="text-4xl font-black text-slate-900">
                      {p.label}
                      <span className="text-base text-slate-400 font-bold">{p.suffix}</span>
                    </div>
                    {isAnnual && p.annual && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold">{p.annual}</span>
                        <span className="px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-xs font-black text-green-600">
                          Éco. {p.savings}/an
                        </span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm font-bold text-slate-700">
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={ctaHref}
                    className={`w-full py-4 text-white font-black rounded-xl text-center uppercase tracking-widest text-xs transition-all ${
                      isPopular
                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {session ? "Accéder au dashboard" : isPopular ? "Essayer Pro gratuitement →" : "Essayer gratuitement"}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Réassurance rapide ─── */}
      <section className="pb-10 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: "🔒", label: "Sans carte bancaire", sub: "14 jours gratuits" },
              { icon: "↩️", label: "Sans engagement", sub: "Annulable à tout moment" },
              { icon: "📞", label: "Support humain", sub: "Équipe française" },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-xs font-black text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PLANS ÉQUIPE
          ═══════════════════════════════════════ */}
      <section className="py-16 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Pour les équipes</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Plusieurs opticiens ? Un seul abonnement.
            </h2>
            <p className="text-slate-400 font-medium mt-3 max-w-xl mx-auto text-sm">
              Gérez toute votre équipe depuis un tableau de bord centralisé. Une facture, tous les accès.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

            {/* ── CABINET ── */}
            <div className="relative bg-white rounded-2xl border border-slate-200 p-8 flex flex-col hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Cabinet</h3>
                  <p className="text-xs text-slate-400 font-medium">3 utilisateurs inclus · Flat</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm font-medium italic mb-6">
                Pour les petits cabinets 2–3 opticiens.
              </p>

              <div className="mb-2">
                {isAnnual && (
                  <div className="text-sm text-slate-400 font-bold line-through mb-1">
                    {(179).toFixed(2).replace(".", ",")}€/mois
                  </div>
                )}
                <div className="text-4xl font-black text-slate-900">
                  {isAnnual ? "152,15" : "179,00"}€
                  <span className="text-base text-slate-400 font-bold">/mois HT</span>
                </div>
                {isAnnual && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">1 825,20€/an HT</span>
                    <span className="px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-xs font-black text-green-600">
                      Éco. 322,20€/an
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs font-black text-blue-600 mb-6">
                Soit {isAnnual ? "50,72" : "59,67"}€/poste/mois
              </p>

              <ul className="space-y-3 mb-8 flex-grow">
                {teamPlans[0].features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm font-bold text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={ctaHref}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-xl text-center uppercase tracking-widest text-xs hover:bg-blue-700 transition-all"
              >
                Démarrer en cabinet
              </Link>
            </div>

            {/* ── RÉSEAU ── */}
            <div className="relative bg-white rounded-2xl border-2 border-blue-600 p-8 flex flex-col shadow-[0_30px_60px_-15px_rgba(37,99,235,0.18)] hover:shadow-2xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest px-5 py-1.5 rounded-full shadow">
                Recommandé équipe
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Network className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Réseau</h3>
                  <p className="text-xs text-slate-400 font-medium">5 inclus · +30€/poste suppl.</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm font-medium italic mb-6">
                Pour les réseaux multi-magasins.
              </p>

              <div className="mb-2">
                {isAnnual && (
                  <div className="text-sm text-slate-400 font-bold line-through mb-1">
                    299,00€/mois
                  </div>
                )}
                <div className="text-4xl font-black text-slate-900">
                  {isAnnual ? "254,15" : "299,00"}€
                  <span className="text-base text-slate-400 font-bold">/mois HT</span>
                </div>
                {isAnnual && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">3 049,80€/an HT</span>
                    <span className="px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-xs font-black text-green-600">
                      Éco. 538,20€/an
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs font-black text-blue-600 mb-4">
                +30€ HT/utilisateur supplémentaire/mois
              </p>

              {/* Calculateur de sièges */}
              <SeatCalculator isAnnual={isAnnual} />

              <ul className="space-y-3 mt-6 mb-8 flex-grow">
                {teamPlans[1].features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm font-bold text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={ctaHref}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-xl text-center uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
              >
                Démarrer mon réseau
              </Link>
            </div>

            {/* ── FRANCHISE ── */}
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 flex flex-col hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] pointer-events-none" />

              <div className="relative z-10 flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Franchise</h3>
                  <p className="text-xs text-blue-300 font-medium">Postes illimités · Sur devis</p>
                </div>
              </div>

              <p className="relative z-10 text-slate-400 text-sm font-medium italic mb-6">
                Pour les enseignes et réseaux nationaux.
              </p>

              <div className="relative z-10 mb-6">
                <div className="text-4xl font-black text-white">
                  Sur devis
                </div>
                <p className="text-blue-300 text-xs font-black mt-2">
                  À partir de 500€ HT/mois · Contrat annuel
                </p>
              </div>

              <ul className="relative z-10 space-y-3 mb-8 flex-grow">
                {teamPlans[2].features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm font-bold text-slate-300">
                    <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/franchise"
                className="relative z-10 w-full py-4 bg-blue-600 text-white font-black rounded-xl text-center uppercase tracking-widest text-xs hover:bg-blue-500 transition-all flex items-center justify-center gap-2 group"
              >
                <Phone className="w-4 h-4" />
                Demander une démo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── ROI Calculator — remonté ici pour impact immédiat ─── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 mb-3">Calculateur ROI</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Combien ça vous coûte de ne pas l&apos;avoir ?</h2>
            <p className="text-slate-400 font-medium mt-3 text-sm">
              En moyenne : <span className="text-slate-700 font-black">15 000€/an</span> de temps récupéré.
            </p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* ─── Comparison Table ─── */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 mb-4">Comparatif</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Comparez en détail</h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[780px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-50">
                    Fonctionnalité
                  </th>
                  {["Solo", "Pro", "Cabinet", "Réseau", "Franchise"].map((name, i) => (
                    <th
                      key={name}
                      className={`py-4 px-4 text-center text-xs font-black uppercase tracking-widest ${
                        i === 0 ? "text-blue-600" :
                        i === 1 ? "text-indigo-600" :
                        i === 2 ? "text-violet-600" :
                        i === 3 ? "text-blue-700" :
                        "text-slate-700"
                      }`}
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.label} className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/50" : "bg-white"}`}>
                    <td className={`py-3.5 px-6 text-sm font-bold text-slate-700 sticky left-0 z-10 ${i % 2 === 1 ? "bg-slate-50/50" : "bg-white"}`}>
                      {row.label}
                    </td>
                    {row.values.map((val, j) => (
                      <td key={j} className="py-3.5 px-4 text-center">
                        <Cell value={val} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>



      {/* ─── FAQ ─── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 mb-4">FAQ</p>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">Questions fréquentes</h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-sm font-black text-slate-900">{item.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Final ─── */}
      <section className="py-24 bg-blue-600 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Zap className="w-12 h-12 text-white/40 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
            Prêt à gagner 1h30/jour ?
          </h2>
          <p className="text-blue-200 font-medium mb-4 text-lg">
            Rejoignez les opticiens qui ont automatisé leur tiers payant.
          </p>
          <p className="text-blue-300 text-xs font-medium mb-10">
            Sans carte bancaire · Sans engagement · Annulable à tout moment
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl text-sm uppercase tracking-widest group"
            >
              {ctaLabel}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/franchise"
              className="inline-flex items-center gap-2 px-8 py-5 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all text-sm uppercase tracking-widest border border-white/20"
            >
              <Building2 className="w-4 h-4" />
              Parler à un expert
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 bg-slate-900 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.png" alt="OptiBot" width={32} height={32} className="rounded-lg" />
            <span className="text-sm font-black text-white">OptiBot</span>
          </Link>
          <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
            <Link href="/legal/cgu" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/legal/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/legal/cgv" className="hover:text-white transition-colors">CGV</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-slate-500 font-medium">© {new Date().getFullYear()} OptiBot. Tous droits réservés.</p>
        </div>
      </footer>

    </main>
  );
}
