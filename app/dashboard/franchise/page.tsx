export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import FranchiseDashboard from "./FranchiseDashboard";

export default async function FranchisePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const plan = session.user?.plan ?? "FREE";
  const isEquipePlan = plan === "EQUIPE" || plan === "TEAM_5" || plan === "TEAM_3";
  if (!isEquipePlan) redirect("/dashboard");
  if (session.user.teamRole !== "OWNER") redirect("/dashboard");

  return <FranchiseDashboard />;
}
