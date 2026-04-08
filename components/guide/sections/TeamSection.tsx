import React from "react";
import { Users, Lock, BarChart2 } from "lucide-react";
import { SectionAnchor, SectionHeader, Card, SubSection, StepNumber, InfoBox, Divider, CheckItem } from "../GuideComponents";

export default function TeamSection() {
  return (
    <>
      <SectionAnchor id="equipe" />
      <section>
        <SectionHeader label="Équipe" icon={Users} title="Gérer une équipe" color="indigo"
          subtitle="Plans CABINET, RÉSEAU et ÉQUIPE" />

        <Card className="space-y-8">
          <SubSection title="Inviter un collaborateur" icon={Users} iconColor="text-indigo-500">
            <ol className="space-y-4">
              {[
                <>Dashboard → <strong>Équipe</strong> → <strong>Inviter un membre</strong></>,
                <>Entrez l&apos;adresse email du collaborateur</>,
                <>Sélectionnez son rôle : <strong>ADMIN</strong> ou <strong>MEMBER</strong></>,
                <>Il reçoit un email d&apos;invitation avec un lien valable <strong>48 heures</strong></>,
                <>Il crée son compte (ou se connecte si compte existant) → rejoint votre espace</>,
                <>Il partage désormais votre quota de scans et accède aux mêmes dossiers TP</>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} color="indigo" />
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">{text}</p>
                </li>
              ))}
            </ol>
            <InfoBox>
              Le plan RÉSEAU inclut des sièges supplémentaires facturés à l&apos;unité. Chaque siège = 1 collaborateur supplémentaire. Vous pouvez en ajouter/retirer à tout moment depuis la gestion de l&apos;abonnement.
            </InfoBox>
          </SubSection>

          <Divider />

          <SubSection title="Rôles et permissions" icon={Lock} iconColor="text-indigo-500">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 font-black text-slate-700 uppercase tracking-wider">Permission</th>
                    <th className="text-center py-2 px-3 font-black text-slate-700 uppercase tracking-wider">OWNER</th>
                    <th className="text-center py-2 px-3 font-black text-slate-700 uppercase tracking-wider">ADMIN</th>
                    <th className="text-center py-2 px-3 font-black text-slate-700 uppercase tracking-wider">MEMBER</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Scan + OCR", "✓", "✓", "✓"],
                    ["Autofill portails", "✓", "✓", "✓"],
                    ["Gestion dossiers TP", "✓", "✓", "✓"],
                    ["Bilans visuels", "✓", "✓", "✓"],
                    ["RPA (si plan PRO+)", "✓", "✓", "✓"],
                    ["Inviter des membres", "✓", "✓", "✗"],
                    ["Supprimer des membres", "✓", "✓", "✗"],
                    ["Voir l'activité équipe", "✓", "✓", "✗"],
                    ["Gérer l'abonnement", "✓", "✗", "✗"],
                    ["Supprimer l'équipe", "✓", "✗", "✗"],
                  ].map(([perm, owner, admin, member]) => (
                    <tr key={perm} className="border-b border-slate-50">
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{perm}</td>
                      <td className="py-2.5 px-3 text-center font-black text-green-500">{owner}</td>
                      <td className="py-2.5 px-3 text-center font-black">{admin === "✓" ? <span className="text-green-500">✓</span> : <span className="text-slate-700">✗</span>}</td>
                      <td className="py-2.5 px-3 text-center font-black">{member === "✓" ? <span className="text-green-500">✓</span> : <span className="text-slate-700">✗</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Activité et suivi équipe" icon={BarChart2} iconColor="text-indigo-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Dashboard → Équipe → Activité. Vue disponible pour OWNER et ADMIN.
            </p>
            <ul className="space-y-2">
              <CheckItem>Nombre de scans par membre (semaine / mois)</CheckItem>
              <CheckItem>Dossiers TP créés par membre</CheckItem>
              <CheckItem>Bilans visuels créés par membre</CheckItem>
              <CheckItem>Dernière connexion de chaque collaborateur</CheckItem>
              <CheckItem>Parcours RPA lancés par membre (plan PRO+)</CheckItem>
            </ul>
          </SubSection>
        </Card>
      </section>
    </>
  );
}
