# Procédure de Gestion d'Incident RGPD — Articles 33 et 34
## AudiBot SAS — Version 1.0 — Mars 2026 — CONFIDENTIEL

---

## 1. Détection et première réaction (H+0 à H+2)

**Checklist immédiate :**

- [ ] Identifier la source et la nature de l'incident (fuite, accès non autorisé, perte, altération)
- [ ] Isoler le système compromis (couper l'accès réseau, désactiver le service si nécessaire)
- [ ] Notifier le responsable de traitement (contact@audibot.fr)
- [ ] Ouvrir un ticket horodaté avec description détaillée de l'incident
- [ ] **NE PAS supprimer les logs** — ils constituent des preuves essentielles

**Informations à collecter immédiatement :**
- Date et heure de détection
- Date et heure estimée du début de l'incident
- Systèmes affectés
- Données potentiellement concernées
- Nombre de personnes potentiellement affectées
- Actions déjà prises

---

## 2. Qualification de l'incident

### Incident mineur
- Pas de données personnelles compromises
- Incident contenu rapidement sans impact externe
- **Action** : documentation interne, pas de notification CNIL

### Incident grave
- Données personnelles compromises (accès, fuite, perte)
- Impact potentiel sur les droits et libertés des personnes
- **Action** : notification CNIL obligatoire dans les 72h (Art. 33)

> **IMPORTANT : Données de santé = TOUJOURS incident grave.**
> Toute violation impliquant des données de santé (NSS, ordonnances, données médicales) est automatiquement qualifiée de grave et nécessite une notification CNIL.

---

## 3. Notification CNIL — Article 33 (dans les 72h)

### Canal de notification
- **Formulaire en ligne** : https://notifications.cnil.fr/notifications/index
- **Email** : notifications@cnil.fr
- **Délai** : 72 heures maximum après constatation de la violation

### Informations à fournir

1. **Nature de la violation** : description de la violation, catégories et nombre approximatif de personnes concernées, catégories et nombre approximatif d'enregistrements de données concernés
2. **Coordonnées du point de contact** : nom et coordonnées du DPO ou autre point de contact (contact@audibot.fr)
3. **Conséquences probables** : description des conséquences probables de la violation
4. **Mesures prises** : description des mesures prises ou envisagées pour remédier à la violation, y compris les mesures pour en atténuer les effets négatifs

### En cas de notification incomplète
Si toutes les informations ne sont pas disponibles dans les 72h, une notification initiale peut être faite, complétée ultérieurement par des informations supplémentaires.

---

## 4. Notification des personnes concernées — Article 34

### Quand notifier ?
La notification aux personnes concernées est obligatoire lorsque la violation est susceptible d'engendrer un **risque élevé** pour leurs droits et libertés.

### Template email de notification

**Objet** : [Important] Incident de sécurité — AudiBot

**Corps** :

```
Madame, Monsieur,

Nous vous informons qu'un incident de sécurité a été détecté le [DATE DE L'INCIDENT] sur notre plateforme AudiBot.

**Données concernées :** [DESCRIPTION DES DONNÉES CONCERNÉES]

**Risques potentiels :** [DESCRIPTION DES RISQUES]

**Mesures prises :**
- [MESURE 1]
- [MESURE 2]
- [MESURE 3]

**Recommandations :**
- Changez votre mot de passe AudiBot immédiatement
- Surveillez toute activité suspecte sur vos comptes
- [AUTRES RECOMMANDATIONS SPÉCIFIQUES]

Pour toute question, contactez-nous à contact@audibot.fr.

La CNIL a été notifiée conformément à l'Article 33 du RGPD.

Cordialement,
L'équipe AudiBot
contact@audibot.fr
```

---

## 5. Contacts urgence

| Rôle | Contact | Détail |
|---|---|---|
| **CNIL — Notifications** | notifications@cnil.fr | Formulaire : https://notifications.cnil.fr/notifications/index |
| **CNIL — Standard** | 01 53 73 22 22 | Horaires ouvrables |
| **Responsable de traitement** | contact@audibot.fr | Vincent Vorreiter |
| **Hébergeur — Scaleway** | support.scaleway.com | Support technique infrastructure |

---

## 6. Post-incident

### Actions obligatoires après résolution

1. **Rapport interne** : rédiger un rapport détaillé de l'incident (chronologie, cause racine, impact, mesures correctives)
2. **Mise à jour du registre** : mettre à jour le registre des violations de données (obligatoire même pour les incidents mineurs — Art. 33.5)
3. **Audit de sécurité** : réaliser un audit de sécurité dans les 30 jours suivant l'incident
4. **Information des sous-traitants** : notifier les sous-traitants concernés (Scaleway, Stripe, Resend) si nécessaire
5. **Mise à jour des procédures** : adapter les mesures de sécurité si des failles ont été identifiées
6. **Retour d'expérience** : organiser un retour d'expérience pour prévenir la récurrence

### Documentation à conserver
- Registre des violations (conservé 5 ans minimum)
- Rapport d'incident complet
- Preuves de notification CNIL (accusé de réception)
- Preuves de notification des personnes concernées
- Plan d'actions correctives et suivi

---

**Dernière révision :** 2026-03-22

*Document confidentiel — Usage interne uniquement*
