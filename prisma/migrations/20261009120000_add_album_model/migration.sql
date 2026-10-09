-- Nouveau modèle Album : collections de médias administrables et publiables.
-- La colonne texte historique "Media"."album" est conservée pour compatibilité.
-- La reprise des données existantes est assurée par scripts/migrate-legacy-albums.ts
-- (aucune traduction inventée : les langues inconnues restent vides).

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleDe" TEXT,
    "descriptionFr" TEXT,
    "descriptionEn" TEXT,
    "descriptionDe" TEXT,
    "coverImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Album_slug_key" ON "Album"("slug");

-- CreateIndex
CREATE INDEX "Album_published_idx" ON "Album"("published");

-- CreateIndex
CREATE INDEX "Album_order_idx" ON "Album"("order");

-- CreateIndex
CREATE INDEX "Album_slug_idx" ON "Album"("slug");

-- AlterTable : association facultative d'un média à un album.
-- ON DELETE SET NULL : la suppression d'un album ne supprime jamais les médias.
ALTER TABLE "Media" ADD COLUMN "albumId" TEXT;

-- CreateIndex
CREATE INDEX "Media_albumId_idx" ON "Media"("albumId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;
