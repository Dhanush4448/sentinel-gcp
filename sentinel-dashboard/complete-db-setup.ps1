# Complete Database Setup Script
# Run this after Docker Desktop is started

Write-Host "`n=== Complete Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Docker
Write-Host "Step 1: Checking Docker..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker is not running!" -ForegroundColor Red
        Write-Host "Please start Docker Desktop and run this script again." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Docker is not available!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and run this script again." -ForegroundColor Yellow
    exit 1
}

# Step 2: Start database
Write-Host "`nStep 2: Starting PostgreSQL database..." -ForegroundColor Yellow
docker-compose up -d db

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start database container" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database container started" -ForegroundColor Green
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 3: Verify database is running
Write-Host "`nStep 3: Verifying database..." -ForegroundColor Yellow
$containerRunning = docker ps --filter "name=sentinel-dashboard-db-1" --format "{{.Names}}" | Select-String "sentinel-dashboard-db-1"

if ($containerRunning) {
    Write-Host "✅ Database container is running" -ForegroundColor Green
} else {
    Write-Host "❌ Database container is not running" -ForegroundColor Red
    Write-Host "Check logs: docker logs sentinel-dashboard-db-1" -ForegroundColor Yellow
    exit 1
}

# Step 4: Run migrations
Write-Host "`nStep 4: Running database migrations..." -ForegroundColor Yellow
npm run db:migrate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    Write-Host "Check the error above for details" -ForegroundColor Yellow
    exit 1
}

# Step 5: Verify connection
Write-Host "`nStep 5: Verifying database connection..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -ErrorAction Stop
    if ($health.services.database.status -eq "connected") {
        Write-Host "✅ Database connection verified!" -ForegroundColor Green
        Write-Host "   Status: $($health.services.database.status)" -ForegroundColor Gray
        Write-Host "   Response Time: $($health.services.database.responseTime)ms" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Database shows: $($health.services.database.status)" -ForegroundColor Yellow
        Write-Host "   You may need to restart your dev server" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not verify connection (dev server may not be running)" -ForegroundColor Yellow
    Write-Host "   Start your dev server and check: http://localhost:3000/api/health" -ForegroundColor White
}

# Summary
Write-Host "`n" + ("=" * 50) -ForegroundColor Gray
Write-Host "`n🎉 Database Setup Complete!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Restart your dev server (Ctrl+C then npm run dev)" -ForegroundColor White
Write-Host "2. Check health: http://localhost:3000/api/health" -ForegroundColor White
Write-Host "3. View database: npm run db:studio" -ForegroundColor White
Write-Host "`nDatabase Credentials:" -ForegroundColor Cyan
Write-Host "  URL: postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME" -ForegroundColor Gray
Write-Host "  User: USERNAME (from your .env.local)" -ForegroundColor Gray
Write-Host "  Password: PASSWORD (from your .env.local)" -ForegroundColor Gray
Write-Host "  Database: DATABASE_NAME (from your .env.local)" -ForegroundColor Gray
Write-Host ""
