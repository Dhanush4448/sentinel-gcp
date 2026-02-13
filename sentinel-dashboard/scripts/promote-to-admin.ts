/**
 * Script to promote a user to ADMIN role
 * Usage: npx ts-node scripts/promote-to-admin.ts <email>
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config()

// Initialize Prisma with adapter
let prisma: PrismaClient

if (process.env.DATABASE_URL) {
  try {
    const connectionString = process.env.DATABASE_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    prisma = new PrismaClient({ adapter })
  } catch (error) {
    console.error('Failed to initialize Prisma with adapter:', error)
    process.exit(1)
  }
} else {
  console.error('DATABASE_URL not set in environment variables')
  process.exit(1)
}

async function promoteToAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    })

    console.log(`✅ Successfully promoted ${user.email} to ADMIN role`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   Name: ${user.name || 'N/A'}`)
    console.log(`   Role: ${user.role}`)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Record to update does not exist')) {
        console.error(`❌ User with email "${email}" not found`)
        console.log('\nAvailable users:')
        const users = await prisma.user.findMany({
          select: { email: true, name: true, role: true },
        })
        users.forEach((u) => {
          console.log(`   - ${u.email} (${u.name || 'No name'}) - ${u.role}`)
        })
      } else {
        console.error(`❌ Error: ${error.message}`)
      }
    } else {
      console.error('❌ Unknown error:', error)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('\nUsage: npx ts-node scripts/promote-to-admin.ts <email>')
  console.log('\nExample:')
  console.log('  npx ts-node scripts/promote-to-admin.ts user@example.com')
  process.exit(1)
}

promoteToAdmin(email)
