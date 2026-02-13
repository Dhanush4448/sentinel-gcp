# NextAuth v5 Setup Script for Sentinel Dashboard
# Run this script to verify your authentication setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NextAuth v5 Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the sentinel-dashboard directory" -ForegroundColor Red
    exit 1
}

# Check NextAuth version
Write-Host "Checking NextAuth version..." -ForegroundColor Yellow
$nextAuthVersion = npm list next-auth 2>&1 | Select-String "next-auth@"
if ($nextAuthVersion -match "next-auth@5") {
    Write-Host "✓ NextAuth v5 is installed" -ForegroundColor Green
} else {
    Write-Host "✗ NextAuth v5 is not installed. Run: npm install" -ForegroundColor Red
}

Write-Host ""

# Check for .env.local file
Write-Host "Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local file exists" -ForegroundColor Green
    
    # Check for required variables
    $envContent = Get-Content ".env.local" -Raw
    
    $requiredVars = @(
        "AUTH_GOOGLE_ID",
        "AUTH_GOOGLE_SECRET", 
        "AUTH_SECRET",
        "AUTH_TRUST_HOST",
        "AUTH_URL"
    )
    
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=") {
            Write-Host "  ✓ $var is set" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $var is missing" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✗ .env.local file not found" -ForegroundColor Red
    Write-Host "  Create .env.local with the following variables:" -ForegroundColor Yellow
    Write-Host "    AUTH_GOOGLE_ID=your_google_client_id" -ForegroundColor Gray
    Write-Host "    AUTH_GOOGLE_SECRET=your_google_client_secret" -ForegroundColor Gray
    Write-Host "    AUTH_SECRET=your_32_character_secret" -ForegroundColor Gray
    Write-Host "    AUTH_TRUST_HOST=true" -ForegroundColor Gray
    Write-Host "    AUTH_URL=http://localhost:3000" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Ensure .env.local has all required variables" -ForegroundColor White
Write-Host "2. Configure Google OAuth callback URL:" -ForegroundColor White
Write-Host "   http://localhost:3000/api/auth/callback/google" -ForegroundColor Gray
Write-Host "3. Start dev server: npm run dev" -ForegroundColor White
Write-Host "4. Visit http://localhost:3000/auth-check to verify" -ForegroundColor White
Write-Host ""

# Check if dev server should be started
$startServer = Read-Host "Start dev server now? (y/n)"
if ($startServer -eq "y" -or $startServer -eq "Y") {
    Write-Host "Starting dev server..." -ForegroundColor Green
    npm run dev
}
