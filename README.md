# 🦻 AudiBot — Automatisation de saisie pour audioprothésistes

AudiBot automatise la saisie des données patient et des prescriptions ORL dans les logiciels et portails mutuelles utilisés par les audioprothésistes français.

**Basé sur** [OptiBot](https://github.com/vvorreit/optibot) — adapté au secteur de l'audioprothèse.

---

## 🚀 Fonctionnement

1. **Scannez** la carte mutuelle du patient (Almerys, Viamedis, Ameli Pro)
2. **Scannez** la prescription ORL (PDF ou photo)
3. AudiBot **extrait automatiquement** les données (patient, prescripteur, audiogramme, classe/type d'appareillage)
4. **Copiez** les données en un clic → presse-papier JSON
5. L'extension Chrome **remplit automatiquement** le formulaire dans Auditdata ou le portail mutuelle

**Gain de temps estimé : 45min à 1h30 par jour.**

---

## 🛠️ Logiciels supportés

| Logiciel | Statut | Notes |
|---|---|---|
| **Auditdata** | 🟡 Beta | Sélecteurs DOM à confirmer (voir TODO dans content.js) |
| **Otosuite** | 🔜 Prévu | À venir |
| **Easyaudio** | 🔜 Prévu | À venir |

---

## 🏥 Portails mutuelles supportés

| Portail | Statut |
|---|---|
| **Almerys** | ✅ Opérationnel |
| **Viamedis** | ✅ Opérationnel |
| **SCOR / Ameli Pro** | 🟡 Beta (sélecteurs à affiner) |

---

## 📋 Données extraites depuis la prescription ORL

- **Prescripteur** : nom ORL, n° RPPS, date de prescription
- **Patient** : nom, prénom, date de naissance
- **Oreille Droite (OD)** : perte auditive à 250, 500, 1000, 2000, 4000 Hz
- **Oreille Gauche (OG)** : idem
- **Classe d'appareillage** : Classe 1 (100% Santé) ou Classe 2
- **Type d'appareillage** : BTE (contour), ITE (intra-auriculaire), RIC/RITE (écouteur déporté)
- **Renouvellement** : oui / non

---

## ⚙️ Installation

### Application Web (Next.js)

```bash
git clone https://github.com/vvorreit/audibot.git
cd audibot
npm install
cp .env.example .env.local  # configurer DATABASE_URL, NEXTAUTH_SECRET, etc.
npx prisma migrate deploy
npm run dev
```

### Extension Chrome

1. Ouvrir `chrome://extensions`
2. Activer le **mode développeur**
3. Cliquer **Charger l'extension non empaquetée**
4. Sélectionner le dossier `extension/`

---

## 🗂️ Structure du projet

```
audibot/
├── app/               # Next.js App Router
├── components/
│   ├── OrdonnanceForm.tsx    # Formulaire prescription ORL
│   └── MutuelleForm.tsx      # Formulaire carte mutuelle
├── lib/
│   ├── parsers.ts            # Parser OCR prescription ORL + mutuelle
│   └── ocr.ts                # Extraction texte PDF/image
├── extension/
│   ├── manifest.json         # Extension Chrome MV3
│   ├── content.js            # Content scripts (Auditdata, Almerys, Viamedis, Ameli Pro)
│   └── popup.html/js         # Interface popup extension
└── prisma/            # Schéma base de données
```

---

## 🔧 TODO / Roadmap

- [ ] Confirmer les sélecteurs DOM Auditdata (nécessite accès instance)
- [ ] Implémenter autofill audiogramme dans Auditdata
- [ ] Support Otosuite
- [ ] Support Easyaudio
- [ ] Affiner sélecteurs Ameli Pro
- [ ] Tests unitaires parser prescription ORL

---

## 📄 Licence

MIT — Fork de [OptiBot](https://github.com/vvorreit/optibot) par [@vvorreit](https://github.com/vvorreit)
