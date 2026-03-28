-- CreateTable: logs RPA extension Chrome
CREATE TABLE IF NOT EXISTS "RpaLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "syncToken" TEXT,
    "mutuelle" TEXT NOT NULL,
    "etape" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "erreur" TEXT,
    "url" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RpaLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RpaLog_mutuelle_idx" ON "RpaLog"("mutuelle");
CREATE INDEX IF NOT EXISTS "RpaLog_statut_idx" ON "RpaLog"("statut");
CREATE INDEX IF NOT EXISTS "RpaLog_createdAt_idx" ON "RpaLog"("createdAt");
CREATE INDEX IF NOT EXISTS "RpaLog_syncToken_idx" ON "RpaLog"("syncToken");
