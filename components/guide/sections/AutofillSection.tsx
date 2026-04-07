import React from "react";
import { MousePointerClick, Play, Users, Layers, Wand2, ScanLine } from "lucide-react";
import { SectionAnchor, SectionHeader, Card, SubSection, StepNumber, TipBox, Divider, InfoBox, CheckItem } from "../GuideComponents";

export default function AutofillSection() {
  return (
    <>
      <SectionAnchor id="autofill" />
      <section>
        <SectionHeader step="Étape 5" label="Autofill" icon={MousePointerClick} title="Remplissage automatique des portails" color="purple" />

        <Card className="space-y-8">
          <SubSection title="Workflow standard — de zéro au formulaire rempli" icon={Play} iconColor="text-purple-500">
            <ol className="space-y-4">
              {[
                <>Scannez la <strong>carte mutuelle</strong> du patient (scan mobile ou upload)</>,
                <>AudiBot extrait les données — elles apparaissent dans le popup de l&apos;extension</>,
                <>Ouvrez le <strong>portail mutuelle</strong> du patient dans un onglet Chrome</>,
                <>AudiBot détecte automatiquement le portail et affiche <strong>« Portail reconnu : Almerys »</strong></>,
                <>Naviguez jusqu&apos;au <strong>formulaire de prise en charge</strong></>,
                <>Cliquez sur le bouton flottant <strong>Remplir</strong> (ou dans le popup)</>,
                <>Le bot injecte toutes les données — <strong>vérifiez visuellement puis validez</strong></>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} />
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">{text}</p>
                </li>
              ))}
            </ol>
            <TipBox>
              <strong>Raccourci clavier :</strong> Sur le portail ouvert, appuyez sur <span className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs">Alt+F</span> pour déclencher le remplissage sans ouvrir le popup.
            </TipBox>
          </SubSection>

          <Divider />

          <SubSection title="Cas particulier — mineur (ouvrant droit)" icon={Users} iconColor="text-purple-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Pour un patient mineur, le portail mutuelle exige souvent le NSS de l&apos;<strong>ouvrant droit</strong> (le parent assuré), pas du mineur. AudiBot gère ce cas automatiquement :
            </p>
            <ol className="space-y-3">
              {[
                "Scannez la carte mutuelle du mineur — AudiBot détecte le rang bénéficiaire (ex: 03 = enfant)",
                "AudiBot affiche « Ouvrant droit requis » et vous invite à entrer le NSS du parent",
                "Saisissez le NSS de l'ouvrant droit — validation par clé de Luhn automatique",
                "Le remplissage utilise le NSS parent + rang bénéficiaire enfant — comme attendu par le portail",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} />
                  <p className="text-sm text-slate-600 pt-1">{text}</p>
                </li>
              ))}
            </ol>
          </SubSection>

          <Divider />

          <SubSection title="Portails intégrés nativement" icon={Layers} iconColor="text-purple-500">
            <p className="text-sm text-slate-700 text-xs mb-4">Intégration complète multi-étapes avec gestion automatique de la navigation entre les pages.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { name: "Almerys", note: "Portail principal + iFrame" },
                { name: "Wemind", note: "Anciennement Malakoff" },
                { name: "Oxantis", note: "AG2R La Mondiale" },
                { name: "LBO", note: "Flux télétransmission" },
                { name: "Viamedis", note: "Direct + portail revendeur" },
                { name: "Harmonie Mutuelle", note: "Portail opticien" },
                { name: "Klesia", note: "CCN optique" },
                { name: "Santéclair", note: "Réseau de soins" },
                { name: "Carta", note: "Carta santé" },
                { name: "iSanté", note: "Portail groupé" },
                { name: "Itelis", note: "Réseau Crédit Agricole" },
                { name: "Eovi-MCD", note: "Mutuelle Rhône-Alpes" },
                { name: "+ 35 portails", note: "Via Smart Fill universel" },
              ].map((p) => (
                <div key={p.name} className="flex flex-col px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-black text-slate-800">{p.name}</span>
                  <span className="text-[10px] text-slate-600 mt-0.5">{p.note}</span>
                </div>
              ))}
            </div>
            <TipBox>
              Votre portail n&apos;est pas listé ? Utilisez <strong>Smart Fill</strong> ou contactez le support — nous ajoutons les portails demandés en priorité.
            </TipBox>
          </SubSection>

          <Divider />

          <SubSection title="Smart Fill — remplissage universel" icon={Wand2} iconColor="text-purple-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Smart Fill est un moteur d&apos;inférence qui analyse n&apos;importe quel formulaire et mappe intelligemment les champs. Il fonctionne sur <strong>tous les portails</strong> — connus ou non.
            </p>
            <div className="grid md:grid-cols-2 gap-3 mb-5">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-black text-blue-800 mb-1">Portail connu (Almerys, Wemind...)</p>
                <p className="text-xs text-blue-700 leading-relaxed">Bouton <strong>bleu</strong> — injection codée en priorité. Si elle échoue (portail modifié, iframe...), Smart Fill prend le relais automatiquement.</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <p className="text-xs font-black text-purple-800 mb-1">Portail inconnu</p>
                <p className="text-xs text-purple-700 leading-relaxed">Bouton <strong>violet</strong> — Smart Fill s&apos;active directement sans configuration préalable.</p>
              </div>
            </div>
            <ol className="space-y-3">
              {[
                "Ouvrez le portail dans Chrome (connu ou non) et naviguez jusqu'au formulaire",
                "Cliquez sur le bouton flottant Remplir (bleu ou violet selon le portail)",
                "Smart Fill analyse les champs et injecte les données automatiquement",
                "Si un champ est mal mappé, corrigez-le manuellement — AudiBot apprend et s'améliore",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} />
                  <p className="text-sm text-slate-600 pt-1">{text}</p>
                </li>
              ))}
            </ol>
            <InfoBox>
              Smart Fill fonctionne sur les formulaires HTML standards, les iFrames, les composants React/Vue/Angular et même certains Shadow DOM. Il ne fonctionne pas sur les applications Flash ou les PDF intégrés.
            </InfoBox>
          </SubSection>

          <Divider />

          <SubSection title="Ordonnance → injection équipement optique" icon={ScanLine} iconColor="text-purple-500">
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Après scan d&apos;une ordonnance, AudiBot peut injecter la correction dans les champs d&apos;équipement des portails :
            </p>
            <ul className="space-y-2">
              <CheckItem>Sphère, cylindre, axe OD/OG injectés dans les champs correspondants</CheckItem>
              <CheckItem>Addition automatiquement saisie si progressive/VAPM détecté</CheckItem>
              <CheckItem>Numéro RPPS du prescripteur validé (format 11 chiffres) avant injection</CheckItem>
              <CheckItem>Date de prescription vérifiée (ordonnance non expirée — alerte si +5 ans)</CheckItem>
              <CheckItem>Type de correction inféré : simple foyer, progressif, dégressif, prismatique</CheckItem>
            </ul>
          </SubSection>
        </Card>
      </section>
    </>
  );
}
