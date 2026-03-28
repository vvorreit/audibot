# Cron Jobs OptiBot — Scaleway VPS

> Remplace vercel.json (non utilisé sur le VPS Docker).
> Ces crons sont déclenchés par un appel HTTP GET avec le header Authorization: Bearer $CRON_SECRET.

## Configuration crontab sur le VPS

```bash
crontab -e
```

Ajouter (remplacer https://optibot.fr et votre_secret) :

```cron
# Onboarding J+1 — Rappel installation extension
0 10 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/onboarding-j1

# Onboarding J+3 — Relance si aucun scan
0 9 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/onboarding-j3

# NPS — Satisfaction J+14
0 11 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/onboarding-nps

# Purge logs techniques (90j)
0 3 * * 0 curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/purge-logs

# Purge comptes inactifs 30j (RGPD)
0 2 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/purge-inactive-accounts

# Purge dossiers TP > 3 ans (RGPD)
0 2 1 * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/purge-tp-dossiers

# Relances tiers-payant
0 8 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/relances-tp

# Alertes expiration ordonnances
0 7 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/alertes-expiration

# Alerte limite scans 80% (ESSENTIEL)
0 */4 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/scan-limit-warning

# Cleanup scan sessions expirées
*/15 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/cleanup-scan-sessions

# Stats Smart Fill hebdo (lundi 6h)
0 6 * * 1 curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/smart-fill-stats

# Campagnes email — envoi
* * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/send-campaigns

# Campagnes email — rapport quotidien
0 8 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://optibot.fr/api/cron/campaign-report

# Monitoring infra (containers, RAM, disk)
*/5 * * * * . /etc/optibot-monitor.env && /usr/local/bin/optibot-monitor >> /root/logs/monitor.log 2>&1
```

## Variables d'environnement requises

```bash
export CRON_SECRET=votre_secret_ici
```

Ou mettre dans `/etc/environment` pour que le crontab y ait accès.
