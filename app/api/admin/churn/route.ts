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
    const rows = await prisma.churnReason.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, plan: true } },
      },
    });

    if (format === "csv") {
      const esc = (v: string | null | undefined) => `"${(v ?? "").replace(/"/g, '""')}"`;
      const header = "date,user,email,plan,reason,comment,retained,retentionOffer";
      const lines = rows.map(
        (r) =>
          `${r.createdAt.toISOString()},${esc(r.user.name)},${esc(r.user.email)},${esc(r.plan)},${esc(r.reason)},${esc(r.comment)},${r.retained},${esc(r.retentionOffer)}`,
      );
      const csv = [header, ...lines].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="churn-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const stats = {
      total: rows.length,
      retained: rows.filter((r) => r.retained).length,
      lost: rows.filter((r) => !r.retained).length,
    };

    return NextResponse.json({ churnReasons: rows, stats });
  } catch (err) {
    console.error("[admin/churn]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
