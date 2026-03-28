import type { Metadata } from "next";
import PortailDetailPage from "@/components/PortailDetailPage";
import type { PortailDetailData } from "@/components/PortailDetailPage";

export const metadata: Metadata = {
  title: "OptiBot × Winoptics — Remplissage automatique ERP leader opticien",
  description:
    "Automatisez la saisie dans Winoptics avec OptiBot. Smart Fill universel disponible pour le logiciel ERP leader des opticiens en France.",
  alternates: { canonical: "https://optibot.fr/erp/winoptics" },
};

const data: PortailDetailData = {
  name: "Winoptics",
  type: "erp",
  domain: "winoptics.fr",
  networkDescription:
    "Winoptics est le logiciel ERP leader pour les opticiens en France. OptiBot propose le Smart Fill universel pour automatiser vos saisies.",
  portailUrl: "winoptics.fr",
  status: "Smart Fill disponible",
  filledFields: [
    "Nom et prénom patient",
    "Numéro de Sécurité Sociale",
    "Date de naissance",
    "Correction OD/OG (sphère, cylindre, axe, addition)",
    "Coordonnées (téléphone, email, adresse)",
    "Synchronisation TP depuis l'ERP",
  ],
  manualFields: [
    "Codes LPP spécifiques",
    "Montants équipements",
  ],
  blogSlug: "/blog/tiers-payant-opticien-erreurs",
  blogLabel: "Les erreurs fréquentes en tiers payant optique",
};

export default function WinopticsPage() {
  return <PortailDetailPage data={data} />;
}
