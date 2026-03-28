-- CreateTable (safe: table does not exist yet)
CREATE TABLE "ChurnReason" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "comment" TEXT,
    "plan" TEXT NOT NULL,
    "retained" BOOLEAN NOT NULL DEFAULT false,
    "retentionOffer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChurnReason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChurnReason_reason_idx" ON "ChurnReason"("reason");
CREATE INDEX "ChurnReason_retained_idx" ON "ChurnReason"("retained");
CREATE INDEX "ChurnReason_createdAt_idx" ON "ChurnReason"("createdAt");

-- AddForeignKey
ALTER TABLE "ChurnReason" ADD CONSTRAINT "ChurnReason_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
