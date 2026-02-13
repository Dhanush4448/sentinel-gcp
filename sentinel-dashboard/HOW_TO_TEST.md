# How to Test Your Enterprise Features 🧪

## 🚀 Quick Start

### 1. Make Sure Server is Running

```powershell
cd sentinel-dashboard
npm run dev
```

**Look for:** `✓ Ready in X.Xs` in terminal

---

## ✅ Test Checklist

### Test 1: Home Page ✅
**Action:** Open `http://localhost:3000` in browser

**What You Should See:**
- ✅ Page loads without errors
- ✅ "Sign in with Google" button visible
- ✅ No red errors in browser console (F12)

**If it works:** ✅ **PASS**

---

### Test 2: Health Check ✅
**Action:** Open `http://localhost:3000/api/health` in browser

**What You Should See:**
```json
{
  "status": "healthy" or "degraded",
  "timestamp": "2024-...",
  "services": {
    "database": { "status": "connected" or "disconnected" },
    "memory": { "used": 50, "total": 100, ... }
  }
}
```

**If you see JSON:** ✅ **PASS**  
**If you see error:** Check terminal for error messages

---

### Test 3: Google OAuth Sign-In ✅
**Action:** 
1. Click "Sign in with Google" button
2. Complete Google sign-in
3. You should be redirected back

**What You Should See:**
- ✅ Redirected to Google sign-in page
- ✅ After signing in, redirected back to app
- ✅ No error messages

**If sign-in works:** ✅ **PASS**

---

### Test 4: Check Your Session ✅
**Action:** Open `http://localhost:3000/api/auth/session` in browser

**What You Should See (after signing in):**
```json
{
  "user": {
    "id": "...",
    "name": "Your Name",
    "email": "your@email.com",
    "role": "USER"
  },
  "expires": "..."
}
```

**If you see user data:** ✅ **PASS**

---

### Test 5: Security Headers ✅
**Action:**
1. Open DevTools (Press F12)
2. Go to **Network** tab
3. Visit `http://localhost:3000/api/health`
4. Click on the request
5. Check **Response Headers**

**What You Should See:**
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`

**If headers are present:** ✅ **PASS**

---

### Test 6: Error Handling ✅
**Action:** Open `http://localhost:3000/api/logs` in browser (without signing in)

**What You Should See:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "requestId": "..."
  }
}
```

**If you see structured error:** ✅ **PASS**

---

### Test 7: Input Validation ✅
**Action:** Open `http://localhost:3000/api/logs?page=abc&limit=-1` in browser

**What You Should See:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "requestId": "..."
  }
}
```

**If validation error appears:** ✅ **PASS**

---

### Test 8: Protected Route (After Sign-In) ✅
**Action:** 
1. Sign in first
2. Open `http://localhost:3000/api/logs`

**What You Should See:**
```json
{
  "data": [],
  "metadata": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

**If you see logs response:** ✅ **PASS**

---

### Test 9: Check Terminal Logs ✅
**Action:** Look at your terminal where `npm run dev` is running

**What You Should See:**
- ✅ Structured log messages
- ✅ Request IDs in logs
- ✅ No error stack traces (unless there's a real error)

**If logs look structured:** ✅ **PASS**

---

### Test 10: Database (Optional) ✅
**Action:** If you have `DATABASE_URL` set in `.env.local`:

```powershell
npm run db:studio
```

**What You Should See:**
- ✅ Prisma Studio opens at `http://localhost:5555`
- ✅ `User` table has your user
- ✅ `Session` table has active session
- ✅ `SecurityLog` table has sign-in events

**If database works:** ✅ **PASS**

---

## 🎯 Success Score

Count your ✅ **PASS** marks:

- **8-10 PASS:** 🎉 **Excellent!** All features working
- **5-7 PASS:** ⚠️ **Good!** Most features working, check failed tests
- **0-4 PASS:** ❌ **Issues Found** - Check terminal for errors

---

## 🚨 Troubleshooting

### Server Not Starting?
```powershell
# Stop all Node processes
Get-Process node | Stop-Process

# Restart
cd sentinel-dashboard
npm run dev
```

### 500 Errors?
- Check terminal for error messages
- Verify `.env.local` exists with required variables
- Try restarting the server

### Authentication Not Working?
- Check `.env.local` has:
  - `AUTH_GOOGLE_ID`
  - `AUTH_GOOGLE_SECRET`
  - `AUTH_SECRET`
- Verify Google OAuth callback URL: `http://localhost:3000/api/auth/callback/google`

### Database Errors?
- App works without database (uses JWT sessions)
- To enable database: Set `DATABASE_URL` in `.env.local`
- Run: `npm run db:migrate`

---

## 📊 Quick PowerShell Test

Run this in PowerShell (while server is running):

```powershell
# Test health
Write-Host "Testing Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health"
    Write-Host "✅ Health: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health: Failed" -ForegroundColor Red
}

# Test session
Write-Host "`nTesting Session..." -ForegroundColor Yellow
try {
    $session = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/session"
    if ($session.user) {
        Write-Host "✅ Session: Signed in as $($session.user.email)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Session: Not signed in" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Session: Failed" -ForegroundColor Red
}

# Test error handling
Write-Host "`nTesting Error Handling..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "http://localhost:3000/api/logs" -Method GET | Out-Null
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Error Handling: Working (401 as expected)" -ForegroundColor Green
    } else {
        Write-Host "❌ Error Handling: Unexpected status" -ForegroundColor Red
    }
}
```

---

## ✅ All Tests Pass?

**Congratulations!** Your enterprise features are working! 🎉

**Next Steps:**
- Read `ARCHITECTURE.md` to understand the system
- Read `API_DOCUMENTATION.md` for API details
- Read `GCP_DEPLOYMENT.md` to deploy to production
