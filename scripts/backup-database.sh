#!/usr/bin/env bash
# ==============================================================================
# APTIC-R — Script Automatisé de Sauvegarde PostgreSQL
# Usage : ./scripts/backup-database.sh
# Recommandation : Exécuter via tâche Cron quotidienne (ex: 03:00 du matin)
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/apticr_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

echo "📦 [$(date)] Début de la sauvegarde de la base de données APTIC-R..."

# Si DATABASE_URL est défini, extraire et utiliser pg_dump
if [ -n "${DATABASE_URL:-}" ]; then
  pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"
else
  # Fallback variables d'environnement locales
  DB_HOST="${PGHOST:-localhost}"
  DB_PORT="${PGPORT:-5432}"
  DB_NAME="${PGDATABASE:-apticr_volunteers}"
  DB_USER="${PGUSER:-postgres}"

  PGPASSWORD="${PGPASSWORD:-}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"
fi

FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "✅ [$(date)] Sauvegarde réussie : ${BACKUP_FILE} (${FILESIZE})"

# Purge des sauvegardes de plus de 30 jours
echo "🧹 Nettoyage des anciennes sauvegardes (> ${RETENTION_DAYS} jours)..."
find "${BACKUP_DIR}" -name "apticr_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete || true

echo "✨ Opération terminée avec succès."
