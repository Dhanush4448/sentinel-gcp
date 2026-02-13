/**
 * Environment Variable Validation Script
 * Run before deployment to ensure all required variables are set
 */

import { getEnv } from '../src/lib/env'

try {
  const env = getEnv()
  console.log('✅ Environment variables validated successfully')
  console.log('\nConfiguration:')
  console.log(`  NODE_ENV: ${env.NODE_ENV}`)
  console.log(`  AUTH_URL: ${env.AUTH_URL || 'Not set'}`)
  console.log(`  Database: ${env.DATABASE_URL ? 'Configured' : 'Not configured (JWT sessions)'}`)
  console.log(`  Redis: ${env.UPSTASH_REDIS_REST_URL ? 'Configured' : 'Not configured (in-memory rate limiting)'}`)
  process.exit(0)
} catch (error) {
  console.error('❌ Environment validation failed:')
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
