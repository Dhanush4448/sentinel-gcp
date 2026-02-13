# Quick Database Setup Guide 🚀

## Step 1: Start Docker Desktop

**Important:** Docker Desktop must be running before proceeding.

1. Open **Docker Desktop** application
2. Wait for it to fully start (whale icon in system tray should be steady)
3. Verify it's running: Open a terminal and run `docker ps`

---

## Step 2: Start PostgreSQL Database

Open PowerShell in the `sentinel-dashboard` directory and run:

```powershell
docker-compose up -d db
```

**Expected output:**
```
Creating sentinel-dashboard-db-1 ... done
```

**Wait 5-10 seconds** for the database to be ready.

---

## Step 3: Verify Database is Running

```powershell
docker ps
```

You should see a container named `sentinel-dashboard-db-1` running.

---

## Step 4: DATABASE_URL is Already Configured ✅

The `.env.local` file has been created with:
```
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME
```

**Database Credentials:**
- **User:** `USERNAME` (replace with your username)
- **Password:** `PASSWORD` (replace with your password)
- **Database:** `DATABASE_NAME` (replace with your database name)
- **Host:** `localhost`
- **Port:** `5432`

---

## Step 5: Run Database Migrations

```powershell
cd sentinel-dashboard
npm run db:migrate
```

**Expected output:**
```
✔ Prisma schema loaded from prisma/schema.prisma
✔ Datasource "db": PostgreSQL database "sentinel_db"
✔ Applied migration: 20240101000000_init
```

---

## Step 6: Restart Your Dev Server

1. Stop the current server (Ctrl+C)
2. Start it again:

```powershell
npm run dev
```

---

## Step 7: Verify Database Connection

Visit: `http://localhost:3000/api/health`

**Expected response:**
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

✅ **If you see `"status": "connected"`, the database is working!**

---

## Troubleshooting

### Issue: Docker Desktop not running
**Solution:** Start Docker Desktop and wait for it to fully initialize.

### Issue: Port 5432 already in use
**Solution:** 
```powershell
# Stop existing PostgreSQL
docker stop sentinel-dashboard-db-1

# Or use a different port in docker-compose.yml
```

### Issue: Migration fails
**Solution:**
```powershell
# Reset database (WARNING: Deletes all data)
npm run db:migrate:reset

# Or check Prisma status
npx prisma migrate status
```

### Issue: Connection refused
**Solution:**
1. Check if container is running: `docker ps`
2. Check container logs: `docker logs sentinel-dashboard-db-1`
3. Wait a bit longer (database might still be starting)

---

## What's Next?

Once the database is connected:

✅ **Persistent Sessions** - Sessions survive server restarts  
✅ **User Management** - Users stored in database  
✅ **Security Logging** - All security events logged  
✅ **Full RBAC** - Database-backed role management  

**Test it:**
1. Sign in with Google
2. Check Prisma Studio: `npm run db:studio`
3. View your user in the `User` table
4. View your session in the `Session` table
5. View security logs in the `SecurityLog` table

---

## Quick Commands Reference

```powershell
# Start database
docker-compose up -d db

# Stop database
docker-compose down

# View database logs
docker logs sentinel-dashboard-db-1

# Run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Check database connection
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

---

**Need Help?** Check `DATABASE_SETUP.md` for detailed instructions.
