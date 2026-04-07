"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé. Non connecté.");
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true }
  });
  if (dbUser?.role !== "ADMIN") throw new Error("Accès refusé. Réservé aux administrateurs.");
  return dbUser;
}
