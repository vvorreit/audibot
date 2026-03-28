# Extension Chrome — Stratégie de sécurisation & distribution

## Risques identifiés

| Risque | Impact | Probabilité |
|--------|--------|-------------|
| Rejection Chrome Web Store (CSP, permissions trop larges) | Haut | Moyen |
| Google supprime l'extension (MV3 policy changes) | Haut | Faible |
| DOM portail change → autofill cassé | Moyen | Élevé |
| Clipboardread review scrutiny | Moyen | Moyen |

---

## 1. Alternatives de distribution (hors Chrome Web Store)

### Option A — Self-hosted CRX + auto-update (recommandé à court terme)
- Héberger le `.crx` sur `optibot.fr/extension/`
- `manifest.json` : ajouter `"update_url": "https://optibot.fr/extension/update.xml"`
- Les utilisateurs installent via `chrome://extensions` → mode développeur → "Installer CRX"
- **Avantage** : zéro dépendance Google, mises à jour silencieuses
- **Inconvénient** : l'utilisateur doit activer le mode développeur (friction à l'onboarding)

### Option B — Firefox Add-ons (Mozilla AMO)
- Le manifest contient déjà `browser_specific_settings.gecko` → l'extension est MV3 compatible Firefox
- Mozilla AMO = moins strict que Chrome Web Store
- **Action** : soumettre sur [addons.mozilla.org](https://addons.mozilla.org) en parallèle

### Option C — Microsoft Edge Add-ons Store
- Compatible MV3, moins de rejets que Chrome
- Couverture enterprise (Edge est souvent l'unique navigateur autorisé en cabinet)

### Option D — Enterprise Policy (GPO/MDM)
- Pour les franchises et gros clients : déploiement via GPO Windows sans passer par le store
- `chrome.policies.ExtensionInstallForcelist`

---

## 2. Chrome Web Store — Réduire le risque de rejection

### Permissions actuelles à justifier
- `clipboardRead` → **sensible**, souvent rejeté. Justification : lecture du clipboard pour récupérer le payload OptiBot copié depuis le dashboard. Documenter dans la privacy policy.
- `tabs` → justifier l'usage (détection du portail actif)
- `host_permissions` larges → restreindre aux domaines stricts (déjà bien fait)

### Actions concrètes
1. **Privacy policy** obligatoire : créer `/legal/extension-privacy` sur optibot.fr
2. **Single purpose** : l'extension ne doit faire QUE l'autofill mutuelles (pas de tracking, pas d'analytics)
3. **No remote code** : tout le JS doit être dans le package (✅ déjà le cas avec MV3)
4. **CSP stricte** dans manifest : `"content_security_policy": { "extension_pages": "script-src 'self'; object-src 'self'" }`
5. **Version bump** à chaque soumission, changelog clair

### Template privacy policy extension
```
OptiBot Multi-Site Extension — Politique de confidentialité
- L'extension lit le clipboard uniquement sur action explicite de l'utilisateur
- Aucune donnée patient n'est transmise à des serveurs tiers
- Aucune télémétrie, aucun tracking
- Les données autofill transitent uniquement entre le dashboard OptiBot et le portail mutuelle, localement dans le navigateur
```

---

## 3. Monitoring DOM portails (bookmarklet + extension)

Un ping est envoyé à `/api/bookmarklet/ping` à chaque injection :
```js
// À ajouter dans content.js après chaque tentative d'autofill
fetch("https://app.optibot.fr/api/bookmarklet/ping", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    version: chrome.runtime.getManifest().version,
    portal: detectPortal(), // "almerys", "wemind", etc.
    status: success ? "ok" : "broken",
    errorHint: errorMessage || null, // JAMAIS de données patient
  }),
}).catch(() => {}); // best-effort, silencieux
```
Les résultats sont visibles dans l'admin OptiBot → onglet OCR → section Bookmarklet Health.

---

## 4. Roadmap recommandée

| Priorité | Action |
|----------|--------|
| P0 | Ajouter le ping monitoring dans content.js |
| P0 | Créer la privacy policy extension sur optibot.fr |
| P1 | Soumettre sur Firefox AMO |
| P1 | Self-hosted CRX update URL pour ne pas dépendre du store |
| P2 | Soumettre Chrome Web Store (avec permissions justifiées) |
| P2 | Tester Edge Add-ons Store |
| P3 | Enterprise GPO guide pour franchise clients |
