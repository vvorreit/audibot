import React from "react";
import { Bell, Inbox, Filter, Settings } from "lucide-react";
import { SectionAnchor, SectionHeader, Card, SubSection, CheckItem, Divider, Badge, StepNumber } from "../GuideComponents";

export default function AlertSection() {
  return (
    <>
      <SectionAnchor id="alertes" />
      <section>
        <SectionHeader label="Alertes" icon={Bell} title="Alertes et notifications" color="rose" />

        <Card className="space-y-8">
          <SubSection title="Centre de notifications in-app" icon={Inbox} iconColor="text-rose-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              La cloche en haut à droite du dashboard affiche toutes vos notifications non lues. Le badge rouge indique le nombre de notifications en attente.
            </p>
            <ul className="space-y-2">
              <CheckItem>Accès rapide : cliquez sur la cloche → dropdown avec les 10 dernières notifs</CheckItem>
              <CheckItem>Centre complet : Dashboard → Alertes pour l&apos;historique et les paramètres</CheckItem>
              <CheckItem>Marquer comme lu : clic sur la notification, ou « Tout marquer comme lu »</CheckItem>
            </ul>
          </SubSection>

          <Divider />

          <SubSection title="Types d'alertes disponibles" icon={Filter} iconColor="text-rose-500">
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { title: "Droits mutuelle expirant", timing: "30j, 15j, 7j avant expiration", color: "amber", desc: "AudiBot surveille les dates de validité de chaque dossier. Alerte avant que les droits n'expirent pour anticiper la mise à jour." },
                { title: "Rejet détecté", timing: "Immédiat à la synchronisation", color: "rose", desc: "Notification dès qu'un rejet est détecté sur un portail, avec le code erreur décodé et l'action corrective." },
                { title: "Dossier sans réponse", timing: "Configurable (défaut J+15)", color: "blue", desc: "Alerte si un dossier télétransmis reste sans réponse après le délai configuré par mutuelle." },
                { title: "Limite de scans approchée", timing: "À 80% et 95% du quota", color: "purple", desc: "Avertissement avant d'atteindre votre quota mensuel de scans. Lien vers la page d'upgrade." },
                { title: "Parcours RPA bloqué", timing: "Immédiat", color: "rose", desc: "Alerte si un parcours RPA échoue (portail modifié, session expirée, CAPTCHA, erreur réseau)." },
                { title: "Nouveau membre équipe", timing: "Immédiat", color: "green", desc: "Notification quand un collaborateur rejoint ou quitte votre espace équipe." },
                { title: "Rapport hebdomadaire", timing: "Lundi matin 8h", color: "slate", desc: "Récap de la semaine : dossiers traités, taux de succès, rejets, relances, gain de temps estimé." },
                { title: "Mise à jour extension", timing: "À chaque nouvelle version majeure", color: "blue", desc: "Notification dans le popup Chrome lors d'une mise à jour majeure avec liste des nouveautés." },
              ].map((alert) => (
                <div key={alert.title} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <Bell className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-black text-slate-800">{alert.title}</p>
                      <Badge color={alert.color as any}>{alert.timing}</Badge>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Configurer les alertes" icon={Settings} iconColor="text-rose-500">
            <ol className="space-y-3">
              {[
                "Dashboard → Alertes → Paramètres",
                "Activez/désactivez chaque type d'alerte selon vos préférences",
                "Pour les alertes de droits expirant : configurez le délai (30j / 15j / 7j)",
                "Pour les dossiers sans réponse : configurez le délai par mutuelle",
                "Choisissez le canal : in-app uniquement, ou in-app + email",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepNumber n={i + 1} color="rose" />
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
