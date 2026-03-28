"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-6 md:p-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-10 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
        </Link>
        <div className="flex items-center gap-4 mb-2 text-blue-600">
          <ShieldCheck className="w-12 h-12" />
          <h1 className="text-4xl font-black">Accord de Traitement des Données (DPA)</h1>
        </div>
        <p className="text-slate-400 text-sm mb-10">Version 1.2 — En vigueur depuis le 27 mars 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">1. Objet</h2>
            <p className="text-slate-600">
              Le présent Accord de Traitement des Données (« DPA ») est conclu en application de l&apos;article 28 du
              Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679). Il définit les
              conditions dans lesquelles OptiBot, en qualité de sous-traitant, traite les données personnelles pour
              le compte du responsable de traitement (l&apos;utilisateur professionnel opticien) dans le cadre de la
              fourniture du service OptiBot.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">2. Nature des données traitées</h2>
            <p className="text-slate-600 mb-3">
              Dans le cadre de l&apos;utilisation du service OptiBot, les catégories de données personnelles suivantes
              sont susceptibles d&apos;être traitées :
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
              <li><strong>Données de santé (article 9 du RGPD)</strong> : prescriptions optiques, corrections visuelles,
                informations médicales figurant sur les ordonnances.</li>
              <li><strong>Données administratives</strong> : numéros de sécurité sociale, références de mutuelles,
                numéros d&apos;adhérent, informations de tiers payant.</li>
              <li><strong>Données d&apos;identification des patients</strong> : nom, prénom, date de naissance, adresse
                figurant sur les documents traités.</li>
            </ul>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mt-4">
              <p className="text-slate-700 font-bold text-sm">
                Ces données sont traitées exclusivement dans le cadre de la reconnaissance optique de caractères (OCR)
                et du pré-remplissage de formulaires, pour le compte et sur instruction du responsable de traitement.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">3. Nos engagements</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">3.1 Traitement sur instructions documentées</h3>
                <p className="text-slate-600">
                  OptiBot s&apos;engage à traiter les données personnelles uniquement sur instructions documentées du
                  responsable de traitement, y compris en ce qui concerne les transferts de données à caractère
                  personnel vers un pays tiers ou à une organisation internationale, sauf si le droit de l&apos;Union
                  ou le droit de l&apos;État membre auquel OptiBot est soumis l&apos;exige.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">3.2 Architecture de minimisation des données — Zéro stockage de santé</h3>
                <p className="text-slate-600">
                  OptiBot met en œuvre une architecture de minimisation maximale des données de santé :
                </p>
                <ul className="list-disc pl-5 text-slate-600 space-y-2 mt-2 text-sm">
                  <li>
                    <strong>Mode navigateur (extension) :</strong> le traitement OCR s&apos;effectue intégralement
                    dans le navigateur de l&apos;opticien. Aucune donnée ne transite par les serveurs OptiBot.
                  </li>
                  <li>
                    <strong>Mode scan assisté (application web) :</strong> le document est transmis par connexion
                    chiffrée TLS 1.3 à un microservice OCR auto-hébergé en France sur infrastructure certifiée HDS
                    (Scaleway SAS). Le document est traité en <strong>mémoire vive uniquement</strong>, sans écriture
                    sur disque, avec purge mémoire explicite immédiate après traitement. <strong>Aucun document
                    de santé n&apos;est stocké, archivé ou transmis à un tiers.</strong>
                  </li>
                </ul>
                <p className="text-slate-600 mt-2">
                  Dans les deux cas, <strong>aucune donnée de santé identifiable n&apos;est persistée côté serveur.</strong>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">3.3 Hébergement en France — Certification HDS</h3>
                <p className="text-slate-600">
                  L&apos;ensemble de l&apos;infrastructure serveur est hébergée en France auprès d&apos;un hébergeur certifié
                  HDS (Hébergeur de Données de Santé), conformément aux exigences de l&apos;article L.1111-8 du Code
                  de la santé publique. Les détails de l&apos;hébergeur sont disponibles sur demande auprès de notre DPO.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">3.4 Mesures de sécurité</h3>
                <p className="text-slate-600 mb-2">
                  OptiBot met en œuvre les mesures techniques et organisationnelles appropriées pour garantir un
                  niveau de sécurité adapté au risque, incluant notamment :
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1.5 pl-2">
                  <li>Chiffrement des communications en TLS 1.3</li>
                  <li>Chiffrement des données au repos en AES-256</li>
                  <li>Authentification multi-facteurs (MFA) disponible</li>
                  <li>Journalisation des accès et des traitements conservée pendant 12 mois</li>
                  <li>Tests de sécurité réguliers et mises à jour continues</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">3.5 Confidentialité du personnel</h3>
                <p className="text-slate-600">
                  OptiBot s&apos;assure que les personnes autorisées à traiter les données personnelles se sont engagées
                  à respecter la confidentialité ou sont soumises à une obligation légale appropriée de confidentialité.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">3.6 Aucune utilisation par intelligence artificielle</h3>
                <p className="text-slate-600">
                  Les données personnelles traitées dans le cadre du service ne sont <strong>jamais utilisées pour
                  entraîner, améliorer ou alimenter des modèles d&apos;intelligence artificielle</strong>. Le traitement
                  OCR repose sur des algorithmes de reconnaissance optique déterministes, sans apprentissage automatique
                  sur les données des utilisateurs.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">3.7 Pas de transfert hors EEE</h3>
                <p className="text-slate-600">
                  OptiBot s&apos;engage à ne pas transférer les données personnelles en dehors de l&apos;Espace Économique
                  Européen (EEE) sans le consentement préalable écrit du responsable de traitement et sans que
                  des garanties appropriées aient été mises en place conformément au chapitre V du RGPD.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">4. Sous-traitants ultérieurs</h2>
            <p className="text-slate-600">
              OptiBot peut faire appel à des sous-traitants ultérieurs pour des fonctions techniques spécifiques
              (hébergement, envoi d&apos;emails transactionnels, traitement des paiements). La liste des sous-traitants
              ultérieurs est disponible sur demande. En cas de changement de sous-traitant ultérieur, le responsable
              de traitement sera informé avec un préavis de <strong>30 jours</strong>, lui permettant d&apos;émettre
              des objections. OptiBot impose à ses sous-traitants ultérieurs les mêmes obligations de protection
              des données que celles prévues au présent DPA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">5. Droits et obligations</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">5.1 Assistance aux droits des personnes</h3>
                <p className="text-slate-600">
                  OptiBot aide le responsable de traitement, par des mesures techniques et organisationnelles
                  appropriées, à s&apos;acquitter de son obligation de donner suite aux demandes d&apos;exercice des droits
                  des personnes concernées (accès, rectification, effacement, portabilité, opposition, limitation).
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">5.2 Notification de violation de données</h3>
                <p className="text-slate-600">
                  En cas de violation de données à caractère personnel, OptiBot notifie le responsable de traitement
                  dans un délai maximum de <strong>48 heures</strong> après en avoir pris connaissance. Cette
                  notification contient la nature de la violation, les catégories de données concernées, les
                  conséquences probables et les mesures prises ou proposées pour y remédier.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">5.3 Droit d&apos;audit</h3>
                <p className="text-slate-600">
                  OptiBot met à disposition du responsable de traitement toutes les informations nécessaires pour
                  démontrer le respect des obligations prévues à l&apos;article 28 du RGPD et permet la réalisation
                  d&apos;audits, y compris des inspections, par le responsable de traitement ou un auditeur mandaté,
                  sous réserve d&apos;un préavis de <strong>15 jours ouvrés</strong>.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">6. Obligations du responsable de traitement</h2>
            <p className="text-slate-600 mb-3">
              Le responsable de traitement (l&apos;utilisateur professionnel) s&apos;engage à :
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
              <li>Disposer d&apos;une <strong>base légale</strong> appropriée pour le traitement des données personnelles
                de ses clients et patients, conformément aux articles 6 et 9 du RGPD.</li>
              <li><strong>Informer les personnes concernées</strong> (patients) du traitement de leurs données
                personnelles via OptiBot, conformément aux articles 13 et 14 du RGPD.</li>
              <li>Appliquer le principe de <strong>minimisation des données</strong> en ne transmettant que les
                données strictement nécessaires à la finalité du traitement.</li>
              <li>Fournir des instructions licites et documentées concernant le traitement des données.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">7. Suppression des données</h2>
            <p className="text-slate-600">
              Au terme de la prestation de service, OptiBot procède à la suppression de l&apos;ensemble des données
              personnelles du responsable de traitement dans un délai de <strong>30 jours</strong>, sauf obligation
              légale de conservation. Une attestation de suppression est fournie sur demande au responsable de
              traitement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">8. Durée</h2>
            <p className="text-slate-600">
              Le présent DPA est conclu pour la durée de l&apos;abonnement du responsable de traitement au service
              OptiBot. Il prend fin automatiquement à l&apos;expiration ou à la résiliation de l&apos;abonnement, sous
              réserve des obligations de suppression et de restitution des données qui perdurent au-delà.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">9. Droit applicable et juridiction</h2>
            <p className="text-slate-600">
              Le présent DPA est régi par le droit français. Tout litige relatif à son interprétation ou à son
              exécution sera soumis à la compétence exclusive des Tribunaux de Paris, sauf disposition légale
              impérative contraire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">10. Contact</h2>
            <p className="text-slate-600">
              Pour toute question relative au présent DPA ou à la protection des données personnelles, vous pouvez
              contacter notre équipe à l&apos;adresse suivante :{" "}
              <a href="mailto:contact@optibot.fr" className="text-blue-600 underline">contact@optibot.fr</a>
            </p>
            <p className="text-slate-600 mt-2">
              Pour toute autre demande :{" "}
              <a href="mailto:contact@optibot.fr" className="text-blue-600 underline">contact@optibot.fr</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
