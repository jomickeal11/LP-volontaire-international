-- Preserve existing newsletter rows. Their new consent evidence remains NULL,
-- so existing consent=true values are not treated as verifiable.
ALTER TABLE "NewsletterAbonne"
  ALTER COLUMN "consent" SET DEFAULT false,
  ADD COLUMN "consentAt" TIMESTAMP(3),
  ADD COLUMN "consentSource" TEXT,
  ADD COLUMN "consentVersion" TEXT;

CREATE TABLE "NewsletterUnsubscribeToken" (
  "id" TEXT NOT NULL,
  "subscriberId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NewsletterUnsubscribeToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NewsletterUnsubscribeToken_tokenHash_key"
  ON "NewsletterUnsubscribeToken"("tokenHash");
CREATE INDEX "NewsletterUnsubscribeToken_subscriberId_idx"
  ON "NewsletterUnsubscribeToken"("subscriberId");

ALTER TABLE "NewsletterUnsubscribeToken"
  ADD CONSTRAINT "NewsletterUnsubscribeToken_subscriberId_fkey"
  FOREIGN KEY ("subscriberId") REFERENCES "NewsletterAbonne"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
