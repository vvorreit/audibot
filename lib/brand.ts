export type BrandConfig = {
  id: "optibot" | "audibot";
  name: string;
  domain: string;
  supportEmail: string;
  appUrl: string;
  colors: {
    primary: string;
    secondary: string;
  };
  lexicon: {
    profession: string;
    product: string;
    document: string;
  };
  features: {
    hasEyes: boolean;
    hasEars: boolean;
  };
};

const BRANDS: Record<string, BrandConfig> = {
  optibot: {
    id: "optibot",
    name: "OptiBot",
    domain: "optibot.fr",
    supportEmail: "contact@optibot.fr",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://optibot.fr",
    colors: {
      primary: "#2563eb", // Bleu
      secondary: "#3b82f6",
    },
    lexicon: {
      profession: "Opticien",
      product: "Verres / Montures",
      document: "Ordonnance",
    },
    features: {
      hasEyes: true,
      hasEars: false,
    }
  },
  audibot: {
    id: "audibot",
    name: "AudiBot",
    domain: "audibot.fr",
    supportEmail: "contact@audibot.fr",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://audibot.fr",
    colors: {
      primary: "#4f46e5", // Indigo
      secondary: "#6366f1",
    },
    lexicon: {
      profession: "Audioprothésiste",
      product: "Appareils / Piles",
      document: "Prescription",
    },
    features: {
      hasEyes: false,
      hasEars: true,
    }
  },
};

export const getBrand = (): BrandConfig => {
  const brandId = process.env.NEXT_PUBLIC_BRAND_ID || "audibot";
  return BRANDS[brandId] || BRANDS.audibot;
};
