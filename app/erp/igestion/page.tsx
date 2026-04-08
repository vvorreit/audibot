import type { Metadata } from "next";
import PortailDetailPage from "@/components/PortailDetailPage";
import type { PortailDetailData } from "@/components/PortailDetailPage";

export const metadata: Metadata = {
  title: "AudiBot × iGestion — Remplissage automatique ERP opticien",
  description:
    "Automatisez la saisie dans iGestion avec AudiBot. Smart Fill détecte et remplit automatiquement les champs patient — nom, prénom, NSS, DDN, correction — en un clic.",
  alternates: { canonical: "https://audibot.fr/erp/igestion" },
};

const data: PortailDetailData = {
  name: "iGestion",
  type: "erp",
  domain: "igestion.fr",
  networkDescription:
    "iGestion est l'un des logiciels de gestion les plus utilisés par les opticiens indépendants en France. AudiBot s'intègre via Smart Fill pour remplir automatiquement les fiches patient.",
  portailUrl: "igestion.fr",
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
  blogSlug: "logiciels-gestion-tiers-payant-opticien",
  blogLabel: "Comment choisir son logiciel de gestion tiers payant",
};

export default function Page() {
  return <PortailDetailPage data={data} />;
}
