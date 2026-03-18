"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Acces refuse. Non connecte.");
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, id: true, plan: true },
  });
  if (!dbUser) throw new Error("Utilisateur introuvable.");
  if (dbUser.plan === "FREE") throw new Error("Module disponible a partir du plan Essentiel.");
  return dbUser;
}

export async function getMutuelleEmailConfigs() {
  await checkAuth();

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
  await checkAuth();

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
