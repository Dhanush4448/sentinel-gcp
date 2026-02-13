# Database Setup - Run this script
Write-Host "`n=== Database Setup ===" -ForegroundColor Cyan

# Check Docker
Write-Host "`n[1/3] Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker is running" -ForegroundColor Green
    } else {
        throw "Docker not ready"
    }
} catch {
    Write-Host "❌ Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "`nPlease:" -ForegroundColor Yellow
    Write-Host "1. Open Docker Desktop from Start Menu" -ForegroundColor White
    Write-Host "2. Wait for it to start (whale icon steady)" -ForegroundColor White
    Write-Host "3. Run this script again: .\run-db-setup.ps1" -ForegroundColor White
    exit 1
}

# Start database
Write-Host "`n[2/3] Starting PostgreSQL database..." -ForegroundColor Yellow
docker-compose up -d db

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start database" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database container started" -ForegroundColor Green
Write-Host "Waiting 10 seconds for database to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Run migrations
Write-Host "`n[3/3] Running database migrations..." -ForegroundColor Yellow
npm run db:migrate

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Database setup complete!" -ForegroundColor Green
    Write-Host "`nNext: Restart your dev server (Ctrl+C then npm run dev)" -ForegroundColor Cyan
    Write-Host "Then check: http://localhost:3000/api/health" -ForegroundColor Cyan
} else {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    exit 1
}
