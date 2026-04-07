import { faqItems } from "@/lib/faqData";

/* ─── JSON-LD helpers ───────────────────────────────────────────── */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OptiBot",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "69.90",
    priceCurrency: "EUR",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "69.90",
      priceCurrency: "EUR",
      billingIncrement: 1,
      unitCode: "MON",
    },
  },
  description:
    "OptiBot automatise la saisie sur les portails mutuelles et ERP optiques. Zéro donnée patient stockée, compatible avec 47 portails mutuelles et ERP (Almerys, Wemind, Viamedis, Cosium et +).",
  url: "https://optibot.fr",
  screenshot: "https://optibot.fr/icon.png",
  featureList: [
    "Aucune donnée patient envoyée sur nos serveurs",
    "Autofill 47 portails mutuelles (Almerys, Wemind, Viamedis, Génération…)",
    "Autofill 10 ERP optiques (Cosium, WinOptics, Optimum, PVO…)",
    "Extension Chrome — remplissage en 1 clic",
    "Essai gratuit 15 jours sans carte bancaire",
  ],
};

export function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
