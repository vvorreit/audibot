import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import CookieBanner from "@/components/CookieBanner";
import ConditionalAnalytics from "@/components/ConditionalAnalytics";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import { getBrand } from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = getBrand();
  const title = `${brand.name} — Auto-saisie tiers-payant pour ${brand.lexicon.profession.toLowerCase()}s`;
  const description = `${brand.name} automatise la saisie des formulaires mutuelles pour les ${brand.lexicon.profession.toLowerCase()}s. OCR ${brand.lexicon.document.toLowerCase()} + carte mutuelle. Gagnez 1h30/jour.`;

  return {
    metadataBase: new URL(`https://${brand.domain}`),
    title: {
      default: title,
      template: `%s — ${brand.name}`,
    },
    description,
    keywords: [`tiers-payant ${brand.id}`, `automatisation ${brand.lexicon.profession.toLowerCase()}`, `saisie mutuelle ${brand.lexicon.profession.toLowerCase()}`],
    authors: [{ name: brand.name }],
    creator: brand.name,
    icons: {
      icon: "/icon.png",
      apple: "/icon.png",
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: `https://${brand.domain}`,
      siteName: brand.name,
      title,
      description,
      images: [{ url: "/icon.png", width: 800, height: 600, alt: brand.name }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brand = getBrand();
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://js.stripe.com" />
        <meta name="theme-color" content={brand.colors.primary} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
        <CookieBanner />
        <WebVitalsReporter />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <ConditionalAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
