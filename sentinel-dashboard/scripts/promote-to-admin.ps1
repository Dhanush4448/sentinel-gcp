# PowerShell script to promote user to ADMIN
# Usage: .\scripts\promote-to-admin.ps1 <email>

param(
    [Parameter(Mandatory=$true)]
    [string]$Email
)

Write-Host "`n=== Promote User to ADMIN ===" -ForegroundColor Cyan
Write-Host "Email: $Email" -ForegroundColor Yellow

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "`n❌ DATABASE_URL not set!" -ForegroundColor Red
    Write-Host "Please set DATABASE_URL in your .env.local file" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nRunning promotion script..." -ForegroundColor Yellow

# Run the TypeScript script
npx ts-node scripts/promote-to-admin.ts $Email

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ User promoted successfully!" -ForegroundColor Green
    Write-Host "`nPlease sign out and sign in again to refresh your session." -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Failed to promote user" -ForegroundColor Red
}
