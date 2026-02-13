import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST === 'true',
    AUTH_URL: process.env.AUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
  }

  const allValid = 
    checks.AUTH_GOOGLE_ID && 
    checks.AUTH_GOOGLE_SECRET && 
    checks.AUTH_SECRET &&
    checks.AUTH_TRUST_HOST

  return NextResponse.json({
    status: allValid ? 'OK' : 'ERROR',
    checks,
    callbackUrl: `${checks.AUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`,
    message: allValid 
      ? 'All environment variables are set correctly. Check Google Cloud Console for callback URL.'
      : 'Some environment variables are missing or incorrect.',
  })
}
