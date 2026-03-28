-- CreateTable
CREATE TABLE IF NOT EXISTS "ExtensionEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExtensionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExtensionEvent_userId_delivered_idx" ON "ExtensionEvent"("userId", "delivered");
CREATE INDEX IF NOT EXISTS "ExtensionEvent_expiresAt_idx" ON "ExtensionEvent"("expiresAt");
CREATE INDEX IF NOT EXISTS "ExtensionEvent_createdAt_idx" ON "ExtensionEvent"("createdAt");
