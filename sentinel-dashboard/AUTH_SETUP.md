# Authentication Setup Guide

## ✅ Completed Changes

1. **Upgraded NextAuth to v5** - Updated from v4.24.13 to v5.0.0-beta.30
2. **Fixed auth configuration** - Added proper Google provider configuration
3. **Removed problematic proxy.ts** - Deleted conflicting file
4. **Added diagnostic tools** - Created `/auth-check` page and `/api/auth/test` endpoint
5. **Improved error handling** - Better error messages and error page

## 📋 Required Environment Variables

Create a `.env.local` file in the `sentinel-dashboard` directory with:

```env
AUTH_GOOGLE_ID=your_google_client_id_here
AUTH_GOOGLE_SECRET=your_google_client_secret_here
AUTH_SECRET=your_32_character_secret_here
AUTH_TRUST_HOST=true
AUTH_URL=http://localhost:3000
```

## 🔧 Setup Steps

### 1. Create .env.local file

```powershell
# Navigate to sentinel-dashboard directory
cd sentinel-dashboard

# Create .env.local file (or edit if exists)
notepad .env.local
```

Add your environment variables to the file.

### 2. Generate AUTH_SECRET (if needed)

You can generate a 32-character secret using:
- Online: https://generate-secret.vercel.app/32
- PowerShell: `-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})`

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Copy the Client ID and Client Secret to your `.env.local` file

### 4. Verify Configuration

```powershell
# Start the dev server
npm run dev

# Visit in browser:
# http://localhost:3000/auth-check
```

This page will show you:
- ✓ Which environment variables are set correctly
- ✗ Which ones are missing
- The exact callback URL to configure in Google Cloud Console

### 5. Test Authentication

1. Visit `http://localhost:3000`
2. Click "Sign in with Google"
3. You should be redirected to Google for authentication

## 🐛 Troubleshooting

### "Auth Connection Error"

1. **Check environment variables**: Visit `/auth-check` to see what's missing
2. **Verify Google OAuth callback URL**: Must be exactly `http://localhost:3000/api/auth/callback/google`
3. **Restart dev server**: After changing `.env.local`, restart with `npm run dev`
4. **Check browser console**: Look for specific error messages in DevTools (F12)

### Diagnostic Endpoints

- **Visual Check**: `http://localhost:3000/auth-check`
- **API Check**: `http://localhost:3000/api/auth/test`

## 📁 Files Changed

- ✅ `package.json` - Updated NextAuth to v5
- ✅ `src/auth.ts` - Fixed Google provider configuration
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Verified route handler
- ✅ `src/app/page.tsx` - Improved error handling
- ✅ `src/app/auth-check/page.tsx` - New diagnostic page
- ✅ `src/app/error/page.tsx` - New error page
- ✅ `src/app/api/auth/test/route.ts` - New diagnostic API
- ❌ `src/proxy.ts` - Removed (was causing conflicts)

## 🚀 Next Steps

1. Create `.env.local` with your credentials
2. Configure Google OAuth callback URL
3. Restart dev server: `npm run dev`
4. Visit `/auth-check` to verify configuration
5. Test sign-in functionality
