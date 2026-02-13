# Production Setup Guide - Sentinel Dashboard

## 🎯 Overview

This guide covers the industry-level production setup for Sentinel Dashboard on GCP Cloud Run with:
- ✅ Persistent session storage (PostgreSQL)
- ✅ GCP Secret Manager integration
- ✅ Structured logging (GCP Cloud Logging)
- ✅ Role-Based Access Control (RBAC)

## 📋 Prerequisites

1. **GCP Account** with billing enabled
2. **gcloud CLI** installed and configured
3. **PostgreSQL Database** (Cloud SQL or managed PostgreSQL)
4. **Docker** (for local testing)

## 🗄️ Database Setup

### 1. Run Prisma Migrations

```powershell
cd sentinel-dashboard
npm run db:migrate
```

This will:
- Create NextAuth tables (User, Account, Session, VerificationToken)
- Add RBAC role enum
- Enhance SecurityLog with relationships

### 2. Verify Database Schema

```powershell
npm run db:studio
```

## 🔐 Secret Manager Setup

### Create Secrets in GCP Secret Manager

```powershell
# Set your project ID
$PROJECT_ID = "your-gcp-project-id"

# Create secrets (you'll be prompted to enter values)
echo "your-auth-secret-value" | gcloud secrets create AUTH_SECRET --data-file=- --project=$PROJECT_ID
echo "your-google-client-id" | gcloud secrets create AUTH_GOOGLE_ID --data-file=- --project=$PROJECT_ID
echo "your-google-client-secret" | gcloud secrets create AUTH_GOOGLE_SECRET --data-file=- --project=$PROJECT_ID
echo "postgresql://user:pass@host:5432/dbname" | gcloud secrets create DATABASE_URL --data-file=- --project=$PROJECT_ID
```

### Grant Cloud Run Access to Secrets

```powershell
# Get your Cloud Run service account
$SERVICE_ACCOUNT = "your-service-account@your-project.iam.gserviceaccount.com"

# Grant secret accessor role
gcloud secrets add-iam-policy-binding AUTH_SECRET --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/secretmanager.secretAccessor" --project=$PROJECT_ID
gcloud secrets add-iam-policy-binding AUTH_GOOGLE_ID --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/secretmanager.secretAccessor" --project=$PROJECT_ID
gcloud secrets add-iam-policy-binding AUTH_GOOGLE_SECRET --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/secretmanager.secretAccessor" --project=$PROJECT_ID
gcloud secrets add-iam-policy-binding DATABASE_URL --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/secretmanager.secretAccessor" --project=$PROJECT_ID
```

## 🚀 Deployment

### Option 1: Using Cloud Build (Recommended)

```powershell
# Set environment variables
$env:GCP_PROJECT_ID = "your-project-id"
$env:GCP_REGION = "us-central1"

# Deploy
.\deploy.ps1
```

### Option 2: Manual Deployment

```powershell
# Build and push image
gcloud builds submit --tag gcr.io/$PROJECT_ID/sentinel-dashboard

# Deploy to Cloud Run
gcloud run deploy sentinel-dashboard \
  --image gcr.io/$PROJECT_ID/sentinel-dashboard \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="AUTH_SECRET=AUTH_SECRET:latest,AUTH_GOOGLE_ID=AUTH_GOOGLE_ID:latest,AUTH_GOOGLE_SECRET=AUTH_GOOGLE_SECRET:latest,DATABASE_URL=DATABASE_URL:latest" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

## 🔒 RBAC Configuration

### Default Roles

- **VIEWER**: Read-only access to logs
- **USER**: Read and write logs
- **MODERATOR**: Full log management + content moderation
- **ADMIN**: Full system access

### Assigning Roles

Users are assigned roles on first sign-in. To change a user's role:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

Or use Prisma Studio:
```powershell
npm run db:studio
```

## 📊 Monitoring & Logging

### View Logs in GCP Console

1. Go to [Cloud Logging](https://console.cloud.google.com/logs)
2. Filter by service: `sentinel-dashboard`
3. View structured logs with severity levels

### Log Levels

- **DEBUG**: Development debugging
- **INFO**: General information
- **WARN**: Warning conditions
- **ERROR**: Error conditions
- **CRITICAL**: Critical failures

### Audit Logs

All security events are automatically logged:
- User sign-ins
- Permission denials
- API access
- Admin actions

## 🔧 Environment Variables

### Local Development (.env.local)

```env
AUTH_GOOGLE_ID=your-client-id
AUTH_GOOGLE_SECRET=your-client-secret
AUTH_SECRET=your-32-char-secret
AUTH_TRUST_HOST=true
AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

### Production (Secret Manager)

All secrets are stored in GCP Secret Manager and automatically loaded at runtime.

## 🧪 Testing

### Local Testing

```powershell
# Start dev server
npm run dev

# Test authentication
# Visit http://localhost:3000

# Test RBAC
# Try accessing /api/logs (requires authentication)
```

### Production Testing

1. Deploy to Cloud Run
2. Visit the service URL
3. Sign in with Google
4. Verify session persistence
5. Check Cloud Logging for structured logs

## 🐛 Troubleshooting

### Session Not Persisting

- Verify DATABASE_URL is correct
- Check Prisma migrations ran successfully
- Ensure database connection is working

### Secret Manager Errors

- Verify service account has `secretAccessor` role
- Check secret names match exactly
- Ensure project ID is correct

### RBAC Not Working

- Verify user has a role assigned in database
- Check middleware is running
- Review Cloud Logging for permission errors

## 📚 Additional Resources

- [NextAuth v5 Documentation](https://authjs.dev)
- [GCP Cloud Run Docs](https://cloud.google.com/run/docs)
- [GCP Secret Manager Docs](https://cloud.google.com/secret-manager/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
