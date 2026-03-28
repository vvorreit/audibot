-- CreateTable
CREATE TABLE IF NOT EXISTS "InjectionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "fieldsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InjectionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "OcrFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OcrFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "InjectionLog_userId_idx" ON "InjectionLog"("userId");
CREATE INDEX IF NOT EXISTS "InjectionLog_createdAt_idx" ON "InjectionLog"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OcrFeedback_userId_idx" ON "OcrFeedback"("userId");
CREATE INDEX IF NOT EXISTS "OcrFeedback_createdAt_idx" ON "OcrFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "InjectionLog" ADD CONSTRAINT "InjectionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcrFeedback" ADD CONSTRAINT "OcrFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
