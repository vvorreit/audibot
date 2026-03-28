export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin } from "@/lib/adminAudit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const segment = req.nextUrl.searchParams.get("segment") ?? "all";

  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      select: { name: true },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    }

    const emails = await prisma.emailTracking.findMany({
      where: { campaignId: id },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        openCount: true,
        clickCount: true,
        firstOpenAt: true,
        firstClickAt: true,
      },
    });

    const allUnsubscribed = new Set(
      (await prisma.emailUnsubscribe.findMany({ select: { email: true } })).map((u) => u.email),
    );

    let filtered = emails;
    switch (segment) {
      case "opened":
        filtered = emails.filter((e) => e.openCount > 0);
        break;
      case "not_opened":
        filtered = emails.filter((e) => e.openCount === 0 && e.status === "sent");
        break;
      case "clicked":
        filtered = emails.filter((e) => e.clickCount > 0);
        break;
      case "errors":
        filtered = emails.filter((e) => e.status === "error");
        break;
    }

    const header = "email,prenom,nom,statut,ouvertures,clics,premier_ouverture,premier_clic,desinscrit";
    const rows = filtered.map((e) => {
      const cols = [
        e.email,
        e.firstName ?? "",
        e.lastName ?? "",
        e.status,
        String(e.openCount),
        String(e.clickCount),
        e.firstOpenAt ? new Date(e.firstOpenAt).toISOString() : "",
        e.firstClickAt ? new Date(e.firstClickAt).toISOString() : "",
        allUnsubscribed.has(e.email) ? "oui" : "non",
      ];
      return cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(",");
    });

    const csv = [header, ...rows].join("\n");
    const safeName = campaign.name.replace(/[^a-zA-Z0-9_-]/g, "_");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeName}_${segment}.csv"`,
      },
    });
  } catch (err) {
    console.error("[campagnes/export]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
