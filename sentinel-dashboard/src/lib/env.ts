/**
 * Environment Variable Validation
 * Ensures all required environment variables are present and valid
 */

import { z } from "zod"

const envSchema = z.object({
  // NextAuth
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  AUTH_TRUST_HOST: z.string().transform((val) => val === "true").default("false"),
  AUTH_URL: z.string().url().optional(),

  // Database (optional)
  DATABASE_URL: z.string().url().optional(),

  // GCP (optional, for production)
  GOOGLE_CLOUD_PROJECT: z.string().optional(),
  GCP_PROJECT_ID: z.string().optional(),

  // Upstash Redis (optional, for rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Node
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).optional(),
})

type Env = z.infer<typeof envSchema>

let validatedEnv: Env | null = null

/**
 * Validate and get environment variables
 */
export function getEnv(): Env {
  if (validatedEnv) {
    return validatedEnv
  }

  try {
    validatedEnv = envSchema.parse(process.env)
    return validatedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n")
      throw new Error(`Environment validation failed:\n${missingVars}`)
    }
    throw error
  }
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

/**
 * Check if database is configured
 */
export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""
}
