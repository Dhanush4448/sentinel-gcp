/**
 * Enterprise-Grade Middleware
 * Route protection, security headers, and request validation
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { withSecurityHeaders } from "@/lib/security"
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/admin",
  "/settings",
]

// Routes that are public
const publicRoutes = [
  "/",
  "/auth-check",
  "/error",
  "/api/auth",
  "/api/health",
  "/api/auth/test",
]

// Routes that need stricter rate limiting
const rateLimitedRoutes = [
  "/api/auth/signin",
  "/api/auth/callback",
  "/api/logs",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const startTime = Date.now()

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // Apply security headers to all responses
  let response = NextResponse.next()
  response = withSecurityHeaders(response)

  // Rate limiting for sensitive routes
  const isRateLimitedRoute = rateLimitedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isRateLimitedRoute) {
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await rateLimit(clientId, {
      maxRequests: 20, // 20 requests
      windowMs: 60000, // per minute
    })

    if (!rateLimitResult.success) {
      logger.warn("Rate limit exceeded", {
        clientId,
        path: pathname,
        limit: rateLimitResult.limit,
      })

      response = NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
            retryAfter: rateLimitResult.reset,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.reset.toString(),
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        }
      )
      return withSecurityHeaders(response)
    }

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString())
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())
    response.headers.set("X-RateLimit-Reset", rateLimitResult.reset.toString())
  }

  // Allow public routes
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  if (isPublicRoute) {
    // Log public route access (non-sensitive)
    const duration = Date.now() - startTime
    logger.debug("Public route accessed", {
      path: pathname,
      duration: `${duration}ms`,
    })
    return response
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Check for session cookie (NextAuth uses authjs.session-token)
    const sessionToken =
      request.cookies.get("authjs.session-token") ||
      request.cookies.get("__Secure-authjs.session-token")

    if (!sessionToken) {
      // No session found - redirect to sign-in
      logger.info("Unauthenticated access attempt", {
        path: pathname,
        ip: getClientIdentifier(request),
      })

      const signInUrl = new URL("/", request.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      response = NextResponse.redirect(signInUrl)
      return withSecurityHeaders(response)
    }

    // Session cookie exists - let the route handler verify it
    // The actual authentication check happens in the route handler
  }

  // For API routes, let them handle their own authentication
  if (pathname.startsWith("/api")) {
    return response
  }

  // Add request ID for tracing
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  response.headers.set("X-Request-ID", requestId)

  // Log request
  const duration = Date.now() - startTime
  logger.debug("Request processed", {
    path: pathname,
    method: request.method,
    duration: `${duration}ms`,
    requestId,
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
