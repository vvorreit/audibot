export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import TemplatesClient from "./TemplatesClient";

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, plan: true, isPro: true },
  });

  const isPro =
    dbUser?.isPro ||
    dbUser?.plan === "PRO" ||
    dbUser?.plan === "EQUIPE" ||
    dbUser?.role === "ADMIN";

  return <TemplatesClient isPro={isPro ?? false} plan={dbUser?.plan ?? "FREE"} />;
}
