# Quick Test Guide - Verify Your App is Working ✅

## Step 1: Start the Server

```powershell
cd sentinel-dashboard
npm run dev
```

Wait for: `✓ Ready in X.Xs` message

---

## Step 2: Test in Browser

### ✅ Test 1: Home Page
**URL:** `http://localhost:3000`

**What to check:**
- Page loads without errors
- "Sign in with Google" button is visible
- No console errors (F12 → Console tab)

---

### ✅ Test 2: Health Check
**URL:** `http://localhost:3000/api/health`

**Expected:** JSON response like:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "services": {
    "database": { "status": "connected" },
    "memory": { ... }
  }
}
```

**If you see an error:**
- Check terminal for error messages
- Verify `.env.local` has `DATABASE_URL` (optional - app works without it)

---

### ✅ Test 3: Authentication
1. Click "Sign in with Google"
2. Complete OAuth flow
3. You should be redirected back to the app

**Check session:**
- URL: `http://localhost:3000/api/auth/session`
- Should show your user info

---

### ✅ Test 4: Security Headers
**How to check:**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Visit `http://localhost:3000/api/health`
4. Click on the request
5. Check **Response Headers** for:
   - `X-Content-Type-Options`
   - `X-Frame-Options`
   - `X-XSS-Protection`

---

### ✅ Test 5: Error Handling
**URL:** `http://localhost:3000/api/logs` (without signing in)

**Expected:** 
- Status: `401 Unauthorized`
- JSON response with error code and message

---

### ✅ Test 6: Input Validation
**URL:** `http://localhost:3000/api/logs?page=abc&limit=-1`

**Expected:**
- Status: `400 Bad Request`
- Error message about invalid parameters

---

## Step 3: Check Terminal Logs

While the server is running, watch the terminal for:
- ✅ Structured JSON logs (in production mode)
- ✅ Request IDs in logs
- ✅ No error stack traces

---

## Step 4: Test Authentication Flow

1. **Sign In:**
   - Visit `http://localhost:3000`
   - Click "Sign in with Google"
   - Complete OAuth

2. **Check Session:**
   - Visit `http://localhost:3000/api/auth/session`
   - Should see your user object with `role: "USER"`

3. **Test Protected Route:**
   - Visit `http://localhost:3000/api/logs`
   - Should return logs (or empty array if no logs)

---

## Step 5: Check Database (Optional)

If you have `DATABASE_URL` set:

```powershell
# Open Prisma Studio
npm run db:studio
```

**Check:**
- `User` table - your user should be there
- `Session` table - active session should be there
- `SecurityLog` table - sign-in events should be logged

---

## 🎯 Success Indicators

Your app is working if:

✅ Home page loads  
✅ Health check returns JSON  
✅ Google OAuth sign-in works  
✅ Session endpoint returns user data  
✅ Security headers are present  
✅ Error responses are structured  
✅ Terminal shows structured logs  

---

## 🚨 Common Issues

### Issue: 500 Error on Health Check
**Solution:**
- Check terminal for error messages
- Verify `.env.local` exists
- Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: Authentication Fails
**Solution:**
- Verify `.env.local` has:
  - `AUTH_GOOGLE_ID`
  - `AUTH_GOOGLE_SECRET`
  - `AUTH_SECRET`
- Check Google OAuth callback URL is: `http://localhost:3000/api/auth/callback/google`

### Issue: Database Errors
**Solution:**
- App works without database (uses JWT sessions)
- To enable database: Set `DATABASE_URL` in `.env.local`
- Run: `npm run db:migrate`

---

## 📊 Quick Status Check

Run these commands in PowerShell:

```powershell
# Check if server is running
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET

# Check authentication endpoint
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/session" -Method GET

# Check error handling (should return 401)
Invoke-WebRequest -Uri "http://localhost:3000/api/logs" -Method GET
```

---

## ✅ All Working?

If all tests pass, your enterprise features are working! 🎉

**Next Steps:**
- See `TESTING_GUIDE.md` for detailed tests
- See `GCP_DEPLOYMENT.md` to deploy to production
- See `ARCHITECTURE.md` to understand the system
