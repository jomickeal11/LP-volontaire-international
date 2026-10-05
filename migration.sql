ALTER TABLE "Media" RENAME COLUMN "title" TO "titleFr";
ALTER TABLE "Media" RENAME COLUMN "caption" TO "captionFr";
ALTER TABLE "Media" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Media" ADD COLUMN "titleDe" TEXT;
ALTER TABLE "Media" ADD COLUMN "captionEn" TEXT;
ALTER TABLE "Media" ADD COLUMN "captionDe" TEXT;
