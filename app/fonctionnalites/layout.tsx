import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fonctionnalités — OCR, remplissage auto, tiers payant | AudiBot",
  description:
    "Découvrez toutes les fonctionnalités AudiBot : lecture OCR de cartes mutuelles et ordonnances, remplissage automatique des portails, suivi tiers payant, gestion d'équipe, sécurité AES-256 et bien plus.",
  openGraph: {
    title: "Fonctionnalités AudiBot — Automatisation pour audioprothésistes",
    description:
      "OCR local, Smart Fill universel, suivi tiers payant, gestion d'équipe. Découvrez comment AudiBot fait gagner +2h par jour aux audioprothésistes.",
  },
};

export default function FonctionnalitesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
