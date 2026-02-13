#!/bin/bash
# Deployment script for GCP Cloud Run

set -e

PROJECT_ID=${GCP_PROJECT_ID:-$(gcloud config get-value project)}
REGION=${GCP_REGION:-us-central1}
SERVICE_NAME="sentinel-dashboard"

echo "🚀 Deploying Sentinel Dashboard to Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"

# Check if secrets exist
echo "📋 Checking required secrets..."
REQUIRED_SECRETS=("AUTH_SECRET" "AUTH_GOOGLE_ID" "AUTH_GOOGLE_SECRET" "DATABASE_URL")

for secret in "${REQUIRED_SECRETS[@]}"; do
  if ! gcloud secrets describe "$secret" --project="$PROJECT_ID" &>/dev/null; then
    echo "⚠️  Secret $secret not found. Creating from environment variable..."
    if [ -z "${!secret}" ]; then
      echo "❌ Error: $secret environment variable is not set"
      exit 1
    fi
    echo -n "${!secret}" | gcloud secrets create "$secret" \
      --data-file=- \
      --project="$PROJECT_ID" \
      --replication-policy="automatic"
    echo "✅ Created secret: $secret"
  else
    echo "✅ Secret exists: $secret"
  fi
done

# Build and deploy using Cloud Build
echo "🔨 Building and deploying..."
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project="$PROJECT_ID" \
  --substitutions=_REGION="$REGION"

echo "✅ Deployment complete!"
echo "🌐 Service URL:"
gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)"
