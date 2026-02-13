# Database Setup Script for Sentinel Dashboard
# This script helps set up PostgreSQL database for production use

param(
    [string]$DatabaseUrl = "",
    [switch]$Local = $false,
    [switch]$CloudSQL = $false
)

Write-Host "`n=== Database Setup for Sentinel Dashboard ===" -ForegroundColor Cyan
Write-Host ""

if ($Local) {
    Write-Host "Setting up local PostgreSQL database..." -ForegroundColor Yellow
    
    # Check if PostgreSQL is installed
    $pgInstalled = Get-Command psql -ErrorAction SilentlyContinue
    if (-not $pgInstalled) {
        Write-Host "⚠️  PostgreSQL not found in PATH" -ForegroundColor Yellow
        Write-Host "Please install PostgreSQL or use Docker:" -ForegroundColor White
        Write-Host "  docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres" -ForegroundColor Gray
        exit 1
    }
    
    Write-Host "✓ PostgreSQL found" -ForegroundColor Green
    
    # Prompt for database details
    $dbName = Read-Host "Database name (default: sentinel_dashboard)"
    if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "sentinel_dashboard" }
    
    $dbUser = Read-Host "Database user (default: postgres)"
    if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }
    
    $dbPassword = Read-Host "Database password" -AsSecureString
    $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
    )
    
    $dbHost = Read-Host "Database host (default: localhost)"
    if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }
    
    $dbPort = Read-Host "Database port (default: 5432)"
    if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }
    
    $connectionString = "postgresql://${dbUser}:${dbPasswordPlain}@${dbHost}:${dbPort}/${dbName}"
    
    Write-Host "`nCreating database..." -ForegroundColor Yellow
    $env:PGPASSWORD = $dbPasswordPlain
    psql -h $dbHost -U $dbUser -p $dbPort -c "CREATE DATABASE $dbName;" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database created" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database might already exist (this is OK)" -ForegroundColor Yellow
    }
    
    Write-Host "`nAdd this to your .env.local file:" -ForegroundColor Cyan
    Write-Host "DATABASE_URL=$connectionString" -ForegroundColor White
    
} elseif ($CloudSQL) {
    Write-Host "Setting up Cloud SQL database..." -ForegroundColor Yellow
    
    $projectId = Read-Host "GCP Project ID"
    $instanceName = Read-Host "Cloud SQL instance name"
    $region = Read-Host "Region (default: us-central1)"
    if ([string]::IsNullOrWhiteSpace($region)) { $region = "us-central1" }
    
    Write-Host "`nCreating Cloud SQL instance..." -ForegroundColor Yellow
    gcloud sql instances create $instanceName `
        --database-version=POSTGRES_15 `
        --tier=db-f1-micro `
        --region=$region `
        --project=$projectId
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Cloud SQL instance created" -ForegroundColor Green
        
        $dbName = Read-Host "Database name (default: sentinel_dashboard)"
        if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "sentinel_dashboard" }
        
        gcloud sql databases create $dbName --instance=$instanceName --project=$projectId
        
        Write-Host "`n✓ Database created" -ForegroundColor Green
        Write-Host "`nNext steps:" -ForegroundColor Cyan
        Write-Host "1. Create a user: gcloud sql users create USERNAME --instance=$instanceName --password=PASSWORD" -ForegroundColor White
        Write-Host "2. Get connection name: gcloud sql instances describe $instanceName --format='value(connectionName)'" -ForegroundColor White
        Write-Host "3. Add DATABASE_URL to GCP Secret Manager" -ForegroundColor White
    }
    
} else {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\setup-database.ps1 -Local          # Set up local PostgreSQL" -ForegroundColor White
    Write-Host "  .\setup-database.ps1 -CloudSQL       # Set up GCP Cloud SQL" -ForegroundColor White
    Write-Host ""
    Write-Host "Or manually add DATABASE_URL to .env.local:" -ForegroundColor Cyan
    Write-Host "  DATABASE_URL=postgresql://user:password@host:5432/database" -ForegroundColor White
}

Write-Host "`nAfter setting DATABASE_URL, run:" -ForegroundColor Cyan
Write-Host "  npm run db:migrate" -ForegroundColor White
