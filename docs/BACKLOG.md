# BACKLOG OptiBot

> Idées et évolutions validées mais non prioritaires.
> Priorisation RICE à réviser à chaque sprint planning.

---

## 🔌 Extension Chrome

### [EXT-01] KPIs par mode de remplissage (Smart Fill / Bot / Recorder)

**Priorité :** Medium — nécessaire pour comprendre l'usage réel et détecter les portails cassés  
**Effort estimé :** 3-4 jours  
**Déclencheur :** Premiers clients payants actifs

**Contexte**
Aujourd'hui `InjectionLog` ne distingue pas le mode utilisé — Smart Fill, Bot natif ou Recorder produisent le même log. On ne peut pas savoir quelle fonctionnalité est réellement utilisée ni mesurer son efficacité.

**User Story**

> En tant qu'admin OptiBot,  
> je veux voir les KPIs d'usage par mode (Smart Fill, Bot, Recorder) dans l'onglet Extension,  
> afin de savoir quelles features génèrent de la valeur et lesquelles sont ignorées.

**Critères d'acceptation**

```gherkin
Scenario: Admin consulte les KPIs extension
  Given je suis sur /admin?tab=extension (ou /admin/extension)
  Then je vois 3 cartes : Smart Fill / Bot / Recorder
  And chaque carte affiche : nb remplissages 30j, taux succès, portails top 3
  And je peux filtrer par période et par portail

Scenario: Drill-down sur un mode
  When je clique sur "Smart Fill"
  Then je vois les 10 derniers remplissages avec portail, nb champs, succès/échec
```

**Notes techniques**
- Ajouter champ `mode String? @default("smartfill")` dans `InjectionLog` (migration Prisma)
- Extension : passer `mode: "smartfill"|"bot"|"recorder"` dans l'appel `log-injection`
  - Smart Fill : appel depuis `performSmartFill()`
  - Bot natif : appel depuis `rpaAlmerys()`, `rpaWemind()`, etc.
  - Recorder : appel depuis `replayParcours()`
- Admin `/admin/extension` : 3 KPI cards + tableau filtrable par mode

---

### [EXT-02] Intégration Cosium — Lecture dossier + récupération accord PEC

**Priorité :** High — demande explicite d'un prospect 3 magasins  
**Effort estimé :** 4-5 semaines  
**Déclencheur :** Premier client Cosium signé (prospect identifié)

**Contexte**
Cosium est le logiciel de gestion le plus répandu chez les opticiens FR (~30% de parts de marché). Un prospect avec 3 magasins a demandé explicitement :
1. Lire les données du dossier Cosium ouvert → pré-remplir les portails mutuelles
2. Récupérer l'accord PEC (numéro, montant) et l'injecter dans Cosium

Les deux sont faisables 100% dans le navigateur via l'extension Chrome — sans données patient côté serveur (philosophie OptiBot respectée).

**User Stories**

**US-01 — Lecture Cosium → portail mutuelle**
> En tant qu'opticien sur Cosium,  
> je veux cliquer sur "🤖 Remplir" depuis Cosium avec un dossier ouvert,  
> afin qu'OptiBot lise automatiquement les données du dossier et ouvre le portail mutuelle pré-rempli.

**US-02 — Récupération accord PEC → Cosium**
> En tant qu'opticien ayant obtenu un accord PEC sur le portail mutuelle,  
> je veux qu'OptiBot injecte automatiquement le numéro et montant de l'accord dans le dossier Cosium ouvert,  
> afin de ne pas avoir à ressaisir ces informations manuellement.

**Critères d'acceptation**

```gherkin
Scenario: Lecture dossier Cosium
  Given j'ai un dossier patient ouvert dans Cosium
  And OptiBot est installé
  When je clique sur le bouton "🤖 Remplir" injecté par OptiBot dans l'interface Cosium
  Then OptiBot lit : nom patient, NSS, mutuelle, correction optique depuis les champs Cosium
  And ouvre le portail mutuelle dans un nouvel onglet avec les champs pré-remplis

Scenario: Injection accord PEC dans Cosium
  Given j'ai obtenu un accord PEC sur le portail Almerys/Wemind
  And le dossier Cosium correspondant est ouvert dans un autre onglet
  When OptiBot détecte la réponse PEC (numéro accord, montant, date)
  Then un bouton "→ Injecter dans Cosium" apparaît
  When je clique dessus
  Then OptiBot injecte les données PEC dans le dossier Cosium ouvert
```

**Notes techniques**
- Utiliser le **Recorder** existant pour enregistrer le parcours de lecture Cosium (sélecteurs CSS des champs dossier)
- Pas de nouveau code serveur — 100% extension Chrome
- Ajouter `"cosium.com"` dans la liste des sites reconnus par l'extension
- Détection de la réponse PEC : MutationObserver sur les pages de confirmation portail
- Communication inter-onglets via `chrome.tabs.sendMessage()`
- Documenter les sélecteurs Cosium (peuvent varier selon la version)

**Go-to-Market**
- Argument clé : "OptiBot lit Cosium et y écrit — zéro ressaisie bout en bout"
- Cible immédiate : prospect 3 magasins Cosium identifié
- Salon Silmo / MIDO : démo Cosium = démo qui convertit

---

## 💳 Billing

### [BILLING-01] Engagement annuel avec paiement mensuel

**Priorité :** Low — à implémenter quand des clients demandent explicitement cette option  
**Effort estimé :** 3-4 jours  
**Déclencheur :** Friction identifiée sur le paiement annuel one-shot (> 400€ d'un coup)

---

**User Story**

> En tant qu'opticien intéressé par l'offre annuelle,  
> je veux m'engager sur 12 mois mais payer chaque mois au tarif annuel,  
> afin de bénéficier de la réduction annuelle (-15%) sans avancer une grosse somme d'un coup.

---

**Critères d'acceptation (Gherkin)**

```gherkin
Scenario: Souscription annuelle avec paiement mensuel
  Given je suis sur la page /pricing
  And je sélectionne le mode "Annuel"
  When je clique sur "Souscrire"
  Then je sois débité chaque mois au tarif annuel (ex: 33,92€/mois pour Essentiel)
  And je vois dans mon dashboard "Engagement jusqu'au JJ/MM/AAAA"
  And je ne peux pas annuler mon abonnement avant la date de fin d'engagement

Scenario: Tentative d'annulation avant fin d'engagement
  Given je suis abonné en mode "annuel mensuel" depuis 3 mois
  When je clique sur "Annuler mon abonnement"
  Then je vois un message "Votre engagement se termine le JJ/MM/AAAA — X mois restants"
  And le bouton d'annulation est désactivé jusqu'à cette date

Scenario: Annulation après fin d'engagement
  Given mon engagement annuel est arrivé à terme
  When je clique sur "Annuler mon abonnement"
  Then l'annulation se passe normalement comme un abonnement mensuel classique
```

---

**Notes techniques**

- Créer de nouveaux `price_xxx` dans Stripe avec `interval: month` au tarif réduit annuel
- Ajouter un champ `engagementEndDate: DateTime?` en base (`User` model)
- Stocker la date de fin d'engagement à la souscription (`createdAt + 12 mois`)
- Bloquer l'annulation côté code si `engagementEndDate > now()`
- Adapter l'UI `PlanWidget` et `dashboard/account` pour afficher la date d'engagement
- Pas de support Stripe natif pour bloquer la résiliation → gestion 100% applicative

---

## 🌍 Expansion Géographique

### [GEO-01] OptiBot Belgique

**Priorité :** Medium — après 50 clients payants FR prouvés  
**Effort estimé :** 2 semaines  
**Déclencheur :** Churn FR < 5%/mois + MRR FR > 10k€

**Analyse**
- Pain identique à la France : mêmes portails mutuelles (Almerys, Wemind, Viamedis)
- 5 mutualités belges avec portails distincts (MC 45%, FSMB 27%, libérale, neutre, libre)
- ~3 800 opticiens dont ~2 000 indépendants ciblables
- Wallonie/Bruxelles : même langue, 0 adaptation produit
- Pricing identique France (pouvoir d'achat équivalent)
- Flandre (Phase 2) : i18n NL requise, ~3 semaines dev supplémentaires

**Notes techniques**
- RPA : 5 portails mutuelles belges à reverser (~2 semaines)
- Mentions légales : TVA BE, siège social belge ou mandataire local
- RGPD : identique UE ✅
- Syndicats cibles : FNOF Belgique + Opticliens

---

### [GEO-02] OptiBot Suisse Romande

**Priorité :** Low — Phase 3 après Belgique prouvée  
**Effort estimé :** 3 semaines (romand uniquement) / 3 mois (marché complet)  
**Déclencheur :** 100+ clients FR payants + Belgique lancée

**Analyse**
- 7 assureurs complémentaires majeurs (CSS, Helsana, Swica, Concordia, Visana, Sanitas, KPT)
- Modèle différent : patient soumet lui-même → opticien offre le service en premium
- Ticket moyen 600-900 CHF → ROI produit très élevé
- ~1 100 opticiens romands (français), 0 adaptation code Phase 1
- Pricing : 49-89 CHF/mois
- Contrainte légale : mandat numérique patient requis (2j dev)
- i18n DE pour alémanique (Phase 2, 3 semaines)
- Stripe supporte CHF nativement ✅

---

## 🏥 Expansion Verticale (nouveaux métiers)

### [VERT-01] DentiBot — Chirurgiens-dentistes

**Priorité :** High — à lancer après 50 clients OptiBot payants  
**Effort estimé :** 7 semaines MVP  
**Déclencheur :** OptiBot stable + ressources dev disponibles  
**Potentiel MRR réaliste :** 150 000€/mois (modèle usage)

---

#### Cible utilisateur révisée — La secrétaire médicale, pas le dentiste

**Insight clé :** Le dentiste opère, il ne touche pas aux portails mutuelles. C'est la **secrétaire médicale** (souvent libérale/indépendante) qui gère tout l'administratif — parfois pour **5 à 10 cabinets simultanément**.

**Implications :**
- La secrétaire est le décideur d'usage (elle évalue et utilise)
- Le dentiste est le décideur d'achat (il paie ou rembourse l'outil)
- Une secrétaire indépendante = potentiellement 5-10 cabinets adressés via un seul compte
- Canaux acquisition prioritaires : associations de secrétaires médicales libérales (ADML, FFASM), LinkedIn "secrétaire médicale libérale"

---

#### User Stories

**US-01 — Secrétaire (utilisatrice principale)**
> En tant que secrétaire médicale libérale gérant plusieurs cabinets,  
> je veux soumettre les dossiers TP de tous mes cabinets depuis une seule interface,  
> afin d'économiser 5h/semaine et ne plus jongler entre les portails mutuelles.

**US-02 — Dentiste (validateur)**
> En tant que chirurgien-dentiste,  
> je veux valider en 1 clic les dossiers préparés par ma secrétaire avant soumission,  
> afin de garder le contrôle sans faire le travail administratif moi-même.

**US-03 — Upgrade automatique**
> En tant que secrétaire ayant dépassé mon quota mensuel,  
> je veux être notifiée et pouvoir upgrader immédiatement,  
> afin de ne pas bloquer mes soumissions en cours de journée.

---

#### Modèle de facturation — Pay-per-submission

**Définition :** 1 feuille de soins soumise sur un portail mutuelle = 1 soumission facturée.

| Formule | Prix | Inclus | Au-delà |
|---|---|---|---|
| Gratuit | 0€ | 5 soumissions/mois | bloqué |
| Pro | 29€/mois | 30 soumissions | 1,50€/soumission |
| Illimité | 79€/mois | Illimité | — |

**Rationale :**
- Aligné sur la valeur créée (1 couronne = 800€ récupérés → ROI 400×)
- Pas de risque pour la secrétaire freelance qui démarre
- Scale naturellement avec le volume : plus elle soumet, plus DentiBot rapporte
- Pas de discrimination par nombre de cabinets — elle paie à l'usage

**ROI pitch :** "1 couronne sauvée d'un rejet = 533 mois d'abonnement Pro payés."

---

#### Feature — Workflow validation dentiste

```
Secrétaire prépare le dossier (scan feuille de soins + OCR)
        ↓
Dossier → statut "En attente de validation"
        ↓
Dentiste reçoit notification email/SMS
        ↓
Dentiste valide en 1 clic (lien signé, sans login)
        ↓
DentiBot soumet automatiquement sur le portail mutuelle
        ↓
Confirmation → dossier archivé
```

**Argument commercial :** "Le dentiste garde le contrôle. La secrétaire fait le travail."  
**Lève l'objection :** "Je ne veux pas que quelqu'un soumette en mon nom sans mon accord."

**Critères d'acceptation (Gherkin)**

```gherkin
Scenario: Validation dentiste via lien email
  Given la secrétaire a préparé un dossier pour le cabinet du Dr. Martin
  When elle clique sur "Envoyer pour validation"
  Then le Dr. Martin reçoit un email avec un résumé du dossier
  And un bouton "Valider et soumettre" signé (lien HMAC, valable 48h)
  When le Dr. Martin clique sur "Valider"
  Then DentiBot soumet le dossier sur le portail mutuelle
  And la secrétaire reçoit une confirmation

Scenario: Expiration du lien de validation
  Given le Dr. Martin n'a pas validé sous 48h
  When le délai expire
  Then le dossier passe en statut "Validation expirée"
  And la secrétaire est notifiée pour relancer

Scenario: Dépassement de quota
  Given la secrétaire est sur le plan Pro (30 soumissions/mois)
  When elle tente une 31ème soumission
  Then elle voit "Quota atteint — 1,50€ par soumission supplémentaire"
  And elle peut continuer en acceptant la facturation variable
  Or elle peut upgrader vers Illimité
```

---

#### Analyse technique

**Différences vs OptiBot :**
- OCR adapté feuilles de soins dentaires (format différent des ordonnances optiques)
- Codes CCAM (~50 codes prothèses courants à mapper)
- Numéro de dent (14, 26...) à extraire et saisir
- Workflow en 3 temps : préparation → validation → soumission
- Lien de validation signé HMAC (48h, sans login dentiste)
- Compteur de soumissions + facturation Stripe Metered Billing

**Nouveaux champs Prisma déjà créés :**
```prisma
codeCCAM        String?
numeroDent      String?
montantHonoraires Float?
deviAccordeAt   DateTime?
devisJoint      Boolean
```

**Stripe Metered Billing :**
- Produit avec `usage_type: "metered"` pour les soumissions au-delà du quota
- Report usage via `stripe.subscriptionItems.createUsageRecord()` à chaque soumission

---

#### Go-to-Market

- **Cible primaire :** Secrétaires médicales libérales (ADML, FFASM, LinkedIn)
- **Cible secondaire :** Dentistes chefs de cabinet (CNSD, ADF, Salon ADF Paris novembre)
- **Cold email :** Même pattern OptiBot — base dentistes disponible (RPPS/INFOGREFFE)
- **Partenariats :** Intégration Logos, Desmos, Julie (distribution via marketplace)
- **Argument décisif :** "Vos secrétaires économisent 5h/semaine. Vous ne rejetez plus aucun dossier."

---

### [VERT-02] OrthoBot — Orthopédistes & Orthésistes

**Priorité :** Low — après DentiBot lancé  
**Effort estimé :** 4 semaines MVP  
**Déclencheur :** DentiBot stable

**Analyse**
- ~3 500 orthopédistes-orthésistes en France (LPPR — Liste des Produits et Prestations Remboursables)
- Appareillages : prothèses, orthèses, fauteuils, corsets = remboursements très élevés (500-5 000€/dossier)
- Tiers-payant systématique — portails mutuelles identiques à OptiBot
- Prescription médicale obligatoire → workflow en 2 temps (accord préalable + livraison)
- Logiciels métier : Actimage, Orthosoft — ne font pas la saisie portail mutuelle
- ROI exceptionnel : 1 fauteuil roulant électrique sauvé = 2 000-4 000€ récupérés
- Syndicats cibles : UFOP (Union Française des Orthoprothésistes), SNOF

**Pricing recommandé**
| Plan | Prix/mois |
|---|---|
| Essentiel | 69,90€ |
| Pro | 119€ |

---

### [VERT-03] OrthoptiBot — Orthoptistes

**Priorité :** Low — marché plus petit, après OrthoBot  
**Effort estimé :** 3 semaines MVP  
**Déclencheur :** Stack RPA stabilisée

**Analyse**
- ~5 000 orthoptistes en France
- Remboursements en forte croissance depuis 2022 (bilans visuels remboursés, accès direct sans ordonnance)
- Actes : bilan orthoptique (55,50€ remboursé Sécu), séances de rééducation
- Part mutuelle complémentaire = saisie manuelle sur les mêmes portails (Almerys, Wemind, Viamedis)
- Proximité naturelle avec OptiBot (filière visuelle) → cross-selling facile aux opticiens qui connaissent des orthoptistes
- Pain moyen (montants inférieurs à l'optique/dentaire) mais volume en explosion post-2022
- Marché petit mais acquisition via réseau opticiens existants = coût quasi nul

**Pricing recommandé**
| Plan | Prix/mois |
|---|---|
| Essentiel | 34,90€ |
| Pro | 59,90€ |

**Go-to-Market**
- Cross-sell auprès des opticiens clients OptiBot
- Syndicat : SNOF (Syndicat National des Orthoptistes)
- Salon SNOF annuel

---

## 🗺️ Roadmap Vision

```
2026 S1 : OptiBot FR → 50 clients payants (focus)
2026 S2 : DentiBot MVP + AudiBot stabilisation
2026 Q4 : DentiBot launch + OptiBot Belgique
2027 S1 : DentiBot Belgique + OptiBot Suisse romande
2027 S2 : OrthoBot + expansion alémanique
2028    : Marché complet FR/BE/CH multi-verticales
```

**ARR cible 2028 :** 3-5M€ (OptiBot + DentiBot + AudiBot × FR + BE)

---
