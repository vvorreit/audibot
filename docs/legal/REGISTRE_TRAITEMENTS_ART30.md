# Registre des Activités de Traitement — Article 30 RGPD
## AudiBot SAS — Version 1.0 — Mars 2026 — CONFIDENTIEL

---

## Responsable de traitement

| Élément | Détail |
|---|---|
| **Dénomination** | AudiBot SAS |
| **Adresse** | 12 rue de la Paix, 75001 Paris, France |
| **Email DPO** | contact@audibot.fr |
| **Représentant légal** | Vincent Vorreiter, Gérant |

---

## Traitement 1 — Gestion des comptes utilisateurs

| Élément | Détail |
|---|---|
| **Finalité** | Création et gestion des comptes opticiens |
| **Base légale** | Exécution d'un contrat (Art. 6.1.b RGPD) |
| **Catégories de personnes** | Opticiens et employés de cabinets optiques |
| **Données traitées** | Nom, prénom, email professionnel, mot de passe hashé (bcrypt), rôle |
| **Durée de conservation** | Durée de l'abonnement + 3 ans (prescription commerciale) |
| **Destinataires** | AudiBot SAS (accès ADMIN uniquement) |
| **Transfert hors UE** | Non |
| **Sous-traitants** | Scaleway (hébergement, UE), Resend (emails transactionnels) |

---

## Traitement 2 — Assistance OCR à la saisie

| Élément | Détail |
|---|---|
| **Finalité** | Pré-remplissage de formulaires mutuelles via reconnaissance OCR de documents médicaux |
| **Base légale** | Intérêt légitime professionnel (Art. 6.1.f) — l'opticien est responsable de traitement vis-à-vis de ses patients |
| **Catégories de personnes** | Patients des opticiens (tiers indirects) |
| **Données traitées** | NSS, nom, prénom, date de naissance, données d'ordonnance — TRAITEMENT LOCAL UNIQUEMENT |
| **Durée de conservation** | Session locale (TTL 24h, jamais persisté côté serveur AudiBot) |
| **Destinataires** | Opticien utilisateur uniquement (traitement dans son navigateur) |
| **Transfert hors UE** | Non |
| **Sous-traitants** | Aucun (traitement 100% client-side) |
| **DPIA** | Oui — voir DPIA.md |

---

## Traitement 3 — Gestion des abonnements et facturation

| Élément | Détail |
|---|---|
| **Finalité** | Facturation, gestion des abonnements, recouvrement |
| **Base légale** | Exécution d'un contrat (Art. 6.1.b) + obligation légale comptable (Art. 6.1.c) |
| **Catégories de personnes** | Clients (opticiens et structures) |
| **Données traitées** | Email, montants payés, références abonnement, historique de paiement |
| **Durée de conservation** | 10 ans (obligation comptable et fiscale) |
| **Destinataires** | AudiBot SAS, expert-comptable |
| **Transfert hors UE** | Oui — Stripe (USA) avec clauses contractuelles types UE-USA |
| **Sous-traitants** | Stripe Inc. (paiement — DPA en place) |

---

## Traitement 4 — Logs techniques et monitoring

| Élément | Détail |
|---|---|
| **Finalité** | Surveillance des performances, détection d'incidents, amélioration du service |
| **Base légale** | Intérêt légitime (Art. 6.1.f) — sécurité et qualité de service |
| **Catégories de personnes** | Utilisateurs du service et de l'extension |
| **Données traitées** | Adresses IP, user-agent, timestamps, scores OCR anonymisés, statuts d'injection (succès/échec), portail mutuelle |
| **Durée de conservation** | 90 jours glissants |
| **Destinataires** | AudiBot SAS (ADMIN uniquement) |
| **Transfert hors UE** | Non |
| **Sous-traitants** | Scaleway (hébergement logs, UE), Upstash (rate limiting, EU region) |
| **Note** | Aucune donnée patient dans les logs — Privacy by Design |

---

## Traitement 5 — Emails marketing et communication

| Élément | Détail |
|---|---|
| **Finalité** | Emails transactionnels (onboarding, alertes), communication commerciale |
| **Base légale** | Consentement (Art. 6.1.a) pour marketing / Exécution du contrat pour transactionnel |
| **Catégories de personnes** | Clients et prospects |
| **Données traitées** | Email, prénom, plan d'abonnement |
| **Durée de conservation** | Durée de l'abonnement + 3 ans pour clients / 1 an pour prospects |
| **Destinataires** | AudiBot SAS |
| **Transfert hors UE** | Non |
| **Sous-traitants** | Resend (emails, serveurs EU) |

---

## Traitement 6 — Journal d'audit RGPD

| Élément | Détail |
|---|---|
| **Finalité** | Traçabilité des accès et opérations sensibles (login, export, suppression) |
| **Base légale** | Obligation légale (Art. 6.1.c) — RGPD Art. 5.2 (accountability) |
| **Catégories de personnes** | Utilisateurs du service |
| **Données traitées** | ID utilisateur anonymisé, action, IP, timestamp |
| **Durée de conservation** | 1 an |
| **Destinataires** | AudiBot SAS (ADMIN uniquement), CNIL en cas de contrôle |
| **Transfert hors UE** | Non |

---

## Sous-traitants (liste consolidée)

| Sous-traitant | Pays | Traitement | DPA signé |
|---|---|---|---|
| Scaleway | France (UE) | Hébergement infrastructure | Oui |
| Stripe Inc. | USA | Paiement — SCCs en place | Oui |
| Resend Inc. | USA (serveurs EU) | Emails transactionnels | Oui |
| Upstash | UE (eu-west) | Rate limiting Redis | Oui |
| PostHog | UE (EU Cloud) | Analytics (si configuré) | Oui |

---

## Révision du registre

Ce registre doit être mis à jour lors de :
- Tout nouveau traitement de données
- Changement de sous-traitant
- Modification des durées de conservation
- Au minimum annuellement

**Dernière mise à jour : Mars 2026**
**Prochaine révision : Mars 2027**

---

**Dernière révision :** 2026-03-22

*Document confidentiel — Communiquable à la CNIL sur demande*
