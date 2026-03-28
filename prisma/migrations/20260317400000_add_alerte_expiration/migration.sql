-- CreateTable: alertes expiration ordonnances (2 ans)
CREATE TABLE IF NOT EXISTS "AlerteExpiration" (
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

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AlerteExpiration_userId_idx" ON "AlerteExpiration"("userId");
CREATE INDEX IF NOT EXISTS "AlerteExpiration_traitee_idx" ON "AlerteExpiration"("traitee");
CREATE INDEX IF NOT EXISTS "AlerteExpiration_dateExpiration_idx" ON "AlerteExpiration"("dateExpiration");

-- AddForeignKey
ALTER TABLE "AlerteExpiration" ADD CONSTRAINT "AlerteExpiration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
