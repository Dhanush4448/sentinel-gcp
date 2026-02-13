# Quick Start - Authentication Setup

## 🚀 All PowerShell Commands (Run These)

### 1. Navigate to Project Directory
```powershell
cd sentinel-dashboard
```

### 2. Verify NextAuth Installation
```powershell
npm list next-auth
```
Should show: `next-auth@5.0.0-beta.30`

### 3. Create/Edit .env.local File
```powershell
# Option 1: Open in Notepad
notepad .env.local

# Option 2: Create with PowerShell
@"
AUTH_GOOGLE_ID=your_google_client_id_here
AUTH_GOOGLE_SECRET=your_google_client_secret_here
AUTH_SECRET=your_32_character_secret_here
AUTH_TRUST_HOST=true
AUTH_URL=http://localhost:3000
"@ | Out-File -FilePath .env.local -Encoding utf8
```

### 4. Generate AUTH_SECRET (if needed)
```powershell
# Generate 32-character random string
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 5. Run Setup Verification Script
```powershell
.\setup-auth.ps1
```

### 6. Start Development Server
```powershell
npm run dev
```

### 7. Verify Configuration (in browser)
```
http://localhost:3000/auth-check
```

## ✅ Verification Checklist

- [ ] NextAuth v5 installed (`npm list next-auth` shows v5)
- [ ] `.env.local` file exists with all variables
- [ ] Google OAuth callback URL configured: `http://localhost:3000/api/auth/callback/google`
- [ ] Dev server running without errors
- [ ] `/auth-check` page shows all green checkmarks

## 🔍 Diagnostic Commands

### Check Environment Variables
```powershell
# Check if .env.local exists
Test-Path .env.local

# View .env.local (be careful with secrets!)
Get-Content .env.local
```

### Test API Endpoint
```powershell
# After starting dev server, test the diagnostic endpoint
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/test" | Select-Object -ExpandProperty Content
```

### Check NextAuth Version
```powershell
npm list next-auth
```

## 🐛 Troubleshooting Commands

### Clear Node Modules and Reinstall
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Check for Port Conflicts
```powershell
# Check if port 3000 is in use
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

### Restart Dev Server
```powershell
# Stop current server (Ctrl+C), then:
npm run dev
```

## 📝 Files Created/Modified

### New Files:
- ✅ `src/app/auth-check/page.tsx` - Diagnostic page
- ✅ `src/app/error/page.tsx` - Error handling page
- ✅ `src/app/api/auth/test/route.ts` - Diagnostic API
- ✅ `setup-auth.ps1` - Setup verification script
- ✅ `AUTH_SETUP.md` - Detailed setup guide
- ✅ `QUICK_START.md` - This file

### Modified Files:
- ✅ `package.json` - Updated NextAuth to v5
- ✅ `src/auth.ts` - Fixed Google provider config
- ✅ `src/app/page.tsx` - Improved error handling
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Formatted

### Removed Files:
- ❌ `src/proxy.ts` - Removed (was causing conflicts)

## 🎯 Next Steps After Setup

1. **Configure Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Add redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **Test Authentication**:
   - Visit `http://localhost:3000`
   - Click "Sign in with Google"
   - Complete OAuth flow

3. **Monitor for Errors**:
   - Check browser console (F12)
   - Check terminal for server errors
   - Visit `/auth-check` for configuration status
