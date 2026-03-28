# SYNC_POLICY.md — Politique de synchronisation multi-produits

---

## ⚠️ Zero Downtime — Règle absolue

**Aucune interruption de service lors d'un déploiement.**

```bash
# ✅ Correct — rolling restart, zéro interruption
docker compose build app
docker compose up -d --no-deps app

# ❌ Interdit — coupe le service
docker compose down && docker compose up -d
```

Migrations Prisma AVANT le restart :
```bash
docker compose exec app npx prisma migrate deploy
docker compose up -d --no-deps app
```

---

> ⚠️ Ce fichier est impératif. Toute IA travaillant sur ce repo DOIT le lire avant toute modification.

---

## Architecture multi-produits

OptiBot est le **repo principal** (source of truth).
AudiBot (`~/coffeeProject/audibot`) et DentiBot (`~/coffeeProject/dentiBot`) sont des forks.

```
OptiBot (source)
    ├── AudiBot (fork — audioprothésistes)
    └── DentiBot (fork — chirurgiens-dentistes)
```

---

## Règle de synchronisation

**Toute modification non-métier sur OptiBot DOIT être propagée sur AudiBot et DentiBot.**

### Ce qui DOIT être synchronisé (infra / générique)

- Corrections de bugs (sécurité, RGPD, performance)
- Composants UI partagés (NavMenu, AdminNav, PlanWidget, etc.)
- Pages admin (admin/emails, admin/campagnes, admin/audit, admin/inbox...)
- Lib partagées (mailer.ts, stripe.ts, auth.ts, imap.ts, brand.ts...)
- Schéma Prisma (modèles communs : User, Team, OcrScanLog, EmailCampaign...)
- Docker, CI/CD, .env.example
- Dépendances npm (package.json)
- Sécurité (CRON_SECRET, HMAC, checkAdmin...)

### Ce qui NE DOIT PAS être synchronisé (spécifique métier)

- Contenu marketing (homepage, pricing, fonctionnalités...)
- Lexique métier (ordonnance/prescription/feuille de soins)
- Portails RPA (Almerys, Wemind = optique/audio ; CCAM = dentaire)
- Branding (couleurs, logo, nom du produit)
- Plans tarifaires spécifiques
- Pages portails (`/portails`, `/mutuelles`)

---

## Procédure de synchronisation

Après chaque commit non-métier sur OptiBot :

```bash
# 1. Identifier les fichiers modifiés
git diff HEAD~1 --name-only

# 2. Copier vers AudiBot
cd ~/coffeeProject/audibot
git checkout -b sync/optibot-YYYY-MM-DD
# Copier les fichiers concernés depuis OptiBot
cp ~/coffeeProject/optiBot/FICHIER_MODIFIE ./FICHIER_MODIFIE
git add . && git commit -m "sync: propagate [description] from OptiBot"
git push

# 3. Copier vers DentiBot
cd ~/coffeeProject/dentiBot
git checkout -b sync/optibot-YYYY-MM-DD
cp ~/coffeeProject/optiBot/FICHIER_MODIFIE ./FICHIER_MODIFIE
git add . && git commit -m "sync: propagate [description] from OptiBot"
git push
```

---

## Fichiers à toujours synchroniser (liste exhaustive)

```
lib/auth.ts
lib/mailer.ts
lib/stripe.ts
lib/brand.ts          ← ajouter le nouveau brand, pas remplacer les existants
lib/imap.ts
lib/adminAudit.ts
lib/safeCompare.ts
lib/email-tracking.ts
lib/rateLimit.ts
lib/db.ts
components/NavMenu.tsx
components/AdminNav.tsx
components/PlanWidget.tsx
components/AppFooter.tsx
app/admin/             ← toutes les pages admin sauf métier-spécifique
app/api/admin/         ← toutes les routes admin
app/api/cron/          ← tous les crons génériques
app/api/track/         ← tracking emails
app/api/webhook/       ← webhook Stripe
app/api/user/          ← gestion compte
app/actions/legal.ts
docker-compose.yml
.env.example
next.config.ts
prisma/schema.prisma   ← modèles communs uniquement
```

---

## Convention de commit pour les syncs

```
sync: [description courte] from OptiBot
```

Exemple :
```
sync: fix open redirect in track/click from OptiBot
sync: admin inbox IMAP from OptiBot
sync: add AdminNav shared component from OptiBot
```

---

## Responsabilité

L'IA qui effectue une modification sur OptiBot est responsable de la propagation immédiate sur AudiBot et DentiBot avant de clore la tâche.

**Ne jamais clore une tâche infra sans avoir synchronisé les 3 repos.**
