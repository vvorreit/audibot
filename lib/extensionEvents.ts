import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function pushExtensionEvent(
  userId: string,
  type: string,
  payload: Record<string, unknown> = {},
  ttlMinutes: number = 30
) {
  return prisma.extensionEvent.create({
    data: {
      userId,
      type,
      payload: payload as Prisma.InputJsonValue,
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
    },
  });
}
