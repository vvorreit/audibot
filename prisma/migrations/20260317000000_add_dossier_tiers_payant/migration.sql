-- CreateEnum
CREATE TYPE "StatutDossierTP" AS ENUM ('EN_ATTENTE', 'RECU', 'REJETE', 'EN_LITIGE');

-- CreateEnum
CREATE TYPE "Mutuelle" AS ENUM ('CPAM', 'ALMERYS', 'VIAMEDIS', 'ITELIS', 'KALIXIA', 'CARTE_BLANCHE', 'SANTECLAIR', 'SEVEANE', 'SP_SANTE', 'AUTRE');

-- CreateTable
CREATE TABLE IF NOT EXISTS "DossierTiersPayant" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "mutuelle" "Mutuelle" NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "dateEnvoi" TIMESTAMP(3) NOT NULL,
    "numeroAdherent" TEXT,
    "referenceInterne" TEXT,
    "statut" "StatutDossierTP" NOT NULL DEFAULT 'EN_ATTENTE',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DossierTiersPayant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DossierTiersPayant_reference_key" ON "DossierTiersPayant"("reference");
CREATE INDEX IF NOT EXISTS "DossierTiersPayant_userId_idx" ON "DossierTiersPayant"("userId");
CREATE INDEX IF NOT EXISTS "DossierTiersPayant_statut_idx" ON "DossierTiersPayant"("statut");
CREATE INDEX IF NOT EXISTS "DossierTiersPayant_createdAt_idx" ON "DossierTiersPayant"("createdAt");

-- AddForeignKey
ALTER TABLE "DossierTiersPayant" ADD CONSTRAINT "DossierTiersPayant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
