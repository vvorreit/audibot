export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, getExtCors, optionsCors } from "@/lib/extensionAuth";
import { rateLimit } from "@/lib/rateLimit";
import { getUserFeatures } from "@/lib/userFeatures";

export async function OPTIONS() {
  return optionsCors();
}

export async function GET(req: NextRequest) {
  const token = extractToken(req);
  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400, headers: getExtCors(req.headers.get('origin')) });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await rateLimit(`bilan-frames:${ip}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429, headers: getExtCors(req.headers.get('origin')) });
  }

  const user = await prisma.user.findUnique({
    where: { syncToken: token },
    select: { id: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401, headers: getExtCors(req.headers.get('origin')) });
  }
  if (user.role !== "ADMIN") {
    const features = await getUserFeatures(user.id);
    if (!features.bilanAuditif) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403, headers: getExtCors(req.headers.get('origin')) });
    }
  }

  const filtersRaw = req.nextUrl.searchParams.get("filters");
  if (!filtersRaw) {
    return NextResponse.json(
      { error: "Paramètre filters requis" },
      { status: 400, headers: getExtCors(req.headers.get('origin')) }
    );
  }

  let filters: {
    recommendedTypes?: string[];
    requiredFeatures?: string[];
    styleKeywords?: string[];
    priceRanges?: string[];
  };

  try {
    filters = JSON.parse(filtersRaw);
  } catch {
    return NextResponse.json(
      { error: "Paramètre filters invalide" },
      { status: 400, headers: getExtCors(req.headers.get('origin')) }
    );
  }

  // Fetch all in-stock appareils then score them in-memory
  const appareils = await prisma.appareil.findMany({
    where: {
      inStock: true,
      ...(filters.priceRanges?.length
        ? { gamme: { in: filters.priceRanges } }
        : {}),
    },
    take: 50,
  });

  // Score each appareil
  const scored = appareils.map((appareil) => {
    let score = 0;

    // Type match (Contour, RIC, Intra-auriculaire, etc.)
    if (
      filters.recommendedTypes?.length &&
      filters.recommendedTypes.includes(appareil.type)
    ) {
      score += 3;
    }

    // Style match (Discret, Standard, Mini)
    if (
      filters.styleKeywords?.length &&
      filters.styleKeywords.includes(appareil.style)
    ) {
      score += 2;
    }

    // Required features
    if (filters.requiredFeatures?.includes("rechargeable") && !appareil.rechargeable) {
      score -= 10;
    }
    if (filters.requiredFeatures?.includes("connectivite") && !appareil.connectivite) {
      score -= 5;
    }

    return { ...appareil, score };
  });

  // Filter out negative scores, sort by score desc, take 6
  const results = scored
    .filter((f) => f.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return NextResponse.json({ appareils: results }, { headers: getExtCors(req.headers.get('origin')) });
}
