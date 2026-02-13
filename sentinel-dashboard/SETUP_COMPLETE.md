# ✅ Database Setup - Almost Complete!

## What's Already Done ✅

1. ✅ **DATABASE_URL added to `.env.local`**
   - Connection string: `postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME`
   - File location: `sentinel-dashboard/.env.local`

2. ✅ **Docker Compose configuration ready**
   - Database service configured in `docker-compose.yml`
   - Credentials: Set in your `.env.local` file (see `.env.example`)

---

## What You Need to Do Next 🚀

### Step 1: Start Docker Desktop

**Important:** Docker Desktop must be running!

1. Open **Docker Desktop** application
2. Wait for it to fully start (you'll see the Docker icon in your system tray)
3. Verify it's running - the icon should be steady (not animating)

---

### Step 2: Start the Database

Once Docker Desktop is running, open PowerShell in the `sentinel-dashboard` directory and run:

```powershell
docker-compose up -d db
```

**Expected output:**
```
Creating sentinel-dashboard-db-1 ... done
```

**Wait 5-10 seconds** for the database to initialize.

---

### Step 3: Run Database Migrations

```powershell
npm run db:migrate
```

This will create all the necessary tables (User, Session, SecurityLog, etc.).

**Expected output:**
```
✔ Prisma schema loaded
✔ Applied migration: 20240101000000_init
```

---

### Step 4: Restart Your Dev Server

1. Stop the current server (press `Ctrl+C` in the terminal where `npm run dev` is running)
2. Start it again:

```powershell
npm run dev
```

---

### Step 5: Verify Database Connection

Visit: `http://localhost:3000/api/health`

**You should see:**
```json
{
  "status": "healthy",
  "services": {
    "database": {
      "status": "connected",
      "responseTime": 5
    }
  }
}
```

✅ **If you see `"status": "connected"`, you're all set!**

---

## Quick Command Summary

```powershell
# 1. Start database (after Docker Desktop is running)
docker-compose up -d db

# 2. Run migrations
npm run db:migrate

# 3. Restart dev server
npm run dev

# 4. Check health
# Visit: http://localhost:3000/api/health
```

---

## Troubleshooting

### "Docker Desktop is not running"
**Solution:** Open Docker Desktop and wait for it to start completely.

### "Port 5432 already in use"
**Solution:** 
```powershell
# Check what's using the port
netstat -ano | findstr :5432

# Or stop existing PostgreSQL
docker stop sentinel-dashboard-db-1
```

### "Migration fails"
**Solution:**
```powershell
# Check Prisma status
npx prisma migrate status

# Or reset (WARNING: deletes data)
npm run db:migrate:reset
```

---

## What You'll Get After Setup

✅ **Persistent Sessions** - Sessions survive server restarts  
✅ **User Management** - Users stored in database  
✅ **Security Logging** - All sign-in events logged  
✅ **Full RBAC** - Database-backed role management  
✅ **Prisma Studio** - Visual database browser (`npm run db:studio`)

---

## Need Help?

- See `DATABASE_QUICK_SETUP.md` for detailed instructions
- See `DATABASE_SETUP.md` for alternative setup methods
- Check Docker Desktop logs if database won't start

**Once Docker Desktop is running, just run:**
```powershell
docker-compose up -d db
npm run db:migrate
```

Then restart your dev server! 🎉
