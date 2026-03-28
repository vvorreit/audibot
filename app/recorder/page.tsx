import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Video,
  AlertCircle, Wand2, MousePointerClick, Eye, ScanLine,
  BookOpen, Zap
} from "lucide-react";

export const metadata = {
  title: "Guide Recorder — OptiBot",
  description: "Apprenez à enregistrer un parcours sur n'importe quel portail mutuelle avec le Recorder OptiBot.",
};

const steps = [
  {
    num: "01",
    icon: ScanLine,
    color: "bg-blue-600",
    title: "Préparez vos données",
    content: (
      <>
        <p className="text-slate-500 font-medium leading-relaxed mb-4">
          Avant de lancer le Recorder, assurez-vous d&apos;avoir des données patient copiées depuis le dashboard.
        </p>
        <ul className="space-y-2">
          {[
            "Scannez une carte mutuelle + ordonnance dans le dashboard",
            "Cliquez \"Copier\" — les données sont prêtes en mémoire",
            "Le Recorder détecte automatiquement les variables (NSS, nom, date...)",
            "Sans données copiées, les champs seront marqués ⚠️ statique",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span className="font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    num: "02",
    icon: Eye,
    color: "bg-slate-700",
    title: "Ouvrez le portail cible",
    content: (
      <>
        <p className="text-slate-500 font-medium leading-relaxed mb-4">
          Naviguez jusqu&apos;à la page de départ du parcours — là où vous commencez normalement à remplir.
        </p>
        <ul className="space-y-2">
          {[
            "Connectez-vous au portail — le Recorder ne gère pas l'authentification",
            "Allez à la page \"Nouvelle demande PEC\" ou équivalent",
            "Ne commencez pas à remplir avant de lancer l'enregistrement",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span className="font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    num: "03",
    icon: Video,
    color: "bg-red-500",
    title: "Lancez le Recorder",
    content: (
      <>
        <p className="text-slate-500 font-medium leading-relaxed mb-4">
          Cliquez sur l&apos;icône OptiBot dans Chrome → bouton <strong>⏺ Enregistrer</strong>.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse inline-block" />
            <span className="text-sm font-black text-red-700">Le bandeau rouge apparaît = enregistrement actif</span>
          </div>
          <p className="text-xs text-red-600 font-medium">Un panneau latéral s&apos;ouvre à droite — il liste les étapes capturées en temps réel.</p>
        </div>
        <ul className="space-y-2">
          {[
            "Badge vert ✅ = variable détectée automatiquement ({{nss}}, {{nom}}...)",
            "Badge orange ⚠️ = valeur statique — à mapper manuellement dans le wizard",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span className="font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    num: "04",
    icon: MousePointerClick,
    color: "bg-blue-600",
    title: "Effectuez le parcours normalement",
    content: (
      <>
        <p className="text-slate-500 font-medium leading-relaxed mb-4">
          Remplissez les champs avec les <strong>vraies données patient</strong> — c&apos;est ce qui permet la détection des variables.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-xs font-black text-green-700 uppercase tracking-widest mb-3">✅ À faire</p>
            <ul className="space-y-1.5 text-sm text-green-700 font-medium">
              {[
                "Remplir avec vraies données patient",
                "Cliquer Suivant / Rechercher",
                "Attendre le chargement de chaque page",
                "Aller jusqu'à la dernière page avant validation",
              ].map((i) => <li key={i}>· {i}</li>)}
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-3">❌ À éviter</p>
            <ul className="space-y-1.5 text-sm text-red-700 font-medium">
              {[
                "Données fictives (non détectables)",
                "Cliquer Soumettre / Confirmer",
                "Cliquer trop vite entre pages",
                "Valider le dossier réellement",
              ].map((i) => <li key={i}>· {i}</li>)}
            </ul>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm font-black text-amber-800">⚠️ Arrêtez-vous AVANT le bouton Soumettre / Confirmer / Envoyer</p>
          <p className="text-xs text-amber-700 font-medium mt-1">Le Recorder ne doit jamais enregistrer la soumission finale — l&apos;opticien valide toujours manuellement.</p>
        </div>
      </>
    ),
  },
  {
    num: "05",
    icon: Wand2,
    color: "bg-violet-600",
    title: "Validez et envoyez",
    content: (
      <>
        <p className="text-slate-500 font-medium leading-relaxed mb-4">
          Cliquez <strong>⏹ Terminer</strong> — un wizard en 3 étapes s&apos;ouvre.
        </p>
        <div className="space-y-3">
          {[
            { step: "1", title: "Nommez le portail", desc: "Ex : \"Malakoff Humanis — PEC Optique\"" },
            { step: "2", title: "Vérifiez les champs", desc: "Pour les ⚠️ orange, sélectionnez la bonne variable dans le dropdown. Supprimez les étapes incorrectes avec 🗑️" },
            { step: "3", title: "Envoyez à OptiBot", desc: "Le parcours est soumis pour validation — il sera disponible après revue." },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3 bg-slate-50 rounded-2xl p-4">
              <span className="w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">{s.step}</span>
              <div>
                <p className="text-sm font-black text-slate-900">{s.title}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
];

const criteria = [
  { icon: "✅", color: "text-green-600", title: "Parcours idéal", items: ["5 à 15 étapes", "Toutes les variables en vert ✅", "Champs clés couverts : NSS, nom, date ordonnance", "Chaque page bien chargée avant le clic suivant"] },
  { icon: "⚠️", color: "text-amber-600", title: "À retravailler", items: ["Moins de 3 étapes (trop partiel)", "Plus de 50% de champs en orange statique", "Étapes en doublon (même champ 2 fois)", "Soumission finale enregistrée"] },
];

export default function RecorderGuidePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <nav className="bg-slate-900 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Image src="/icon.png" alt="OptiBot" width={28} height={28} className="rounded-lg" priority />
            </div>
            <span className="text-lg font-bold tracking-tight uppercase">OptiBot</span>
          </Link>
          <Link href="/extension" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 bg-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Video className="w-3.5 h-3.5" /> Recorder OptiBot
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
            Enregistrez n&apos;importe quel portail<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">en 5 minutes</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Effectuez le parcours manuellement une fois — OptiBot le rejoue automatiquement pour tous les dossiers suivants, et le partage à tous les opticiens.
          </p>
        </div>
      </section>

      {/* Guide étapes */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-2xl font-black tracking-tight">Guide pas à pas</h2>
          </div>

          <div className="space-y-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="flex gap-6">
                  {/* Numéro + ligne */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="w-px bg-slate-100 flex-1 mt-3" />
                  </div>

                  {/* Contenu */}
                  <div className="pb-8 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Étape {step.num}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-4">{step.title}</h3>
                    {step.content}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Critères qualité */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <Zap className="w-5 h-5 text-blue-600" />
            <h2 className="text-2xl font-black tracking-tight">Critères d&apos;un bon parcours</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {criteria.map((c) => (
              <div key={c.title} className="bg-white rounded-3xl border border-slate-200 p-8">
                <div className={`text-2xl mb-3`}>{c.icon}</div>
                <h3 className={`text-lg font-black mb-4 ${c.color}`}>{c.title}</h3>
                <ul className="space-y-2">
                  {c.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="font-medium">· {item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-16 px-6 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight mb-8">💡 Conseils pratiques</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "🖥️", tip: "Ne fermez pas la fenêtre pendant l'enregistrement — le Recorder survit aux navigations mais pas à la fermeture de l'onglet" },
              { icon: "⏳", tip: "Attendez que chaque page soit complètement chargée avant de remplir — le Recorder capture l'URL au moment de la saisie" },
              { icon: "📋", tip: "Pour les selects et dropdowns : sélectionnez l'option avec la vraie valeur patient, pas une valeur fictive" },
              { icon: "🗑️", tip: "Si vous faites une erreur, supprimez l'étape dans le wizard étape 2 avec le bouton 🗑️ avant d'envoyer" },
              { icon: "🔄", tip: "Un parcours peut être enregistré plusieurs fois — la version la plus récente validée est utilisée" },
              { icon: "🌍", tip: "Votre parcours validé est partagé automatiquement à tous les opticiens OptiBot sur ce portail" },
            ].map((t) => (
              <div key={t.tip} className="flex items-start gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <span className="text-2xl shrink-0">{t.icon}</span>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight mb-3">Prêt à enregistrer votre premier parcours ?</h2>
          <p className="text-slate-400 font-medium mb-8">Installez l&apos;extension, ouvrez votre portail mutuelle, et c&apos;est parti.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/extension" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20">
              Installer l&apos;extension
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/portails" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 font-black rounded-2xl hover:bg-white/20 transition-all uppercase tracking-widest text-xs">
              Voir les portails compatibles
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/portails" className="hover:text-white transition-colors">Portails</Link>
            <Link href="/fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</Link>
            <Link href="/legal/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
          </div>
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">© 2026 OptiBot</div>
        </div>
      </footer>

    </div>
  );
}
