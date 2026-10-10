UPDATE "PropositionProjet"
SET "status" = CASE "status"
    WHEN 'NEW' THEN 'NOUVEAU'
    WHEN 'REVIEW' THEN 'EN_EXAMEN'
    WHEN 'CONTACTED' THEN 'INFORMATIONS_COMPLEMENTAIRES'
    WHEN 'ACCEPTED' THEN 'ACCEPTE_COLLABORATION'
    WHEN 'DECLINED' THEN 'REFUSE'
    WHEN 'ARCHIVED' THEN 'REFUSE'
    ELSE "status"
END;

ALTER TABLE "PropositionProjet" ALTER COLUMN "status" SET DEFAULT 'NOUVEAU';

CREATE TABLE "DocumentPropositionNote" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentPropositionNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HistoriquePropositionProjet" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "changedById" TEXT,
    "changedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoriquePropositionProjet_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DocumentPropositionNote_proposalId_createdAt_idx" ON "DocumentPropositionNote"("proposalId", "createdAt");
CREATE INDEX "DocumentPropositionNote_authorId_idx" ON "DocumentPropositionNote"("authorId");
CREATE INDEX "HistoriquePropositionProjet_proposalId_createdAt_idx" ON "HistoriquePropositionProjet"("proposalId", "createdAt");
CREATE INDEX "HistoriquePropositionProjet_changedById_idx" ON "HistoriquePropositionProjet"("changedById");

ALTER TABLE "DocumentPropositionNote"
ADD CONSTRAINT "DocumentPropositionNote_proposalId_fkey"
FOREIGN KEY ("proposalId") REFERENCES "PropositionProjet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentPropositionNote"
ADD CONSTRAINT "DocumentPropositionNote_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "HistoriquePropositionProjet"
ADD CONSTRAINT "HistoriquePropositionProjet_proposalId_fkey"
FOREIGN KEY ("proposalId") REFERENCES "PropositionProjet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HistoriquePropositionProjet"
ADD CONSTRAINT "HistoriquePropositionProjet_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "HistoriquePropositionProjet" ("id", "proposalId", "fromStatus", "toStatus", "changedByName", "createdAt")
SELECT
    'init_' || "id",
    "id",
    NULL,
    "status",
    'APTIC-R — système',
    "createdAt"
FROM "PropositionProjet"
WHERE NOT EXISTS (
    SELECT 1
    FROM "HistoriquePropositionProjet" AS history
    WHERE history."proposalId" = "PropositionProjet"."id"
);
