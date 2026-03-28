# Analyse d'Impact relative à la Protection des Données (AIPD / DPIA)
## OptiBot — Traitement des données de santé via OCR
### Version 1.0 — Mars 2026 — CONFIDENTIEL — USAGE INTERNE UNIQUEMENT

---

## 1. Contexte et nécessité de la DPIA

Conformément à l'Article 35 du RGPD et aux lignes directrices de la CNIL, une DPIA est obligatoire
pour tout traitement susceptible d'engendrer un risque élevé pour les droits et libertés des personnes,
notamment pour le traitement de données de santé (Article 9 RGPD).

**OptiBot traite des données de santé** via OCR de documents médicaux (ordonnances, cartes de mutuelle) :
numéro de sécurité sociale, données de prescription optique, informations de couverture maladie.

---

## 2. Description du traitement

| Élément | Détail |
|---|---|
| **Responsable de traitement** | OptiBot SAS |
| **Finalité** | Assistance à la saisie pour opticiens — pré-remplissage de formulaires mutuelles via OCR |
| **Base légale** | Intérêt légitime professionnel (Art. 6.1.f) + consentement de l'opticien (Art. 9.2.a) |
| **Catégories de données** | NSS, nom, prénom, date de naissance, données d'ordonnance optique, données mutuelle |
| **Personnes concernées** | Patients des opticiens utilisateurs d'OptiBot |
| **Volume estimé** | Traitement local — pas de stockage centralisé des données patient |
| **Durée de conservation** | Session locale uniquement (TTL 24h dans l'extension, jamais en base de données) |
| **Sous-traitants** | Voir Registre des Traitements |

---

## 3. Mesures de protection implémentées

### 3.1 Privacy by Design
- **Traitement 100% local** : l'OCR s'exécute dans le navigateur de l'opticien (Tesseract.js côté client)
- **Zéro stockage serveur** des données patient : aucun champ nominatif en base de données
- **Logs anonymisés** : seuls les méta-données techniques sont conservées (type de document, score OCR, succès/échec)
- **Chiffrement AES-256-GCM** dans l'extension Chrome avec clé dérivée PBKDF2 (310 000 itérations)

### 3.2 Minimisation des données
- Seules les données nécessaires au pré-remplissage sont extraites
- Les champs `rawText` de l'OCR ne sont jamais persistés côté serveur
- Référence interne anonyme (`TP-2026-XXXX`) en lieu et place des données nominatives

### 3.3 Contrôle d'accès
- Authentification par token unique par opticien (syncToken)
- Verrouillage automatique de l'extension après 15 min d'inactivité
- Rate limiting sur toutes les API
- Sessions chiffrées JWT côté serveur

### 3.4 Droits des personnes concernées
- Les patients n'interagissent pas directement avec OptiBot
- Les opticiens (responsables de traitement vis-à-vis de leurs patients) peuvent effacer les données locales à tout moment
- Aucune donnée patient persistée côté serveur → pas de données à exporter/supprimer côté OptiBot

---

## 4. Analyse des risques

| Risque | Probabilité | Impact | Mesure de mitigation |
|---|---|---|---|
| Fuite de données patient via un serveur compromis | **Faible** — pas de stockage | Élevé | Architecture client-side : pas de données côté serveur |
| Accès non autorisé au navigateur de l'opticien | Moyen | Élevé | Chiffrement local + verrouillage 15 min |
| Interception des données entre client et portail mutuelle | Faible | Élevé | HTTPS obligatoire, pas de transit des données patient |
| Erreur OCR menant à une mauvaise saisie | Moyen | Moyen | Score OCR affiché, validation manuelle obligatoire par l'opticien |
| Extension compromise par mise à jour malveillante | Faible | Élevé | Self-hosted CRX + vérification d'intégrité |
| Utilisation abusive par un employé de la société | Faible | Élevé | Logs anonymisés — pas d'accès aux données patient en interne |

---

## 5. Consultation de la CNIL

Conformément à l'Art. 36 RGPD, une consultation préalable de la CNIL est requise si les risques résiduels
restent élevés après mesures. **Évaluation : risques résiduels FAIBLES** grâce à l'architecture client-side.
Une consultation n'est pas nécessaire à ce stade.

---

## 6. Révision

Cette DPIA doit être révisée :
- Lors de tout changement architectural majeur (ex: stockage serveur des données patient)
- Tous les 2 ans minimum
- En cas de contrôle CNIL ou incident de sécurité

**Prochaine révision prévue : Mars 2028**

---

## 7. Approbation

| Rôle | Nom | Date | Signature |
|---|---|---|---|
| Responsable de traitement | Vincent Vorreiter — contact@optibot.fr | Mars 2026 | |
| DPO (si désigné) | Non désigné (moins de 250 salariés) — contact@optibot.fr | Mars 2026 | |

---

**Dernière révision :** 2026-03-22

*Document confidentiel — Ne pas diffuser publiquement*
