export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

/**
 * Manifest dynamique pour la PWA Scan.
 *
 * Appelé avec ?dt={deviceToken} après un pairing réussi,
 * il injecte le token dans start_url pour que la PWA standalone
 * puisse retrouver l'appareil sans dépendre du localStorage de Safari
 * (qui est isolé sur iOS).
 */
export function GET(req: NextRequest) {
  const dt = req.nextUrl.searchParams.get("dt");

  const startUrl = dt ? `/scan?dt=${encodeURIComponent(dt)}` : "/scan";

  const manifest = {
    id: "/scan",
    name: "AudiBot Scan",
    short_name: "Scan",
    description: "Scanner vos cartes mutuelles et ordonnances",
    start_url: startUrl,
    scope: "/scan",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#2563eb",
    categories: ["medical", "productivity"],
    icons: [
      { src: "/icon-128.png", sizes: "128x128", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-384.png", sizes: "384x384", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Scanner",
        short_name: "Scan",
        url: "/scan",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
