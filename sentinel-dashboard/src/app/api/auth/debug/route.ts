import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = "nodejs"

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    database: {
      url_set: !!process.env.DATABASE_URL,
      url_length: process.env.DATABASE_URL?.length || 0,
    },
    auth: {
      google_id_set: !!process.env.AUTH_GOOGLE_ID,
      google_secret_set: !!process.env.AUTH_GOOGLE_SECRET,
      secret_set: !!process.env.AUTH_SECRET,
    },
  }

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    diagnostics.database.connected = true
    diagnostics.database.error = null
  } catch (error) {
    diagnostics.database.connected = false
    diagnostics.database.error = error instanceof Error ? error.message : String(error)
  }

  // Check if tables exist
  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `
    diagnostics.database.tables = tables.map(t => t.tablename)
    diagnostics.database.has_user_table = tables.some(t => t.tablename === 'User')
    diagnostics.database.has_session_table = tables.some(t => t.tablename === 'Session')
  } catch (error) {
    diagnostics.database.tables_error = error instanceof Error ? error.message : String(error)
  }

  return NextResponse.json(diagnostics, { status: 200 })
}
