export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AccountClient from "./AccountClient";

const DPA_VERSION = process.env.DPA_VERSION || "1.1";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  let dpaStatus = null;
  if (session?.user?.id) {
    try {
      const latest = await prisma.legalAcceptance.findFirst({
        where: { userId: session.user.id, documentType: "dpa" },
        orderBy: { acceptedAt: "desc" },
      });
      dpaStatus = {
        current_version: DPA_VERSION,
        accepted_version: latest?.documentVersion ?? null,
        accepted_at: latest?.acceptedAt ? latest.acceptedAt.toISOString() : null,
        is_current: latest?.documentVersion === DPA_VERSION,
      };
    } catch {
      // fallback silencieux — le client gère null
    }
  }

  return <AccountClient dpaStatus={dpaStatus} />;
}
