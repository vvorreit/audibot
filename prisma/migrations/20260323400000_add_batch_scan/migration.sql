CREATE TABLE IF NOT EXISTS "BatchScanSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BatchScanSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BatchScanItem" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "blob" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "orderIndex" INTEGER NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BatchScanItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BatchScanSession_userId_idx" ON "BatchScanSession"("userId");
CREATE INDEX IF NOT EXISTS "BatchScanSession_expiresAt_idx" ON "BatchScanSession"("expiresAt");
CREATE INDEX IF NOT EXISTS "BatchScanSession_status_idx" ON "BatchScanSession"("status");
CREATE INDEX IF NOT EXISTS "BatchScanItem_batchId_idx" ON "BatchScanItem"("batchId");
CREATE INDEX IF NOT EXISTS "BatchScanItem_status_idx" ON "BatchScanItem"("status");

ALTER TABLE "BatchScanItem" ADD CONSTRAINT "BatchScanItem_batchId_fkey"
  FOREIGN KEY ("batchId") REFERENCES "BatchScanSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
