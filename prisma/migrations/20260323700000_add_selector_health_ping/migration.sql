-- CreateTable
CREATE TABLE IF NOT EXISTS "SelectorHealthPing" (
    "id" TEXT NOT NULL,
    "portal" TEXT NOT NULL,
    "selectorName" TEXT NOT NULL,
    "found" BOOLEAN NOT NULL,
    "userId" TEXT,
    "url" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SelectorHealthPing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SelectorHealthPing_portal_idx" ON "SelectorHealthPing"("portal");
CREATE INDEX IF NOT EXISTS "SelectorHealthPing_selectorName_idx" ON "SelectorHealthPing"("selectorName");
CREATE INDEX IF NOT EXISTS "SelectorHealthPing_found_idx" ON "SelectorHealthPing"("found");
CREATE INDEX IF NOT EXISTS "SelectorHealthPing_createdAt_idx" ON "SelectorHealthPing"("createdAt");
CREATE INDEX IF NOT EXISTS "SelectorHealthPing_portal_selectorName_createdAt_idx" ON "SelectorHealthPing"("portal", "selectorName", "createdAt");
