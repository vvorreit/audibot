"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Acces refuse.");
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") throw new Error("Acces reserve aux administrateurs.");
}

export async function getMutuelleEmailConfigs() {
  await checkAdmin();

  const configs = await prisma.mutuelleEmailConfig.findMany({
    orderBy: { mutuelle: "asc" },
  });

  return configs.map((c) => ({
    id: c.id,
    mutuelle: c.mutuelle,
    emailDefaut: c.emailDefaut,
    emailPerso: c.emailPerso,
    actif: c.actif,
  }));
}

export async function updateMutuelleEmail(id: string, data: { emailPerso?: string | null; actif?: boolean }) {
  await checkAdmin();

  if (data.emailPerso !== undefined) {
    const email = data.emailPerso?.trim() || null;
    if (email && !email.includes("@")) {
      throw new Error("Adresse email invalide.");
    }
    return prisma.mutuelleEmailConfig.update({
      where: { id },
      data: { emailPerso: email },
    });
  }

  if (data.actif !== undefined) {
    return prisma.mutuelleEmailConfig.update({
      where: { id },
      data: { actif: data.actif },
    });
  }
}
