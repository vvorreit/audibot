export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/adminAudit";
import { getUserDetail } from "@/app/admin/actions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = await getUserDetail(id);
    return NextResponse.json(user);
  } catch (err) {
    console.error("[admin/users/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
