-- Additive account activation and one-time administrator invitation support.
-- Existing accounts and role strings are preserved; active accounts default to true.
ALTER TABLE "Utilisateur"
ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "InvitationAdministrateur" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvitationAdministrateur_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InvitationAdministrateur_tokenHash_key" ON "InvitationAdministrateur"("tokenHash");
CREATE INDEX "InvitationAdministrateur_email_status_idx" ON "InvitationAdministrateur"("email", "status");
CREATE INDEX "InvitationAdministrateur_expiresAt_idx" ON "InvitationAdministrateur"("expiresAt");
