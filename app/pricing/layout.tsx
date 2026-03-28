import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs OptiBot — Choisissez votre plan",
  description: "Comparez les plans OptiBot : Free, Essentiel, Pro et Équipe. OCR ordonnance, scan téléphone, suivi tiers-payant, relances automatiques. Démarrez gratuitement.",
  alternates: { canonical: "https://optibot.fr/pricing" },
  openGraph: {
    type: "website",
    url: "https://optibot.fr/pricing",
    title: "Tarifs OptiBot",
    description: "Plans adaptés à chaque opticien. Démarrez gratuitement.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Tarifs OptiBot" }],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
