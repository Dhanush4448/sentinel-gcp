import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // A simple query to test the DB connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'Healthy',
      database: 'Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'Degraded',
      database: 'Disconnected',
      error: 'Could not connect to PostgreSQL',
    }, { status: 503 });
  }
}
