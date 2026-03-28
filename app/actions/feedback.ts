"use server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function submitNpsFeedback(score: number, message: string): Promise<void> {
  if (score < 1 || score > 10) return;
  try {
    const session = await getServerSession(authOptions);
    await prisma.npsResponse.create({
      data: {
        userId: (session?.user as any)?.id ?? null,
        email: session?.user?.email ?? null,
        score,
        message: message.trim() || null,
      },
    });
    console.log(`[NPS] score=${score} userId=${(session?.user as any)?.id}`);
  } catch (err) {
    console.error("[NPS] Erreur:", err);
  }
}
