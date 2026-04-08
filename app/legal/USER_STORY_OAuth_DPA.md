# User Story — Acceptation DPA après inscription Google OAuth

**ID :** US-LEGAL-003  
**Priorité :** 🔴 Critique (le seul point légal restant non résolu)  
**Auteur :** Clara (DPO) — 20 mars 2026  
**Dépendance :** US-LEGAL-001 (DPA)

---

## Story

> **En tant que** nouvel utilisateur qui s'inscrit via Google OAuth,  
> **je veux** être informé de l'Accord de Traitement des Données et pouvoir l'accepter explicitement,  
> **afin que** mon utilisation du service soit juridiquement conforme au RGPD Article 28, même sans avoir rempli le formulaire d'inscription classique.

---

## Contexte technique

Le flux actuel Google OAuth (`signIn("google")`) crée l'utilisateur en BDD via l'event `createUser` dans `lib/auth.ts`, mais **ne crée pas d'entrée `legalAcceptance`** et **ne présente jamais le DPA à l'utilisateur**. Un utilisateur Google peut donc utiliser AudiBot sans avoir jamais vu ou accepté le DPA.

---

## Critères d'acceptation

### ✅ AC1 — Détection du premier login OAuth sans DPA accepté

Après un login Google, vérifier en base si l'utilisateur a une entrée `legalAcceptance` avec `documentType = "dpa"` et `documentVersion = "1.1"`.

**Si non → rediriger vers la page `/onboarding/dpa`** avant d'accéder au dashboard.

```ts
// Dans le callback redirect de NextAuth (lib/auth.ts) :
async redirect({ url, baseUrl }) {
  // Après login, vérifier si DPA accepté
  // Si non → /onboarding/dpa?callbackUrl=...
}
```

Ou plus simple : vérifier côté middleware Next.js sur les routes `/dashboard/*`.

---

### ✅ AC2 — Page `/onboarding/dpa`

Afficher une page dédiée (pas une modale, pour garantir la lisibilité) :

**Contenu :**
- Titre : *"Avant de continuer — Accord de Traitement des Données"*
- Texte d'explication court :
  > *"AudiBot traite des données de santé en qualité de sous-traitant au sens de l'article 28 du RGPD. En tant que professionnel de santé, vous êtes Responsable de traitement. Veuillez lire et accepter l'Accord de Traitement des Données avant d'utiliser le service."*
- Iframe ou résumé des points clés du DPA (lien vers `/legal/dpa`)
- **Checkbox non pré-cochée** : *"J'ai lu et j'accepte l'[Accord de Traitement des Données](/legal/dpa)"*
- Bouton **"Accepter et continuer"** (désactivé tant que checkbox non cochée)
- Lien **"Se déconnecter"** si l'utilisateur refuse

**Comportement interdit :**
- ❌ Permettre l'accès au dashboard sans acceptation
- ❌ Acceptation automatique silencieuse en background

---

### ✅ AC3 — Enregistrement de l'acceptation OAuth

À la validation de la page `/onboarding/dpa` :

```ts
// POST /api/legal/dpa/accept
await prisma.legalAcceptance.create({
  data: {
    userId: user.id,
    email: user.email,
    documentType: "dpa",
    documentVersion: "1.1",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  }
});
// Puis redirect vers /dashboard
```

---

### ✅ AC4 — Middleware de protection

Ajouter dans `middleware.ts` une vérification pour toutes les routes `/dashboard/*` et `/tiers-payant/*` :

```ts
// Si utilisateur connecté mais pas de DPA accepté → redirect /onboarding/dpa
// Vérifier via un flag sur le token JWT (ex: token.dpaAccepted: boolean)
// Le flag est mis à true lors du createUser ou de l'acceptation OAuth
```

Pour éviter un appel BDD à chaque requête : stocker `dpaAccepted: boolean` dans le JWT lors de la génération du token.

---

### ✅ AC5 — Mise à jour du token JWT

Dans `lib/auth.ts`, callback `jwt` :

```ts
async jwt({ token, user }) {
  if (user) {
    const acceptance = await prisma.legalAcceptance.findFirst({
      where: { userId: user.id, documentType: "dpa" }
    });
    token.dpaAccepted = !!acceptance;
  }
  return token;
}
```

---

## Definition of Done

- [ ] Page `/onboarding/dpa` créée avec checkbox non pré-cochée
- [ ] Bouton "Accepter et continuer" désactivé sans checkbox cochée
- [ ] Acceptation enregistrée en BDD (`legalAcceptance`) avec IP + user-agent
- [ ] Flag `dpaAccepted` dans le JWT
- [ ] Middleware bloquant l'accès au dashboard si `dpaAccepted = false`
- [ ] Lien "Se déconnecter" sur la page onboarding DPA
- [ ] Test : inscription Google → redirect vers `/onboarding/dpa`
- [ ] Test : après acceptation → accès dashboard OK
- [ ] Test : rechargement page dashboard après acceptation → plus de redirect

---

## ⚠️ Warning Clara

> Ne pas enregistrer l'acceptation de manière silencieuse dans `createUser` sans que l'utilisateur ait vu le DPA. Ce serait une acceptation fictive, nulle et non opposable. L'utilisateur doit avoir lu (ou eu l'opportunité de lire) le document et coché la case lui-même.
