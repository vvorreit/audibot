#!/bin/bash
# collect-logs.sh — Dumpe les logs des 3 containers dans /root/logs/
# Usage : ./scripts/collect-logs.sh [lignes]
# Ex    : ./scripts/collect-logs.sh 500

LINES=${1:-200}
LOG_DIR="/root/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$LOG_DIR"

echo "══════════════════════════════════════════"
echo " OptiBot — Collecte logs ($LINES lignes)"
echo " → $LOG_DIR/"
echo "══════════════════════════════════════════"

for CONTAINER in optibot-app optibot-ocr optibot-db; do
  OUT="$LOG_DIR/${CONTAINER}_${TIMESTAMP}.log"
  echo ""
  echo "▸ $CONTAINER → $OUT"
  docker logs "$CONTAINER" --tail "$LINES" --timestamps > "$OUT" 2>&1
  echo "  $(wc -l < "$OUT") lignes"
done

# Fichier combiné pour debug rapide
COMBINED="$LOG_DIR/combined_${TIMESTAMP}.log"
echo "" > "$COMBINED"
for CONTAINER in optibot-app optibot-ocr optibot-db; do
  echo "════ $CONTAINER ════" >> "$COMBINED"
  docker logs "$CONTAINER" --tail "$LINES" --timestamps >> "$COMBINED" 2>&1
  echo "" >> "$COMBINED"
done

echo ""
echo "✓ Logs combinés : $COMBINED"
echo ""
echo "Pour suivre en live :"
echo "  docker logs optibot-app -f --tail 50"
echo "  docker logs optibot-ocr -f --tail 50"
echo "  docker logs optibot-db  -f --tail 50"
