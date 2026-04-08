"use client";

import Link from "next/link";
import { ArrowLeft, Puzzle } from "lucide-react";

export default function ExtensionPrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-6 md:p-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-10 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
        </Link>
        <div className="flex items-center gap-4 mb-2 text-blue-600">
          <Puzzle className="w-12 h-12" />
          <h1 className="text-4xl font-black">Politique de confidentialité — Extension</h1>
        </div>
        <p className="text-sm text-slate-400 mb-10">Extension navigateur AudiBot Multi-Site — Version 1.3 — 23 mars 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">1. Éditeur</h2>
            <p className="text-slate-600 leading-relaxed">
              L&apos;extension AudiBot Multi-Site est éditée par <strong>Vorreiter Activities</strong> (SASU),
              54 rue Marcel et Ida Demia, 01500 Ambérieu-en-Bugey — <a href="mailto:contact@audibot.fr" className="text-blue-600 underline">contact@audibot.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">2. Données accédées et traitées</h2>

            <h3 className="font-bold text-slate-800 mb-2">2.1 Presse-papier (<code>clipboardRead</code>)</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              L&apos;extension lit le presse-papier <strong>uniquement lorsque vous cliquez sur le bouton &quot;🤖 Remplir&quot;</strong>.
              Elle y recherche des données structurées préalablement copiées depuis votre tableau de bord AudiBot
              (nom, prénom, NSS, prescription ORL). Ces données ne sont pas envoyées à un serveur lors de cette lecture.
            </p>

            <h3 className="font-bold text-slate-800 mb-2">2.2 Données patients en cache local</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Pour éviter de copier-coller à chaque formulaire, l&apos;extension peut mettre en cache local les données
              d&apos;un patient (NSS, audiogramme, nom, prénom). Ces données sont <strong>chiffrées en AES-256-GCM</strong>
              avec une clé dérivée de votre token de session (PBKDF2, 310 000 itérations, salt aléatoire par appareil).
              Elles ne quittent jamais votre navigateur et sont automatiquement supprimées après <strong>15 minutes d&apos;inactivité</strong>.
            </p>

            <h3 className="font-bold text-slate-800 mb-2">2.3 Accès aux portails mutuelles</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              L&apos;extension injecte du code JavaScript dans les pages des portails mutuelles suivants afin de pré-remplir
              automatiquement les formulaires de demande de prise en charge :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>LivebyOptimum, Almerys / be-almerys.com, Viamedis, Itelis (ISM-TP)</li>
              <li>Actil / Kalixia, Wemind, APGIS, Ameli.fr</li>
              <li>Solimut, SP Santé / FFL Promoteur, Mercer (services-fm.net, mercernet.fr)</li>
              <li>Oxantis (MGEN / Harmonie Mutuelle), SantéClair / TP Plus, Génération</li>
              <li>Mutuelle-optique.fr</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              L&apos;extension <strong>n&apos;envoie pas les données de santé</strong> saisies sur ces portails à des serveurs tiers.
              Elle lit certains champs pour les mémoriser localement (fonction &quot;💾 Mémoriser&quot;) afin de pré-remplir
              d&apos;autres portails lors de la même session.
            </p>

            <h3 className="font-bold text-slate-800 mb-2">2.4 Détection automatique des rejets (optionnelle)</h3>
            <p className="text-slate-600 leading-relaxed">
              Si vous activez la détection automatique des rejets dans le popup de l&apos;extension,
              celle-ci analyse périodiquement les pages de résultats tiers-payant de certains portails
              (Almerys, Viamedis, Itelis, Actil) pour détecter les dossiers rejetés et les synchroniser
              avec votre espace AudiBot. Les données transmises sont : numéro de dossier, motif de rejet,
              date, montant. <strong>Aucun nom de patient n&apos;est transmis.</strong>
              Cette fonctionnalité est <strong>désactivée par défaut</strong> et nécessite votre activation explicite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">3. Données envoyées aux serveurs AudiBot</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-600 border border-slate-200 rounded">
                <thead className="bg-slate-50 font-semibold">
                  <tr>
                    <th className="text-left p-3 border-b">Événement</th>
                    <th className="text-left p-3 border-b">Données envoyées</th>
                    <th className="text-left p-3 border-b">Données patient ?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3">Remplissage d&apos;un formulaire</td>
                    <td className="p-3">Token de session, nom du portail, statut succès/échec, nombre de champs</td>
                    <td className="p-3 text-green-700 font-semibold">❌ Non</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Health monitoring (ping)</td>
                    <td className="p-3">Version extension, portail, statut</td>
                    <td className="p-3 text-green-700 font-semibold">❌ Non</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Sync tiers-payant (bouton &quot;Sync TP&quot;)</td>
                    <td className="p-3">Token, N° dossier, organisme, montant, statut, date</td>
                    <td className="p-3 text-green-700 font-semibold">❌ Non (pas de nom patient)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Détection rejets (si activée)</td>
                    <td className="p-3">Token, N° dossier, motif rejet, date, montant, portail</td>
                    <td className="p-3 text-green-700 font-semibold">❌ Non</td>
                  </tr>
                  <tr>
                    <td className="p-3">RPA (automatisation formulaire)</td>
                    <td className="p-3">Logs d&apos;étapes (mutuelle, étape, statut)</td>
                    <td className="p-3 text-green-700 font-semibold">❌ Non</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">4. Stockage local (chrome.storage)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-600 border border-slate-200 rounded">
                <thead className="bg-slate-50 font-semibold">
                  <tr>
                    <th className="text-left p-3 border-b">Clé</th>
                    <th className="text-left p-3 border-b">Contenu</th>
                    <th className="text-left p-3 border-b">Chiffré</th>
                    <th className="text-left p-3 border-b">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-xs">audibot_cache</td>
                    <td className="p-3">Données patient en cache (NSS, prescription ORL, etc.)</td>
                    <td className="p-3 text-green-700 font-semibold">✅ AES-256-GCM</td>
                    <td className="p-3">15 min d&apos;inactivité</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-xs">audibot_rpa</td>
                    <td className="p-3">Payload RPA temporaire (données patient)</td>
                    <td className="p-3 text-green-700 font-semibold">✅ AES-256-GCM</td>
                    <td className="p-3">5 minutes max</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-xs">audibot_auth</td>
                    <td className="p-3">Token de session, plan, expiration</td>
                    <td className="p-3 text-slate-500">Non (pas de données patient)</td>
                    <td className="p-3">20 heures</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">audibot_lock</td>
                    <td className="p-3">Timestamp de verrouillage automatique</td>
                    <td className="p-3 text-slate-500">Non</td>
                    <td className="p-3">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">5. Permissions requises</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>clipboardRead</strong> — Lecture du presse-papier lors du clic sur &quot;Remplir&quot; pour récupérer les données copiées depuis AudiBot</li>
              <li><strong>activeTab</strong> — Accès à l&apos;onglet actif pour injecter le script d&apos;auto-remplissage</li>
              <li><strong>storage</strong> — Stockage chiffré local des données patient en cache</li>
              <li><strong>tabs</strong> — Ouverture d&apos;un nouvel onglet lors du lancement du RPA</li>
              <li><strong>alarms</strong> — Déclenchement du verrouillage automatique après 15 min d&apos;inactivité</li>
              <li><strong>scripting</strong> — Injection dynamique de scripts sur les portails mutuelles pour adapter le remplissage aux mises à jour des sites</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">6. Vos droits</h2>
            <p className="text-slate-600 leading-relaxed">
              Vous pouvez supprimer toutes les données locales à tout moment en cliquant sur &quot;Effacer&quot; dans le popup
              de l&apos;extension, ou en désinstallant l&apos;extension (les données chrome.storage sont supprimées automatiquement).
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              Pour toute question : <a href="mailto:contact@audibot.fr" className="text-blue-600 underline">contact@audibot.fr</a>
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              Vous avez le droit d&apos;introduire une réclamation auprès de la{" "}
              <a href="https://www.cnil.fr" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">CNIL</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">7. Lien vers la politique générale</h2>
            <p className="text-slate-600 leading-relaxed">
              Cette politique complète la{" "}
              <Link href="/legal/confidentialite" className="text-blue-600 underline">
                Politique de confidentialité générale d&apos;AudiBot
              </Link>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
