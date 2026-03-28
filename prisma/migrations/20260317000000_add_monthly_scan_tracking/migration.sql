-- AlterTable: add monthly scan tracking for ESSENTIEL plan limit
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "monthlyScanCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "monthlyScanResetAt" TIMESTAMP(3);
