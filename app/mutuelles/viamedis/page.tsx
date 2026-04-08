import type { Metadata } from "next";
import PortailDetailPage from "@/components/PortailDetailPage";
import type { PortailDetailData } from "@/components/PortailDetailPage";

export const metadata: Metadata = {
  title: "AudiBot × Viamedis — Remplissage automatique tiers payant Viamedis pour opticiens",
  description:
    "Automatisez vos saisies tiers payant sur Viamedis avec AudiBot. Smart Fill universel pour 15 millions de bénéficiaires — Harmonie Mutuelle, MGEN et plus.",
  alternates: { canonical: "https://audibot.fr/mutuelles/viamedis" },
};

const data: PortailDetailData = {
  name: "Viamedis",
  type: "mutuelle",
  domain: "viamedis.net",
  networkDescription:
    "Viamedis est le réseau #2 en France avec 15 millions de bénéficiaires. Il regroupe Harmonie Mutuelle, MGEN et de nombreuses complémentaires santé.",
  portailUrl: "viamedis.fr",
  status: "Smart Fill disponible",
  filledFields: ["NSS", "Nom", "Prénom"],
  manualFields: ["Mapping dédié en cours de développement"],
  blogSlug: "/blog/viamedis-opticien-guide-tiers-payant",
  blogLabel: "Guide : Viamedis pour les opticiens",
};

export default function ViamedisPage() {
  return <PortailDetailPage data={data} />;
}
