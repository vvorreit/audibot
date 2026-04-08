export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTeamDetails } from "@/app/actions/team";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ team: null }, { status: 401 });
  }

  const team = await getTeamDetails();
  return NextResponse.json({ team });
}
