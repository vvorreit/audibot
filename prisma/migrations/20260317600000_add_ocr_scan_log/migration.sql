-- CreateTable
CREATE TABLE IF NOT EXISTS "OcrScanLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ocrConfidence" DOUBLE PRECISION NOT NULL,
    "dataScore" DOUBLE PRECISION NOT NULL,
    "globalScore" DOUBLE PRECISION NOT NULL,
    "level" TEXT NOT NULL,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OcrScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OcrScanLog_createdAt_idx" ON "OcrScanLog"("createdAt");
CREATE INDEX IF NOT EXISTS "OcrScanLog_type_idx" ON "OcrScanLog"("type");
CREATE INDEX IF NOT EXISTS "OcrScanLog_userId_idx" ON "OcrScanLog"("userId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "OcrScanLog" ADD CONSTRAINT "OcrScanLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
