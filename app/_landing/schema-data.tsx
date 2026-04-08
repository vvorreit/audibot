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
  name: "AudiBot",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "32.90",
    priceCurrency: "EUR",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "32.90",
      priceCurrency: "EUR",
      billingIncrement: 1,
      unitCode: "MON",
    },
  },
  description:
    "AudiBot automatise la saisie sur les portails mutuelles et ERP audio. Z\u00e9ro donn\u00e9e patient stock\u00e9e, compatible avec Auditdata, Almerys, Viamedis, Ameli Pro et plus.",
  url: "https://audibot.fr",
  featureList: [
    "Aucune donn\u00e9e patient envoy\u00e9e sur nos serveurs",
    "Autofill portails mutuelles (Almerys, Viamedis, G\u00e9n\u00e9ration, Wemind\u2026)",
    "Autofill ERP audio (Auditdata, Noah\u2026)",
    "Extension Chrome \u2014 remplissage en 1 clic",
    "Extraction automatique prescription ORL & audiogramme",
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
