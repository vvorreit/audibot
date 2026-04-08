import type { Metadata } from "next";
import PortailDetailPage from "@/components/PortailDetailPage";
import type { PortailDetailData } from "@/components/PortailDetailPage";

export const metadata: Metadata = {
  title: "AudiBot × AG2R La Mondiale — Tiers payant optique automatisé",
  description:
    "Remplissez automatiquement vos demandes tiers payant AG2R La Mondiale avec AudiBot. Smart Fill universel disponible pour les opticiens.",
  alternates: { canonical: "https://audibot.fr/mutuelles/ag2r-la-mondiale" },
};

const data: PortailDetailData = {
  name: "AG2R La Mondiale",
  type: "mutuelle",
  domain: "ag2rlamondiale.fr",
  networkDescription:
    "AG2R La Mondiale est un groupe majeur d\u2019assurance et de protection sociale pour les entreprises et les TNS. AudiBot simplifie la saisie tiers payant pour les opticiens.",
  portailUrl: "ag2rlamondiale.fr / portail pro",
  status: "Smart Fill disponible",
  filledFields: ["NSS", "Nom", "Prénom"],
  manualFields: ["Mapping dédié bientôt disponible"],
  blogSlug: "/blog/delais-remboursement-tiers-payant-optique",
  blogLabel: "Délais de remboursement en tiers payant optique",
};

export default function AG2RPage() {
  return <PortailDetailPage data={data} />;
}
