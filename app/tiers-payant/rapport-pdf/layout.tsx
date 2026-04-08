export default function RapportPDFLayout({ children }: { children: React.ReactNode }) {
  // Layout minimal sans NavMenu ni footer pour l'impression
  return <>{children}</>;
}
