export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HotPatchActions } from "./actions-client";

export default async function AdminHotPatchPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "ADMIN") redirect("/");

  let patches: Awaited<ReturnType<typeof prisma.hotPatch.findMany>> = [];
  try {
    patches = await prisma.hotPatch.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  } catch (e) {
    console.error("[admin/hotpatch] DB error:", e);
  }

  const activeCount = patches.filter((p) => p.active).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hot-Patches</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} actif{activeCount > 1 ? "s" : ""} sur {patches.length} total
            — appliqués automatiquement sans mise à jour extension
          </p>
        </div>
      </div>

      <HotPatchActions patches={JSON.parse(JSON.stringify(patches))} />
    </div>
  );
}
