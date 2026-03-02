/**
 * Database Connection Check
 * Tests if the database is actually available before using it
 */

import { prisma } from './prisma'

let dbAvailable: boolean | null = null
let checkPromise: Promise<boolean> | null = null

/**
 * Check if database is available
 * Caches the result to avoid repeated checks
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  if (dbAvailable !== null) {
    return dbAvailable
  }

  if (!prisma) {
    dbAvailable = false
    return false
  }

  if (!checkPromise) {
    checkPromise = (async () => {
      try {
        await prisma.$queryRaw`SELECT 1`
        dbAvailable = true
        return true
      } catch (error) {
        dbAvailable = false
        return false
      } finally {
        checkPromise = null
      }
    })()
  }

  return checkPromise
}

/**
 * Synchronously check if we should attempt to use the database
 * Returns true if DATABASE_URL is set and prisma exists
 * The actual connection will be tested asynchronously
 */
export function shouldTryDatabase(): boolean {
  return !!process.env.DATABASE_URL && 
         process.env.DATABASE_URL.trim() !== '' && 
         !!prisma
}
