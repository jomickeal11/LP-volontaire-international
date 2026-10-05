-- Module « Événements & Formations » : programme, contact événementiel,
-- catégorie personnalisée et publication multilingue explicite.
-- Migration non destructive : aucune donnée existante n'est supprimée.

-- 1. Programme détaillé (optionnel, par langue)
ALTER TABLE "Evenement"
  ADD COLUMN IF NOT EXISTS "programmeFr" TEXT,
  ADD COLUMN IF NOT EXISTS "programmeEn" TEXT,
  ADD COLUMN IF NOT EXISTS "programmeDe" TEXT;

-- 2. Catégorie personnalisée (obligatoire uniquement si category = 'OTHER')
ALTER TABLE "Evenement"
  ADD COLUMN IF NOT EXISTS "categoryOther" TEXT;

-- 3. Contact de l'événement, distinct du contact institutionnel APTIC-R
ALTER TABLE "Evenement"
  ADD COLUMN IF NOT EXISTS "contactName" TEXT,
  ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;

-- 4. Un événement uniquement en ligne n'a pas d'adresse physique à saisir
ALTER TABLE "Evenement" ALTER COLUMN "location" DROP NOT NULL;

-- 5. Créer un événement ne doit plus le publier, et ouvrir l'inscription
--    ne doit pas être l'état par défaut.
ALTER TABLE "Evenement" ALTER COLUMN "published" SET DEFAULT false;
ALTER TABLE "Evenement" ALTER COLUMN "registrationOpen" SET DEFAULT false;

-- 6. Publication multilingue explicite (aucun repli FR -> EN/DE)
ALTER TABLE "Evenement"
  ADD COLUMN IF NOT EXISTS "publishedFr" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "publishedEn" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "publishedDe" BOOLEAN NOT NULL DEFAULT false;

-- 7. Préserver la publication existante comme publication française ;
--    les traductions restent à publier explicitement.
UPDATE "Evenement" SET "publishedFr" = "published";

CREATE INDEX IF NOT EXISTS "Evenement_publishedFr_idx" ON "Evenement"("publishedFr");
CREATE INDEX IF NOT EXISTS "Evenement_publishedEn_idx" ON "Evenement"("publishedEn");
CREATE INDEX IF NOT EXISTS "Evenement_publishedDe_idx" ON "Evenement"("publishedDe");
