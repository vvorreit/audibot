export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/adminAudit";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const replies = await (prisma as any).adminInboxReply.findMany({
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ replies });
}
