#!/bin/bash
set -e

# ═══════════════════════════════════════════════════════════════
# OptiBot — Déploiement local (contourne GitHub Actions)
#
# 1. Build Next.js sur Mac (natif, rapide)
# 2. Package dans une image Docker amd64 (pas de build Node dans Docker)
# 3. Push sur GHCR
# 4. Le serveur pull + restart comme d'habitude
#
# Prérequis une seule fois :
#   docker login ghcr.io -u vvorreit
#   (Personal Access Token → scope packages:write)
#
#   ~/.ssh/config :
#     Host optibot
#       HostName TON_IP
#       User TON_USER
#       IdentityFile ~/.ssh/id_ed25519
#
# Usage :
#   ./scripts/deploy-local.sh
# ═══════════════════════════════════════════════════════════════

IMAGE="ghcr.io/vvorreit/optibot"
TAG="latest"
# Toujours s'exécuter depuis la racine du repo (peu importe d'où le script est lancé)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

SHA_TAG="$(git rev-parse --short HEAD)"
STAGING="/tmp/optibot-deploy-$$"

cleanup() { rm -rf "$STAGING" 2>/dev/null; }
trap cleanup EXIT

echo ""
echo "══════════════════════════════════════════"
echo "  OptiBot — Build local & push GHCR"
echo "  commit: ${SHA_TAG}"
echo "══════════════════════════════════════════"
echo ""

# ── 1. Git : vérifier état propre ─────────────────────────────
if ! git diff --quiet HEAD 2>/dev/null; then
  echo "▸ Changements non committés détectés :"
  git status --short
  echo ""
  echo "  Committe et relance le script."
  exit 1
fi

if [ "$(git rev-parse HEAD)" != "$(git rev-parse @{u} 2>/dev/null)" ] 2>/dev/null; then
  echo "▸ Push des commits locaux..."
  git push
  echo "  ✓ Code pushé"
  echo ""
fi

# ── 2. Vérifier la connexion GHCR ────────────────────────────
echo "▸ Vérification connexion GHCR..."
if ! cat ~/.docker/config.json 2>/dev/null | grep -q "ghcr.io"; then
  echo "  ⚠ Pas connecté à GHCR."
  echo "  → Lance : docker login ghcr.io -u vvorreit"
  echo "  → Utilise un Personal Access Token (Settings > Developer > Tokens > packages:write)"
  exit 1
fi
echo "  ✓ GHCR OK"

# ── 3. Build Next.js en local (natif arm64, rapide) ──────────
echo ""
echo "▸ Build Next.js en local..."
npm run build
echo "  ✓ Build OK"

# ── 4. Préparer le staging (copie sélective, pas de .dockerignore) ──
echo ""
echo "▸ Préparation du contexte Docker..."
mkdir -p "$STAGING"

cp -R .next/standalone/. "$STAGING/"
cp -R .next/static "$STAGING/.next/static"
cp -R public "$STAGING/public"
cp -R prisma "$STAGING/prisma"
cp prisma.config.ts "$STAGING/prisma.config.ts"
cp package.json "$STAGING/package.json"
cp package-lock.json "$STAGING/package-lock.json"

# Dockerfile : repart de l'image GHCR existante (node:20-alpine déjà dedans)
# Le dossier staging a déjà le contenu de .next/standalone/ à la racine
cat > "$STAGING/Dockerfile" << 'DKFILE'
FROM ghcr.io/vvorreit/optibot:latest

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Repasser en root pour copier et corriger les permissions
USER root
WORKDIR /app

# Ecraser le build existant avec le nouveau (staging = contenu standalone + assets)
COPY . ./

# Permissions correctes sur tous les fichiers copiés
RUN chown -R nextjs:nodejs /app

# Repasser en user applicatif
USER nextjs

EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node server.js"]
DKFILE

echo "  ✓ Contexte prêt ($(du -sh "$STAGING" | cut -f1))"

# ── 5. Build image amd64 + push GHCR ─────────────────────────
# Pas de build Node dans Docker → QEMU ne fait que des COPY → OK
echo ""
echo "▸ Build image Docker (amd64) + push GHCR..."
docker buildx build \
  --platform linux/amd64 \
  --tag "${IMAGE}:${TAG}" \
  --tag "${IMAGE}:${SHA_TAG}" \
  --cache-from "type=registry,ref=${IMAGE}:latest" \
  --push \
  "$STAGING"

echo "  ✓ Image pushée : ${IMAGE}:${TAG} + :${SHA_TAG}"

# ── 5b. Build image OCR (PaddleOCR) si changements ───────────
IMAGE_OCR="ghcr.io/vvorreit/optibot-ocr"

OCR_CHANGED=false
if git diff HEAD~1 --name-only 2>/dev/null | grep -q "ocr-service/"; then
  OCR_CHANGED=true
fi

if [ "$OCR_CHANGED" = "true" ]; then
  echo ""
  echo "▸ Changements détectés dans ocr-service/ — build image OCR..."
  docker buildx build \
    --platform linux/amd64 \
    --tag "${IMAGE_OCR}:latest" \
    --tag "${IMAGE_OCR}:${SHA_TAG}" \
    --cache-from "type=registry,ref=${IMAGE_OCR}:latest" \
    --push \
    "./ocr-service"
  echo "  ✓ Image OCR pushée : ${IMAGE_OCR}:latest"
else
  echo ""
  echo "▸ Pas de changement dans ocr-service/ — skip build OCR (réutilisation image existante)"
fi

# ── 6. Déploiement serveur via SSH ────────────────────────────
echo ""
echo "▸ Déploiement sur le serveur..."

if ! ssh -o ConnectTimeout=10 -o BatchMode=yes optibot "echo ok" > /dev/null 2>&1; then
  echo ""
  echo "  ⚠ Impossible de se connecter via SSH (Host 'optibot')."
  echo ""
  echo "  L'image est sur GHCR. Finis manuellement :"
  echo "    ssh ton-serveur"
  echo "    cd /app/optibot && docker compose pull app ocr && docker compose up -d --no-build app ocr"
  exit 0
fi

ssh optibot << 'REMOTE'
  set -e
  cd /app/optibot

  echo "  → git pull..."
  git pull origin main 2>/dev/null || true

  echo "  → docker compose pull (app + ocr)..."
  docker compose pull app ocr

  echo "  → redémarrage conteneurs..."
  docker compose up -d --no-build app ocr

  echo "  → migrations Prisma..."
  docker exec optibot-app npx prisma migrate deploy 2>/dev/null || true

  echo "  → nettoyage images..."
  docker image prune -f > /dev/null 2>&1

  # Santé
  sleep 3
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo "  ✓ Serveur OK (HTTP 200)"
  else
    echo "  ⚠ Serveur HTTP $STATUS — vérifie : docker compose logs --tail=20 app"
  fi
REMOTE

echo ""
echo "══════════════════════════════════════════"
echo "  ✅ Déploiement terminé !"
echo "  Image : ${IMAGE}:${SHA_TAG}"
echo "══════════════════════════════════════════"
echo ""
