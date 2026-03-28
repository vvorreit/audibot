import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true, // gzip/brotli sur les réponses HTTP
  poweredByHeader: false, // supprimer X-Powered-By
  images: {
    formats: ["image/avif", "image/webp"], // formats modernes auto
    minimumCacheTTL: 86400, // cache images 24h
  },
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            /*
             * CSP — Notes sécurité :
             *
             * ⚠️  unsafe-eval — DETTE TECHNIQUE DOCUMENTÉE
             *     Requis par Tesseract.js pour l'initialisation du worker WASM (OCR client-side).
             *     Sans unsafe-eval, le worker WASM de Tesseract ne peut pas s'initialiser et
             *     l'OCR est complètement non-fonctionnel.
             *     Suppression possible UNIQUEMENT si Tesseract est migré vers un Web Worker
             *     isolé avec un scope CSP séparé (worker-src indépendant).
             *     Voir US-SEC09 pour le plan de migration.
             *     Risque accepté : vecteur en deux étapes (XSS préalable requis) + données
             *     patient traitées 100% client-side, aucun transit serveur.
             *     Dernière revue : mars 2026 — Vincent Vorreiter
             *
             * ⚠️  unsafe-inline — DETTE TECHNIQUE DOCUMENTÉE
             *     Requis par Next.js pour l'hydration des scripts inline et les styles
             *     dynamiques Tailwind. Migration vers nonces CSP possible via middleware
             *     Next.js 14+ mais complexité significative (voir doc Next.js CSP nonces).
             *     Dernière revue : mars 2026 — Vincent Vorreiter
             *
             * script-src-elem restreint aux domaines connus pour limiter la surface d'attaque.
             */
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://accounts.google.com; script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://accounts.google.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' blob: https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://accounts.google.com; frame-src https://accounts.google.com https://js.stripe.com; frame-ancestors 'none';",
          },
        ],
      },
      {
        source: "/tesseract/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/pdf.worker.min.mjs",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
