CREATE TABLE IF NOT EXISTS "MutuelleEmailConfig" (
    "id" TEXT NOT NULL,
    "mutuelle" "Mutuelle" NOT NULL,
    "emailDefaut" TEXT NOT NULL,
    "emailPerso" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MutuelleEmailConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MutuelleEmailConfig_mutuelle_key" ON "MutuelleEmailConfig"("mutuelle");

INSERT INTO "MutuelleEmailConfig" ("id", "mutuelle", "emailDefaut", "actif", "updatedAt") VALUES
  (gen_random_uuid()::text, 'CPAM', 'reclamation@assurance-maladie.fr', true, NOW()),
  (gen_random_uuid()::text, 'ALMERYS', 'gestiontp@almerys.com', true, NOW()),
  (gen_random_uuid()::text, 'VIAMEDIS', 'optique@viamedis.net', true, NOW()),
  (gen_random_uuid()::text, 'ITELIS', 'service-optique@itelis.fr', true, NOW()),
  (gen_random_uuid()::text, 'KALIXIA', 'gestion@kalixia.com', true, NOW()),
  (gen_random_uuid()::text, 'CARTE_BLANCHE', 'tierspayant@carte-blanche.com', true, NOW()),
  (gen_random_uuid()::text, 'SANTECLAIR', 'optique@santeclair.fr', true, NOW()),
  (gen_random_uuid()::text, 'SEVEANE', 'gestion@seveane.com', true, NOW()),
  (gen_random_uuid()::text, 'SP_SANTE', 'tp@sp-sante.fr', true, NOW()),
  (gen_random_uuid()::text, 'AUTRE', '', false, NOW())
ON CONFLICT ("mutuelle") DO NOTHING;
