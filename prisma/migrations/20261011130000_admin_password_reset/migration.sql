CREATE TABLE "ReinitialisationMotDePasse" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "lastAttemptAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReinitialisationMotDePasse_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReinitialisationMotDePasse_userId_key"
  ON "ReinitialisationMotDePasse"("userId");
CREATE UNIQUE INDEX "ReinitialisationMotDePasse_tokenHash_key"
  ON "ReinitialisationMotDePasse"("tokenHash");
CREATE INDEX "ReinitialisationMotDePasse_expiresAt_idx"
  ON "ReinitialisationMotDePasse"("expiresAt");

ALTER TABLE "ReinitialisationMotDePasse"
  ADD CONSTRAINT "ReinitialisationMotDePasse_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "Utilisateur"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
