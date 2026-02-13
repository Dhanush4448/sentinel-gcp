import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requirePermission } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { AppError, ErrorCode, createErrorResponse, generateRequestId } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/monitoring';
import { withSecurityHeaders } from '@/lib/security';

export const runtime = "nodejs"

/**
 * Metrics endpoint for monitoring
 * Requires ADMIN role
 */
export async function GET() {
  const requestId = generateRequestId();

  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    // Require admin role
    try {
      requirePermission(session.user.role, 'admin:all', session.user.id);
    } catch (error) {
      throw new AppError(ErrorCode.FORBIDDEN, 'Admin access required', 403);
    }

    const systemMetrics: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
        },
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      application: {
        metrics: metrics.getAll(),
        averages: {
          apiResponseTime: metrics.getAverage('api.response_time'),
          dbQueryTime: metrics.getAverage('db.query_time'),
        },
      },
    };

    // Database metrics
    if (prisma) {
      try {
        const [userCount, sessionCount, logCount, accountCount] = await Promise.all([
          prisma.user.count(),
          prisma.session.count(),
          prisma.securityLog.count(),
          prisma.account.count(),
        ]);

        systemMetrics.database = {
          connected: true,
          users: userCount,
          activeSessions: sessionCount,
          totalLogs: logCount,
          accounts: accountCount,
        };
      } catch (error) {
        systemMetrics.database = {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    } else {
      systemMetrics.database = {
        connected: false,
        message: 'DATABASE_URL not configured',
      };
    }

    logger.audit('METRICS_ACCESSED', session.user.id, {
      requestId,
    });

    const response = NextResponse.json(systemMetrics);
    return withSecurityHeaders(response);
  } catch (error) {
    return createErrorResponse(error, requestId);
  }
}
