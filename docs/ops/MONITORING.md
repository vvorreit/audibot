# Monitoring OptiBot — Guide complet

## Stack recommandée (100% gratuit)

| Couche | Outil | Rôle |
|---|---|---|
| Uptime externe | UptimeRobot | Ping HTTP depuis l'extérieur |
| Erreurs app | Sentry | Stacktraces Next.js/API |
| Métriques VPS | Netdata | CPU, RAM, disk, containers |
| Alertes custom | scripts/monitor.sh | RAM, disk, containers, health |

---

## 1. UptimeRobot (5 min)

1. Créer un compte sur https://uptimerobot.com
2. "Add New Monitor" → HTTP(s)
3. URL : `https://optibot.fr/api/health`
4. Fréquence : 5 minutes
5. Alert Contact : votre email
6. "Create Monitor"

Le endpoint retourne HTTP 200 si tout est OK, HTTP 503 si la DB est down.
UptimeRobot alerte automatiquement par email si down > 2 minutes.

---

## 2. Sentry (10 min)

1. Créer un compte sur https://sentry.io (plan Developer = gratuit, 5k erreurs/mois)
2. Créer un projet → Next.js
3. Copier le DSN
4. Ajouter dans les variables d'env sur le serveur :

```bash
# Dans /app/optibot/.env ou via docker-compose environment
SENTRY_DSN=https://xxx@ooo.ingest.sentry.io/yyy
NEXT_PUBLIC_SENTRY_DSN=https://xxx@ooo.ingest.sentry.io/yyy
```

5. Redéployer
6. Dans Sentry → Alerts → créer une règle :
   - "Any new issue" → email immédiat
   - "Issue seen > 10 times in 1 hour" → email

---

## 3. Netdata (1 commande)

```bash
# Sur le VPS
curl https://my-netdata.io/kickstart.sh | bash

# Accès dashboard local (tunnel SSH)
ssh -L 19999:localhost:19999 root@optibot
# Ouvrir http://localhost:19999
```

Netdata détecte automatiquement les containers Docker et affiche :
- CPU par container
- RAM par container
- Réseau
- I/O disque

Alertes intégrées : CPU > 80%, RAM > 90%, disk > 85% → email/Slack/webhook.

---

## 4. Script monitor.sh (cron toutes les 5 min)

Le script `scripts/monitor.sh` vérifie :
- État des 3 containers Docker (optibot-app, optibot-ocr, optibot-db)
- RAM (warning > 75%, critique > 90%)
- Disque (warning > 80%, critique > 90%)
- Endpoint `/api/health` (HTTP 200 attendu)

### Installation sur le VPS

```bash
# Copier le script
cp /app/optibot/scripts/monitor.sh /usr/local/bin/optibot-monitor
chmod +x /usr/local/bin/optibot-monitor

# Créer le dossier de logs
mkdir -p /root/logs

# Ajouter au crontab
crontab -e
```

Ajouter cette ligne dans le crontab :
```
*/5 * * * * RESEND_API_KEY=votre_clé ALERT_EMAIL=contact@optibot.fr APP_URL=https://optibot.fr /usr/local/bin/optibot-monitor >> /root/logs/monitor.log 2>&1
```

Ou créer un fichier `/etc/optibot-monitor.env` :
```bash
RESEND_API_KEY=re_xxxxx
ALERT_EMAIL=contact@optibot.fr
FROM_EMAIL=alerts@optibot.fr
APP_URL=https://optibot.fr
```

Et le crontab :
```
*/5 * * * * . /etc/optibot-monitor.env && /usr/local/bin/optibot-monitor >> /root/logs/monitor.log 2>&1
```

### Vérification manuelle

```bash
# Tester le script
RESEND_API_KEY=re_xxx ALERT_EMAIL=ton@email.fr APP_URL=https://optibot.fr /usr/local/bin/optibot-monitor

# Voir les logs
tail -f /root/logs/monitor.log
```

---

## 5. Endpoint /api/health

Retourne :
```json
{
  "status": "operational",
  "services": [
    { "name": "database", "status": "operational", "latencyMs": 3 },
    { "name": "api", "status": "operational" },
    { "name": "ocr", "status": "operational", "note": "PaddleOCR actif" }
  ],
  "system": {
    "ram": { "usedPct": 45, "usedMb": 921, "totalMb": 2048, "status": "ok" },
    "cpu": { "loadAvg1m": 0.12, "usedPct": 6, "status": "ok" },
    "uptime": "72h"
  },
  "checkedAt": "2026-03-26T18:00:00.000Z"
}
```

Codes HTTP :
- `200` : tout opérationnel ou dégradé (OCR fallback)
- `503` : DB down

---

## Résumé des seuils d'alerte

| Métrique | Warning | Critique |
|---|---|---|
| RAM | > 75% | > 90% |
| Disque | > 80% | > 90% |
| CPU load | > 70% | > 90% |
| Container down | — | immédiat |
| HTTP health | 503 | timeout/erreur |
