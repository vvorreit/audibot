export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import StatsHub from "@/app/dashboard/stats/StatsHub";

export default async function ROIPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");
  return <StatsHub defaultTab="roi" />;
}
