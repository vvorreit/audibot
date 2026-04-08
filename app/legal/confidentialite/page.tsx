"use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-6 md:p-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-10 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
        </Link>
        <div className="flex items-center gap-4 mb-8 text-blue-600">
           <Shield className="w-12 h-12" />
           <h1 className="text-4xl font-black">Politique de Confidentialité</h1>
        </div>
        <p className="text-sm text-slate-400 mb-10">Dernière mise à jour : 27 mars 2026 — Conformément aux Articles 13 et 14 du Règlement (UE) 2016/679 (RGPD)</p>

        <div className="prose prose-slate max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">1. Responsable du traitement</h2>
            <p className="text-slate-600 leading-relaxed">
              Le responsable du traitement des données personnelles collectées via le site audibot.fr est :<br /><br />
              <strong>Vorreiter Activities</strong><br />
              SIRET : 92252355000023<br />
              Email : <a href="mailto:contact@audibot.fr" className="text-blue-600 underline">contact@audibot.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">2. Principe de &quot;Privacy-by-Design&quot;</h2>
            <p className="text-slate-600 leading-relaxed">
              AudiBot a été conçu pour respecter scrupuleusement le secret médical et la vie privée de vos patients.
              <strong> Aucune donnée de santé identifiable n&apos;est stockée sur nos serveurs.</strong> Les documents sont traités
              en mémoire volatile et immédiatement purgés après chaque analyse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">3. Traitement des documents — Architecture</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              AudiBot propose deux modes de traitement des documents (prescriptions ORL, cartes mutuelles) :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-3">
              <li>
                <strong>Mode navigateur (extension) :</strong> La reconnaissance optique s&apos;effectue directement
                dans votre navigateur, sur votre poste. Le document ne quitte pas votre ordinateur.
              </li>
              <li>
                <strong>Mode scan assisté (application web) :</strong> Le document est transmis par connexion
                chiffrée (TLS 1.3) à notre microservice OCR auto-hébergé en France, sur infrastructure certifiée{" "}
                <strong>HDS (Hébergeur de Données de Santé)</strong> — Scaleway SAS. Le document est traité en{" "}
                <strong>mémoire vive uniquement</strong>, sans écriture sur disque, puis immédiatement supprimé
                de la mémoire après traitement (purge explicite garantie par le code).{" "}
                <strong>Aucun document n&apos;est conservé sur nos serveurs.</strong>
              </li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              <strong>AudiBot n&apos;utilise aucune API d&apos;intelligence artificielle tierce.</strong> Le moteur de
              reconnaissance optique (PaddleOCR) est auto-hébergé, sans connexion sortante vers des services
              tiers, avec modèles pré-chargés localement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">4. Données collectées et bases légales</h2>
            <p className="text-slate-600 leading-relaxed">
              Nous collectons uniquement les données strictement nécessaires au fonctionnement du service, sur les bases légales suivantes :
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-slate-600 border border-slate-200 rounded">
                <thead className="bg-slate-50 text-slate-700 font-semibold">
                  <tr>
                    <th className="text-left p-3 border-b">Donnée</th>
                    <th className="text-left p-3 border-b">Finalité</th>
                    <th className="text-left p-3 border-b">Base légale (Art. 6 RGPD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Email, mot de passe</td>
                    <td className="p-3">Création et gestion du compte</td>
                    <td className="p-3">Exécution du contrat (Art. 6.1.b)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Compteur d&apos;usage</td>
                    <td className="p-3">Respect des quotas de l&apos;offre souscrite</td>
                    <td className="p-3">Exécution du contrat (Art. 6.1.b)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Données de facturation</td>
                    <td className="p-3">Gestion comptable et fiscale</td>
                    <td className="p-3">Obligation légale (Art. 6.1.c)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Données d&apos;analyse (cookies)</td>
                    <td className="p-3">Mesure d&apos;audience (Google Analytics)</td>
                    <td className="p-3">Consentement (Art. 6.1.a)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Métadonnées emails (ouverture, clic)</td>
                    <td className="p-3">Suivi de délivrabilité des emails transactionnels (confirmation, alertes compte)</td>
                    <td className="p-3">Intérêt légitime (Art. 6.1.f) — amélioration de la délivrabilité</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Logs OCR (score, type, métadonnées)</td>
                    <td className="p-3">Amélioration du service, détection d&apos;anomalies — sans contenu des documents</td>
                    <td className="p-3">Intérêt légitime (Art. 6.1.f)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-500 text-sm mt-3">
              <strong>Aucune décision automatisée ni profilage</strong> n&apos;est effectué à partir de vos données personnelles (Article 22 RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">5. Cookies et traceurs</h2>
            <p className="text-slate-600 leading-relaxed">
              AudiBot utilise Google Analytics pour mesurer l&apos;audience du site. Ce service dépose des cookies sur votre appareil <strong>uniquement après votre consentement explicite</strong>, recueilli via notre bandeau de cookies lors de votre première visite.
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              Vous pouvez retirer votre consentement à tout moment en cliquant sur « Gérer mes cookies » en bas de page, ou via les paramètres de votre navigateur.
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              Aucun cookie publicitaire ni cookie de profilage n&apos;est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">6. Durée de conservation</h2>
            <p className="text-slate-600 leading-relaxed">
              Les données de compte (email, préférences) sont conservées pendant toute la durée de la relation contractuelle, puis pendant <strong>3 ans</strong> à compter de la dernière activité, conformément aux recommandations de la CNIL.
              Les données de facturation sont conservées <strong>10 ans</strong> conformément aux obligations légales comptables (Code de commerce, Art. L123-22).
              Les données d&apos;analyse (Google Analytics) sont conservées <strong>13 mois maximum</strong> conformément aux recommandations de la CNIL.
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li><strong>Logs techniques</strong> (OCR, injections, RPA) : <strong>90 jours</strong>, purgés automatiquement</li>
              <li><strong>Dossiers tiers payant</strong> : durée de l&apos;abonnement + <strong>3 ans</strong> (obligation comptable)</li>
              <li><strong>Données de compte</strong> : durée de l&apos;abonnement + <strong>30 jours</strong> après résiliation</li>
              <li><strong>Acceptations légales</strong> (CGV, DPA) : <strong>5 ans</strong> (prescription contractuelle)</li>
              <li><strong>Données supprimées à la demande</strong> : sous <strong>30 jours</strong> (Art. 17 RGPD — droit à l&apos;effacement)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">7. Sous-traitants et transferts hors UE</h2>
            <p className="text-slate-600 leading-relaxed">
              Dans le cadre de la fourniture du service, nous faisons appel aux sous-traitants suivants, chacun soumis à des obligations RGPD :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-3">
              <li>
                <strong>Stripe Inc.</strong> — Traitement des paiements (certifié PCI-DSS). Transfert hors UE encadré par les Clauses Contractuelles Types (CCT) de la Commission européenne.{" "}
                <a href="https://stripe.com/fr/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Politique Stripe</a>
              </li>
              <li>
                <strong>Google LLC</strong> — Analyse d&apos;audience via Google Analytics, uniquement après consentement. Transfert hors UE encadré par les CCT de la Commission européenne.{" "}
                <a href="https://policies.google.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Politique Google</a>
              </li>
              <li>
                <strong>Scaleway SAS</strong> — Hébergement des serveurs en France (Union Européenne), certifié HDS (Hébergeur de Données de Santé). Aucun transfert hors UE.{" "}
                <a href="https://www.scaleway.com/fr/politique-de-confidentialite/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Politique Scaleway</a>
              </li>
            </ul>
            <p className="text-slate-500 text-sm mt-3">
              Les CCT sont les garanties appropriées au sens de l&apos;Article 46 du RGPD pour les transferts vers des pays tiers à l&apos;EEE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">8. Vos droits (RGPD)</h2>
            <p className="text-slate-600 leading-relaxed">
              Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mt-3">
              <li><strong>Accès</strong> — obtenir une copie de vos données</li>
              <li><strong>Rectification</strong> — corriger des données inexactes</li>
              <li><strong>Effacement</strong> — demander la suppression de vos données</li>
              <li><strong>Portabilité</strong> — recevoir vos données dans un format structuré</li>
              <li><strong>Opposition</strong> — vous opposer à un traitement basé sur notre intérêt légitime</li>
              <li><strong>Limitation</strong> — restreindre temporairement un traitement</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous à : <strong>contact@audibot.fr</strong>. Nous nous engageons à répondre dans un délai maximum de <strong>30 jours</strong>.
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              Si vous estimez que vos droits ne sont pas respectés, vous avez le droit d&apos;introduire une réclamation auprès de la <strong>Commission Nationale de l&apos;Informatique et des Libertés (CNIL)</strong> :{" "}
              <a href="https://www.cnil.fr" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
