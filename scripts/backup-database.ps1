param(
    [string]$BackupDir = ".\backups\postgres",
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "apticr_backup_$Timestamp.sql"

Write-Host "Debut de la sauvegarde PostgreSQL de la base APTIC-R..." -ForegroundColor Cyan

# Lecture de la variable DATABASE_URL depuis .env si present
$DbUrl = $env:DATABASE_URL
if (-not $DbUrl -and (Test-Path ".env")) {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^\s*DATABASE_URL\s*=\s*['""]?(.*?)['""]?\s*$") {
            $DbUrl = $matches[1]
        }
    }
}

try {
    if ($DbUrl) {
        pg_dump $DbUrl -f $BackupFile
    } else {
        pg_dump -U postgres -d apticr_volunteers -f $BackupFile
    }

    $FileObj = Get-Item $BackupFile
    $SizeKB = [math]::Round($FileObj.Length / 1KB, 2)
    Write-Host "Sauvegarde terminee avec succes : $BackupFile ($SizeKB Ko)" -ForegroundColor Green

    # Purge des anciennes sauvegardes
    $LimitDate = (Get-Date).AddDays(-$RetentionDays)
    Get-ChildItem -Path $BackupDir -Filter "apticr_backup_*.sql" | Where-Object { $_.LastWriteTime -lt $LimitDate } | Remove-Item -Force
} catch {
    Write-Host "Erreur ou pg_dump non disponible dans le PATH : $($_.Exception.Message)" -ForegroundColor Yellow
}
