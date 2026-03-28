-- CreateTable
CREATE TABLE "ScanSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blob" TEXT,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScanSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScanSession_userId_idx" ON "ScanSession"("userId");
CREATE INDEX "ScanSession_expiresAt_idx" ON "ScanSession"("expiresAt");
