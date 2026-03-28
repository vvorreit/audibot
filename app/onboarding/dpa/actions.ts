"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function acceptDpa(dpaVersion: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Non authentifié." };
  }

  const userId = session.user.id;
  const email = session.user.email ?? "";

  // Vérifier si déjà accepté (idempotent)
  const existing = await prisma.legalAcceptance.findFirst({
    where: { userId, documentType: "dpa", documentVersion: dpaVersion },
  });

  if (existing) {
    return { success: true };
  }

  // Récupérer IP et user-agent
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  await prisma.legalAcceptance.create({
    data: {
      userId,
      email,
      documentType: "dpa",
      documentVersion: dpaVersion,
      ipAddress,
      userAgent,
    },
  });

  return { success: true };
}
