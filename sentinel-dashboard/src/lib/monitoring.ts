/**
 * Performance Monitoring and Metrics
 * Industry-grade observability
 */

import { logger } from "./logger"

interface Metric {
  name: string
  value: number
  unit: string
  timestamp: string
  tags?: Record<string, string>
}

class MetricsCollector {
  private metrics: Metric[] = []
  private readonly maxMetrics = 1000

  /**
   * Record a metric
   */
  record(name: string, value: number, unit: string = "ms", tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags,
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log important metrics
    if (value > 1000 || name.includes("error")) {
      logger.warn(`Metric: ${name} = ${value}${unit}`, { metric, tags })
    }
  }

  /**
   * Get all metrics
   */
  getAll(): Metric[] {
    return [...this.metrics]
  }

  /**
   * Get metrics by name
   */
  getByName(name: string): Metric[] {
    return this.metrics.filter((m) => m.name === name)
  }

  /**
   * Get average for a metric
   */
  getAverage(name: string): number | null {
    const metrics = this.getByName(name)
    if (metrics.length === 0) return null

    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = []
  }
}

export const metrics = new MetricsCollector()

/**
 * Measure execution time of async function
 */
export async function measureTime<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    metrics.record(name, duration, "ms", { ...tags, status: "success" })
    return result
  } catch (error) {
    const duration = Date.now() - start
    metrics.record(name, duration, "ms", { ...tags, status: "error" })
    throw error
  }
}

/**
 * Measure execution time of sync function
 */
export function measureTimeSync<T>(
  name: string,
  fn: () => T,
  tags?: Record<string, string>
): T {
  const start = Date.now()
  try {
    const result = fn()
    const duration = Date.now() - start
    metrics.record(name, duration, "ms", { ...tags, status: "success" })
    return result
  } catch (error) {
    const duration = Date.now() - start
    metrics.record(name, duration, "ms", { ...tags, status: "error" })
    throw error
  }
}
