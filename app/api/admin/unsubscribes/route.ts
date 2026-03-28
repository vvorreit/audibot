export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const format = req.nextUrl.searchParams.get("format");

  try {
    const rows = await prisma.emailUnsubscribe.findMany({
      orderBy: { unsubscribedAt: "desc" },
    });

    if (format === "csv") {
      const header = "email,unsubscribedAt,reason";
      const lines = rows.map(
        (r) =>
          `${r.email},${r.unsubscribedAt.toISOString()},${r.reason ?? ""}`,
      );
      const csv = [header, ...lines].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="unsubscribes-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ unsubscribes: rows, total: rows.length });
  } catch (err) {
    console.error("[admin/unsubscribes]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
