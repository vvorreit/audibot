-- CreateTable
CREATE TABLE IF NOT EXISTS "PortalSelectorOverride" (
    "id" TEXT NOT NULL,
    "portal" TEXT NOT NULL,
    "selectorName" TEXT NOT NULL,
    "selector" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PortalSelectorOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PortalSelectorOverride_portal_selectorName_key" ON "PortalSelectorOverride"("portal", "selectorName");
CREATE INDEX IF NOT EXISTS "PortalSelectorOverride_portal_idx" ON "PortalSelectorOverride"("portal");
CREATE INDEX IF NOT EXISTS "PortalSelectorOverride_enabled_idx" ON "PortalSelectorOverride"("enabled");
