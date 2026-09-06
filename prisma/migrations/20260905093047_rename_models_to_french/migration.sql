/*
  Warnings:

  - You are about to drop the `AnalyticsEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Application` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ApplicationNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ApplicationSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ApplicationStatusHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Candidate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Partner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PartnerDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PartnerRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationNote" DROP CONSTRAINT "ApplicationNote_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationNote" DROP CONSTRAINT "ApplicationNote_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationSkill" DROP CONSTRAINT "ApplicationSkill_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationSkill" DROP CONSTRAINT "ApplicationSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationStatusHistory" DROP CONSTRAINT "ApplicationStatusHistory_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationStatusHistory" DROP CONSTRAINT "ApplicationStatusHistory_changedById_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "PartnerDocument" DROP CONSTRAINT "PartnerDocument_partnerId_fkey";

-- DropForeignKey
ALTER TABLE "PartnerDocument" DROP CONSTRAINT "PartnerDocument_partnerRequestId_fkey";

-- DropForeignKey
ALTER TABLE "PartnerRequest" DROP CONSTRAINT "PartnerRequest_partnerId_fkey";

-- DropTable
DROP TABLE "AnalyticsEvent";

-- DropTable
DROP TABLE "Application";

-- DropTable
DROP TABLE "ApplicationNote";

-- DropTable
DROP TABLE "ApplicationSkill";

-- DropTable
DROP TABLE "ApplicationStatusHistory";

-- DropTable
DROP TABLE "Candidate";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "Partner";

-- DropTable
DROP TABLE "PartnerDocument";

-- DropTable
DROP TABLE "PartnerRequest";

-- DropTable
DROP TABLE "Skill";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Candidat" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidature" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "status" "CandidateStatus" NOT NULL DEFAULT 'NEW',
    "lang" "LanguageCode" NOT NULL DEFAULT 'FR',
    "education" TEXT,
    "fieldOfStudy" TEXT,
    "profession" TEXT,
    "experienceLevel" "ExperienceDuration",
    "digitalSkillLevel" TEXT,
    "arrivalDate" TIMESTAMP(3),
    "duration" "MissionDuration" NOT NULL DEFAULT 'SIX_MONTHS',
    "motivation" TEXT NOT NULL,
    "projectExperience" TEXT,
    "source" TEXT,
    "consentData" BOOLEAN NOT NULL DEFAULT false,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competence" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameDe" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "Competence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetenceCandidature" (
    "applicationId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "CompetenceCandidature_pkey" PRIMARY KEY ("applicationId","skillId")
);

-- CreateTable
CREATE TABLE "DocumentCandidature" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'CV',
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileUrl" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentCandidature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriqueCandidature" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStatus" "CandidateStatus" NOT NULL,
    "toStatus" "CandidateStatus" NOT NULL,
    "changedById" TEXT,
    "changedByName" TEXT NOT NULL DEFAULT 'Système',
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoriqueCandidature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteCandidature" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'Admin APTIC-R',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteCandidature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partenaire" (
    "id" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "website" TEXT,
    "orgType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partenaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandePartenariat" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT,
    "contactPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "volunteerCount" TEXT,
    "targetCountries" TEXT,
    "programme" TEXT,
    "message" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandePartenariat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPartenaire" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT,
    "partnerRequestId" TEXT,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileUrl" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentPartenaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvenementStatistique" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lang" TEXT,
    "country" TEXT,
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvenementStatistique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidat_email_key" ON "Candidat"("email");

-- CreateIndex
CREATE INDEX "Candidat_email_idx" ON "Candidat"("email");

-- CreateIndex
CREATE INDEX "Candidat_country_idx" ON "Candidat"("country");

-- CreateIndex
CREATE UNIQUE INDEX "Candidature_referenceNumber_key" ON "Candidature"("referenceNumber");

-- CreateIndex
CREATE INDEX "Candidature_status_idx" ON "Candidature"("status");

-- CreateIndex
CREATE INDEX "Candidature_candidateId_idx" ON "Candidature"("candidateId");

-- CreateIndex
CREATE INDEX "Candidature_referenceNumber_idx" ON "Candidature"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Competence_slug_key" ON "Competence"("slug");

-- CreateIndex
CREATE INDEX "HistoriqueCandidature_applicationId_idx" ON "HistoriqueCandidature"("applicationId");

-- CreateIndex
CREATE INDEX "NoteCandidature_applicationId_idx" ON "NoteCandidature"("applicationId");

-- CreateIndex
CREATE INDEX "Partenaire_orgName_idx" ON "Partenaire"("orgName");

-- CreateIndex
CREATE INDEX "Partenaire_country_idx" ON "Partenaire"("country");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE INDEX "EvenementStatistique_name_idx" ON "EvenementStatistique"("name");

-- CreateIndex
CREATE INDEX "EvenementStatistique_createdAt_idx" ON "EvenementStatistique"("createdAt");

-- AddForeignKey
ALTER TABLE "Candidature" ADD CONSTRAINT "Candidature_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidature" ADD CONSTRAINT "Candidature_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetenceCandidature" ADD CONSTRAINT "CompetenceCandidature_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Candidature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetenceCandidature" ADD CONSTRAINT "CompetenceCandidature_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Competence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentCandidature" ADD CONSTRAINT "DocumentCandidature_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Candidature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueCandidature" ADD CONSTRAINT "HistoriqueCandidature_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Candidature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueCandidature" ADD CONSTRAINT "HistoriqueCandidature_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteCandidature" ADD CONSTRAINT "NoteCandidature_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Candidature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteCandidature" ADD CONSTRAINT "NoteCandidature_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandePartenariat" ADD CONSTRAINT "DemandePartenariat_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partenaire"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPartenaire" ADD CONSTRAINT "DocumentPartenaire_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partenaire"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPartenaire" ADD CONSTRAINT "DocumentPartenaire_partnerRequestId_fkey" FOREIGN KEY ("partnerRequestId") REFERENCES "DemandePartenariat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
