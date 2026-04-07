import React from "react";
import { ShieldCheck, Lock, FileText, X, CheckCircle } from "lucide-react";
import { SectionAnchor, SectionHeader, Card, SubSection, Divider } from "../GuideComponents";

export default function SecuritySection() {
  return (
    <>
      <SectionAnchor id="securite" />
      <section>
        <SectionHeader label="Sécurité" icon={ShieldCheck} title="Sécurité des données & conformité RGPD" color="green" />

        <Card className="space-y-8">
          <SubSection title="Principe fondamental — zéro donnée patient" icon={ShieldCheck} iconColor="text-green-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Les données de santé patient (NSS, corrections optiques, données d&apos;ordonnance) sont des <strong>données sensibles au sens du RGPD Art.9</strong>. AudiBot est conçu pour ne jamais les stocker ni les faire transiter par ses serveurs.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-black text-red-600 mb-2 flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> Jamais stocké sur nos serveurs</p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2.5 text-sm text-slate-600"><X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> NSS / NIR du patient</li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600"><X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> Corrections optiques (sphère, cylindre, axe)</li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600"><X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> Nom, prénom, date de naissance patient</li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600"><X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> Données d&apos;ordonnance brutes</li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600"><X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> Photos ou scans de documents</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-black text-green-600 mb-2 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Ce qui est stocké (anonymisé)</p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2.5 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> Références internes (ex: TP-2026-0001)</li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> Statuts de dossiers (accepté, rejeté)</li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> Montants globaux sans lien nominal</li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> Métadonnées techniques (timestamps, mutuelle générique)</li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> Compteurs d&apos;usage anonymisés</li>
                </ul>
              </div>
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Architecture de sécurité" icon={Lock} iconColor="text-green-500">
            <div className="space-y-4">
              {[
                {
                  title: "Chiffrement AES-256 end-to-end (scan mobile)",
                  desc: "Une clé AES-256 est générée localement dans votre navigateur pour chaque session de scan. Cette clé est transmise uniquement dans le fragment URL (#) — jamais envoyée au serveur. Les données OCR sont chiffrées avec cette clé avant transmission, déchiffrées uniquement dans votre navigateur ordinateur.",
                },
                {
                  title: "Sessions éphémères (90 secondes)",
                  desc: "Chaque QR code génère une session de scan expirée après 90 secondes. Même si l'URL est interceptée après expiration, elle ne donne accès à rien. Les sessions persistantes (téléphone mémorisé) ont une durée de 10 minutes.",
                },
                {
                  title: "Transport HTTPS uniquement",
                  desc: "Toutes les communications entre l'extension, le téléphone et audibot.fr sont chiffrées TLS 1.3. Les connexions HTTP sont automatiquement redirigées vers HTTPS. Certificat SSL renouvelé automatiquement.",
                },
                {
                  title: "Credentials RPA chiffrés",
                  desc: "Vos identifiants de portails mutuelles (pour le RPA) sont chiffrés AES-256 avant stockage en base. La clé de déchiffrement n'est jamais exposée côté client. Seul le processus serveur autorisé peut les déchiffrer au moment de l'exécution.",
                },
                {
                  title: "Double authentification (2FA)",
                  desc: "Activez le 2FA TOTP depuis Dashboard → Mon compte → Sécurité. Compatible Google Authenticator, Authy, 1Password. Le code de backup est affiché une seule fois à l'activation — conservez-le.",
                },
                {
                  title: "Bilans visuels — données chiffrées",
                  desc: "Les réponses aux bilans visuels sont chiffrées côté client avant envoi. Les documents PDF générés sont stockés sous forme de blobs chiffrés AES-256. Seul le magasin propriétaire peut déchiffrer et consulter les résultats.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-5 bg-green-50 border border-green-100 rounded-2xl">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-green-900 mb-1">{item.title}</p>
                    <p className="text-xs text-green-700 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Conformité légale" icon={FileText} iconColor="text-green-500">
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { label: "RGPD Art.9", desc: "Architecture zero-data : aucune donnée de santé patient stockée. Pas d'obligation HDS (Hébergement Données de Santé)." },
                { label: "CNIL", desc: "Registre des traitements (Art.30) tenu à jour. DPO interne. Durées de conservation définies et appliquées automatiquement." },
                { label: "ePrivacy", desc: "Bandeau de consentement cookies conforme. Analytics anonymisé. Aucun cookie de tracking tiers." },
              ].map((c) => (
                <div key={c.label} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs font-black text-slate-800 mb-1">{c.label}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </SubSection>
        </Card>
      </section>
    </>
  );
}
