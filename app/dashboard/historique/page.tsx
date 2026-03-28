export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import HistoriqueClient from "./HistoriqueClient";

export default async function HistoriquePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, plan: true, isPro: true },
  });

  if (!user) redirect("/auth/signin");

  const isPlanLimite = !user.isPro && user.plan !== "PRO" && user.plan !== "EQUIPE";

  const dateLimit = isPlanLimite
    // eslint-disable-next-line react-hooks/purity -- server component, not a React hook
    ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : undefined;

  const scans = await prisma.ocrScanLog.findMany({
    where: {
      userId: user.id,
      ...(dateLimit ? { createdAt: { gte: dateLimit } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      success: true,
      ocrConfidence: true,
      dataScore: true,
      globalScore: true,
      level: true,
      fileName: true,
      createdAt: true,
    },
    take: 500,
  });

  const serialized = scans.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <HistoriqueClient
      scans={serialized}
      isPlanLimite={isPlanLimite}
      plan={user.plan}
    />
  );
}
