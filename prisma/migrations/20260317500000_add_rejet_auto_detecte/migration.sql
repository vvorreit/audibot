-- CreateTable: rejets auto-detectes par l'extension Chrome
CREATE TABLE IF NOT EXISTS "RejetAutoDetecte" (
    "id" TEXT NOT NULL,
    "syncToken" TEXT NOT NULL,
    "portail" TEXT NOT NULL,
    "numeroDossier" TEXT,
    "motif" TEXT,
    "dateRejet" TIMESTAMP(3),
    "montant" DOUBLE PRECISION,
    "dossierId" TEXT,
    "matched" BOOLEAN NOT NULL DEFAULT false,
    "traite" BOOLEAN NOT NULL DEFAULT false,
    "rawData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RejetAutoDetecte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RejetAutoDetecte_syncToken_idx" ON "RejetAutoDetecte"("syncToken");
CREATE INDEX IF NOT EXISTS "RejetAutoDetecte_traite_idx" ON "RejetAutoDetecte"("traite");
CREATE INDEX IF NOT EXISTS "RejetAutoDetecte_dossierId_idx" ON "RejetAutoDetecte"("dossierId");
