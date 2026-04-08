import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacter AudiBot — Support & Questions",
  description:
    "Contactez l'équipe AudiBot pour toute question, demande de démo ou devis personnalisé. Réponse sous 24h.",
  alternates: { canonical: "https://audibot.fr/contact" },
  openGraph: {
    type: "website",
    url: "https://audibot.fr/contact",
    title: "Contacter AudiBot — Support & Questions",
    description: "Contactez l'équipe AudiBot pour toute question, demande de démo ou devis personnalisé. Réponse sous 24h.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contacter AudiBot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacter AudiBot — Support & Questions",
    description: "Contactez l'équipe AudiBot pour toute question. Réponse sous 24h.",
    images: ["/og-image.png"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
