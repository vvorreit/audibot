export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/* 1×1 transparent PNG (67 bytes) */
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAB" +
    "Nl7BcQAAAABJRU5ErkJggg==",
  "base64",
);

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t");

  if (token) {
    try {
      const tracking = await prisma.emailTracking.findUnique({ where: { token } });
      if (tracking) {
        await prisma.emailTracking.update({
          where: { id: tracking.id },
          data: {
            openCount: { increment: 1 },
            ...(tracking.firstOpenAt ? {} : { firstOpenAt: new Date() }),
          },
        });
      }
    } catch (err) {
      console.error("[track/open]", err);
    }
  }

  return new Response(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Length": String(PIXEL.length),
    },
  });
}
