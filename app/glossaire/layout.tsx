import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "https://audibot.fr/glossaire" },
};

export default function GlossaireLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
