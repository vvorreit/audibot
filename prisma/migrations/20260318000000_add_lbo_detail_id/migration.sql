-- AlterTable: add LBO sync fields for deduplication
ALTER TABLE "DossierTiersPayant" ADD COLUMN IF NOT EXISTS "lboDetailId" TEXT;
ALTER TABLE "DossierTiersPayant" ADD COLUMN IF NOT EXISTS "mode" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "DossierTiersPayant_lboDetailId_key" ON "DossierTiersPayant"("lboDetailId") WHERE "lboDetailId" IS NOT NULL;
