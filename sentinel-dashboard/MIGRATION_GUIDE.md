# Migration Guide: Local Dev → Production

## 🎯 What Changed

### 1. Database Schema Updates

**New Tables:**
- `User` - User accounts with RBAC roles
- `Account` - OAuth provider accounts
- `Session` - Persistent sessions
- `VerificationToken` - Email verification tokens

**Enhanced:**
- `SecurityLog` - Now linked to User table with metadata support

**New Enum:**
- `Role` - USER, ADMIN, MODERATOR, VIEWER

### 2. Authentication Changes

- **Before**: Sessions stored in cookies (stateless)
- **After**: Sessions stored in database (persistent)

### 3. New Features

- ✅ RBAC (Role-Based Access Control)
- ✅ Structured logging (GCP Cloud Logging compatible)
- ✅ Secret Manager integration
- ✅ Production-ready Dockerfile
- ✅ Cloud Run deployment configs

## 📝 Migration Steps

### Step 1: Update Database Schema

```powershell
cd sentinel-dashboard

# Generate Prisma client with new schema
npm run db:generate

# Create and apply migrations
npm run db:migrate
```

### Step 2: Update Environment Variables

Your existing `.env.local` should work, but ensure you have:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
AUTH_GOOGLE_ID=your-client-id
AUTH_GOOGLE_SECRET=your-client-secret
AUTH_SECRET=your-32-char-secret
AUTH_TRUST_HOST=true
AUTH_URL=http://localhost:3000
```

### Step 3: Test Locally

```powershell
# Start dev server
npm run dev

# Test sign-in
# 1. Visit http://localhost:3000
# 2. Sign in with Google
# 3. Check database - you should see a new User record
# 4. Check sessions table - you should see a session record
```

### Step 4: Verify RBAC

```powershell
# Open Prisma Studio
npm run db:studio

# Check User table - new users should have role = USER
# You can manually change a user's role to ADMIN for testing
```

### Step 5: Prepare for Production

1. **Create GCP Secrets** (see PRODUCTION_SETUP.md)
2. **Run migrations in production database**
3. **Deploy to Cloud Run**

## 🔄 Data Migration

### Existing SecurityLogs

Existing `SecurityLog` records will continue to work. The `user_id` field is now optional and can be linked to the User table.

### User Migration

When users sign in for the first time:
- A new `User` record is created
- An `Account` record links their Google account
- A `Session` record is created
- Default role is `USER`

## ⚠️ Breaking Changes

### API Changes

- `/api/logs` now requires authentication
- All protected routes require valid session
- Admin routes require `ADMIN` role

### Session Behavior

- Sessions now persist across server restarts
- Session expiration is 30 days (configurable in `auth.ts`)
- Sessions are stored in database, not just cookies

## 🧪 Testing Checklist

- [ ] Sign in creates User record
- [ ] Session persists after server restart
- [ ] RBAC permissions work correctly
- [ ] Logging captures security events
- [ ] API routes require authentication
- [ ] Admin routes require ADMIN role

## 🐛 Common Issues

### "User not found" errors

- Ensure migrations ran successfully
- Check DATABASE_URL is correct
- Verify Prisma client is generated

### "Permission denied" errors

- Check user has a role assigned
- Verify RBAC middleware is working
- Check Cloud Logging for details

### Session not persisting

- Verify database connection
- Check Session table exists
- Ensure adapter is configured in auth.ts

## 📚 Next Steps

1. Review `PRODUCTION_SETUP.md` for deployment
2. Set up GCP Secret Manager
3. Configure Cloud Run
4. Monitor logs in GCP Console
