# Temporarily disable database connection
# This allows the app to run with JWT sessions when Docker isn't available

$envFile = ".env.local"
$backupFile = ".env.local.backup"

if (Test-Path $envFile) {
    # Create backup
    Copy-Item $envFile $backupFile -Force
    Write-Host "Created backup: $backupFile" -ForegroundColor Green
    
    # Comment out DATABASE_URL
    $content = Get-Content $envFile
    $newContent = $content | ForEach-Object {
        if ($_ -match "^DATABASE_URL=") {
            "# $_"
        } else {
            $_
        }
    }
    $newContent | Set-Content $envFile
    Write-Host "DATABASE_URL has been commented out" -ForegroundColor Yellow
    Write-Host "The app will now use JWT sessions (no database required)" -ForegroundColor Green
    Write-Host "`nTo re-enable database, run: .\enable-db.ps1" -ForegroundColor Cyan
} else {
    Write-Host "Error: $envFile not found" -ForegroundColor Red
}
