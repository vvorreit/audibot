-- CreateTable EmailUnsubscribe — RGPD unsubscribe list
CREATE TABLE IF NOT EXISTS "EmailUnsubscribe" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "unsubscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "EmailUnsubscribe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EmailUnsubscribe_email_key" ON "EmailUnsubscribe"("email");
CREATE INDEX IF NOT EXISTS "EmailUnsubscribe_email_idx" ON "EmailUnsubscribe"("email");
