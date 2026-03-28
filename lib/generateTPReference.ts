import { PrismaClient } from "@prisma/client";

export async function generateTPReference(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
): Promise<string> {
  const year = new Date().getFullYear();
  const lastDossier = await tx.dossierTiersPayant.findFirst({
    where: { reference: { startsWith: `TP-${year}-` } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  let nextNum = 1;
  if (lastDossier) {
    const parts = lastDossier.reference.split("-");
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }
  return `TP-${year}-${String(nextNum).padStart(4, "0")}`;
}
