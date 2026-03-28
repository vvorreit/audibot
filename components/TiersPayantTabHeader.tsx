"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

const TAB_HEADERS: Record<string, { title: string; subtitle: string }> = {
  "/tiers-payant/dashboard": { title: "Tableau de bord",    subtitle: "Vue synthétique des impayés et remboursements" },
  "/tiers-payant":           { title: "Dossiers",           subtitle: "Suivi des remboursements mutuelles" },
  "/tiers-payant/relances":  { title: "Relances",           subtitle: "Configuration et suivi des relances automatiques" },
  "/tiers-payant/litiges":   { title: "Litiges",            subtitle: "Gestion des dossiers en litige" },
  "/tiers-payant/templates": { title: "Courriers",          subtitle: "Templates de courriers et relances" },
  "/tiers-payant/alertes":   { title: "Alertes expiration", subtitle: "Ordonnances approchant les 2 ans" },
  "/tiers-payant/emails":    { title: "Emails mutuelles",   subtitle: "Adresses email de relance par mutuelle" },
  "/tiers-payant/rejets":    { title: "Rejets auto-détectés", subtitle: "Rejets importés depuis l'extension Chrome" },
  "/tiers-payant/patients":  { title: "Contacts patients",  subtitle: "Annuaire des contacts pour les relances" },
};

function TiersPayantTabHeaderInner() {
  const pathname = usePathname();
  const header = TAB_HEADERS[pathname] ?? null;
  if (!header) return null;

  return (
    <div className="pb-4 border-b border-slate-100 mb-6">
      <h1 className="text-xl font-black tracking-tight text-slate-900">{header.title}</h1>
      <p className="text-slate-400 text-xs font-medium mt-0.5">{header.subtitle}</p>
    </div>
  );
}

export default function TiersPayantTabHeader() {
  return (
    <Suspense fallback={<div className="pb-4 mb-6" />}>
      <TiersPayantTabHeaderInner />
    </Suspense>
  );
}
