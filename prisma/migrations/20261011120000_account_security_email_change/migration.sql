ALTER TABLE "Utilisateur"
  ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "ChangementEmailUtilisateur" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "newEmail" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "lastAttemptAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChangementEmailUtilisateur_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChangementEmailUtilisateur_userId_key"
  ON "ChangementEmailUtilisateur"("userId");
CREATE UNIQUE INDEX "ChangementEmailUtilisateur_newEmail_key"
  ON "ChangementEmailUtilisateur"("newEmail");
CREATE UNIQUE INDEX "ChangementEmailUtilisateur_tokenHash_key"
  ON "ChangementEmailUtilisateur"("tokenHash");
CREATE INDEX "ChangementEmailUtilisateur_expiresAt_idx"
  ON "ChangementEmailUtilisateur"("expiresAt");

ALTER TABLE "ChangementEmailUtilisateur"
  ADD CONSTRAINT "ChangementEmailUtilisateur_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "Utilisateur"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
