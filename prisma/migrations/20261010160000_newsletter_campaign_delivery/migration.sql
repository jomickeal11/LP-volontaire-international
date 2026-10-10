ALTER TABLE "NewsletterCampagne"
  ADD COLUMN "startedAt" TIMESTAMP(3),
  ADD COLUMN "completedAt" TIMESTAMP(3),
  ADD COLUMN "totalRecipients" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "sentCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "failedCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "NewsletterCampagneDestinataire" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "subscriberId" TEXT,
  "lang" "LanguageCode" NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "emailLogId" TEXT,
  "error" TEXT,
  "lastAttemptAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NewsletterCampagneDestinataire_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NewsletterCampagneDestinataire_campaignId_subscriberId_key"
  ON "NewsletterCampagneDestinataire"("campaignId", "subscriberId");
CREATE INDEX "NewsletterCampagneDestinataire_campaignId_status_createdAt_idx"
  ON "NewsletterCampagneDestinataire"("campaignId", "status", "createdAt");
CREATE INDEX "NewsletterCampagneDestinataire_subscriberId_idx"
  ON "NewsletterCampagneDestinataire"("subscriberId");

ALTER TABLE "NewsletterCampagneDestinataire"
  ADD CONSTRAINT "NewsletterCampagneDestinataire_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "NewsletterCampagne"("id")
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "NewsletterCampagneDestinataire_subscriberId_fkey"
  FOREIGN KEY ("subscriberId") REFERENCES "NewsletterAbonne"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
