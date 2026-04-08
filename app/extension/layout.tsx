import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Extension Chrome AudiBot — Remplissage automatique | AudiBot",
  description:
    "Installez l'extension Chrome AudiBot en 2 minutes et remplissez automatiquement les portails mutuelles (Almerys, Wemind, Viamedis…) en 1 clic. OCR local, zéro donnée patient envoyée.",
  alternates: { canonical: "https://audibot.fr/extension" },
  openGraph: {
    type: "website",
    url: "https://audibot.fr/extension",
    title: "Extension Chrome AudiBot — Remplissage automatique",
    description: "Installez l'extension Chrome AudiBot en 2 minutes et remplissez automatiquement les portails mutuelles (Almerys, Wemind, Viamedis…) en 1 clic. OCR local, zéro donnée patient envoyée.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Extension Chrome AudiBot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Extension Chrome AudiBot — Remplissage automatique",
    description: "Installez l'extension Chrome AudiBot en 2 minutes.",
    images: ["/og-image.png"],
  },
};

export default function ExtensionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
