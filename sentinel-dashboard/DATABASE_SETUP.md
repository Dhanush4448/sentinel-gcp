# Database Setup (Optional)

## Current Status

Your application is **working perfectly** without a database! 

- ✅ Authentication works with **JWT sessions**
- ✅ Sessions are stored in encrypted cookies
- ✅ All authentication features are functional

## When Do You Need a Database?

You only need to set up a database if you want:

1. **Persistent Sessions** - Sessions survive server restarts
2. **User Management** - Store user data in database
3. **Security Logging** - Persistent audit logs
4. **Production Features** - Full RBAC with database-backed roles

## Quick Setup (If Needed)

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** (if not installed)
   - Download: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create Database**
   ```sql
   CREATE DATABASE sentinel_dashboard;
   ```

3. **Add to `.env.local`**
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/sentinel_dashboard
   ```

4. **Run Migrations**
   ```powershell
   npm run db:migrate
   ```

5. **Restart Server**
   ```powershell
   npm run dev
   ```

### Option 2: Cloud SQL (GCP)

1. **Create Cloud SQL Instance**
   ```powershell
   gcloud sql instances create sentinel-db \
     --database-version=POSTGRES_15 \
     --tier=db-f1-micro \
     --region=us-central1
   ```

2. **Create Database**
   ```powershell
   gcloud sql databases create sentinel_dashboard --instance=sentinel-db
   ```

3. **Get Connection String**
   ```powershell
   gcloud sql instances describe sentinel-db --format="value(connectionName)"
   ```

4. **Add to `.env.local`**
   ```env
   DATABASE_URL=postgresql://user:password@/database?host=/cloudsql/PROJECT:REGION:INSTANCE
   ```

## Current Behavior

### Without Database (Current)
- ✅ Authentication: **Works** (JWT sessions)
- ✅ Sign In: **Works** (Google OAuth)
- ✅ Sessions: **Work** (stored in cookies)
- ⚠️  Persistence: Sessions lost on server restart
- ⚠️  Logging: Security logs not persisted

### With Database (After Setup)
- ✅ Authentication: **Works** (Database sessions)
- ✅ Sign In: **Works** (Google OAuth)
- ✅ Sessions: **Persistent** (survive restarts)
- ✅ Logging: **Persistent** (stored in database)
- ✅ User Management: **Full** (database-backed)

## Recommendation

**For Development/Testing**: Current setup (JWT) is perfect - no database needed!

**For Production**: Set up database for persistent sessions and logging.

## No Action Required

If you're just testing authentication, **you don't need to do anything**. The current setup works perfectly for development!
