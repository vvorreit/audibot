# User Story — Bandeau de consentement cookies

**ID :** US-LEGAL-002  
**Priorité :** 🔴 Critique (obligation CNIL — amende possible sans bandeau conforme)  
**Auteur :** Clara (DPO) — 20 mars 2026  
**Dépendance :** US-LEGAL-001 (DPA)

---

## Story

> **En tant que** visiteur du site optibot.fr,  
> **je veux** être informé des cookies utilisés et pouvoir choisir de les accepter ou les refuser,  
> **afin que** mon consentement soit recueilli de manière libre, éclairée et explicite avant tout dépôt de cookie non essentiel.

---

## Contexte légal (pour les devs)

La CNIL exige un consentement **préalable, libre, éclairé et non ambigu** avant tout dépôt de cookie à finalité non strictement nécessaire (analytics, pub, etc.). Google Analytics = cookie non essentiel = consentement obligatoire. Sans bandeau conforme, c'est l'une des premières choses auditées lors d'un contrôle CNIL.

**Règle d'or : refuser doit être aussi simple qu'accepter.** Un bouton "Refuser" doit être visible au même niveau que "Accepter" — pas caché dans un sous-menu.

---

## Critères d'acceptation

### ✅ AC1 — Affichage du bandeau à la première visite

**Déclencheur :** Première visite sur le site (aucun cookie de consentement présent)

**Comportement attendu :**
- Afficher un bandeau en bas de page (ou modale centrée) avec :
  - Titre : *"Nous utilisons des cookies"*
  - Texte court : *"OptiBot utilise Google Analytics pour mesurer l'audience du site. Aucun cookie n'est déposé sans votre accord."*
  - Lien vers la politique de confidentialité : `/legal/confidentialite`
  - **Bouton "Accepter"** (style primaire)
  - **Bouton "Refuser"** (style secondaire — même visibilité qu'Accepter)
  - Lien optionnel "Personnaliser" pour affiner les choix

**Comportement interdit :**
- ❌ Bouton "Refuser" absent, caché ou dans un sous-menu
- ❌ Google Analytics chargé avant le consentement
- ❌ Cases pré-cochées
- ❌ Défilement de la page ou navigation valant consentement

---

### ✅ AC2 — Comportement selon le choix

**Si Accepter :**
- Stocker le consentement dans un cookie : `optibot_consent=granted` (durée : 13 mois max)
- Charger Google Analytics (`gtag.js`) **après** le consentement
- Ne plus afficher le bandeau lors des visites suivantes

**Si Refuser :**
- Stocker le refus : `optibot_consent=denied` (durée : 13 mois max)
- **Ne pas charger** Google Analytics
- Ne plus afficher le bandeau lors des visites suivantes
- L'utilisateur peut toujours accéder au site normalement

**Dans les deux cas :**
- Stocker le timestamp de la décision
- Ne pas bloquer la navigation

---

### ✅ AC3 — Retrait du consentement

- Afficher un lien persistent en bas de page : *"Gérer mes cookies"* (footer ou petit lien discret)
- Ce lien rouvre le bandeau et permet de modifier le choix
- Si l'utilisateur passe de "Accepter" à "Refuser" : désactiver GA immédiatement et supprimer les cookies GA existants

---

### ✅ AC4 — Intégration Google Analytics conditionnelle

```tsx
// Charger GA uniquement si consentement accordé
// Ne JAMAIS charger gtag.js dans _document.tsx ou layout.tsx sans vérification du consentement

// Exemple avec next/script :
{consent === 'granted' && (
  <>
    <Script
      src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX');
      `}
    </Script>
  </>
)}
```

**Si GA est déjà intégré dans le layout sans condition → le retirer immédiatement. C'est une violation CNIL en l'état.**

---

### ✅ AC5 — Cookie de consentement

```
Nom        : optibot_consent
Valeur     : "granted" | "denied"
Durée      : 13 mois maximum (recommandation CNIL)
Domaine    : .optibot.fr
SameSite   : Lax
Secure     : true
```

---

### ✅ AC6 — Exemptions (cookies techniques)

Les cookies suivants sont **exemptés de consentement** (strictement nécessaires) et peuvent être déposés sans bandeau :

| Cookie | Finalité | Durée |
|---|---|---|
| Cookie de session / auth | Maintien de la connexion | Session |
| `optibot_consent` | Mémorisation du choix cookies | 13 mois |
| CSRF token | Sécurité des formulaires | Session |

Tout autre cookie doit être soumis à consentement.

---

## Composant suggéré

```
/components/CookieBanner.tsx   ← le bandeau UI
/lib/consent.ts                ← helpers : getConsent(), setConsent(), revokeConsent()
/app/layout.tsx                ← intégrer CookieBanner + GA conditionnel
```

---

## Definition of Done

- [ ] Bandeau affiché à la première visite sans cookie de consentement
- [ ] Boutons "Accepter" et "Refuser" au même niveau de visibilité
- [ ] Google Analytics **non chargé** avant consentement
- [ ] Google Analytics chargé **uniquement** après "Accepter"
- [ ] Cookie `optibot_consent` stocké avec durée 13 mois
- [ ] Lien "Gérer mes cookies" fonctionnel dans le footer
- [ ] Retrait du consentement désactive GA immédiatement
- [ ] Vérifier que GA n'est pas déjà chargé inconditionnellement dans le layout
- [ ] Test : visiter le site en navigation privée → bandeau visible, GA absent du réseau
- [ ] Test : accepter → GA présent dans les requêtes réseau
- [ ] Test : refuser → aucune requête vers google-analytics.com

---

## ⚠️ Warning Clara

> **Vérifier en priorité** si `gtag.js` ou `G-XXXXXXXXXX` est actuellement chargé dans `app/layout.tsx` ou `_document.tsx` **sans condition de consentement**. Si oui, c'est une violation CNIL active à corriger avant tout déploiement.
>
> La CNIL dispose d'outils automatisés de crawl qui détectent les cookies déposés avant consentement. Ce type d'infraction est systématiquement sanctionné lors des mises en demeure.
