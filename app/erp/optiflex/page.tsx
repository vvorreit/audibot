import type { Metadata } from "next";
import PortailDetailPage from "@/components/PortailDetailPage";
import type { PortailDetailData } from "@/components/PortailDetailPage";

export const metadata: Metadata = {
  title: "OptiBot × Optiflex — Remplissage automatique ERP opticiens indépendants",
  description:
    "Automatisez la saisie dans Optiflex avec OptiBot. Smart Fill universel disponible pour l\u2019ERP des opticiens indépendants.",
  alternates: { canonical: "https://optibot.fr/erp/optiflex" },
};

const data: PortailDetailData = {
  name: "Optiflex",
  type: "erp",
  domain: "optiflex.fr",
  networkDescription:
    "Optiflex est un ERP conçu pour les opticiens indépendants. OptiBot propose le Smart Fill universel pour automatiser vos saisies client.",
  portailUrl: "optiflex.fr",
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

export default function OptiflexPage() {
  return <PortailDetailPage data={data} />;
}
