import React from "react";
import { Chrome, Download, Eye, Settings, Layers, MousePointerClick, Wand2, RefreshCw, AlertCircle, Lock } from "lucide-react";
import { SectionAnchor, SectionHeader, Card, SubSection, StepNumber, TipBox, Divider, InfoBox, CodeBlock } from "../GuideComponents";

export default function ExtensionSection() {
  return (
    <>
      <SectionAnchor id="extension" />
      <section>
        <SectionHeader step="Étape 1" label="Extension" icon={Chrome} title="Installer l'extension Chrome" color="blue" />

        <Card className="space-y-8">
          <SubSection title="Installation depuis le Chrome Web Store" icon={Download}>
            <ol className="space-y-4">
              {[
                <><strong>audibot.fr/extension</strong> → cliquez sur <strong>« Ajouter à Chrome »</strong></>,
                <>Chrome Web Store s&apos;ouvre → <strong>« Ajouter à Chrome »</strong> → <strong>« Ajouter l&apos;extension »</strong></>,
                <>L&apos;icône <span className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">🤖</span> apparaît à droite de la barre d&apos;adresse</>,
                <>Cliquez sur l&apos;icône puzzle → <strong>Épingler AudiBot</strong> pour un accès permanent</>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} />
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">{text}</p>
                </li>
              ))}
            </ol>
            <TipBox>
              Fonctionne sur <strong>Chrome, Brave, Edge, Arc, Vivaldi, Opera</strong> (tout navigateur Chromium v110+). Firefox n&apos;est pas supporté. Safari n&apos;est pas supporté.
            </TipBox>
          </SubSection>

          <Divider />

          <SubSection title="Permissions accordées à l'extension" icon={Eye} iconColor="text-blue-500">
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Lors de l&apos;installation, Chrome demande des autorisations. Voici pourquoi chacune est nécessaire :
            </p>
            <div className="space-y-3">
              {[
                { perm: "Lire les données sur les sites web", why: "Nécessaire pour détecter les champs de formulaire sur les portails mutuelles et y injecter les données" },
                { perm: "Stocker des données localement", why: "Mémoriser vos données scannées entre deux sessions (stockage local, jamais sur nos serveurs)" },
                { perm: "Communiquer avec audibot.fr", why: "Synchroniser votre compte, récupérer les mappings de portails et envoyer les résultats OCR anonymisés" },
                { perm: "Afficher des notifications", why: "Vous informer du succès ou d'une erreur lors d'une injection (optionnel)" },
              ].map((p) => (
                <div key={p.perm} className="flex gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Lock className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-slate-700 mb-0.5">{p.perm}</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{p.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Connexion à votre compte" icon={Settings}>
            <ol className="space-y-4">
              {[
                <>Cliquez sur l&apos;icône AudiBot dans Chrome</>,
                <>Popup → bouton <strong>« Se connecter »</strong> — votre dashboard s&apos;ouvre dans un onglet</>,
                <>Connectez-vous : <strong>email + mot de passe</strong> ou <strong>« Continuer avec Google »</strong></>,
                <>Fermez l&apos;onglet dashboard — le popup de l&apos;extension est maintenant connecté</>,
                <>L&apos;avatar de votre profil apparaît en haut du popup</>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} />
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">{text}</p>
                </li>
              ))}
            </ol>
            <InfoBox>
              La session de l&apos;extension reste active même après la fermeture de Chrome. Vous n&apos;avez à vous connecter qu&apos;une seule fois par ordinateur.
            </InfoBox>
          </SubSection>

          <Divider />

          <SubSection title="Structure du popup — ce que vous voyez" icon={Layers}>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Le popup de l&apos;extension est organisé en quatre zones principales :
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { zone: "Documents", desc: "Données extraites du dernier scan : NSS, mutuelle, correction optique. Historique des documents récents." },
                { zone: "Smart Fill", desc: "Boutons flottants Remplir et Mémoriser apparaissent sur les sites de portails mutuelles pour injection directe." },
                { zone: "Paramètres (4 toggles)", desc: "Activer/désactiver : notifications, mode automatique, thème sombre, raccourcis clavier." },
                { zone: "Connexion ERP", desc: "Configurer la connexion à votre logiciel de gestion (ERP) pour synchroniser les données patients." },
              ].map((z) => (
                <div key={z.zone} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-black text-slate-800 mb-0.5">{z.zone}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{z.desc}</p>
                </div>
              ))}
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Boutons flottants sur les sites" icon={MousePointerClick}>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Lorsque vous naviguez sur un portail mutuelle reconnu, deux boutons flottants apparaissent en bas à droite de la page :
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-black text-blue-800 mb-1">Remplir</p>
                <p className="text-xs text-blue-700 leading-relaxed">Injecte les données du dernier scan dans les champs du formulaire actif. Equivalent du bouton dans le popup.</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <p className="text-xs font-black text-purple-800 mb-1">Mémoriser</p>
                <p className="text-xs text-purple-700 leading-relaxed">Capture les données déjà saisies dans le formulaire et les enregistre dans l&apos;extension pour réutilisation future.</p>
              </div>
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Smart Fill — métriques et diagnostics" icon={Wand2}>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Après chaque remplissage Smart Fill, l&apos;extension affiche un résumé avec trois indicateurs de qualité :
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { metric: "noData", desc: "Champs du formulaire pour lesquels aucune donnée n'était disponible dans le scan. Normal pour les champs optionnels.", color: "bg-slate-50 border-slate-100" },
                { metric: "failed", desc: "Champs où l'injection a échoué (champ protégé, format incompatible, iframe bloquante). Nécessite une saisie manuelle.", color: "bg-amber-50 border-amber-100" },
                { metric: "unmatched", desc: "Champs du formulaire que Smart Fill n'a pas pu identifier. Souvent des champs spécifiques au portail non encore cartographiés.", color: "bg-rose-50 border-rose-100" },
              ].map((m) => (
                <div key={m.metric} className={`p-4 rounded-xl border ${m.color}`}>
                  <p className="text-xs font-black text-slate-800 mb-1 font-mono">{m.metric}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
            <TipBox>
              Si vous voyez beaucoup de <strong>unmatched</strong> sur un portail, signalez-le via le bouton feedback dans le popup. Notre équipe améliore continuellement les mappings.
            </TipBox>
          </SubSection>

          <Divider />

          <SubSection title="Mises à jour et versioning" icon={RefreshCw}>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              L&apos;extension se met à jour automatiquement via Chrome Web Store. Cycle de mise à jour : Chrome vérifie toutes les 5 heures. Pour forcer une mise à jour immédiate :
            </p>
            <CodeBlock>chrome://extensions → Activer le mode développeur → « Mettre à jour »</CodeBlock>
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">
              Chaque version est notée dans le popup. En cas de problème après une mise à jour, vous pouvez revenir à la version précédente via le Chrome Web Store (onglet « Version »).
            </p>
          </SubSection>

          <Divider />

          <SubSection title="Problèmes courants à l'installation" icon={AlertCircle} iconColor="text-amber-500">
            <div className="space-y-3">
              {[
                { prob: "L'icône n'apparaît pas après installation", fix: "Cliquez sur l'icône puzzle (extensions) → épinglez AudiBot" },
                { prob: "« Erreur réseau » dans le popup", fix: "Vérifiez que vous êtes connecté à Internet et que audibot.fr n'est pas bloqué par votre antivirus/proxy" },
                { prob: "Le popup s'ouvre mais ne se connecte pas", fix: "Effacez les cookies de audibot.fr : Paramètres Chrome → Confidentialité → Cookies" },
                { prob: "« Extension désactivée par l'administrateur »", fix: "Votre DSI/IT a bloqué les extensions. Contactez-les pour whitelister l'ID de l'extension AudiBot" },
              ].map((p) => (
                <div key={p.prob} className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-amber-800 mb-1">{p.prob}</p>
                    <p className="text-xs text-amber-700 leading-relaxed">→ {p.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </SubSection>
        </Card>
      </section>
    </>
  );
}
