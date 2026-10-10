ALTER TABLE "Projet"
ADD COLUMN "sourceProposalId" TEXT;

CREATE UNIQUE INDEX "Projet_sourceProposalId_key"
ON "Projet"("sourceProposalId");

ALTER TABLE "Projet"
ADD CONSTRAINT "Projet_sourceProposalId_fkey"
FOREIGN KEY ("sourceProposalId") REFERENCES "PropositionProjet"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
