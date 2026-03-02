# Database Viewer Guide 📊

Your database is **PostgreSQL** (not SQLite), so you need PostgreSQL-compatible tools.

## 🎯 Option 1: Prisma Studio (Easiest - Built-in)

**Best for:** Quick viewing and editing

```powershell
cd sentinel-dashboard
npm run db:studio
```

- Opens in browser at `http://localhost:5555`
- Visual table browser
- Edit data directly
- No installation needed

---

## 🖥️ Option 2: PostgreSQL GUI Tools

### A. DBeaver (Free, Cross-platform)
- Download: https://dbeaver.io/download/
- Supports PostgreSQL
- Visual query builder

**Connection Details:**
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `sentinel_db`
- **Username:** `user_admin`
- **Password:** `password_admin` (or your custom password)

### B. pgAdmin (Official PostgreSQL Tool)
- Download: https://www.pgadmin.org/download/
- Official PostgreSQL GUI
- Full-featured database management

**Connection Details:** Same as above

### C. TablePlus (Paid, Beautiful UI)
- Download: https://tableplus.com/
- Modern, clean interface
- Supports PostgreSQL

---

## 📱 Option 3: VS Code Extensions

If you use VS Code:

1. Install: **PostgreSQL** extension by Chris Kolkman
2. Add connection:
   - Host: `localhost`
   - Port: `5432`
   - Database: `sentinel_db`
   - User: `user_admin`
   - Password: `password_admin`

---

## 🔄 Option 4: Export to SQLite (Advanced)

If you **really** want to use your SQLite app, you'd need to export the data:

### Step 1: Export PostgreSQL data to CSV/SQL
```powershell
# Export all tables
docker exec sentinel-dashboard-db-1 pg_dump -U user_admin -d sentinel_db > export.sql
```

### Step 2: Convert to SQLite format
This requires a conversion tool or manual migration (complex process).

**⚠️ Note:** This is not recommended as:
- PostgreSQL and SQLite have different features
- You'll lose PostgreSQL-specific features
- Better to use a PostgreSQL viewer

---

## 🚀 Quick Start: Prisma Studio

**Recommended for you:**

```powershell
cd C:\Users\dhanu\sentinel-gcp\sentinel-dashboard
npm run db:studio
```

Then open: `http://localhost:5555`

You'll see:
- ✅ User table
- ✅ Session table  
- ✅ Account table
- ✅ SecurityLog table
- ✅ All your data visually

---

## 📋 Connection String Reference

For any PostgreSQL GUI tool, use:

```
Host: localhost
Port: 5432
Database: sentinel_db
Username: user_admin
Password: password_admin
```

Or connection string format:
```
postgresql://user_admin:password_admin@localhost:5432/sentinel_db
```

---

## ❓ Why Not SQLite?

- **PostgreSQL** = Server-based, production-ready, supports complex queries
- **SQLite** = File-based, simpler, single-user

Your project uses PostgreSQL for:
- ✅ Multi-user support
- ✅ Better performance
- ✅ Production deployment
- ✅ Advanced features (JSONB, full-text search, etc.)

---

## 🎯 Recommendation

**Use Prisma Studio** - it's the easiest and already built into your project!

```powershell
npm run db:studio
```
