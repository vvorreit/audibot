"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function updateOnboardingStep(step: number): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { onboardingStep: true },
  });

  if (user && step > user.onboardingStep) {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { onboardingStep: step },
    });
  }
}
