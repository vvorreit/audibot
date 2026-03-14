# Règles de développement OptiBot

## Prisma & Migrations

### Règle absolue
**Ne jamais créer de migration qui recrée des tables existantes.**
La base de données de production a été provisionnée avant l'introduction des migrations Prisma.
Les tables `User`, `Account`, `Session`, `Team`, `Invitation`, `VerificationToken` existent déjà.

### Ce qu'il faut faire
- Créer une migration uniquement pour les **changements** (ADD COLUMN, CREATE INDEX, ALTER TABLE, etc.)
- Ne jamais écrire `CREATE TABLE` dans une migration — uniquement `ALTER TABLE` ou `CREATE INDEX`
- Toujours utiliser `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` pour les nouvelles colonnes

### Ce qu'il ne faut pas faire
- ❌ Créer une migration "initiale" avec `CREATE TABLE`
- ❌ Utiliser `npx prisma migrate dev` en production
- ❌ Supprimer le dossier `prisma/migrations` pour "repartir de zéro"
- ❌ Ajouter `prisma db push` dans le Dockerfile (risque de data loss)

### Exemple de bonne migration
```sql
-- Ajouter une colonne
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "newField" TEXT;

-- Ajouter un index
CREATE UNIQUE INDEX IF NOT EXISTS "User_newField_key" ON "User"("newField");
```

### Commandes utiles en cas de problème P3009
```bash
# Résoudre une migration échouée
docker exec optibot-app npx prisma migrate resolve --rolled-back <nom_migration>
docker exec optibot-app npx prisma migrate resolve --applied <nom_migration>
```

---

## Docker & Déploiement

- Le déploiement est automatique via GitHub Actions au push sur `main`
- L'image est buildée sur GitHub Actions et poussée sur GHCR (`ghcr.io/vvorreit/optibot`)
- Le serveur tire l'image pré-compilée — il ne build pas localement
- `prisma migrate deploy` tourne au démarrage du conteneur

## Variables d'environnement

- **Jamais** préfixer des credentials avec `NEXT_PUBLIC_` — ils seraient exposés dans le bundle JS
- Les variables serveur uniquement (ex: `LBO_LOGIN`, `LBO_PASSWORD`) restent sans préfixe
- Voir `.env.example` pour la liste complète

## Stack

- **Framework** : Next.js 16 (App Router, standalone output)
- **Auth** : NextAuth v4 avec PrismaAdapter, Google OAuth + Credentials
- **DB** : PostgreSQL via Prisma (docker service `db`)
- **Mail** : nodemailer vers docker-mailserver (service `mailserver`)
- **Paiement** : Stripe (checkout + portal)
- **Infra** : CentOS + Docker Compose + GitHub Actions CI/CD
