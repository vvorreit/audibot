import React from "react";
import { Settings, CreditCard, Download, X } from "lucide-react";
import { SectionAnchor, SectionHeader, Card, SubSection, CheckItem, Divider, InfoBox, StepNumber, WarnBox } from "../GuideComponents";

export default function AccountSection() {
  return (
    <>
      <SectionAnchor id="compte" />
      <section>
        <SectionHeader label="Compte" icon={Settings} title="Gérer mon compte" color="slate" />

        <Card className="space-y-8">
          <SubSection title="Informations personnelles" icon={Settings} iconColor="text-slate-700">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Dashboard → Mon compte → Profil
            </p>
            <ul className="space-y-2">
              <CheckItem>Modifier votre nom affiché</CheckItem>
              <CheckItem>Changer votre adresse email (confirmation par email requise)</CheckItem>
              <CheckItem>Changer votre mot de passe (saisir l&apos;ancien mot de passe requis)</CheckItem>
              <CheckItem>Nom du magasin — apparaît dans les exports et les emails de relance</CheckItem>
            </ul>
          </SubSection>

          <Divider />

          <SubSection title="Gérer l'abonnement" icon={CreditCard} iconColor="text-slate-700">
            <ul className="space-y-2">
              <CheckItem>Dashboard → Mon compte → Abonnement → <strong>Gérer via Stripe</strong></CheckItem>
              <CheckItem>Changer de plan : upgrade immédiat, downgrade en fin de période</CheckItem>
              <CheckItem>Télécharger les factures : espace Stripe accessible depuis votre compte</CheckItem>
              <CheckItem>Annuler : bouton &quot;Résilier&quot; — accès maintenu jusqu&apos;à fin de période payée</CheckItem>
            </ul>
            <InfoBox>
              En cas de résiliation, vos données (dossiers TP, historique) sont conservées 30 jours. Après 30 jours sans abonnement, les données sont supprimées définitivement. Vous pouvez exporter avant de résilier.
            </InfoBox>
          </SubSection>

          <Divider />

          <SubSection title="Export de vos données (RGPD)" icon={Download} iconColor="text-slate-700">
            <ol className="space-y-3">
              {[
                "Dashboard → Mon compte → Confidentialité → Export de mes données",
                "Cliquez sur « Générer l'export »",
                "Téléchargez le fichier JSON (données) + CSV (dossiers TP)",
                "L'export est disponible pendant 24h",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} color="slate" />
                  <p className="text-sm text-slate-600 pt-1">{text}</p>
                </li>
              ))}
            </ol>
          </SubSection>

          <Divider />

          <SubSection title="Supprimer mon compte" icon={X} iconColor="text-red-400">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Dashboard → Mon compte → Confidentialité → Supprimer mon compte. Action <strong>irréversible</strong>.
            </p>
            <ul className="space-y-2">
              <CheckItem>Toutes vos données sont supprimées immédiatement</CheckItem>
              <CheckItem>Votre abonnement est résilié (sans remboursement prorata)</CheckItem>
              <CheckItem>Les membres de votre équipe perdent l&apos;accès</CheckItem>
            </ul>
            <WarnBox>
              Exportez vos données <strong>avant</strong> de supprimer le compte. La suppression est définitive — aucune récupération possible.
            </WarnBox>
          </SubSection>
        </Card>
      </section>
    </>
  );
}
