export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const rows = await prisma.portalSelectorOverride.findMany({
    where: { enabled: true },
    select: { portal: true, selectorName: true, selector: true },
  });

  const overrides: Record<string, Record<string, string>> = {};
  for (const row of rows) {
    if (!overrides[row.portal]) overrides[row.portal] = {};
    overrides[row.portal][row.selectorName] = row.selector;
  }

  return NextResponse.json(
    { version: 1, overrides },
    {
      headers: {
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
