/**
 * Input Validation and Sanitization
 * Industry-grade validation using Zod schemas
 */

import { z } from "zod"

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

export const logQuerySchema = paginationSchema.extend({
  severity: z.enum(["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]).optional(),
  userId: z.string().cuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  role: z.enum(["USER", "ADMIN", "MODERATOR", "VIEWER"]).optional(),
})

export const securityLogCreateSchema = z.object({
  action: z.string().min(1).max(255),
  tier: z.string().min(1).max(50),
  severity: z.enum(["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]).default("INFO"),
  metadata: z.record(z.unknown()).optional(),
})

// Email validation
export const emailSchema = z.string().email().max(255)

// URL validation
export const urlSchema = z.string().url()

// Sanitize string input
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .slice(0, 10000) // Max length
}

// Validate and parse query parameters
export function validateQuery<T extends z.ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const params = Object.fromEntries(searchParams.entries())
  return schema.parse(params)
}

// Safe JSON parsing
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}
