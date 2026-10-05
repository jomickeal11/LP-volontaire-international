-- Suit la consultation des demandes de participation par l'administrateur.
-- Champ distinct de `reviewedAt` : « lue » ne signifie pas « validée », une
-- demande peut rester PENDING après avoir été consultée.
ALTER TABLE "DemandeParticipation" ADD COLUMN "readAt" TIMESTAMP(3);

-- Indicateur « non lue » : Requête du back-office sur les seules demandes non consultées.
CREATE INDEX "DemandeParticipation_readAt_idx" ON "DemandeParticipation"("readAt");

-- Comptage par événement dans la liste des événements.
CREATE INDEX "DemandeParticipation_eventId_readAt_idx" ON "DemandeParticipation"("eventId", "readAt");
