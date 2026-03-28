-- CreateTable: templates de relance editables
CREATE TABLE IF NOT EXISTS "TemplateRelance" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'amiable',
    "objet" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "delaiJours" INTEGER,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateRelance_pkey" PRIMARY KEY ("id")
);

-- Seed: 3 templates par defaut
INSERT INTO "TemplateRelance" ("id", "nom", "type", "objet", "contenu", "delaiJours", "actif", "createdAt", "updatedAt")
VALUES
(gen_random_uuid()::text, 'Relance amiable J+30', 'amiable',
 'Relance amiable — Dossier {{reference_dossier}}',
 'Madame, Monsieur,

Sauf erreur de notre part, nous n''avons pas encore recu le reglement de notre facture {{reference_dossier}} d''un montant de {{montant}} EUR, transmise le {{date_envoi}} a {{nom_mutuelle}}.

Nous vous serions reconnaissants de bien vouloir proceder au reglement dans les meilleurs delais ou de nous informer de toute difficulte rencontree.

Dans l''attente de votre retour, nous vous prions d''agreer, Madame, Monsieur, l''expression de nos salutations distinguees.

{{nom_opticien}}
{{adresse_magasin}}',
 30, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(gen_random_uuid()::text, 'Relance ferme J+60', 'ferme',
 'Seconde relance — Dossier {{reference_dossier}} — Reglement en attente',
 'Madame, Monsieur,

Par courrier precedent, nous vous avions signale le non-reglement de notre facture {{reference_dossier}} d''un montant de {{montant}} EUR, datee du {{date_envoi}}.

A ce jour, et malgre notre premiere relance, nous n''avons toujours pas recu votre reglement ni aucune explication.

Nous vous demandons de proceder au paiement sous 15 jours a compter de la reception de ce courrier, faute de quoi nous nous verrons contraints d''engager les demarches necessaires au recouvrement de cette creance.

{{nom_opticien}}
{{adresse_magasin}}',
 60, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(gen_random_uuid()::text, 'Mise en demeure J+90', 'mise_en_demeure',
 'MISE EN DEMEURE — Dossier {{reference_dossier}}',
 'Lettre recommandee avec accuse de reception

Madame, Monsieur,

Malgre nos relances precedentes restees sans effet, nous constatons que la somme de {{montant}} EUR correspondant au dossier {{reference_dossier}} ({{nom_mutuelle}}) transmis le {{date_envoi}} demeure impayee.

Par la presente, nous vous mettons en demeure de proceder au paiement de la somme de {{montant}} EUR dans un delai de 8 jours a compter de la reception de ce courrier.

A defaut de reglement dans ce delai, nous nous reservons le droit de saisir les juridictions competentes pour obtenir le paiement de cette somme, majoree des interets de retard et frais de recouvrement.

Fait a {{adresse_magasin}}, le {{date_courrier}}.

{{nom_opticien}}',
 90, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
