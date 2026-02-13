import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { withSecurityHeaders } from '@/lib/security';

export const runtime = "nodejs"

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'unknown';
      responseTime?: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  uptime: number;
}

const startTime = Date.now();

export async function GET() {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: {
        status: 'unknown',
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  // Check memory usage
  if (process.memoryUsage) {
    const memUsage = process.memoryUsage();
    health.services.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    };
  }

  // Check database connection
  if (prisma) {
    try {
      const dbStartTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStartTime;
      
      health.services.database = {
        status: 'connected',
        responseTime: dbResponseTime,
      };
    } catch (error) {
      health.services.database = {
        status: 'disconnected',
      };
      health.status = 'degraded';
      logger.error('Database health check failed', error);
    }
  } else {
    health.services.database = {
      status: 'disconnected',
    };
    health.status = 'degraded';
  }

  // Determine overall status
  if (health.services.database.status === 'disconnected') {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  const response = NextResponse.json(health, { status: statusCode });
  return withSecurityHeaders(response);
}
