import sharp from "sharp";
import path from "path";

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <text x="600" y="280" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="120" font-weight="bold" fill="white">OptiBot</text>
  <text x="600" y="380" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" fill="rgba(255,255,255,0.85)">Automatisation tiers-payant pour opticiens</text>
</svg>`;

async function main() {
  const outputPath = path.join(process.cwd(), "public", "og-image.png");
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`Generated ${outputPath}`);
}

main().catch(console.error);
