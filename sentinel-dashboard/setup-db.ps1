# Quick Database Setup Script
# This script sets up PostgreSQL database for Sentinel Dashboard

Write-Host "`n=== Database Setup for Sentinel Dashboard ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker is running" -ForegroundColor Green
        $dockerRunning = $true
    } else {
        Write-Host "❌ Docker is not running" -ForegroundColor Red
        Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
        $dockerRunning = $false
    }
} catch {
    Write-Host "❌ Docker is not available" -ForegroundColor Red
    $dockerRunning = $false
}

if ($dockerRunning) {
    Write-Host "`nStarting PostgreSQL database..." -ForegroundColor Yellow
    
    # Navigate to project directory
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location $scriptPath
    
    # Start database using docker-compose
    docker-compose up -d db
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database container started" -ForegroundColor Green
        Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        # Database connection details from docker-compose.yml
        # Get DATABASE_URL from environment or use default for local dev
        $dbUrl = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { "postgresql://user:password@localhost:5432/sentinel_db" }
        
        Write-Host "`n📝 Adding DATABASE_URL to .env.local..." -ForegroundColor Cyan
        
        # Read existing .env.local or create new
        $envFile = ".env.local"
        $envContent = @()
        
        if (Test-Path $envFile) {
            $envContent = Get-Content $envFile
            # Remove existing DATABASE_URL if present
            $envContent = $envContent | Where-Object { $_ -notmatch "^DATABASE_URL=" }
        }
        
        # Add DATABASE_URL
        $envContent += "DATABASE_URL=$dbUrl"
        
        # Write back to file
        $envContent | Set-Content $envFile
        
        Write-Host "✅ DATABASE_URL added to .env.local" -ForegroundColor Green
        Write-Host "   $dbUrl" -ForegroundColor Gray
        
        Write-Host "`n🔄 Running database migrations..." -ForegroundColor Yellow
        npm run db:migrate
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migrations completed successfully!" -ForegroundColor Green
            Write-Host "`n🎉 Database setup complete!" -ForegroundColor Green
            Write-Host "`nNext steps:" -ForegroundColor Cyan
            Write-Host "1. Restart your dev server (Ctrl+C then npm run dev)" -ForegroundColor White
            Write-Host "2. Check health endpoint: http://localhost:3000/api/health" -ForegroundColor White
            Write-Host "3. Database should show 'connected' status" -ForegroundColor White
        } else {
            Write-Host "❌ Migration failed. Check the error above." -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Failed to start database container" -ForegroundColor Red
        Write-Host "Check Docker Desktop is running and try again" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n📋 Manual Setup Instructions:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1: Start Docker Desktop" -ForegroundColor Yellow
    Write-Host "1. Open Docker Desktop" -ForegroundColor White
    Write-Host "2. Wait for it to start" -ForegroundColor White
    Write-Host "3. Run this script again: .\setup-db.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Manual PostgreSQL Setup" -ForegroundColor Yellow
    Write-Host "1. Install PostgreSQL or use existing instance" -ForegroundColor White
    Write-Host "2. Create database: CREATE DATABASE sentinel_db;" -ForegroundColor White
    Write-Host "3. Add to .env.local:" -ForegroundColor White
    Write-Host "   DATABASE_URL=postgresql://user:password@localhost:5432/sentinel_db" -ForegroundColor Gray
    Write-Host "4. Run: npm run db:migrate" -ForegroundColor White
}

Write-Host ""
