import React from "react";
import { Bot, Zap, Play, Video, BarChart2 } from "lucide-react";
import { SectionAnchor, SectionHeader, Card, SubSection, Badge, Divider, StepNumber, WarnBox, TipBox, CheckItem } from "../GuideComponents";

export default function RpaSection() {
  return (
    <>
      <SectionAnchor id="rpa" />
      <section>
        <SectionHeader label="RPA" icon={Bot} title="RPA — Automatisation complète des parcours" color="blue"
          subtitle="Disponible à partir du plan PRO" />

        <Card className="space-y-8">
          <SubSection title="Qu'est-ce que le RPA ?" icon={Zap} iconColor="text-blue-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Le <strong>RPA (Robotic Process Automation)</strong> exécute un parcours complet sur un portail mutuelle de façon entièrement automatique — connexion, navigation multi-pages, saisie, validation et récupération du résultat. Contrairement à l&apos;autofill (qui remplit un formulaire ouvert), le RPA <strong>ouvre lui-même le portail</strong>, navigue entre les pages et soumet le dossier.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-black text-blue-800 mb-1">Autofill (tous plans)</p>
                <p className="text-xs text-blue-700">Vous ouvrez le portail, naviguez jusqu&apos;au formulaire, cliquez sur Remplir. AudiBot injecte les données dans la page active.</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-xs font-black text-green-800 mb-1 flex items-center gap-1.5"><Badge color="blue">PRO</Badge> RPA</p>
                <p className="text-xs text-green-700">Vous scannez le document, cliquez sur Lancer. AudiBot fait <em>tout</em> : connexion, navigation, saisie, soumission. Vous pouvez travailler sur autre chose.</p>
              </div>
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Lancer un parcours RPA" icon={Play} iconColor="text-blue-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Le bouton <strong>▶ Lancer</strong> apparaît dans le popup <strong>uniquement si</strong> deux conditions sont réunies :
            </p>
            <div className="grid md:grid-cols-2 gap-3 mb-5">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-black text-blue-800 mb-1">Condition 1 — Plan PRO ou ÉQUIPE</p>
                <p className="text-xs text-blue-700">Le RPA est réservé aux plans PRO, ÉQUIPE et ADMIN. Sur FREE, le bloc parcours ne s&apos;affiche pas.</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-black text-blue-800 mb-1">Condition 2 — Parcours enregistré</p>
                <p className="text-xs text-blue-700">Un parcours doit avoir été enregistré via le <strong>Recorder</strong> pour le portail ouvert. Sans parcours en base, le bouton n&apos;apparaît pas.</p>
              </div>
            </div>
            <ol className="space-y-4">
              {[
                <>Enregistrez d&apos;abord un parcours via le <strong>Recorder</strong> (voir section ci-dessous)</>,
                <>Scannez le document patient, puis ouvrez le portail cible dans Chrome</>,
                <>Le popup affiche <strong>« Parcours disponibles »</strong> avec le bouton <strong>▶ Lancer</strong></>,
                <>Cliquez sur <strong>▶ Lancer</strong> — AudiBot rejoue automatiquement toutes les étapes enregistrées</>,
                <>Des toasts de progression s&apos;affichent à chaque étape</>,
                <>Si une reconnexion est détectée en cours de route, AudiBot vous invite à vous reconnecter et reprend automatiquement</>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} />
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">{text}</p>
                </li>
              ))}
            </ol>
            <WarnBox>
              Ne fermez pas l&apos;onglet du portail pendant l&apos;exécution. Vous pouvez travailler dans d&apos;autres onglets sans problème.
            </WarnBox>
          </SubSection>

          <Divider />

          <SubSection title="Recorder — créer un nouveau parcours" icon={Video} iconColor="text-blue-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              AudiBot peut enregistrer vos actions sur un portail pour créer un parcours RPA automatique. Utile pour les portails non encore intégrés.
            </p>
            <ol className="space-y-3">
              {[
                "Popup → RPA → « Enregistrer un parcours »",
                "Donnez un nom au parcours et sélectionnez les variables à injecter (NSS, numéro adhérent...)",
                "Cliquez sur « Démarrer l'enregistrement » — bouton rouge dans le popup",
                "Naviguez normalement sur le portail — chaque clic, saisie et navigation est enregistrée",
                "Cliquez sur « Arrêter » — AudiBot génère le script RPA automatiquement",
                "Testez le parcours sur un dossier réel — ajustez si nécessaire",
                "Activez le parcours → disponible pour tous vos scans futurs",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} />
                  <p className="text-sm text-slate-600 pt-1">{text}</p>
                </li>
              ))}
            </ol>
            <TipBox>
              Les parcours enregistrés sont robustes aux changements mineurs de mise en page (sélecteurs alternatifs automatiques). En cas de refonte majeure d&apos;un portail, une alerte vous invite à ré-enregistrer.
            </TipBox>
          </SubSection>

          <Divider />

          <SubSection title="Suivi et statistiques RPA" icon={BarChart2} iconColor="text-blue-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">Extension Chrome → onglet RPA → Historique</p>
            <ul className="space-y-2">
              <CheckItem>Taux de succès global et par portail (sur 7j, 30j, 90j)</CheckItem>
              <CheckItem>Temps moyen d&apos;exécution par parcours</CheckItem>
              <CheckItem>Détail de chaque étape : durée, résultat, erreur éventuelle</CheckItem>
              <CheckItem>Gain de temps calculé : heures économisées vs saisie manuelle</CheckItem>
              <CheckItem>Alertes automatiques si un portail a un taux d&apos;échec &gt; 20%</CheckItem>
            </ul>
          </SubSection>
        </Card>
      </section>
    </>
  );
}
