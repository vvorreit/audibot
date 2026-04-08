"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

const TAB_HEADERS: Record<string, { title: string; subtitle: string }> = {
  "/admin/analytics": { title: "Analytiques",       subtitle: "Vue globale de l'activité AudiBot" },
  "/admin/users":     { title: "Utilisateurs",       subtitle: "Gestion des comptes opticiens" },
  "/admin/teams":     { title: "Équipes",            subtitle: "Gestion des comptes multi-utilisateurs" },
  "/admin/extension": { title: "Extension",          subtitle: "Santé, sélecteurs et usage de l'extension" },
  "/admin/ocr":       { title: "OCR & Qualité",      subtitle: "Performance de la reconnaissance de documents" },
  "/admin/rpa":       { title: "RPA Monitor",        subtitle: "Suivi des automatisations RPA en temps réel" },
  "/admin/franchise": { title: "Franchise",          subtitle: "Leads et partenariats réseau" },
  "/admin/inbox":     { title: "Inbox",              subtitle: "Messages reçus sur contact@audibot.fr" },
  "/admin/audit":            { title: "Logs d'audit",         subtitle: "Traçabilité des actions administrateurs" },
  "/admin/campagnes":        { title: "Campagnes email",      subtitle: "Envoi et suivi des campagnes" },
  "/admin/churn":            { title: "Churn & Retention",    subtitle: "Analyse des résiliations" },
  "/admin/emails":           { title: "Templates",            subtitle: "Templates et emails transactionnels" },
  "/admin/parcours":         { title: "Parcours RPA",         subtitle: "Configuration des parcours dynamiques" },
  "/admin/selectors":        { title: "Sélecteurs portails",  subtitle: "Configuration CSS à chaud" },
  "/admin/unsubscribes":     { title: "Désinscriptions",      subtitle: "Emails désinscrits des campagnes" },
  "/admin/emails-hub":      { title: "Centre Emails",      subtitle: "Templates, campagnes, inbox et désinscrits" },
  "/admin/users-hub":       { title: "Utilisateurs",        subtitle: "Comptes, équipes et rétention" },
  "/admin/compliance-hub":  { title: "Conformité & RGPD",   subtitle: "Logs d'audit et monitoring RGPD" },
};

function AdminTabHeaderInner() {
  const pathname = usePathname();

  // Exact match first, then prefix match for dynamic routes like /admin/users/[id]
  const header = TAB_HEADERS[pathname]
    ?? Object.entries(TAB_HEADERS).find(([key]) => key !== pathname && pathname.startsWith(key + "/"))?.[1]
    ?? null;

  if (!header) return null;

  return (
    <div className="pb-4 border-b border-slate-100 mb-6">
      <h1 className="text-3xl font-black tracking-tight text-slate-900">{header.title}</h1>
      <p className="text-slate-400 text-xs font-medium mt-0.5">{header.subtitle}</p>
    </div>
  );
}

export default function AdminTabHeader() {
  return (
    <Suspense fallback={<div className="pb-4 mb-6" />}>
      <AdminTabHeaderInner />
    </Suspense>
  );
}
