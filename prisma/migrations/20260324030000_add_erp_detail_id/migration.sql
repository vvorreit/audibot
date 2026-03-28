-- AlterTable
ALTER TABLE "DossierTiersPayant" ADD COLUMN IF NOT EXISTS "erpDetailId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DossierTiersPayant_erpDetailId_key" ON "DossierTiersPayant"("erpDetailId");
