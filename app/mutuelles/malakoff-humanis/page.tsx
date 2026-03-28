import type { Metadata } from "next";
import PortailDetailPage from "@/components/PortailDetailPage";
import type { PortailDetailData } from "@/components/PortailDetailPage";

export const metadata: Metadata = {
  title: "OptiBot × Malakoff Humanis — Tiers payant optique automatisé",
  description:
    "Remplissez automatiquement vos demandes tiers payant Malakoff Humanis avec OptiBot. Smart Fill universel disponible pour les opticiens.",
  alternates: { canonical: "https://optibot.fr/mutuelles/malakoff-humanis" },
};

const data: PortailDetailData = {
  name: "Malakoff Humanis",
  type: "mutuelle",
  domain: "malakoffhumanis.com",
  networkDescription:
    "Malakoff Humanis est un acteur majeur de la retraite complémentaire et de la santé en entreprise. OptiBot simplifie la saisie tiers payant pour les opticiens.",
  portailUrl: "malakoffhumanis.com",
  status: "Smart Fill disponible",
  filledFields: ["NSS", "Nom", "Prénom"],
  manualFields: ["Mapping dédié bientôt disponible"],
  blogSlug: "/blog/tiers-payant-opticien-erreurs",
  blogLabel: "Les erreurs fréquentes en tiers payant optique",
};

export default function MalakoffHumanisPage() {
  return <PortailDetailPage data={data} />;
}
