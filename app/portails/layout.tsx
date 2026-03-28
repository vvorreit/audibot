import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portails tiers-payant compatibles \u2014 Almerys, Wemind, Viamedis | OptiBot",
  description:
    "D\u00e9couvrez tous les portails mutuelles et ERP compatibles avec OptiBot : Almerys, Wemind, Viamedis, Itelis, Kalixia, G\u00e9n\u00e9ration, LivebyOptimum et plus. Remplissage automatique en 1 clic.",
};

export default function PortailsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
