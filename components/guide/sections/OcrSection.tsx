import React from "react";
import { ScanLine, Zap, FileText } from "lucide-react";
import { SectionAnchor, SectionHeader, Card, SubSection, CheckItem, Divider } from "../GuideComponents";

export default function OcrSection() {
  return (
    <>
      <SectionAnchor id="ocr" />
      <section>
        <SectionHeader step="Étape 4" label="OCR" icon={ScanLine} title="Extraction OCR des documents" color="purple" />

        <Card className="space-y-8">
          <SubSection title="Comment fonctionne l'OCR AudiBot" icon={Zap} iconColor="text-purple-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              L&apos;OCR (Optical Character Recognition) extrait le texte d&apos;une image et l&apos;interprète selon des modèles entraînés spécifiquement sur les documents optiques français. Ce n&apos;est pas un simple OCR générique — chaque champ a son propre modèle de validation.
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { step: "1. Prétraitement", desc: "Redressement, augmentation du contraste, conversion N&B adaptative, suppression des reflets" },
                { step: "2. Extraction texte", desc: "Moteur OCR hybride (Tesseract + modèle maison) optimisé pour les polices de cartes mutuelles" },
                { step: "3. Interprétation", desc: "Détection des champs par regex + modèles de validation (NIR checksum, RPPS format, date format)" },
              ].map((s) => (
                <div key={s.step} className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <p className="text-xs font-black text-purple-700 mb-1">{s.step}</p>
                  <p className="text-xs text-purple-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Données extraites — carte mutuelle" icon={FileText} iconColor="text-purple-500">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-xs font-black text-slate-700 uppercase tracking-wider">Champ</th>
                    <th className="text-left py-2 px-3 text-xs font-black text-slate-700 uppercase tracking-wider">Exemple</th>
                    <th className="text-left py-2 px-3 text-xs font-black text-slate-700 uppercase tracking-wider">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { field: "NSS (NIR)", ex: "2 82 05 75 116 042 13", val: "Clé de Luhn + format 15 chiffres" },
                    { field: "Numéro adhérent", ex: "0012345678", val: "Format libre, min 6 caractères" },
                    { field: "Organisme mutuelle", ex: "Harmonie Mutuelle", val: "Matching liste référentielle" },
                    { field: "Date début droits", ex: "01/01/2025", val: "Format date FR + cohérence temporelle" },
                    { field: "Date fin droits", ex: "31/12/2026", val: "Doit être postérieure à la date début" },
                    { field: "Code réseau", ex: "ITELIS", val: "Optionnel, liste fermée" },
                    { field: "Rang bénéficiaire", ex: "01 (Assuré)", val: "01–09" },
                  ].map((r) => (
                    <tr key={r.field} className="border-b border-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-800 text-xs">{r.field}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-700">{r.ex}</td>
                      <td className="py-2.5 px-3 text-xs text-green-700">{r.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Données extraites — ordonnance" icon={FileText} iconColor="text-purple-500">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-xs font-black text-slate-700 uppercase tracking-wider">Champ</th>
                    <th className="text-left py-2 px-3 text-xs font-black text-slate-700 uppercase tracking-wider">Format attendu</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { field: "Sphère OD / OG", fmt: "-12,00 à +12,00 (pas de 0,25)" },
                    { field: "Cylindre OD / OG", fmt: "-6,00 à +6,00" },
                    { field: "Axe OD / OG", fmt: "0° à 180°" },
                    { field: "Addition OD / OG", fmt: "+0,75 à +3,50 (presbytie)" },
                    { field: "Prisme OD / OG", fmt: "0 à 10 Δ (optionnel)" },
                    { field: "Prescripteur — nom", fmt: "Texte libre" },
                    { field: "Prescripteur — RPPS", fmt: "11 chiffres — validation format" },
                    { field: "Date de prescription", fmt: "JJ/MM/AAAA — max 5 ans" },
                    { field: "Motif (ALD, AT, etc.)", fmt: "Détection par mots-clés" },
                  ].map((r) => (
                    <tr key={r.field} className="border-b border-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-800 text-xs">{r.field}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-700">{r.fmt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Upload direct depuis l'ordinateur" icon={Zap} iconColor="text-purple-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Pas de téléphone ? Vous pouvez uploader directement depuis le popup de l&apos;extension ou le dashboard :
            </p>
            <ul className="space-y-2">
              <CheckItem>Formats acceptés : JPG, PNG, WEBP, PDF (première page uniquement)</CheckItem>
              <CheckItem>Taille maximale : 10 Mo par fichier</CheckItem>
              <CheckItem>Glisser-déposer supporté dans le popup et le dashboard</CheckItem>
              <CheckItem>Les PDF multi-pages : seule la première page est analysée (indiquez la page si nécessaire)</CheckItem>
            </ul>
          </SubSection>
        </Card>
      </section>
    </>
  );
}
