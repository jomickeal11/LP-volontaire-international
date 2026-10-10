CREATE TABLE "NewsletterCampagne" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "lang" "LanguageCode" NOT NULL DEFAULT 'FR',
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "subjectFr" TEXT NOT NULL,
  "subjectEn" TEXT NOT NULL,
  "subjectDe" TEXT NOT NULL,
  "contentFr" TEXT NOT NULL,
  "contentEn" TEXT NOT NULL,
  "contentDe" TEXT NOT NULL,
  "lastTestSentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NewsletterCampagne_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NewsletterCampagne_status_updatedAt_idx"
  ON "NewsletterCampagne"("status", "updatedAt");
CREATE INDEX "NewsletterCampagne_lang_idx"
  ON "NewsletterCampagne"("lang");
