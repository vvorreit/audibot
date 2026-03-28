CREATE TABLE IF NOT EXISTS "PatientContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "consentEmail" BOOLEAN NOT NULL DEFAULT false,
    "consentSMS" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "consentSource" TEXT,
    "dossierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatientContact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PatientRappelLog" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'envoye',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatientRappelLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PatientContact_userId_idx" ON "PatientContact"("userId");
CREATE INDEX IF NOT EXISTS "PatientContact_email_idx" ON "PatientContact"("email");
CREATE INDEX IF NOT EXISTS "PatientRappelLog_patientId_idx" ON "PatientRappelLog"("patientId");
CREATE INDEX IF NOT EXISTS "PatientRappelLog_createdAt_idx" ON "PatientRappelLog"("createdAt");

ALTER TABLE "PatientContact" ADD CONSTRAINT "PatientContact_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientRappelLog" ADD CONSTRAINT "PatientRappelLog_patientId_fkey"
  FOREIGN KEY ("patientId") REFERENCES "PatientContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
