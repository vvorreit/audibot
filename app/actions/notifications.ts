"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getAuthUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Non connecté");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) throw new Error("Utilisateur introuvable");
  return user.id;
}

export async function getNotifications() {
  try {
    const userId = await getAuthUserId();
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        read: true,
        link: true,
        createdAt: true,
      },
    });
    return notifications;
  } catch (error) {
    console.error("Erreur getNotifications:", error);
    return [];
  }
}

export async function markAsRead(id: string) {
  try {
    const userId = await getAuthUserId();
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  } catch (error) {
    console.error("Erreur markAsRead:", error);
  }
}

export async function markAllAsRead() {
  try {
    const userId = await getAuthUserId();
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  } catch (error) {
    console.error("Erreur markAllAsRead:", error);
  }
}

/** Utilisé par les crons — pas de session nécessaire */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, link: link ?? null },
    });
  } catch (error) {
    console.error("Erreur createNotification:", error);
  }
}
