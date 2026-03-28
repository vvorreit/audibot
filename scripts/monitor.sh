#!/bin/bash
# monitor.sh — Surveillance infra OptiBot
# Cron recommandé : */5 * * * * /app/optibot/scripts/monitor.sh >> /root/logs/monitor.log 2>&1
#
# Vérifie :
#   - État des 3 containers Docker
#   - RAM disponible
#   - Espace disque
#   - Endpoint /api/health
# Envoie un email Resend si un problème est détecté

set -euo pipefail

# ─── Config ────────────────────────────────────────────────────────────────────
RESEND_API_KEY="${RESEND_API_KEY:-}"
ALERT_EMAIL="${ALERT_EMAIL:-contact@optibot.fr}"
FROM_EMAIL="${FROM_EMAIL:-alerts@optibot.fr}"
APP_URL="${APP_URL:-https://optibot.fr}"
HOSTNAME_LABEL=$(hostname)

# Seuils
RAM_WARN_PCT=75
RAM_CRIT_PCT=90
DISK_WARN_PCT=80
DISK_CRIT_PCT=90

CONTAINERS=("optibot-app" "optibot-ocr" "optibot-db")

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
ALERTS=()
SEVERITY="warning"

# ─── Fonctions ─────────────────────────────────────────────────────────────────

send_alert() {
  local subject="$1"
  local body="$2"

  if [ -z "$RESEND_API_KEY" ]; then
    echo "[$TIMESTAMP] ALERTE (no Resend key): $subject"
    return
  fi

  curl -s -X POST "https://api.resend.com/emails" \
    -H "Authorization: Bearer $RESEND_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"from\": \"$FROM_EMAIL\",
      \"to\": [\"$ALERT_EMAIL\"],
      \"subject\": \"$subject\",
      \"html\": \"<pre style='font-family:monospace;'>$body</pre>\"
    }" > /dev/null
}

# ─── 1. Containers Docker ──────────────────────────────────────────────────────
for CONTAINER in "${CONTAINERS[@]}"; do
  STATUS=$(docker inspect --format='{{.State.Status}}' "$CONTAINER" 2>/dev/null || echo "missing")
  if [ "$STATUS" != "running" ]; then
    ALERTS+=("🔴 Container $CONTAINER : $STATUS (attendu: running)")
    SEVERITY="critical"
    echo "[$TIMESTAMP] CRITICAL: Container $CONTAINER est $STATUS"
  else
    echo "[$TIMESTAMP] OK: Container $CONTAINER running"
  fi
done

# ─── 2. RAM ───────────────────────────────────────────────────────────────────
TOTAL_RAM=$(grep MemTotal /proc/meminfo | awk '{print $2}')
FREE_RAM=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
USED_RAM=$((TOTAL_RAM - FREE_RAM))
RAM_PCT=$((USED_RAM * 100 / TOTAL_RAM))
RAM_USED_MB=$((USED_RAM / 1024))
RAM_TOTAL_MB=$((TOTAL_RAM / 1024))

echo "[$TIMESTAMP] RAM: ${RAM_PCT}% utilisé (${RAM_USED_MB}Mo / ${RAM_TOTAL_MB}Mo)"

if [ "$RAM_PCT" -ge "$RAM_CRIT_PCT" ]; then
  ALERTS+=("🔴 RAM critique : ${RAM_PCT}% (${RAM_USED_MB}Mo / ${RAM_TOTAL_MB}Mo)")
  SEVERITY="critical"
elif [ "$RAM_PCT" -ge "$RAM_WARN_PCT" ]; then
  ALERTS+=("🟡 RAM élevée : ${RAM_PCT}% (${RAM_USED_MB}Mo / ${RAM_TOTAL_MB}Mo)")
fi

# ─── 3. Disque ────────────────────────────────────────────────────────────────
DISK_PCT=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
DISK_USED=$(df -h / | tail -1 | awk '{print $3}')
DISK_TOTAL=$(df -h / | tail -1 | awk '{print $2}')

echo "[$TIMESTAMP] Disk: ${DISK_PCT}% utilisé (${DISK_USED} / ${DISK_TOTAL})"

if [ "$DISK_PCT" -ge "$DISK_CRIT_PCT" ]; then
  ALERTS+=("🔴 Disque critique : ${DISK_PCT}% (${DISK_USED} / ${DISK_TOTAL})")
  SEVERITY="critical"
elif [ "$DISK_PCT" -ge "$DISK_WARN_PCT" ]; then
  ALERTS+=("🟡 Disque élevé : ${DISK_PCT}% (${DISK_USED} / ${DISK_TOTAL})")
fi

# ─── 4. Endpoint /api/health ──────────────────────────────────────────────────
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$APP_URL/api/health" 2>/dev/null || echo "000")

echo "[$TIMESTAMP] HTTP /api/health: $HTTP_CODE"

if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "503" ]; then
  ALERTS+=("🔴 /api/health inaccessible (HTTP $HTTP_CODE)")
  SEVERITY="critical"
elif [ "$HTTP_CODE" = "503" ]; then
  ALERTS+=("🟡 /api/health retourne 503 (service dégradé)")
fi

# ─── Envoi alerte si nécessaire ───────────────────────────────────────────────
if [ ${#ALERTS[@]} -gt 0 ]; then
  EMOJI="⚠️"
  [ "$SEVERITY" = "critical" ] && EMOJI="🚨"

  SUBJECT="$EMOJI [OptiBot] Alerte infra — $HOSTNAME_LABEL"
  BODY="Timestamp: $TIMESTAMP\nServeur: $HOSTNAME_LABEL\n\nProblèmes détectés:\n"
  for ALERT in "${ALERTS[@]}"; do
    BODY+="• $ALERT\n"
  done
  BODY+="\nRAM: ${RAM_PCT}% (${RAM_USED_MB}Mo / ${RAM_TOTAL_MB}Mo)"
  BODY+="\nDisk: ${DISK_PCT}% (${DISK_USED} / ${DISK_TOTAL})"
  BODY+="\nHealth: HTTP $HTTP_CODE"
  BODY+="\n\nVoir: $APP_URL/admin"

  send_alert "$SUBJECT" "$BODY"
  echo "[$TIMESTAMP] Alerte envoyée à $ALERT_EMAIL"
else
  echo "[$TIMESTAMP] Tout OK. RAM: ${RAM_PCT}%, Disk: ${DISK_PCT}%, HTTP: $HTTP_CODE"
fi
