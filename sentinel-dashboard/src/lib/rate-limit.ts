/**
 * Rate Limiting for API Protection
 * Industry-grade rate limiting to prevent abuse
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Initialize Redis client (optional - falls back to in-memory if not available)
let redis: Redis | null = null
let rateLimiter: Ratelimit | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
      analytics: true,
    })
  }
} catch (error) {
  console.warn("Rate limiting disabled: Redis not configured", error)
}

// In-memory fallback rate limiter
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map()
  private windowMs: number
  private maxRequests: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  async limit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get or create request history
    let requests = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    requests = requests.filter((timestamp) => timestamp > windowStart)
    
    // Check if limit exceeded
    if (requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...requests)
      const reset = oldestRequest + this.windowMs
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: Math.ceil((reset - now) / 1000),
      }
    }

    // Add current request
    requests.push(now)
    this.requests.set(identifier, requests)

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - requests.length,
      reset: Math.ceil(this.windowMs / 1000),
    }
  }
}

// Fallback rate limiter
const fallbackLimiter = new InMemoryRateLimiter(10, 10000) // 10 requests per 10 seconds

/**
 * Rate limit a request
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param options - Rate limit options
 */
export async function rateLimit(
  identifier: string,
  options?: {
    maxRequests?: number
    windowMs?: number
  }
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (rateLimiter) {
    return await rateLimiter.limit(identifier)
  }

  // Use fallback with custom options if provided
  if (options) {
    const customLimiter = new InMemoryRateLimiter(
      options.maxRequests || 10,
      options.windowMs || 10000
    )
    return await customLimiter.limit(identifier)
  }

  return await fallbackLimiter.limit(identifier)
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || "unknown"

  return ip
}
