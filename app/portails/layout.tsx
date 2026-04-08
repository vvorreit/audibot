import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portails mutuelles & ERP audio compatibles \u2014 Almerys, Viamedis, Auditdata | AudiBot",
  description:
    "D\u00e9couvrez tous les portails mutuelles et ERP audio compatibles avec AudiBot : Almerys, Viamedis, Auditdata, Noah, Ameli Pro et plus. Remplissage automatique en 1 clic.",
};

export default function PortailsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
