# GCP Cloud Run Deployment Guide

## Prerequisites

1. **GCP Project** with billing enabled
2. **gcloud CLI** installed and authenticated
3. **PostgreSQL Database** (Cloud SQL or external)
4. **Google OAuth** credentials configured

## Step 1: Set Up Cloud SQL Database

### Create Cloud SQL Instance

```powershell
# Set your project ID
$PROJECT_ID = "your-project-id"
$INSTANCE_NAME = "sentinel-db"
$REGION = "us-central1"

# Create PostgreSQL instance
gcloud sql instances create $INSTANCE_NAME `
  --database-version=POSTGRES_15 `
  --tier=db-f1-micro `
  --region=$REGION `
  --project=$PROJECT_ID

# Create database
gcloud sql databases create sentinel_dashboard --instance=$INSTANCE_NAME --project=$PROJECT_ID

# Create user
gcloud sql users create sentinel_user --instance=$INSTANCE_NAME --password=YOUR_SECURE_PASSWORD --project=$PROJECT_ID
```

### Get Connection Details

```powershell
# Get connection name
gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)" --project=$PROJECT_ID

# Connection string format:
# postgresql://user:password@/database?host=/cloudsql/PROJECT:REGION:INSTANCE
```

## Step 2: Create Secrets in Secret Manager

```powershell
# Set project
$PROJECT_ID = "your-project-id"
gcloud config set project $PROJECT_ID

# Create secrets
echo "your-auth-secret-value" | gcloud secrets create AUTH_SECRET --data-file=- --replication-policy="automatic"
echo "your-google-client-id" | gcloud secrets create AUTH_GOOGLE_ID --data-file=- --replication-policy="automatic"
echo "your-google-client-secret" | gcloud secrets create AUTH_GOOGLE_SECRET --data-file=- --replication-policy="automatic"
echo "postgresql://user:pass@/db?host=/cloudsql/PROJECT:REGION:INSTANCE" | gcloud secrets create DATABASE_URL --data-file=- --replication-policy="automatic"
```

## Step 3: Grant Cloud Run Access to Secrets

```powershell
# Get Cloud Run service account
$SERVICE_ACCOUNT = "${PROJECT_ID}@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant secret accessor role
$SECRETS = @("AUTH_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "DATABASE_URL")
foreach ($secret in $SECRETS) {
  gcloud secrets add-iam-policy-binding $secret `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/secretmanager.secretAccessor" `
    --project=$PROJECT_ID
}
```

## Step 4: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI:
   ```
   https://your-service-url.run.app/api/auth/callback/google
   ```
   (You'll get the URL after deployment)

## Step 5: Deploy to Cloud Run

### Option 1: Using Cloud Build (Recommended)

```powershell
# Set variables
$PROJECT_ID = "your-project-id"
$REGION = "us-central1"

# Submit build
gcloud builds submit `
  --config=cloudbuild.yaml `
  --project=$PROJECT_ID `
  --substitutions="_REGION=$REGION"
```

### Option 2: Manual Deployment

```powershell
# Build and push image
gcloud builds submit --tag gcr.io/$PROJECT_ID/sentinel-dashboard

# Deploy to Cloud Run
gcloud run deploy sentinel-dashboard `
  --image gcr.io/$PROJECT_ID/sentinel-dashboard:latest `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --set-secrets="AUTH_SECRET=AUTH_SECRET:latest,AUTH_GOOGLE_ID=AUTH_GOOGLE_ID:latest,AUTH_GOOGLE_SECRET=AUTH_GOOGLE_SECRET:latest,DATABASE_URL=DATABASE_URL:latest" `
  --set-env-vars="NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID" `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300
```

## Step 6: Run Database Migrations

After deployment, migrations run automatically via `start.sh`. To run manually:

```powershell
# Connect to Cloud SQL
gcloud sql connect $INSTANCE_NAME --user=sentinel_user --project=$PROJECT_ID

# Or use Cloud Run job
gcloud run jobs create migrate-db `
  --image gcr.io/$PROJECT_ID/sentinel-dashboard:latest `
  --region $REGION `
  --set-secrets="DATABASE_URL=DATABASE_URL:latest" `
  --command "npx" `
  --args "prisma,migrate,deploy"
```

## Step 7: Verify Deployment

1. **Get service URL**:
   ```powershell
   gcloud run services describe sentinel-dashboard --region=$REGION --format="value(status.url)"
   ```

2. **Test endpoints**:
   - Health: `https://your-url.run.app/api/health`
   - Auth check: `https://your-url.run.app/auth-check`
   - Home: `https://your-url.run.app/`

3. **Check logs**:
   ```powershell
   gcloud run services logs read sentinel-dashboard --region=$REGION
   ```

## Environment Variables

### Required Secrets (in Secret Manager)
- `AUTH_SECRET` - NextAuth secret (32+ characters)
- `AUTH_GOOGLE_ID` - Google OAuth Client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth Client Secret
- `DATABASE_URL` - PostgreSQL connection string

### Runtime Environment Variables
- `NODE_ENV=production`
- `GOOGLE_CLOUD_PROJECT` - Your GCP project ID
- `AUTH_TRUST_HOST=true`
- `AUTH_URL` - Your Cloud Run service URL

## Troubleshooting

### Service won't start
- Check Cloud Run logs: `gcloud run services logs read sentinel-dashboard`
- Verify secrets are accessible
- Check database connection

### Database connection errors
- Verify Cloud SQL instance is running
- Check connection string format
- Ensure Cloud Run has access to Cloud SQL

### Authentication errors
- Verify OAuth callback URL matches exactly
- Check secrets are loaded correctly
- Review Cloud Run logs for errors

## Cost Optimization

- **Min instances**: Set to 0 for cost savings (cold starts acceptable)
- **Max instances**: Adjust based on traffic
- **Memory**: 512Mi is sufficient for most workloads
- **CPU**: 1 vCPU is standard

## Security Checklist

- [ ] Secrets stored in Secret Manager (not in code)
- [ ] Cloud Run service account has minimal permissions
- [ ] Database uses strong passwords
- [ ] OAuth callback URLs are correctly configured
- [ ] HTTPS is enforced (automatic with Cloud Run)
- [ ] Database is in private network (Cloud SQL)
