CREATE TABLE "PropositionProjet" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "lang" "LanguageCode" NOT NULL DEFAULT 'FR',
    "proposerName" TEXT NOT NULL,
    "organization" TEXT,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "expectedResults" TEXT NOT NULL,
    "collaboration" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "budget" TEXT,
    "message" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropositionProjet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentPropositionProjet" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentPropositionProjet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PropositionProjet_referenceNumber_key" ON "PropositionProjet"("referenceNumber");
CREATE INDEX "PropositionProjet_status_idx" ON "PropositionProjet"("status");
CREATE INDEX "PropositionProjet_email_idx" ON "PropositionProjet"("email");
CREATE INDEX "PropositionProjet_createdAt_idx" ON "PropositionProjet"("createdAt");
CREATE UNIQUE INDEX "DocumentPropositionProjet_proposalId_key" ON "DocumentPropositionProjet"("proposalId");
CREATE INDEX "DocumentPropositionProjet_proposalId_idx" ON "DocumentPropositionProjet"("proposalId");

ALTER TABLE "DocumentPropositionProjet"
ADD CONSTRAINT "DocumentPropositionProjet_proposalId_fkey"
FOREIGN KEY ("proposalId") REFERENCES "PropositionProjet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
