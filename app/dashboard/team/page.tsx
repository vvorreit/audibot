export const dynamic = "force-dynamic";

import { getTeamDetails } from "@/app/actions/team";
import TeamSettings from "@/components/TeamSettings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const plan = session.user?.plan ?? "FREE";
  const isEquipePlan = plan === "EQUIPE" || plan === "TEAM_5" || plan === "TEAM_3";
  if (!isEquipePlan) redirect("/dashboard");

  const team = await getTeamDetails();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <TeamSettings initialTeam={team as any} />;
}
