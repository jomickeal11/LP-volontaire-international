ALTER TABLE "Article"
  ADD COLUMN "publishedFr" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publishedEn" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publishedDe" BOOLEAN NOT NULL DEFAULT false;

-- Preserve existing publication as French; translations require explicit publication.
UPDATE "Article" SET "publishedFr" = "published";

CREATE INDEX "Article_publishedFr_idx" ON "Article"("publishedFr");
CREATE INDEX "Article_publishedEn_idx" ON "Article"("publishedEn");
CREATE INDEX "Article_publishedDe_idx" ON "Article"("publishedDe");