import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, ArrowRight, ScanLine, MousePointerClick, FileText,
  Bell, RefreshCw, Users, Bot, Video, Wand2, ShieldCheck,
  Timer, AlertCircle, CheckCircle, Zap, Smartphone, BarChart2,
  Mail, Code2, Lock, Eye
} from "lucide-react";

interface Feature {
  icon: React.ElementType;
  category: string;
  title: string;
  description: string;
  details: string[];
  badge?: string;
  badgeColor?: string;
}

const features: Feature[] = [
  // ── OCR & Scan ──
  {
    icon: ScanLine,
    category: "Lecture de documents",
    title: "OCR local — zéro donnée sur nos serveurs",
    description: "Déposez une carte mutuelle ou une prescription audiologique. AudiBot extrait instantanément toutes les données utiles directement dans votre navigateur.",
    details: [
      "Cartes mutuelles : NSS, numéro adhérent, organisme, dates de validité",
      "Prescriptions audiologiques : audiogramme, prescripteur, RPPS, date",
      "Scan photo depuis votre smartphone (QR code relay)",
      "PDF, photo, scan — tous formats acceptés",
      "Traitement 100% local — aucune donnée patient ne transite par nos serveurs",
    ],
    badge: "RGPD natif",
    badgeColor: "green",
  },
  {
    icon: Smartphone,
    category: "Lecture de documents",
    title: "Scan depuis votre téléphone",
    description: "Photographiez une carte mutuelle avec votre iPhone ou Android. Les données arrivent automatiquement sur votre ordinateur en quelques secondes.",
    details: [
      "QR code affiché sur le dashboard — scan instantané",
      "Fonctionne sur iOS et Android sans application à installer",
      "Transmission chiffrée AES-256 — zéro donnée stockée sur nos serveurs",
      "Guide de cadrage visuel avec indicateur qualité temps réel",
      "Capture automatique quand le document est stable",
      "Amélioration image automatique (contraste, N&B) avant lecture OCR",
      "Galerie photos — choisir une photo existante depuis votre téléphone",
      "Aperçu du document avant envoi",
      "Multi-scan batch sans re-scanner le QR",
      "Installable sur l'écran d'accueil (PWA)",
    ],
    badge: "Amélioré",
    badgeColor: "blue",
  },

  // ── Autofill ──
  {
    icon: MousePointerClick,
    category: "Remplissage automatique",
    title: "Autofill portails mutuelles",
    description: "Un clic sur 🤖 Remplir — le bot injecte toutes les données dans le formulaire du portail mutuelle ouvert dans votre navigateur.",
    details: [
      "13 portails avec intégration native (Almerys, Wemind, Viamedis, Oxantis...)",
      "25+ portails supplémentaires via Smart Fill universel",
      "Gestion ouvrant droit automatique (NSS mère pour les mineurs)",
      "Validation NSS par clé de Luhn avant injection",
      "Alerte si droits mutuelle expirés ou bientôt expirés",
      "Compatible iframes, Shadow DOM, React, Angular, Vue, Blazor",
    ],
    badge: "47 portails",
    badgeColor: "blue",
  },
  {
    icon: Wand2,
    category: "Remplissage automatique",
    title: "Smart Fill — universel sur tous les portails",
    description: "Sur n'importe quel portail inconnu, Smart Fill détecte automatiquement les champs et les remplit sans aucune configuration.",
    details: [
      "Scoring de confiance 0-100 par champ avec détail des signaux",
      "15 stratégies de remplissage (React Fiber, Angular, Vue 3, Blazor...)",
      "Fuzzy matching avec distance de Levenshtein + memoization",
      "Apprentissage collaboratif : les corrections améliorent le taux pour tous",
      "Seuil de confiance configurable : Strict / Standard / Large",
      "Mode aperçu avant remplissage (opt-in)",
      "Scan async par chunks — ne freeze pas les pages lourdes",
      "Auto-repair des sélecteurs quand le taux de skip est élevé",
    ],
  },
  {
    icon: Video,
    category: "Remplissage automatique",
    title: "Recorder — enregistrez votre parcours",
    description: "Effectuez le parcours manuellement une fois — AudiBot le rejoue automatiquement pour tous les dossiers suivants.",
    details: [
      "Enregistrement en 5 minutes depuis l'extension",
      "Capture clics, saisies, sélections, navigations entre pages",
      "Détection automatique des variables patient (NSS, nom, dates...)",
      "Wizard de validation avant envoi",
      "Parcours partagés à toute la communauté AudiBot après validation",
    ],
  },
  {
    icon: Bot,
    category: "Remplissage automatique",
    title: "Parcours dynamiques — replay multi-pages",
    description: "AudiBot rejoue un parcours enregistré étape par étape : remplissage, clics, attentes, navigation entre pages — le tout automatiquement.",
    details: [
      "Parcours configurables depuis le backend (aucun code à modifier)",
      "Replay étape par étape avec barre de progression",
      "Pause automatique si une étape échoue — reprise manuelle possible",
      "Fonctionne sur tous les portails (pas limité à un seul)",
      "Variables patient substituées automatiquement ({{nom}}, {{nss}}...)",
      "Retry avec backoff exponentiel sur les étapes lentes",
    ],
  },

  // ── Tiers payant ──
  {
    icon: FileText,
    category: "Suivi tiers payant",
    title: "Suivi & tracking des dossiers TP",
    description: "Centralisez tous vos dossiers tiers payant : statuts, montants, historique complet des changements.",
    details: [
      "Statuts : En attente / Reçu / Rejeté / En litige",
      "Historique complet de chaque dossier avec auteur et date",
      "Synchronisation automatique depuis votre logiciel audiologie",
      "Filtres par mutuelle, statut, date, montant",
      "Export CSV pour votre comptable",
    ],
  },
  {
    icon: RefreshCw,
    category: "Suivi tiers payant",
    title: "Relances automatiques",
    description: "AudiBot relance automatiquement les mutuelles qui ne répondent pas, selon vos règles personnalisées.",
    details: [
      "Règles de relance par délai (J+30, J+60, J+90)",
      "Règles spécifiques par mutuelle",
      "Email de relance automatique avec template personnalisable",
      "Log complet de chaque relance envoyée",
      "Désactivation par dossier",
    ],
    badge: "Plan Pro",
    badgeColor: "purple",
  },
  {
    icon: AlertCircle,
    category: "Suivi tiers payant",
    title: "Détection automatique des rejets",
    description: "L'extension détecte les rejets directement sur les portails Almerys, Viamedis, Itelis, Kalixia et les remonte dans votre tableau de bord.",
    details: [
      "Détection silencieuse en arrière-plan pendant votre navigation",
      "Motif de rejet extrait et catégorisé automatiquement",
      "Suggestion d'action corrective (montant, document manquant, date...)",
      "Scoring prédictif : estimation du risque de rejet avant soumission",
      "Dossier mis à jour automatiquement en base",
      "Notification dans le centre d'alertes et dans la popup extension",
    ],
  },
  {
    icon: Bell,
    category: "Suivi tiers payant",
    title: "Alertes & notifications",
    description: "Ne ratez plus aucune échéance. AudiBot vous alerte sur les prescriptions qui expirent, les relances dues, les rejets détectés.",
    details: [
      "Centre de notifications in-app (cloche)",
      "Alertes expiration prescription à J-60, J-30, J-7",
      "Notification de rejet détecté avec lien direct vers le dossier",
      "Rapport mensuel automatique par email (plan Pro)",
    ],
  },

  // ── Équipe & gestion ──
  {
    icon: Users,
    category: "Équipe & gestion",
    title: "Gestion d'équipe",
    description: "Déployez AudiBot sur toute votre équipe avec des rôles et permissions adaptés.",
    details: [
      "Jusqu'à 5 postes sur le plan Équipe",
      "Rôles : Owner, Admin, Member",
      "Invitations par email avec lien sécurisé",
      "Facturation centralisée sur un seul compte",
      "Onboarding personnalisé (1h visio incluse sur plan Équipe)",
    ],
    badge: "Plan Équipe",
    badgeColor: "indigo",
  },
  {
    icon: BarChart2,
    category: "Équipe & gestion",
    title: "Dashboard analytique admin",
    description: "Suivez l'activité de votre équipe et mesurez le ROI d'AudiBot en temps réel.",
    details: [
      "Temps économisé calculé automatiquement (×7 min par dossier)",
      "Taux de rejet par mutuelle",
      "Montants en attente / reçus sur le mois",
      "Nombre de scans et taux de succès OCR",
    ],
  },

  // ── Sécurité & conformité ──
  {
    icon: ShieldCheck,
    category: "Sécurité & conformité",
    title: "Conformité RGPD native",
    description: "AudiBot a été conçu dès le départ pour les données de santé. Zéro compromis.",
    details: [
      "OCR 100% local — aucune donnée patient ne quitte votre appareil",
      "Cache local chiffré AES-256-GCM avec clé device-only (jamais transmise)",
      "Verrouillage automatique après 15 min d'inactivité",
      "Droit à l'effacement (Art.17) — suppression en un clic",
      "Purge automatique des logs techniques après 90 jours",
      "DPA (Accord de traitement) signé électroniquement",
    ],
    badge: "RGPD Art.35",
    badgeColor: "green",
  },
  {
    icon: Lock,
    category: "Sécurité & conformité",
    title: "Authentification sécurisée",
    description: "Connexion par email vérifié ou Google. Session sécurisée avec expiration automatique.",
    details: [
      "Vérification email obligatoire à l'inscription",
      "Connexion Google OAuth disponible",
      "Session extension limitée à 20h — renouvellement automatique",
      "Traçabilité des acceptations légales (CGV, DPA) avec IP et date",
    ],
  },

  // ── Extension Chrome ──
  {
    icon: Code2,
    category: "Extension Chrome",
    title: "Extension Chrome Pro",
    description: "L'extension est le cœur d'AudiBot — elle tourne en arrière-plan sur tous vos portails mutuelles.",
    details: [
      "Bouton 🤖 Remplir fixe sur tous les portails compatibles",
      "Raccourci clavier Ctrl+Shift+F pour remplir instantanément",
      "Popup avec données patient éditables en direct",
      "Remplissage auto au chargement de page (configurable)",
      "Bouton 💾 Mémoriser les données patient (logiciel audio)",
      "Synchronisation tiers payant depuis votre logiciel audiologie",
      "Suivi TP, alertes rejets et dashboard équipe dans la popup (Pro)",
      "Icône dynamique (bleue = portail actif, grise = inactif)",
      "Compatible Chrome, Edge, Brave",
    ],
  },
  {
    icon: Eye,
    category: "Extension Chrome",
    title: "Rapport de remplissage",
    description: "Après chaque remplissage, la popup affiche un résumé de ce qui a été rempli avec succès.",
    details: [
      "✅ Champs remplis avec confiance > 80%",
      "⚠️ Champs à vérifier (confiance 50-80%)",
      "❌ Champs non trouvés sur la page",
      "Rapport disponible 5 minutes après le dernier fill",
    ],
  },

  // ── Intégration ──
  {
    icon: Zap,
    category: "Intégrations",
    title: "Bridge ERP — connexion à votre logiciel audioprothésiste",
    description: "AudiBot lit et écrit automatiquement dans votre logiciel audioprothésiste. Le patient scanné est injecté directement dans votre logiciel métier.",
    details: [
      "6 logiciels audio supportés : Audiosoft, Noah (HIMSA), Sycle, Audinsoft, Axiom (Propulso), Irium Audio",
      "Auto-détection de l'ERP au chargement de la page",
      "Smart Scrape : lecture automatique des champs patient depuis l'ERP",
      "Smart Inject : injection PEC (accord mutuelle) dans l'ERP",
      "Injection note de rejet dans le dossier patient",
      "Apprentissage passif : les corrections améliorent le matching",
    ],
  },
  {
    icon: Zap,
    category: "Intégrations",
    title: "Synchronisation logiciel audiologie",
    description: "AudiBot s'intègre profondément avec votre logiciel audiologie pour un flux de travail entièrement automatisé.",
    details: [
      "Lecture automatique des données patient depuis votre logiciel",
      "Scraping des prescriptions audiologiques et audiogrammes",
      "Synchronisation des dossiers TP (montants, statuts, bordereaux)",
      "Scraping des équipements (codes LPP appareils auditifs, prix, RAC) pour Almerys",
    ],
  },
  {
    icon: Mail,
    category: "Intégrations",
    title: "Emails transactionnels",
    description: "AudiBot vous tient informé à chaque étape importante par email.",
    details: [
      "Email de bienvenue + guide d'installation",
      "Relances TP envoyées automatiquement aux mutuelles",
      "Alertes expiration prescription",
      "Rapport mensuel tiers payant (plan Pro)",
      "Email si portail cassé détecté (monitoring automatique)",
    ],
  },
];

const categories = Array.from(new Set(features.map((f) => f.category)));

const badgeStyles: Record<string, string> = {
  green: "bg-green-50 text-green-700 border-green-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export default function FonctionnalitesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <nav className="bg-slate-900 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Image src="/icon.png" alt="AudiBot" width={28} height={28} className="rounded-lg" priority />
            </div>
            <span className="text-lg font-bold tracking-tight uppercase">AudiBot</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            {features.length} fonctionnalités
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Tout ce qu&apos;AudiBot fait<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">pour vous</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            De la lecture de document au suivi tiers payant, en passant par l&apos;autofill et les relances automatiques — voici le détail complet de ce qu&apos;AudiBot automatise à votre place.
          </p>

          {/* Ancres par catégorie */}
          <div className="flex flex-wrap gap-2 justify-center mt-10">
            {categories.map((cat) => (
              <a
                key={cat}
                href={`#${cat.toLowerCase().replace(/\s+/g, "-").replace(/[éèê]/g, "e").replace(/[àâ]/g, "a")}`}
                className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-black hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contenu par catégorie */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-24">
          {categories.map((category) => {
            const catFeatures = features.filter((f) => f.category === category);
            const anchorId = category.toLowerCase().replace(/\s+/g, "-").replace(/[éèê]/g, "e").replace(/[àâ]/g, "a");
            return (
              <div key={category} id={anchorId}>
                {/* Header catégorie */}
                <div className="mb-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-2">{category}</p>
                  <div className="w-12 h-1 bg-indigo-600 rounded-full" />
                </div>

                {/* Features grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {catFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.title}
                        className="bg-white border border-slate-200 rounded-[28px] p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                      >
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-5">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-black text-base text-slate-900 leading-tight">{feature.title}</h3>
                              {feature.badge && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border ${badgeStyles[feature.badgeColor || "blue"]}`}>
                                  {feature.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.description}</p>
                          </div>
                        </div>

                        {/* Details */}
                        <ul className="space-y-2 mt-auto">
                          {feature.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                              <span className="font-medium">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-14 bg-slate-50 border-y border-slate-100 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10s", label: "Par dossier" },
            { value: "47", label: "Portails compatibles" },
            { value: "100%", label: "Local, zéro serveur" },
            { value: "14j", label: "Essai gratuit" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="text-3xl md:text-4xl font-black text-slate-900">{s.value}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Prêt à gagner 1h par jour ?
          </h2>
          <p className="text-slate-400 font-medium mb-8">
            14 jours gratuits — sans carte bancaire — sans engagement.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-sm"
          >
            Essayer AudiBot gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-slate-500 mt-4">Sans CB · Sans engagement · Annulable à tout moment</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/portails" className="hover:text-white transition-colors">Portails</Link>
            <Link href="/legal/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/legal/cgu" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/legal/cgv" className="hover:text-white transition-colors">CGV</Link>
          </div>
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">© 2026 AudiBot</div>
        </div>
      </footer>

    </div>
  );
}
