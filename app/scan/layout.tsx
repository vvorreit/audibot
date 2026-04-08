import { cookies } from "next/headers";
import ScanPWAHead from "@/components/ScanPWAHead";
import NetworkStatus from "@/components/NetworkStatus";

export const metadata = {
  title: "AudiBot Scan",
  description: "Scanner vos cartes mutuelles et ordonnances",
};

export default async function ScanLayout({ children }: { children: React.ReactNode }) {
  // Lire le deviceToken depuis le cookie (set par /api/mobile/pair)
  // pour injecter le token dans le manifest start_url côté serveur.
  // C'est la seule méthode fiable sur iOS car la PWA standalone
  // a un localStorage et des cookies JS isolés de Safari,
  // MAIS les cookies set par le serveur (Set-Cookie) sont partagés
  // si le domaine et le path matchent.
  const cookieStore = await cookies();
  const dt = cookieStore.get("audibot_device_token")?.value;
  const manifestHref = dt
    ? `/api/scan/manifest?dt=${encodeURIComponent(dt)}`
    : "/api/scan/manifest";

  return (
    <>
      <head>
        <link rel="manifest" href={manifestHref} />
        <meta name="apple-mobile-web-app-title" content="AudiBot Scan" />
        {/* apple-mobile-web-app-capable is already in root layout */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* iOS splash screen */}
        <link rel="apple-touch-startup-image" href="/icon-512.png" />
      </head>
      <ScanPWAHead />
      <NetworkStatus />
      {children}
    </>
  );
}
