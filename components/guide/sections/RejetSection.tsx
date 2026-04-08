import React from "react";
import { AlertCircle } from "lucide-react";
import { SectionAnchor, SectionHeader, Card, RejetRow, TipBox } from "../GuideComponents";

export default function RejetSection() {
  return (
    <>
      <SectionAnchor id="rejets" />
      <section>
        <SectionHeader label="Rejets" icon={AlertCircle} title="Catalogue des codes rejet — décodage et correction" color="rose" />

        <Card>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Un rejet = une erreur dans la télétransmission détectée par la mutuelle. AudiBot décode automatiquement les codes et vous indique quoi corriger. Voici les plus fréquents :
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left py-3 px-4 text-[10px] font-black text-slate-600 uppercase tracking-wider">Code</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-slate-600 uppercase tracking-wider">Libellé</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-slate-600 uppercase tracking-wider">Cause probable</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-slate-600 uppercase tracking-wider">Action corrective</th>
                </tr>
              </thead>
              <tbody>
                <RejetRow code="B02" label="Assuré non retrouvé" cause="NSS incorrect ou mal saisi (inversion chiffres)" fix="Vérifier le NIR sur la carte Vitale, rescanner la carte mutuelle" />
                <RejetRow code="B16" label="Droits non ouverts" cause="Patient sans droits actifs à la date du soin" fix="Vérifier la date de validité des droits mutuelle. Si correct, demander attestation à jour au patient" />
                <RejetRow code="C01" label="Numéro de prescripteur invalide" cause="RPPS mal lu sur l'ordonnance ou médecin radié" fix="Vérifier le RPPS sur Annuaire Santé (annuaire.sante.fr) — rescanner l'ordonnance" />
                <RejetRow code="C07" label="Ordonnance expirée" cause="Date de prescription > 5 ans (verres) ou > 1 an (lentilles)" fix="Demander une nouvelle ordonnance au patient" />
                <RejetRow code="D15" label="Montant hors plafond" cause="Montant facturé supérieur au plafond LPP ou contrat" fix="Vérifier le barème de la mutuelle — ajuster le montant ou soumettre accord préalable" />
                <RejetRow code="E03" label="Code acte inconnu" cause="Code LPPR/LPP incorrect pour l'équipement" fix="Vérifier la codification : monture, verre unifocal, progressif, lentille — code différent" />
                <RejetRow code="E12" label="Association d'actes incompatible" cause="Combinaison de codes actes non autorisée (ex: deux corrections différentes)" fix="Séparer en deux dossiers ou corriger la codification" />
                <RejetRow code="F01" label="Numéro de dossier dupliqué" cause="Un dossier identique a déjà été transmis" fix="Vérifier l'historique — le dossier est peut-être déjà accepté" />
                <RejetRow code="G08" label="Accord préalable manquant" cause="Soin nécessitant un accord préalable (forte correction, ALD)" fix="Faire signer l'accord préalable par le médecin et le joindre au dossier" />
                <RejetRow code="H02" label="Rang bénéficiaire erroné" cause="Rang non correspondant au bénéficiaire (enfant vs adulte)" fix="Rescanner la carte mutuelle — vérifier le rang (01=assuré, 02=conjoint, 03+=enfant)" />
              </tbody>
            </table>
          </div>
          <TipBox>
            AudiBot affiche le code décodé avec l&apos;action corrective directement dans le tableau de bord TP → colonne &quot;Rejet&quot;. Cliquez sur le code pour voir le détail complet.
          </TipBox>
        </Card>
      </section>
    </>
  );
}
