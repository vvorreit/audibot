-- AlterTable: add relance fields to DossierTiersPayant
ALTER TABLE "DossierTiersPayant" ADD COLUMN IF NOT EXISTS "relanceCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DossierTiersPayant" ADD COLUMN IF NOT EXISTS "derniereRelanceAt" TIMESTAMP(3);
ALTER TABLE "DossierTiersPayant" ADD COLUMN IF NOT EXISTS "relanceDesactivee" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: regles de relance configurables
CREATE TABLE IF NOT EXISTS "RegleRelance" (
    "id" TEXT NOT NULL,
    "delaiJours" INTEGER NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'both',
    "mutuelle" "Mutuelle",
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegleRelance_pkey" PRIMARY KEY ("id")
);

-- CreateTable: historique des relances
CREATE TABLE IF NOT EXISTS "RelanceLog" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "delaiJours" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'envoyee',
    "datePrevu" TIMESTAMP(3) NOT NULL,
    "dateExecution" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RegleRelance_delaiJours_mutuelle_key" ON "RegleRelance"("delaiJours", "mutuelle");
CREATE INDEX IF NOT EXISTS "RelanceLog_dossierId_idx" ON "RelanceLog"("dossierId");
CREATE INDEX IF NOT EXISTS "RelanceLog_statut_idx" ON "RelanceLog"("statut");
CREATE INDEX IF NOT EXISTS "RelanceLog_datePrevu_idx" ON "RelanceLog"("datePrevu");

-- AddForeignKey
ALTER TABLE "RelanceLog" ADD CONSTRAINT "RelanceLog_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "DossierTiersPayant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: default relance rules (J+30, J+60, J+90)
INSERT INTO "RegleRelance" ("id", "delaiJours", "action", "actif", "createdAt", "updatedAt")
VALUES
    (gen_random_uuid()::text, 30, 'both', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 60, 'both', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 90, 'both', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
