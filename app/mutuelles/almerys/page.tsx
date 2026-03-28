import type { Metadata } from "next";
import PortailDetailPage from "@/components/PortailDetailPage";
import type { PortailDetailData } from "@/components/PortailDetailPage";

export const metadata: Metadata = {
  title: "OptiBot × Almerys — Automatiser la saisie tiers payant optique sur Almerys",
  description:
    "Remplissez automatiquement vos demandes de tiers payant sur le portail Almerys avec OptiBot. NSS, nom, prénom, date ordonnance, RPPS — en un clic.",
  alternates: { canonical: "https://optibot.fr/mutuelles/almerys" },
};

const data: PortailDetailData = {
  name: "Almerys",
  type: "mutuelle",
  domain: "mutuelle-almerys.com",
  networkDescription:
    "Almerys est le réseau #1 en France avec 17 millions de bénéficiaires. OptiBot automatise la saisie sur le portail Almerys pour les opticiens.",
  portailUrl: "mutuelle-almerys.com",
  status: "Partiel",
  filledFields: [
    "NSS ouvrant droit",
    "Nom",
    "Prénom",
    "Date ordonnance",
    "Date demande",
    "RPPS",
  ],
  manualFields: ["Codes LPP", "Montants verres / monture"],
  blogSlug: "/blog/almerys-optique-guide-opticien",
  blogLabel: "Guide complet : Almerys pour les opticiens",
};

export default function AlmerysPage() {
  return <PortailDetailPage data={data} />;
}
