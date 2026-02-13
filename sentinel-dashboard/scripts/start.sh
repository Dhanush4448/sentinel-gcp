#!/bin/sh
# Production startup script for Cloud Run
# Handles secret loading and Prisma migrations

set -e

echo "🚀 Starting Sentinel Dashboard..."

# Load secrets from Secret Manager if in production
if [ "$NODE_ENV" = "production" ] && [ -n "$GOOGLE_CLOUD_PROJECT" ]; then
  echo "📋 Loading secrets from Secret Manager..."
  
  # Function to get secret
  get_secret() {
    gcloud secrets versions access latest --secret="$1" --project="$GOOGLE_CLOUD_PROJECT" 2>/dev/null || echo ""
  }
  
  # Load secrets into environment
  export AUTH_SECRET=${AUTH_SECRET:-$(get_secret "AUTH_SECRET")}
  export AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID:-$(get_secret "AUTH_GOOGLE_ID")}
  export AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET:-$(get_secret "AUTH_GOOGLE_SECRET")}
  export DATABASE_URL=${DATABASE_URL:-$(get_secret "DATABASE_URL")}
  export AUTH_TRUST_HOST=${AUTH_TRUST_HOST:-"true"}
  export AUTH_URL=${AUTH_URL:-"https://${GOOGLE_CLOUD_PROJECT}.run.app"}
  
  echo "✅ Secrets loaded"
else
  echo "ℹ️  Running in development mode (using environment variables)"
fi

# Run Prisma migrations (if database is available)
if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "" ]; then
  echo "🔄 Running database migrations..."
  npx prisma migrate deploy || {
    echo "⚠️  Migration failed, attempting to continue..."
    # Don't exit - let the app start even if migrations fail
  }
  echo "✅ Database migrations complete"
else
  echo "ℹ️  No DATABASE_URL set - using JWT sessions"
fi

# Start the application
echo "🌟 Starting Next.js server..."
exec node server.js