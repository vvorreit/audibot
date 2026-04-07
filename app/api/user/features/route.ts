export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserFeatures } from "@/lib/userFeatures";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = session.user as { id: string; role?: string };

  // ADMIN a toujours toutes les features
  if (user.role === "ADMIN") {
    return NextResponse.json({ bilanAuditif: true, rapprochement: true, bankSync: true });
  }

  const features = await getUserFeatures(user.id);
  return NextResponse.json(features);
}
