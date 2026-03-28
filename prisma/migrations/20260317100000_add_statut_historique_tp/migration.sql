-- AlterTable: add status-related columns to DossierTiersPayant
ALTER TABLE "DossierTiersPayant" ADD COLUMN IF NOT EXISTS "montantRecu" DOUBLE PRECISION;
ALTER TABLE "DossierTiersPayant" ADD COLUMN IF NOT EXISTS "dateReception" TIMESTAMP(3);
ALTER TABLE "DossierTiersPayant" ADD COLUMN IF NOT EXISTS "motifRejet" TEXT;
ALTER TABLE "DossierTiersPayant" ADD COLUMN IF NOT EXISTS "commentaire" TEXT;

-- CreateTable: historique des changements de statut
CREATE TABLE IF NOT EXISTS "HistoriqueStatutTP" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "ancienStatut" "StatutDossierTP" NOT NULL,
    "nouveauStatut" "StatutDossierTP" NOT NULL,
    "commentaire" TEXT,
    "auteurId" TEXT NOT NULL,
    "auteurNom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoriqueStatutTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HistoriqueStatutTP_dossierId_idx" ON "HistoriqueStatutTP"("dossierId");
CREATE INDEX IF NOT EXISTS "HistoriqueStatutTP_createdAt_idx" ON "HistoriqueStatutTP"("createdAt");

-- AddForeignKey
ALTER TABLE "HistoriqueStatutTP" ADD CONSTRAINT "HistoriqueStatutTP_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "DossierTiersPayant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
