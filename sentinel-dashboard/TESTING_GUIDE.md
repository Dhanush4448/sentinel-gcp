# Testing Guide - Verify Enterprise Features 🧪

## Quick Start Testing

### 1. Start the Development Server

```powershell
cd sentinel-dashboard
npm run dev
```

The server will start at `http://localhost:3000`

---

## ✅ Feature Verification Checklist

### 1. Health Check Endpoint
**Test:** Application health and database connection

```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET | Select-Object -ExpandProperty Content

# Or in browser:
# http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "Healthy",
  "database": "Connected",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "...",
  "responseTime": "XXms"
}
```

**✅ Pass Criteria:**
- Status is "Healthy"
- Database shows "Connected" (if DATABASE_URL is set)
- Response time < 500ms

---

### 2. Authentication Flow
**Test:** Google OAuth sign-in

1. Visit: `http://localhost:3000`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Check session: `http://localhost:3000/api/auth/session`

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "image": "...",
    "role": "USER"
  },
  "expires": "..."
}
```

**✅ Pass Criteria:**
- User object is present
- Role is assigned (USER, ADMIN, etc.)
- Session persists

---

### 3. Security Headers
**Test:** Verify security headers are present

```powershell
# PowerShell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET
$response.Headers

# Check for:
# - X-Content-Type-Options
# - X-Frame-Options
# - X-XSS-Protection
# - Referrer-Policy
# - Permissions-Policy
```

**✅ Pass Criteria:**
- Security headers are present
- CSP header is set (if configured)
- HSTS header is set (if HTTPS)

---

### 4. Rate Limiting
**Test:** Verify rate limiting works

```powershell
# Make multiple rapid requests
1..35 | ForEach-Object {
    Write-Host "Request $_"
    try {
        Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET
    } catch {
        Write-Host "Rate limited: $_" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 100
}
```

**✅ Pass Criteria:**
- First 10 requests succeed
- Requests 11+ are rate limited (429 status)
- Error message includes retry-after

---

### 5. Input Validation
**Test:** Verify validation rejects invalid input

```powershell
# Test invalid query parameters
Invoke-WebRequest -Uri "http://localhost:3000/api/logs?page=abc&limit=-1" -Method GET
```

**Expected Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "requestId": "..."
  }
}
```

**✅ Pass Criteria:**
- Invalid input returns 400 status
- Error message is clear
- Request ID is included

---

### 6. Error Handling
**Test:** Verify standardized error responses

```powershell
# Test unauthorized access (without auth)
Invoke-WebRequest -Uri "http://localhost:3000/api/logs" -Method GET
```

**Expected Response:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "requestId": "..."
  }
}
```

**✅ Pass Criteria:**
- Error code is present
- Message is clear
- Request ID for tracing

---

### 7. Metrics Endpoint
**Test:** Application metrics (requires authentication)

1. Sign in first
2. Visit: `http://localhost:3000/api/metrics`

**Expected Response:**
```json
{
  "status": "OK",
  "metrics": {
    "uptime": 12345,
    "memory": {
      "used": "...",
      "total": "..."
    },
    "requests": {
      "total": 100,
      "errors": 5
    }
  },
  "timestamp": "...",
  "requestId": "..."
}
```

**✅ Pass Criteria:**
- Metrics are present
- Uptime is tracked
- Memory usage is shown

---

### 8. Logs Endpoint (RBAC)
**Test:** Role-based access control

```powershell
# As regular user (should work)
Invoke-WebRequest -Uri "http://localhost:3000/api/logs" -Method GET -Headers @{Cookie="..."}

# As unauthorized (should fail)
Invoke-WebRequest -Uri "http://localhost:3000/api/logs" -Method GET
```

**✅ Pass Criteria:**
- Authenticated users can access
- Unauthenticated users get 401
- Users without permission get 403

---

### 9. Structured Logging
**Test:** Verify logs are structured

Check your terminal/console output when making requests. Logs should be:
- JSON formatted (in production)
- Include request IDs
- Include severity levels
- Include timestamps

**✅ Pass Criteria:**
- Logs are structured
- Request IDs are present
- Severity levels are correct

---

### 10. Database Session Persistence
**Test:** Verify sessions are stored in database

1. Sign in
2. Check database (if using Prisma Studio):
   ```powershell
   npm run db:studio
   ```
3. Verify `Session` table has entries

**✅ Pass Criteria:**
- Sessions are in database
- User records are created
- Security logs are recorded

---

## 🧪 Automated Test Script

Create a PowerShell test script:

```powershell
# test-features.ps1
Write-Host "🧪 Testing Enterprise Features..." -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
    if ($health.status -eq "Healthy") {
        Write-Host "✅ Health Check: PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Health Check: FAILED - $_" -ForegroundColor Red
}

# Test 2: Security Headers
Write-Host "`n2. Testing Security Headers..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET
    $headers = $response.Headers
    
    $requiredHeaders = @("X-Content-Type-Options", "X-Frame-Options", "X-XSS-Protection")
    $missing = $requiredHeaders | Where-Object { -not $headers.ContainsKey($_) }
    
    if ($missing.Count -eq 0) {
        Write-Host "✅ Security Headers: PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ Security Headers: FAILED - Missing: $($missing -join ', ')" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Security Headers: FAILED - $_" -ForegroundColor Red
}

# Test 3: Rate Limiting
Write-Host "`n3. Testing Rate Limiting..." -ForegroundColor Yellow
$rateLimited = $false
try {
    1..15 | ForEach-Object {
        try {
            Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET | Out-Null
        } catch {
            if ($_.Exception.Response.StatusCode -eq 429) {
                $rateLimited = $true
            }
        }
    }
    
    if ($rateLimited) {
        Write-Host "✅ Rate Limiting: PASSED" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Rate Limiting: May not be active (check Redis config)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Rate Limiting: FAILED - $_" -ForegroundColor Red
}

Write-Host "`n✅ Testing Complete!" -ForegroundColor Green
```

---

## 🔍 Browser Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Go to **Network** tab
3. Make requests to endpoints
4. Check:
   - Response headers (security headers)
   - Response status codes
   - Response times
   - Request/response payloads

### Console Logs
Check browser console for:
- Authentication status
- API errors
- Client-side validation

---

## 📊 Monitoring Dashboard

### Check Application Logs
```powershell
# Watch logs in real-time
npm run dev
# Check terminal output for structured logs
```

### Check Database (if using Prisma Studio)
```powershell
npm run db:studio
# Opens at http://localhost:5555
# Check:
# - Users table
# - Sessions table
# - SecurityLogs table
```

---

## 🚨 Common Issues & Solutions

### Issue: Health check fails
**Solution:** Check if `DATABASE_URL` is set in `.env.local`

### Issue: Rate limiting not working
**Solution:** Check if `UPSTASH_REDIS_REST_URL` is set (optional, falls back to in-memory)

### Issue: Authentication fails
**Solution:** Verify Google OAuth credentials in `.env.local`

### Issue: Security headers missing
**Solution:** Check `src/lib/security.ts` is imported in routes

---

## ✅ Success Criteria

Your application is working correctly if:

1. ✅ Health check returns "Healthy"
2. ✅ Authentication works (Google OAuth)
3. ✅ Security headers are present
4. ✅ Rate limiting activates after threshold
5. ✅ Invalid input returns validation errors
6. ✅ Errors have standardized format
7. ✅ Metrics endpoint returns data
8. ✅ RBAC restricts unauthorized access
9. ✅ Logs are structured
10. ✅ Sessions persist in database

---

## 🎯 Next Steps

Once all tests pass:

1. **Deploy to GCP**: See `GCP_DEPLOYMENT.md`
2. **Set up CI/CD**: Push to GitHub to trigger workflows
3. **Monitor Production**: Use GCP Cloud Logging
4. **Scale**: Configure Cloud Run auto-scaling

---

**Need Help?** Check the documentation:
- `README.md` - Setup instructions
- `ARCHITECTURE.md` - System design
- `API_DOCUMENTATION.md` - API reference
