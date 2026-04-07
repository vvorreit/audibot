import React from "react";
import { Smartphone, Star, QrCode, Download, Camera, Layers, ScanLine, CheckCircle, Info, Lightbulb, AlertCircle, X } from "lucide-react";
import { SectionAnchor, SectionHeader, Card, SubSection, CheckItem, InfoBox, StepNumber, TipBox, WarnBox, Divider } from "../GuideComponents";

export default function MobileSection() {
  return (
    <>
      <SectionAnchor id="scan-mobile" />
      <section>
        <SectionHeader step="Étape 2" label="Mobile" icon={Smartphone} title="Scanner depuis votre téléphone (PWA)" color="green" />

        <Card className="space-y-8">
          <SubSection title="Pourquoi le scan mobile ?" icon={Star} iconColor="text-green-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              La caméra d&apos;un smartphone moderne (12 Mpx+) surpasse largement un scanner à plat pour les documents plastifiés. Elle capture les micro-détails avec un traitement d&apos;image adaptatif en temps réel.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-black text-green-700 mb-2 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Avantages</p>
                <ul className="space-y-1.5">
                  <CheckItem>Aucune application à installer (PWA native)</CheckItem>
                  <CheckItem>iOS Safari et Android Chrome supportés</CheckItem>
                  <CheckItem>Capture auto quand le document est stable</CheckItem>
                  <CheckItem>Amélioration image automatique (contraste, N&amp;B)</CheckItem>
                  <CheckItem>Téléphone mémorisé après le 1er scan — plus besoin du QR</CheckItem>
                  <CheckItem>Galerie : choisir une photo existante</CheckItem>
                  <CheckItem>Mode batch pour scanner plusieurs patients à la suite</CheckItem>
                </ul>
              </div>
              <div>
                <p className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Prérequis</p>
                <ul className="space-y-1.5">
                  <CheckItem>iOS 15+ ou Android 10+</CheckItem>
                  <CheckItem>Autoriser l&apos;accès à la caméra</CheckItem>
                  <CheckItem>HTTPS requis (audibot.fr seulement)</CheckItem>
                  <CheckItem>Ordinateur et téléphone sur le même réseau ou accès Internet</CheckItem>
                </ul>
              </div>
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Première connexion — QR code" icon={QrCode} iconColor="text-green-500">
            <ol className="space-y-4">
              {[
                <>Sur l&apos;<strong>ordinateur</strong> : ouvrez <strong>audibot.fr/scan</strong> — un QR code apparaît (valable 90 secondes)</>,
                <>Sur le <strong>téléphone</strong> : ouvrez l&apos;appareil photo natif (pas besoin d&apos;app) et scannez le QR</>,
                <>Le navigateur mobile propose d&apos;ouvrir le lien — <strong>acceptez</strong></>,
                <>La page de scan s&apos;affiche sur le téléphone — <strong>l&apos;appareil est automatiquement mémorisé</strong></>,
                <>Prochaine fois : la page de scan s&apos;ouvre directement avec un bouton <strong>« Scanner »</strong>, sans QR</>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} color="green" />
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">{text}</p>
                </li>
              ))}
            </ol>
            <InfoBox>
              Une fois le téléphone mémorisé, vous n&apos;avez plus besoin de scanner le QR code. L&apos;appareil est reconnu automatiquement à chaque visite de la page /scan. Si vous changez de téléphone ou effacez votre navigateur mobile, le jeton est perdu et un nouveau QR sera demandé automatiquement.
            </InfoBox>
          </SubSection>

          <Divider />

          <SubSection title="Installer la PWA — « Ajouter à l'écran d'accueil »" icon={Download} iconColor="text-green-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Après votre premier scan via QR code, installez AudiBot Scan comme une application native sur votre téléphone pour un accès instantané :
            </p>
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-xs font-black text-green-800 mb-1">iOS (Safari)</p>
                <ol className="space-y-1.5 text-xs text-green-700">
                  <li>1. Ouvrez la page /scan dans Safari</li>
                  <li>2. Appuyez sur le bouton <strong>Partager</strong> (carré avec flèche)</li>
                  <li>3. Sélectionnez <strong>« Sur l&apos;écran d&apos;accueil »</strong></li>
                  <li>4. Confirmez — l&apos;icône AudiBot apparaît sur votre écran</li>
                </ol>
              </div>
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-xs font-black text-green-800 mb-1">Android (Chrome)</p>
                <ol className="space-y-1.5 text-xs text-green-700">
                  <li>1. Chrome propose automatiquement l&apos;installation</li>
                  <li>2. Si pas de popup : menu ⋮ → <strong>« Installer l&apos;application »</strong></li>
                  <li>3. Confirmez — l&apos;app apparaît dans votre tiroir d&apos;applications</li>
                </ol>
              </div>
            </div>
            <TipBox icon={<Lightbulb className="w-4 h-4" />}>
              Une fois la PWA installée, ouvrez-la directement depuis l&apos;écran d&apos;accueil. Le téléphone est déjà mémorisé — vous arrivez directement sur l&apos;interface de scan, prêt à photographier.
            </TipBox>
          </SubSection>

          <Divider />

          <SubSection title="Photographier un document — technique" icon={Camera} iconColor="text-green-500">
            <ol className="space-y-4">
              {[
                <>Posez le document sur une <strong>surface mate, sombre de préférence</strong> (contraste maximum)</>,
                <>Éclairage : lumière naturelle ou lampe du plafond — <strong>pas de flash direct, pas de contre-jour</strong></>,
                <>Tenez le téléphone <strong>parallèle au document</strong>, à 20–30 cm de hauteur</>,
                <>Le guide visuel (rectangle orange) s&apos;allume en <strong>vert quand la stabilité est atteinte</strong></>,
                <>La capture se déclenche automatiquement — ou appuyez sur le bouton si vous préférez capturer manuellement</>,
                <>Vérifiez l&apos;<strong>aperçu</strong> : le texte doit être lisible, sans flou ni reflet majeur</>,
                <>Appuyez sur <strong>« Envoyer »</strong> — les données arrivent sur l&apos;ordinateur en 2–4 secondes</>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} color="green" />
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">{text}</p>
                </li>
              ))}
            </ol>
            <WarnBox>
              <strong>Cartes plastifiées :</strong> inclinez légèrement la carte (15–20°) pour éliminer les reflets. L&apos;IA améliore le contraste mais ne peut pas corriger un reflet total sur une zone de texte.
            </WarnBox>
          </SubSection>

          <Divider />

          <SubSection title="Mode batch — scanner plusieurs patients" icon={Layers} iconColor="text-green-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Le mode batch permet de scanner les documents de plusieurs patients à la suite sans revenir à l&apos;ordinateur entre chaque scan :
            </p>
            <ol className="space-y-3">
              {[
                "Sur la page de scan mobile, activez le toggle « Mode batch » en haut",
                "Scannez le premier document — les données sont envoyées automatiquement",
                "L'interface revient immédiatement à la caméra pour le document suivant",
                "Continuez pour chaque patient — chaque scan crée une entrée séparée",
                "Sur l'ordinateur, retrouvez tous les scans dans l'historique chronologique",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} color="green" />
                  <p className="text-sm text-slate-600 pt-1">{text}</p>
                </li>
              ))}
            </ol>
            <TipBox>
              Les diagnostics de chaque scan (qualité image, champs détectés, erreurs éventuelles) sont envoyés automatiquement avec les données — aucun log manuel nécessaire.
            </TipBox>
          </SubSection>

          <Divider />

          <SubSection title="Types de documents reconnus" icon={ScanLine} iconColor="text-green-500">
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { type: "Carte mutuelle plastifiée", fields: "NSS, n° adhérent, organisme, dates validité, code réseau", ok: true },
                { type: "Attestation mutuelle PDF", fields: "Mêmes champs + bénéficiaires multiples", ok: true },
                { type: "Ordonnance médicale", fields: "Sphère OD/OG, cylindre, axe, addition, prescripteur, RPPS, date", ok: true },
                { type: "Carte Vitale", fields: "Détection uniquement (pas d'extraction NFC — données non stockées)", ok: true },
                { type: "Carte d'identité / passeport", fields: "Non supporté — hors périmètre", ok: false },
                { type: "Facture", fields: "Non supporté dans cette version", ok: false },
              ].map((d) => (
                <div key={d.type} className={`p-4 rounded-xl border ${d.ok ? "bg-green-50 border-green-100" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {d.ok ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <p className={`text-xs font-black ${d.ok ? "text-green-800" : "text-slate-700"}`}>{d.type}</p>
                  </div>
                  <p className={`text-xs leading-relaxed ${d.ok ? "text-green-700" : "text-slate-600"}`}>{d.fields}</p>
                </div>
              ))}
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Scan depuis la galerie photos" icon={Camera} iconColor="text-green-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Pas de document physique sous la main ? Utilisez une photo déjà prise :
            </p>
            <ol className="space-y-3">
              {[
                "Sur la page de scan mobile, appuyez sur « Galerie » (icône photo en bas à gauche)",
                "Sélectionnez la photo dans votre pellicule",
                "AudiBot analyse la photo — même traitement OCR que pour une capture live",
                "Les données sont envoyées vers votre ordinateur",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} color="green" />
                  <p className="text-sm text-slate-600 pt-1">{text}</p>
                </li>
              ))}
            </ol>
          </SubSection>
        </Card>
      </section>
    </>
  );
}
