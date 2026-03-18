-- Migration: add OCR scoring, onboarding, scan limits, and new models
-- AudiBot: ESSENTIEL/PRO/EQUIPE plans, injection logs, OCR feedback, scan logs, rate limits

-- ============================================================
-- 1. Alter User table — new columns
-- ============================================================

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "monthlyScanCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "monthlyScanResetAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingStep" INTEGER NOT NULL DEFAULT 0;

-- Index on createdAt for cron/onboarding queries
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- ============================================================
-- 2. InjectionLog — tracks extension autofill events
-- ============================================================

CREATE TABLE IF NOT EXISTS "InjectionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "fieldsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InjectionLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InjectionLog_userId_idx" ON "InjectionLog"("userId");
CREATE INDEX IF NOT EXISTS "InjectionLog_createdAt_idx" ON "InjectionLog"("createdAt");

ALTER TABLE "InjectionLog" DROP CONSTRAINT IF EXISTS "InjectionLog_userId_fkey";
ALTER TABLE "InjectionLog" ADD CONSTRAINT "InjectionLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- 3. OcrFeedback — user feedback on OCR quality
-- ============================================================

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

CREATE INDEX IF NOT EXISTS "OcrFeedback_userId_idx" ON "OcrFeedback"("userId");
CREATE INDEX IF NOT EXISTS "OcrFeedback_createdAt_idx" ON "OcrFeedback"("createdAt");

ALTER TABLE "OcrFeedback" DROP CONSTRAINT IF EXISTS "OcrFeedback_userId_fkey";
ALTER TABLE "OcrFeedback" ADD CONSTRAINT "OcrFeedback_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- 4. OcrScanLog — logs each OCR scan with scoring data
-- ============================================================

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

CREATE INDEX IF NOT EXISTS "OcrScanLog_createdAt_idx" ON "OcrScanLog"("createdAt");
CREATE INDEX IF NOT EXISTS "OcrScanLog_type_idx" ON "OcrScanLog"("type");
CREATE INDEX IF NOT EXISTS "OcrScanLog_userId_idx" ON "OcrScanLog"("userId");

ALTER TABLE "OcrScanLog" DROP CONSTRAINT IF EXISTS "OcrScanLog_userId_fkey";
ALTER TABLE "OcrScanLog" ADD CONSTRAINT "OcrScanLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- 5. RateLimit — generic rate limiting table
-- ============================================================

CREATE TABLE IF NOT EXISTS "rate_limits" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("key")
);
