import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requirePermission } from '@/lib/rbac';
import { logger } from '@/lib/logger';
import { validateQuery, logQuerySchema } from '@/lib/validation';
import { createErrorResponse, AppError, ErrorCode, generateRequestId } from '@/lib/errors';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { withSecurityHeaders } from '@/lib/security';

// Explicitly use Node.js runtime (not Edge) for database operations
export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    // Rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await rateLimit(clientId, {
      maxRequests: 30,
      windowMs: 60000, // 1 minute
    });

    if (!rateLimitResult.success) {
      throw new AppError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded. Please try again later.',
        429,
        { retryAfter: rateLimitResult.reset }
      );
    }

    // Check authentication
    const session = await auth();
    if (!session?.user) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    // Check permissions
    try {
      requirePermission(session.user.role, 'read:logs', session.user.id);
    } catch (error) {
      throw new AppError(ErrorCode.FORBIDDEN, 'Insufficient permissions', 403);
    }

    // Check if database is available
    if (!prisma) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Database not available',
        503
      );
    }

    // Validate and parse query parameters
    const { searchParams } = new URL(req.url);
    let queryParams;
    try {
      queryParams = validateQuery(logQuerySchema, searchParams);
    } catch (error) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid query parameters',
        400,
        { validationError: error }
      );
    }

    const { page, limit, severity, userId, startDate, endDate } = queryParams;
    const skip = (page - 1) * limit;

    // Build query with filters
    const where: any = {};
    if (severity) where.severity = severity;
    if (userId) where.user_id = userId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.securityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.securityLog.count({ where }),
    ]);

    const duration = Date.now() - startTime;

    logger.audit('LOGS_READ', session.user.id, {
      page,
      limit,
      totalResults: logs.length,
      filters: { severity, userId },
      duration: `${duration}ms`,
      requestId,
    });

    const response = NextResponse.json({
      data: logs,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        requestId,
      },
    });

    // Add performance headers
    response.headers.set('X-Response-Time', `${duration}ms`);
    response.headers.set('X-Request-ID', requestId);

    return withSecurityHeaders(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to fetch logs', error, {
      duration: `${duration}ms`,
      requestId,
    });
    return createErrorResponse(error, requestId);
  }
}
