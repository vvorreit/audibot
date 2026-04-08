export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEFAULT_URL = "https://audibot.fr";

const ALLOWED_ORIGINS = ["https://audibot.fr", "https://audibot.fr"];

function isSafeRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_ORIGINS.some(
      (origin) =>
        parsed.origin === origin ||
        parsed.href.startsWith(origin + "/")
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t");
  const rawUrl = req.nextUrl.searchParams.get("url");
  const url = rawUrl && isSafeRedirectUrl(rawUrl) ? rawUrl : DEFAULT_URL;

  if (token) {
    try {
      const tracking = await prisma.emailTracking.findUnique({ where: { token } });
      if (tracking) {
        await prisma.emailTracking.update({
          where: { id: tracking.id },
          data: {
            clickCount: { increment: 1 },
            ...(tracking.firstClickAt ? {} : { firstClickAt: new Date() }),
          },
        });
      }
    } catch (err) {
      console.error("[track/click]", err);
    }
  }

  return NextResponse.redirect(url, 307);
}
