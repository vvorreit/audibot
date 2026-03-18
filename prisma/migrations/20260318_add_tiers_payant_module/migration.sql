-- CreateEnum
CREATE TYPE "StatutDossierTP" AS ENUM ('EN_ATTENTE', 'RECU', 'REJETE', 'EN_LITIGE');

-- CreateEnum
CREATE TYPE "Mutuelle" AS ENUM ('CPAM', 'ALMERYS', 'VIAMEDIS', 'ITELIS', 'KALIXIA', 'CARTE_BLANCHE', 'SANTECLAIR', 'SEVEANE', 'SP_SANTE', 'AUTRE');

-- CreateTable
CREATE TABLE "DossierTiersPayant" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "mutuelle" "Mutuelle" NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "dateEnvoi" TIMESTAMP(3) NOT NULL,
    "numeroAdherent" TEXT,
    "referenceInterne" TEXT,
    "statut" "StatutDossierTP" NOT NULL DEFAULT 'EN_ATTENTE',
    "montantRecu" DOUBLE PRECISION,
    "dateReception" TIMESTAMP(3),
    "motifRejet" TEXT,
    "commentaire" TEXT,
    "relanceCount" INTEGER NOT NULL DEFAULT 0,
    "derniereRelanceAt" TIMESTAMP(3),
    "relanceDesactivee" BOOLEAN NOT NULL DEFAULT false,
    "lboDetailId" TEXT,
    "mode" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DossierTiersPayant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriqueStatutTP" (
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

-- CreateTable
CREATE TABLE "RegleRelance" (
    "id" TEXT NOT NULL,
    "delaiJours" INTEGER NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'both',
    "mutuelle" "Mutuelle",
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegleRelance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelanceLog" (
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

-- CreateTable
CREATE TABLE "TemplateRelance" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'amiable',
    "objet" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "delaiJours" INTEGER,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateRelance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlerteExpiration" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT,
    "clientNom" TEXT NOT NULL,
    "dateOrdonnance" TIMESTAMP(3) NOT NULL,
    "dateExpiration" TIMESTAMP(3) NOT NULL,
    "joursAvant" INTEGER NOT NULL,
    "traitee" BOOLEAN NOT NULL DEFAULT false,
    "traiteePar" TEXT,
    "traiteeAt" TIMESTAMP(3),
    "commentaire" TEXT,
    "notifEmail" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlerteExpiration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MutuelleEmailConfig" (
    "id" TEXT NOT NULL,
    "mutuelle" "Mutuelle" NOT NULL,
    "emailDefaut" TEXT NOT NULL,
    "emailPerso" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MutuelleEmailConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RejetAutoDetecte" (
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
CREATE UNIQUE INDEX "DossierTiersPayant_reference_key" ON "DossierTiersPayant"("reference");
CREATE UNIQUE INDEX "DossierTiersPayant_lboDetailId_key" ON "DossierTiersPayant"("lboDetailId");
CREATE INDEX "DossierTiersPayant_userId_idx" ON "DossierTiersPayant"("userId");
CREATE INDEX "DossierTiersPayant_statut_idx" ON "DossierTiersPayant"("statut");
CREATE INDEX "DossierTiersPayant_createdAt_idx" ON "DossierTiersPayant"("createdAt");

-- CreateIndex
CREATE INDEX "HistoriqueStatutTP_dossierId_idx" ON "HistoriqueStatutTP"("dossierId");
CREATE INDEX "HistoriqueStatutTP_createdAt_idx" ON "HistoriqueStatutTP"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RegleRelance_delaiJours_mutuelle_key" ON "RegleRelance"("delaiJours", "mutuelle");

-- CreateIndex
CREATE INDEX "RelanceLog_dossierId_idx" ON "RelanceLog"("dossierId");
CREATE INDEX "RelanceLog_statut_idx" ON "RelanceLog"("statut");
CREATE INDEX "RelanceLog_datePrevu_idx" ON "RelanceLog"("datePrevu");

-- CreateIndex
CREATE INDEX "AlerteExpiration_userId_idx" ON "AlerteExpiration"("userId");
CREATE INDEX "AlerteExpiration_traitee_idx" ON "AlerteExpiration"("traitee");
CREATE INDEX "AlerteExpiration_dateExpiration_idx" ON "AlerteExpiration"("dateExpiration");

-- CreateIndex
CREATE UNIQUE INDEX "MutuelleEmailConfig_mutuelle_key" ON "MutuelleEmailConfig"("mutuelle");

-- CreateIndex
CREATE INDEX "RejetAutoDetecte_syncToken_idx" ON "RejetAutoDetecte"("syncToken");
CREATE INDEX "RejetAutoDetecte_traite_idx" ON "RejetAutoDetecte"("traite");
CREATE INDEX "RejetAutoDetecte_dossierId_idx" ON "RejetAutoDetecte"("dossierId");

-- AddForeignKey
ALTER TABLE "DossierTiersPayant" ADD CONSTRAINT "DossierTiersPayant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueStatutTP" ADD CONSTRAINT "HistoriqueStatutTP_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "DossierTiersPayant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelanceLog" ADD CONSTRAINT "RelanceLog_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "DossierTiersPayant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlerteExpiration" ADD CONSTRAINT "AlerteExpiration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
