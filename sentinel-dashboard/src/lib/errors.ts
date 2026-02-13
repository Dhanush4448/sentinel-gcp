/**
 * Enterprise-Grade Error Handling
 * Standardized error responses and logging
 */

import { logger } from "./logger"
import { NextResponse } from "next/server"

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  
  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  
  // Resources
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  
  // Server
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = "AppError"
  }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: unknown,
  requestId?: string
): NextResponse {
  // Handle known AppError
  if (error instanceof AppError) {
    logger.error(`[${error.code}] ${error.message}`, error, {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      requestId,
    })

    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
          ...(requestId && { requestId }),
        },
      },
      { status: error.statusCode }
    )
  }

  // Handle validation errors (Zod)
  if (error && typeof error === "object" && "issues" in error) {
    const zodError = error as { issues: Array<{ path: string[]; message: string }> }
    logger.warn("Validation error", {
      issues: zodError.issues,
      requestId,
    })

    return NextResponse.json(
      {
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Validation failed",
          details: {
            issues: zodError.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
          ...(requestId && { requestId }),
        },
      },
      { status: 400 }
    )
  }

  // Handle unknown errors
  const errorMessage = error instanceof Error ? error.message : "Internal server error"
  logger.error("Unhandled error", error, { requestId })

  // Don't expose internal errors in production
  const isProduction = process.env.NODE_ENV === "production"
  const message = isProduction ? "An unexpected error occurred" : errorMessage

  return NextResponse.json(
    {
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message,
        ...(requestId && { requestId }),
        ...(!isProduction && error instanceof Error && {
          stack: error.stack,
        }),
      },
    },
    { status: 500 }
  )
}

/**
 * Generate request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const requestId = generateRequestId()
    try {
      return await handler(...args)
    } catch (error) {
      return createErrorResponse(error, requestId)
    }
  }) as T
}
