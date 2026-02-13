#!/bin/sh
# Database migration script for production

set -e

echo "🔄 Running database migrations..."

# Load DATABASE_URL from Secret Manager if in production
if [ "$NODE_ENV" = "production" ] && [ -n "$GOOGLE_CLOUD_PROJECT" ]; then
  echo "📋 Loading DATABASE_URL from Secret Manager..."
  export DATABASE_URL=$(gcloud secrets versions access latest --secret="DATABASE_URL" --project="$GOOGLE_CLOUD_PROJECT")
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL not set"
  exit 1
fi

# Run migrations
npx prisma migrate deploy

echo "✅ Migrations complete!"
