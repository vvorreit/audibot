import React from "react";
import { FileText, Layers, RefreshCw, Mail, Download } from "lucide-react";
import { SectionAnchor, SectionHeader, Card, SubSection, Badge, Divider, StepNumber, CheckItem } from "../GuideComponents";

export default function TiersPayantSection() {
  return (
    <>
      <SectionAnchor id="tiers-payant" />
      <section>
        <SectionHeader step="Étape 6" label="TP" icon={FileText} title="Gestion du tiers payant" color="amber" />

        <Card className="space-y-8">
          <SubSection title="Accéder à l'espace tiers payant" icon={Layers} iconColor="text-amber-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Dashboard → menu latéral → <strong>Tiers Payant</strong>. Disponible à partir du plan <Badge color="green">PRO</Badge>.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { screen: "Tableau de bord TP", desc: "Vue synthétique : montants en attente, dossiers rejetés, relances programmées, taux de succès" },
                { screen: "Mes dossiers", desc: "Liste complète des dossiers avec filtres par statut, mutuelle, période, montant" },
                { screen: "Rejets", desc: "Dossiers rejetés avec code erreur décodé et action de correction suggérée" },
                { screen: "Relances", desc: "File de relances à envoyer + historique des relances passées" },
                { screen: "Templates", desc: "Modèles d'emails de relance personnalisables par mutuelle et délai" },
                { screen: "Export", desc: "Génération CSV et PDF pour votre comptabilité ou votre OCAM" },
              ].map((s) => (
                <div key={s.screen} className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs font-black text-amber-800 mb-0.5">{s.screen}</p>
                  <p className="text-xs text-amber-700 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Cycle de vie d'un dossier TP" icon={RefreshCw} iconColor="text-amber-500">
            <div className="flex flex-col gap-2">
              {[
                { status: "CRÉÉ", color: "bg-slate-100 text-slate-600", desc: "Dossier créé manuellement ou via injection" },
                { status: "EN ATTENTE", color: "bg-blue-100 text-blue-700", desc: "Télétransmis — en attente de réponse de la mutuelle (J+5 à J+21)" },
                { status: "ACCEPTÉ", color: "bg-green-100 text-green-700", desc: "Prise en charge accordée — paiement en cours" },
                { status: "REJETÉ", color: "bg-red-100 text-red-700", desc: "Erreur détectée — action corrective requise" },
                { status: "RELANCÉ", color: "bg-purple-100 text-purple-700", desc: "Relance envoyée suite à absence de réponse" },
                { status: "LITIGE", color: "bg-amber-100 text-amber-700", desc: "Contestation en cours — dossier transmis au service litige" },
                { status: "CLÔTURÉ", color: "bg-slate-100 text-slate-700", desc: "Paiement reçu ou abandon du dossier" },
              ].map((s) => (
                <div key={s.status} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${s.color} shrink-0`}>{s.status}</span>
                  <p className="text-xs text-slate-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Relances automatiques — configuration" icon={Mail} iconColor="text-amber-500">
            <ol className="space-y-4">
              {[
                <>Dashboard TP → <strong>Templates</strong> → <strong>Nouveau template</strong></>,
                <>Nommez le template et sélectionnez la <strong>mutuelle cible</strong> (ou &quot;Toutes&quot;)</>,
                <>Définissez le <strong>délai de déclenchement</strong> : ex. J+15 après télétransmission sans réponse</>,
                <>Rédigez le corps de l&apos;email avec les <strong>variables dynamiques</strong> disponibles</>,
                <>Activez le template — les relances partent <strong>automatiquement chaque nuit à 2h</strong></>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} color="amber" />
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">{text}</p>
                </li>
              ))}
            </ol>
          </SubSection>

          <Divider />

          <SubSection title="Export comptabilité" icon={Download} iconColor="text-amber-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Dashboard TP → <strong>Export</strong> → choisissez la période et le format.
            </p>
            <ul className="space-y-2">
              <CheckItem>CSV : compatibles avec Excel, Sage, EBP, Cegid</CheckItem>
              <CheckItem>PDF : récapitulatif mensuel mise en page propre, avec logo</CheckItem>
              <CheckItem>Colonnes : référence, mutuelle, montant AMO, montant AMC, statut, date, commentaire</CheckItem>
              <CheckItem>Filtres avant export : période, mutuelle, statut, montant minimum</CheckItem>
            </ul>
          </SubSection>
        </Card>
      </section>
    </>
  );
}
