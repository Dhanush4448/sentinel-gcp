# Re-enable database connection

$envFile = ".env.local"
$backupFile = ".env.local.backup"

if (Test-Path $backupFile) {
    # Restore from backup
    Copy-Item $backupFile $envFile -Force
    Write-Host "Database connection restored from backup" -ForegroundColor Green
    Write-Host "Make sure Docker Desktop is running before restarting the app" -ForegroundColor Yellow
} else {
    Write-Host "No backup found. Please manually uncomment DATABASE_URL in .env.local" -ForegroundColor Yellow
}
