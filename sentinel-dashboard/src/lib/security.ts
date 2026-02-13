/**
 * Security Headers and CSRF Protection
 * Industry-grade security configurations
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Security headers for all responses
 */
export function getSecurityHeaders(): Record<string, string> {
  const isProduction = process.env.NODE_ENV === "production"

  return {
    // Prevent XSS attacks
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    
    // Content Security Policy
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval in dev
      "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://accounts.google.com https://*.googleapis.com",
      "frame-src 'self' https://accounts.google.com",
      "frame-ancestors 'none'",
    ].join("; "),
    
    // Strict Transport Security (HTTPS only in production)
    ...(isProduction && {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    }),
    
    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    
    // Permissions Policy
    "Permissions-Policy": [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
    ].join(", "),
  }
}

/**
 * Apply security headers to response
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders()
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

/**
 * CSRF Token validation
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // NextAuth handles CSRF for auth routes
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return true
  }

  // For other routes, check Origin header
  const origin = request.headers.get("origin")
  const host = request.headers.get("host")
  
  if (!origin) {
    // Same-origin requests don't need Origin header
    return true
  }

  // Validate origin matches host
  const originHost = new URL(origin).hostname
  const requestHost = host?.split(":")[0] || ""
  
  // Allow localhost for development
  if (process.env.NODE_ENV === "development") {
    return originHost === requestHost || originHost === "localhost"
  }

  return originHost === requestHost
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .slice(0, 10000)
}
