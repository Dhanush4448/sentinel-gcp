# PowerShell deployment script for GCP Cloud Run

$ErrorActionPreference = "Stop"

$PROJECT_ID = if ($env:GCP_PROJECT_ID) { $env:GCP_PROJECT_ID } else { gcloud config get-value project 2>$null }
$REGION = if ($env:GCP_REGION) { $env:GCP_REGION } else { "us-central1" }
$SERVICE_NAME = "sentinel-dashboard"

Write-Host "🚀 Deploying Sentinel Dashboard to Cloud Run" -ForegroundColor Cyan
Write-Host "Project: $PROJECT_ID" -ForegroundColor Gray
Write-Host "Region: $REGION" -ForegroundColor Gray
Write-Host "Service: $SERVICE_NAME" -ForegroundColor Gray

if (-not $PROJECT_ID) {
    Write-Host "❌ Error: GCP Project ID not set. Set GCP_PROJECT_ID environment variable or configure gcloud." -ForegroundColor Red
    exit 1
}

# Check if secrets exist
Write-Host "`n📋 Checking required secrets..." -ForegroundColor Yellow
$REQUIRED_SECRETS = @("AUTH_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "DATABASE_URL")

foreach ($secret in $REQUIRED_SECRETS) {
    $secretExists = gcloud secrets describe $secret --project=$PROJECT_ID 2>$null
    if (-not $secretExists) {
        Write-Host "⚠️  Secret $secret not found. Please create it manually:" -ForegroundColor Yellow
        Write-Host "   gcloud secrets create $secret --data-file=- --project=$PROJECT_ID" -ForegroundColor Gray
        Write-Host "   (Then paste the secret value and press Ctrl+D)" -ForegroundColor Gray
    } else {
        Write-Host "✅ Secret exists: $secret" -ForegroundColor Green
    }
}

# Build and deploy using Cloud Build
Write-Host "`n🔨 Building and deploying..." -ForegroundColor Yellow
gcloud builds submit `
    --config=cloudbuild.yaml `
    --project=$PROJECT_ID `
    --substitutions="_REGION=$REGION"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
    Write-Host "🌐 Service URL:" -ForegroundColor Cyan
    gcloud run services describe $SERVICE_NAME `
        --region=$REGION `
        --project=$PROJECT_ID `
        --format="value(status.url)"
} else {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
