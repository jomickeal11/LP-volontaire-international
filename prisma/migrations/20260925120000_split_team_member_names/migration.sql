BEGIN;

ALTER TABLE "MembreEquipe" ADD COLUMN "firstName" TEXT;
ALTER TABLE "MembreEquipe" ADD COLUMN "lastName" TEXT;

WITH normalized_members AS (
  SELECT
    "id",
    regexp_replace(
      btrim("name"),
      '^(Dr\.?|M\.?|Mme\.?|Mlle\.?|Prof\.?|Ir\.?)\s+',
      '',
      'i'
    ) AS "cleanName"
  FROM "MembreEquipe"
)
UPDATE "MembreEquipe" AS member
SET
  "firstName" = CASE
    WHEN normalized."cleanName" !~ '\s+' THEN normalized."cleanName"
    ELSE regexp_replace(normalized."cleanName", '\s+\S+$', '')
  END,
  "lastName" = CASE
    WHEN normalized."cleanName" !~ '\s+' THEN normalized."cleanName"
    ELSE regexp_replace(normalized."cleanName", '^.*\s+', '')
  END
FROM normalized_members AS normalized
WHERE member."id" = normalized."id";

ALTER TABLE "MembreEquipe" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "MembreEquipe" ALTER COLUMN "lastName" SET NOT NULL;
UPDATE "MembreEquipe" SET "bioFr" = '' WHERE "bioFr" IS NULL;
ALTER TABLE "MembreEquipe" ALTER COLUMN "bioFr" SET NOT NULL;
ALTER TABLE "MembreEquipe" DROP COLUMN "name";

CREATE INDEX "MembreEquipe_lastName_idx" ON "MembreEquipe"("lastName");

COMMIT;
