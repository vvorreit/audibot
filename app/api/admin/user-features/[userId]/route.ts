import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { parseBody } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";

const featuresSchema = z.object({
  bilanAuditif: z.boolean().optional(),
  rapprochement: z.boolean().optional(),
});

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Non connecté");
  const user = session.user as { id: string; role?: string };
  if (user.role !== "ADMIN") throw new Error("Non autorisé");
  return user;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { userId } = await params;
  const features = await prisma.userFeatures.findUnique({ where: { userId } });

  return NextResponse.json({
    bilanAuditif: features?.bilanAuditif ?? false,
    rapprochement: features?.rapprochement ?? false,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  let admin;
  try {
    admin = await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const allowed = await rateLimit(`admin-user-features:${admin.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const { userId } = await params;
  const data = await parseBody(req, featuresSchema);
  if (data instanceof NextResponse) return data;

  const updateData: Record<string, unknown> = {};
  if (typeof data.bilanAuditif === "boolean") updateData.bilanAuditif = data.bilanAuditif;
  if (typeof data.rapprochement === "boolean") updateData.rapprochement = data.rapprochement;

  const features = await prisma.userFeatures.upsert({
    where: { userId },
    create: {
      userId,
      ...updateData,
      grantedBy: admin.id,
    },
    update: {
      ...updateData,
      grantedBy: admin.id,
    },
  });

  return NextResponse.json({
    ok: true,
    features: {
      bilanAuditif: features.bilanAuditif,
      rapprochement: features.rapprochement,
    },
  });
}
