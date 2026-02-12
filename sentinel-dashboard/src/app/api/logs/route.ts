import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    const [logs, total] = await Promise.all([
      prisma.securityLog.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.securityLog.count(),
    ]);

    return NextResponse.json({
      data: logs,
      metadata: { total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
