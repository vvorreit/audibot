import React from "react";
import { HelpCircle, ChevronRight } from "lucide-react";
import { SectionAnchor, SectionHeader } from "../GuideComponents";

const faqItems = [
  {
    q: "L'extension ralentit-elle mon navigateur Chrome ?",
    a: "Non. L'extension s'active uniquement sur les portails mutuelles reconnus et lors d'un scan actif. En dehors de ces moments, elle est en veille et ne consomme pas de ressources."
  },
  {
    q: "Puis-je utiliser AudiBot sur plusieurs ordinateurs ?",
    a: "Oui. Votre compte est accessible sur autant d'ordinateurs que vous souhaitez. Installez l'extension sur chaque ordinateur et connectez-vous avec le même compte. Les données (dossiers TP, templates) sont synchronisées."
  },
  {
    q: "Que se passe-t-il si j'atteins ma limite de scans mensuelle ?",
    a: "Vous recevez une alerte à 80% et 95% de votre quota. Une fois la limite atteinte, les nouveaux scans sont bloqués mais toutes les autres fonctionnalités (autofill, TP, alertes) restent disponibles. Vous pouvez upgrader votre plan pour continuer."
  },
  {
    q: "L'OCR fonctionne-t-il sur toutes les cartes mutuelles ?",
    a: "AudiBot reconnaît les cartes de toutes les grandes mutuelles françaises (Harmonie, Malakoff, AG2R, Axa, April, etc.) et des OCAM. Pour les cartes de mutuelles peu communes, l'extraction peut être partielle — vous pouvez compléter manuellement les champs manquants."
  },
  {
    q: "Mon portail mutuelle change régulièrement — que faire ?",
    a: "Les portails principaux (Almerys, Wemind, etc.) sont maintenus à jour par notre équipe. Si un portail subit une refonte et qu'AudiBot ne le reconnaît plus, signalez-le via le bouton « Portail cassé » dans le popup — nous mettons à jour sous 48-72h. En attendant, Smart Fill peut pallier."
  },
  {
    q: "Le RPA peut-il tourner sans que j'aie Chrome ouvert ?",
    a: "Non. Le RPA nécessite une instance Chrome active avec l'extension installée. Il ne peut pas tourner côté serveur (pas d'interface de navigateur distante). Pour les traitements en batch, vous pouvez lancer plusieurs parcours successifs depuis le popup."
  },
  {
    q: "Comment les patients remplissent-ils le bilan visuel ?",
    a: "Trois possibilités : vous leur envoyez un lien par email ou SMS depuis le dashboard, ils scannent un QR code affiché en magasin (mode tablette), ou vous intégrez le lien de partage sur votre site web. Le questionnaire est accessible sur téléphone et ordinateur, sans application à installer. Il prend 5 à 8 minutes à compléter."
  },
  {
    q: "Dois-je scanner le QR code à chaque fois pour le scan mobile ?",
    a: "Non. Le QR code n'est nécessaire que lors de la première connexion entre votre téléphone et votre compte AudiBot. Après ce premier scan, l'appareil est mémorisé automatiquement. Il suffit d'ouvrir la page /scan (ou la PWA installée sur votre écran d'accueil) pour scanner directement. Un nouveau QR est demandé uniquement si vous changez de téléphone ou effacez les données de votre navigateur mobile."
  },
  {
    q: "Comment récupérer mon mot de passe oublié ?",
    a: "Depuis la page de connexion (audibot.fr/auth/signin), cliquez sur « Mot de passe oublié ». Entrez votre email — vous recevez un lien de réinitialisation valable 1 heure. Si vous vous êtes connecté via Google, vous n'avez pas de mot de passe AudiBot — utilisez « Continuer avec Google »."
  },
  {
    q: "Mes données sont-elles sauvegardées si je change d'ordinateur ?",
    a: "Toutes vos données de compte (dossiers TP, templates, bilans visuels, paramètres) sont stockées sur nos serveurs et accessibles depuis n'importe quel ordinateur. Seules les données locales de l'extension (cache de la dernière session de scan) sont liées à l'ordinateur."
  },
  {
    q: "Puis-je utiliser AudiBot sans l'extension Chrome ?",
    a: "Le dashboard web (gestion TP, bilans visuels, alertes, export, équipe) est accessible sans extension depuis n'importe quel navigateur. En revanche, le scan mobile depuis le dashboard et l'autofill portails nécessitent l'extension Chrome."
  },
  {
    q: "Comment contacter le support ?",
    a: "Dashboard → Support → Nouveau ticket, ou email direct : contact@audibot.fr. Délai de réponse : < 4h en semaine, < 24h le week-end. Pour les urgences production : bouton « Urgence » dans le dashboard (plan PRO+)."
  },
];

export default function FaqSection() {
  return (
    <>
      <SectionAnchor id="faq" />
      <section>
        <SectionHeader label="FAQ" icon={HelpCircle} title="Questions fréquentes" color="slate" />

        <div className="space-y-3">
          {faqItems.map((item) => (
            <div key={item.q} className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <details className="group">
                <summary className="flex items-center gap-3 px-6 py-5 cursor-pointer list-none">
                  <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  <p className="text-sm font-bold text-slate-800 flex-1">{item.q}</p>
                  <ChevronRight className="w-4 h-4 text-slate-600 transition-transform group-open:rotate-90 shrink-0" />
                </summary>
                <div className="px-6 pb-5 pt-0">
                  <div className="pl-7">
                    <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
