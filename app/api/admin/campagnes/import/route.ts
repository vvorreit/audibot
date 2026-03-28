export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/admin/campagnes/import
 * Body: multipart/form-data with fields:
 *   - file: CSV (email, prenom?, nom?)
 *   - name: campaign name
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string) || "Sans nom";

    if (!file) {
      return NextResponse.json({ error: "Fichier CSV requis" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: "Le CSV doit contenir au moins un en-tête et une ligne" }, { status: 400 });
    }

    const header = lines[0].toLowerCase().split(/[;,\t]/).map((h) => h.trim());
    const emailIdx = header.findIndex((h) => h === "email" || h === "e-mail" || h === "mail");
    const prenomIdx = header.findIndex((h) => h === "prenom" || h === "prénom" || h === "firstname" || h === "first_name");
    const nomIdx = header.findIndex((h) => h === "nom" || h === "lastname" || h === "last_name");

    if (emailIdx === -1) {
      return NextResponse.json({ error: "Colonne 'email' introuvable dans le CSV" }, { status: 400 });
    }

    const campaign = await prisma.emailCampaign.create({
      data: { name },
    });

    const rows: { campaignId: string; email: string; firstName: string | null; lastName: string | null }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[;,\t]/).map((c) => c.trim());
      const email = cols[emailIdx]?.toLowerCase().trim();
      if (!email || !email.includes("@")) continue;

      rows.push({
        campaignId: campaign.id,
        email,
        firstName: prenomIdx >= 0 ? cols[prenomIdx] || null : null,
        lastName: nomIdx >= 0 ? cols[nomIdx] || null : null,
      });
    }

    if (rows.length === 0) {
      await prisma.emailCampaign.delete({ where: { id: campaign.id } });
      return NextResponse.json({ error: "Aucun email valide trouvé dans le CSV" }, { status: 400 });
    }

    await prisma.emailTracking.createMany({ data: rows });

    return NextResponse.json({
      campaignId: campaign.id,
      imported: rows.length,
    });
  } catch (err) {
    console.error("[campagnes/import]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
