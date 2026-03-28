import type { Metadata } from "next";
import PortailDetailPage from "@/components/PortailDetailPage";
import type { PortailDetailData } from "@/components/PortailDetailPage";

export const metadata: Metadata = {
  title: "OptiBot × Harmonie Mutuelle — Saisie tiers payant Oxantis automatisée",
  description:
    "Automatisez la saisie tiers payant Harmonie Mutuelle (portail Oxantis) avec OptiBot. NSS, nom, prénom, DDN remplis automatiquement pour les opticiens.",
  alternates: { canonical: "https://optibot.fr/mutuelles/harmonie-mutuelle" },
};

const data: PortailDetailData = {
  name: "Harmonie Mutuelle",
  type: "mutuelle",
  domain: "harmonie-mutuelle.fr",
  networkDescription:
    "Harmonie Mutuelle compte 4 millions d\u2019adhérents et utilise le portail Oxantis. OptiBot automatise la saisie via le mapping Oxantis dédié.",
  portailUrl: "oxantis.net (réseau Oxantis)",
  status: "Partiel",
  filledFields: ["NSS", "Nom", "Prénom", "Date de naissance"],
  manualFields: ["Codes LPP", "Montants", "Détails équipement"],
  blogSlug: "/blog/relances-tiers-payant-opticien-automatiques",
  blogLabel: "Relances tiers payant automatiques pour opticiens",
};

export default function HarmonieMutuellePage() {
  return <PortailDetailPage data={data} />;
}
