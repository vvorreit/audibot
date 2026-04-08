import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs AudiBot — Choisissez votre plan",
  description: "Comparez les plans AudiBot : Free, Essentiel, Pro et Équipe. OCR ordonnance, scan téléphone, suivi tiers-payant, relances automatiques. Démarrez gratuitement.",
  alternates: { canonical: "https://audibot.fr/pricing" },
  openGraph: {
    type: "website",
    url: "https://audibot.fr/pricing",
    title: "Tarifs AudiBot",
    description: "Plans adaptés à chaque opticien. Démarrez gratuitement.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Tarifs AudiBot" }],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
