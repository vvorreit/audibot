import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type FeatureName = "bilanAuditif" | "rapprochement" | "bankSync";

export async function getUserFeatures(userId: string) {
  const [features, user] = await Promise.all([
    prisma.userFeatures.findUnique({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true, isPro: true } }),
  ]);
  const paidPlans = ["PRO", "EQUIPE", "CABINET", "RESEAU", "ENTERPRISE"];
  const isPaid = user?.isPro || (user?.plan ? paidPlans.includes(user.plan) : false);
  return {
    bilanAuditif: features?.bilanAuditif ?? false,
    rapprochement: features?.rapprochement ?? false,
    bankSync: isPaid,
  };
}

/* Verifie si l'user connecte a acces a une feature */
/* ADMIN a toujours acces */
export async function hasFeature(feature: FeatureName): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;
  const user = session.user as { id: string; role?: string };
  if (user.role === "ADMIN") return true;
  const features = await getUserFeatures(user.id);
  return features[feature];
}
