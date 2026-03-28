-- CreateTable
CREATE TABLE "BookmarkletPing" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "portal" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userAgent" TEXT,
    "errorHint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookmarkletPing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookmarkletPing_portal_idx" ON "BookmarkletPing"("portal");
CREATE INDEX "BookmarkletPing_status_idx" ON "BookmarkletPing"("status");
CREATE INDEX "BookmarkletPing_createdAt_idx" ON "BookmarkletPing"("createdAt");
CREATE INDEX "BookmarkletPing_version_idx" ON "BookmarkletPing"("version");
