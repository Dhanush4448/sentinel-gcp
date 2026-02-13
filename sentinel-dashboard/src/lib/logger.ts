/**
 * Structured Logging for GCP Cloud Logging
 * Supports both local development and GCP production environments
 */

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL"

interface LogEntry {
  severity: LogLevel
  message: string
  timestamp: string
  service: string
  [key: string]: unknown
}

class Logger {
  private serviceName: string
  private isProduction: boolean

  constructor(serviceName: string = "sentinel-dashboard") {
    this.serviceName = serviceName
    this.isProduction = process.env.NODE_ENV === "production"
  }

  private formatLog(severity: LogLevel, message: string, metadata?: Record<string, unknown>): LogEntry {
    const entry: LogEntry = {
      severity,
      message,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      ...metadata,
    }

    // In production, format for GCP Cloud Logging
    if (this.isProduction) {
      // GCP Cloud Logging expects specific format
      return {
        ...entry,
        "@type": "type.googleapis.com/google.cloud.logging.v2.LogEntry",
      }
    }

    return entry
  }

  private log(severity: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const entry = this.formatLog(severity, message, metadata)

    // In production, use structured JSON logging for GCP
    if (this.isProduction) {
      console.log(JSON.stringify(entry))
    } else {
      // Pretty print for local development
      const colorMap: Record<LogLevel, string> = {
        DEBUG: "\x1b[36m", // Cyan
        INFO: "\x1b[32m",  // Green
        WARN: "\x1b[33m",  // Yellow
        ERROR: "\x1b[31m", // Red
        CRITICAL: "\x1b[35m", // Magenta
      }
      const reset = "\x1b[0m"
      const color = colorMap[severity] || ""
      console.log(`${color}[${severity}]${reset} ${message}`, metadata || "")
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log("DEBUG", message, metadata)
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log("INFO", message, metadata)
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log("WARN", message, metadata)
  }

  error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void {
    const errorMetadata = {
      ...metadata,
      ...(error instanceof Error
        ? {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          }
        : { error }),
    }
    this.log("ERROR", message, errorMetadata)
  }

  critical(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void {
    const errorMetadata = {
      ...metadata,
      ...(error instanceof Error
        ? {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          }
        : { error }),
    }
    this.log("CRITICAL", message, errorMetadata)
  }

  // Audit log for security events
  audit(action: string, userId: string, metadata?: Record<string, unknown>): void {
    this.info(`AUDIT: ${action}`, {
      audit: true,
      userId,
      action,
      ...metadata,
    })
  }
}

// Singleton instance
export const logger = new Logger()

// Export type for use in other files
export type { LogLevel, LogEntry }
