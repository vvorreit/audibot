"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-6 md:p-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-10 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
        </Link>
        <div className="flex items-center gap-4 mb-2 text-blue-600">
          <ShoppingCart className="w-12 h-12" />
          <h1 className="text-4xl font-black">Conditions Générales de Vente</h1>
        </div>
        <p className="text-slate-400 text-sm mb-10">Dernière mise à jour : mars 2026 — Version 1.1</p>

        <div className="prose prose-slate max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">1. Vendeur</h2>
            <p className="text-slate-600">
              Les présentes Conditions Générales de Vente (CGV) régissent toute souscription d&apos;abonnement au service
              OptiBot, édité par <strong>Vorreiter Activities</strong>, Société par Actions Simplifiée Unipersonnelle (SASU),
              54 rue Marcel et Ida Demia, 01500 Ambérieu-en-Bugey — SIRET : 92252355000023 — TVA : FR30922523550
              (ci-après &laquo;&nbsp;le Vendeur&nbsp;&raquo;).
              Contact&nbsp;: <a href="mailto:contact@optibot.fr" className="text-blue-600 underline">contact@optibot.fr</a>.
            </p>
            <p className="text-slate-600 mt-2">
              Ces CGV s&apos;appliquent à tout professionnel (opticien, groupe optique, franchise) souscrivant un abonnement
              payant, conformément à l&apos;article L441-1 du Code de commerce.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">2. Offres et tarifs</h2>
            <p className="text-slate-600">Les abonnements disponibles sont&nbsp;:</p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 font-bold text-slate-700">Formule</th>
                    <th className="text-left p-3 font-bold text-slate-700">Prix mensuel HT</th>
                    <th className="text-left p-3 font-bold text-slate-700">Prix annuel HT</th>
                    <th className="text-left p-3 font-bold text-slate-700">Postes inclus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="p-3 font-bold">Essentiel</td><td className="p-3">39,90&nbsp;€/mois</td><td className="p-3">33,92&nbsp;€/mois (406,98&nbsp;€/an)</td><td className="p-3">1 poste</td></tr>
                  <tr><td className="p-3 font-bold">Pro</td><td className="p-3">69,90&nbsp;€/mois</td><td className="p-3">59,42&nbsp;€/mois (712,98&nbsp;€/an)</td><td className="p-3">1 poste</td></tr>
                  <tr><td className="p-3 font-bold">Cabinet</td><td className="p-3">179,00&nbsp;€/mois</td><td className="p-3">152,15&nbsp;€/mois (1&nbsp;825,80&nbsp;€/an)</td><td className="p-3">3 postes</td></tr>
                  <tr><td className="p-3 font-bold">Réseau</td><td className="p-3">299,00&nbsp;€/mois + 30&nbsp;€/poste supp.</td><td className="p-3">254,15&nbsp;€/mois (3&nbsp;049,80&nbsp;€/an)</td><td className="p-3">5 postes inclus</td></tr>
                  <tr><td className="p-3 font-bold">Franchise</td><td className="p-3" colSpan={2}>Sur devis annuel — contacter <a href="mailto:contact@optibot.fr" className="text-blue-600 underline">contact@optibot.fr</a></td><td className="p-3">Illimité</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-600 mt-4">
              Tous les prix sont indiqués hors taxes (HT). La TVA applicable est celle en vigueur au moment de la facturation
              (actuellement 20&nbsp;% pour les services numériques en France). Les prix peuvent être révisés avec un préavis
              de 30 jours par email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">3. Conditions de paiement</h2>
            <p className="text-slate-600">
              Le paiement est effectué par carte bancaire via Stripe (prestataire de paiement sécurisé PCI-DSS).
              OptiBot ne stocke aucune donnée de carte bancaire.
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-2">
              <li><strong>Abonnement mensuel</strong>&nbsp;: prélèvement automatique chaque mois à la date de souscription.</li>
              <li><strong>Abonnement annuel</strong>&nbsp;: prélèvement unique en début de période.</li>
              <li>En cas d&apos;échec de paiement, l&apos;accès est suspendu après 3 tentatives infructueuses (J+3, J+5, J+7). Un email d&apos;alerte est envoyé à chaque tentative.</li>
              <li>Les factures sont générées automatiquement par Stripe et envoyées à l&apos;adresse email du compte.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">4. Droit de rétractation</h2>
            <p className="text-slate-600">
              Conformément à l&apos;article L221-28 du Code de la consommation, <strong>le droit de rétractation ne s&apos;applique pas</strong> aux
              services numériques dont l&apos;exécution a commencé avec l&apos;accord exprès du consommateur avant l&apos;expiration du délai
              de rétractation, dès lors que celui-ci a renoncé expressément à son droit.
            </p>
            <p className="text-slate-600 mt-2">
              OptiBot étant un service B2B destiné aux professionnels opticiens, le droit de rétractation de 14 jours
              prévu pour les consommateurs ne s&apos;applique pas.
            </p>
            <p className="text-slate-600 mt-2">
              Néanmoins, OptiBot propose une <strong>période d&apos;essai gratuite de 14 jours</strong> permettant d&apos;évaluer
              le service avant tout engagement financier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">5. Politique de remboursement</h2>
            <p className="text-slate-600">
              En dehors de la période d&apos;essai gratuite, les abonnements ne donnent pas lieu à remboursement en cas
              de résiliation en cours de période (mensuelle ou annuelle). Tout mois ou année entamé est dû intégralement.
            </p>
            <p className="text-slate-600 mt-2">
              Exceptions où un remboursement au prorata peut être accordé&nbsp;:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-2">
              <li>Interruption de service supérieure à 72h consécutives imputable à OptiBot.</li>
              <li>Erreur de facturation de notre part (doublon, montant incorrect).</li>
              <li>Décision commerciale à la discrétion d&apos;OptiBot.</li>
            </ul>
            <p className="text-slate-600 mt-2">
              Pour toute demande de remboursement&nbsp;: <a href="mailto:contact@optibot.fr" className="text-blue-600 underline">contact@optibot.fr</a>
              — nous nous engageons à répondre sous 5 jours ouvrés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">6. Conditions de résiliation</h2>
            <p className="text-slate-600">
              <strong>Par le Client</strong>&nbsp;: La résiliation est possible à tout moment depuis l&apos;espace
              &laquo;&nbsp;Mon compte&nbsp;&raquo; &gt; Facturation &gt; Annuler l&apos;abonnement, ou par email à
              <a href="mailto:contact@optibot.fr" className="text-blue-600 underline mx-1">contact@optibot.fr</a>.
              L&apos;accès reste actif jusqu&apos;à la fin de la période en cours déjà payée.
            </p>
            <p className="text-slate-600 mt-2">
              <strong>Par OptiBot</strong>&nbsp;: OptiBot peut résilier immédiatement en cas de violation des CGU
              (usage abusif, tentative de contournement, partage de compte). En cas de résiliation pour cause
              légitime, les sommes non consommées peuvent être remboursées au prorata.
            </p>
            <p className="text-slate-600 mt-2">
              <strong>Données après résiliation</strong>&nbsp;: Les données sont conservées 30 jours après résiliation
              puis définitivement supprimées, sauf obligation légale contraire. Une exportation peut être demandée
              avant la suppression.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">7. Niveau de service (SLA)</h2>
            <p className="text-slate-600">
              OptiBot s&apos;engage à maintenir une disponibilité cible de <strong>99,5&nbsp;%</strong> du service sur une base mensuelle,
              hors maintenances planifiées notifiées 48h à l&apos;avance. En cas de dépassement, un avoir peut être accordé
              à la discrétion d&apos;OptiBot.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">8. Limitation de responsabilité</h2>
            <p className="text-slate-600">
              OptiBot est un outil d&apos;assistance à la saisie. Il ne se substitue pas au jugement professionnel de l&apos;opticien.
              OptiBot ne saurait être tenu responsable d&apos;erreurs de saisie résultant d&apos;une mauvaise qualité de document
              source, d&apos;une configuration incorrecte, ou d&apos;un usage non conforme à la documentation.
            </p>
            <p className="text-slate-600 mt-2">
              La responsabilité d&apos;OptiBot est limitée au montant des abonnements effectivement payés par le Client
              au cours des 12 derniers mois précédant le litige.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">9. Loi applicable et juridiction</h2>
            <p className="text-slate-600">
              Les présentes CGV sont soumises au droit français. En cas de litige, les parties s&apos;engagent à rechercher
              une solution amiable avant toute action judiciaire. À défaut d&apos;accord, le tribunal compétent sera celui
              du siège social d&apos;OptiBot.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">10. Contact</h2>
            <p className="text-slate-600">
              Pour toute question relative à ces CGV&nbsp;:{" "}
              <a href="mailto:contact@optibot.fr" className="text-blue-600 underline">contact@optibot.fr</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
