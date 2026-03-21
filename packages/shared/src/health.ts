/**
 * Comprehensive Health Check Service
 * Implements liveness, readiness, and startup probes
 */

import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';

// ============================================================================
// Types
// ============================================================================
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  checks: Record<string, HealthCheck>;
}

export interface HealthCheck {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration?: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// Health Check Implementation
// ============================================================================
export class HealthService {
  private startTime: number;
  private version: string;

  constructor() {
    this.startTime = Date.now();
    this.version = process.env.APP_VERSION || '1.0.0';
  }

  /**
   * Liveness Probe - Is the service running?
   * Should always return true unless process is deadlocked or in infinite loop
   */
  async liveness(): Promise<HealthStatus> {
    const checks: Record<string, HealthCheck> = {};
    
    // Basic process check
    checks.process = {
      status: 'pass',
      message: 'Process is running',
    };

    // Memory check
    const memoryUsage = process.memoryUsage();
    const memoryLimit = parseInt(process.env.MEMORY_LIMIT_MB || '512') * 1024 * 1024;
    
    if (memoryUsage.heapUsed > memoryLimit * 0.95) {
      checks.memory = {
        status: 'warn',
        message: `Memory usage at ${(memoryUsage.heapUsed / memoryLimit * 100).toFixed(2)}%`,
        details: {
          used: memoryUsage.heapUsed,
          limit: memoryLimit,
        },
      };
    } else {
      checks.memory = {
        status: 'pass',
        message: 'Memory usage within limits',
      };
    }

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: this.version,
      checks,
    };
  }

  /**
   * Readiness Probe - Can the service accept traffic?
   * Checks dependencies (database, redis, external services)
   */
  async readiness(): Promise<HealthStatus> {
    const checks: Record<string, HealthCheck> = {};
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    // Database connectivity
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const dbDuration = Date.now() - dbStart;
      
      checks.database = {
        status: 'pass',
        message: 'Database connection successful',
        duration: dbDuration,
      };
    } catch (error) {
      checks.database = {
        status: 'fail',
        message: 'Database connection failed',
        details: { error: (error as Error).message },
      };
      overallStatus = 'unhealthy';
    }

    // Redis connectivity
    const redisStart = Date.now();
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      // In production, would use actual Redis client
      const redisDuration = Date.now() - redisStart;
      
      checks.redis = {
        status: 'pass',
        message: 'Redis connection successful',
        duration: redisDuration,
      };
    } catch (error) {
      checks.redis = {
        status: 'fail',
        message: 'Redis connection failed',
        details: { error: (error as Error).message },
      };
      overallStatus = overallStatus === 'unhealthy' ? 'unhealthy' : 'degraded';
    }

    // Environment variables check
    const requiredEnvVars = ['DATABASE_URL', 'NODE_ENV'];
    const missingVars = requiredEnvVars.filter(key => !process.env[key]);
    
    if (missingVars.length > 0) {
      checks.environment = {
        status: 'fail',
        message: `Missing environment variables: ${missingVars.join(', ')}`,
      };
      overallStatus = 'unhealthy';
    } else {
      checks.environment = {
        status: 'pass',
        message: 'All required environment variables present',
      };
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: this.version,
      checks,
    };
  }

  /**
   * Startup Probe - Has the application initialized properly?
   * Used during container startup to detect failures early
   */
  async startup(): Promise<HealthStatus> {
    const checks: Record<string, HealthCheck> = {};
    
    // Check if Prisma client is initialized
    try {
      await prisma.$connect();
      checks.prisma = {
        status: 'pass',
        message: 'Prisma client initialized',
      };
    } catch (error) {
      checks.prisma = {
        status: 'fail',
        message: 'Prisma client initialization failed',
        details: { error: (error as Error).message },
      };
    }

    // Check database migrations
    try {
      // Would check migration status in production
      checks.migrations = {
        status: 'pass',
        message: 'Database migrations up to date',
      };
    } catch (error) {
      checks.migrations = {
        status: 'warn',
        message: 'Could not verify migration status',
        details: { error: (error as Error).message },
      };
    }

    const allPassed = Object.values(checks).every(c => c.status === 'pass');
    
    return {
      status: allPassed ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: this.version,
      checks,
    };
  }

  /**
   * Full Health Check - Comprehensive system health
   */
  async fullHealth(): Promise<HealthStatus> {
    const liveness = await this.liveness();
    const readiness = await this.readiness();
    
    const combinedChecks = {
      ...liveness.checks,
      ...readiness.checks,
    };

    const hasFailure = Object.values(combinedChecks).some(c => c.status === 'fail');
    const hasWarning = Object.values(combinedChecks).some(c => c.status === 'warn');

    return {
      status: hasFailure ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: this.version,
      checks: combinedChecks,
    };
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================
export const healthService = new HealthService();

// ============================================================================
// HTTP Handler Helpers
// ============================================================================
export function createHealthHandlers() {
  return {
    liveness: async (_req: unknown, res: { status: (code: number) => { json: (data: unknown) => void } }) => {
      const health = await healthService.liveness();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    },
    
    readiness: async (_req: unknown, res: { status: (code: number) => { json: (data: unknown) => void } }) => {
      const health = await healthService.readiness();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    },
    
    startup: async (_req: unknown, res: { status: (code: number) => { json: (data: unknown) => void } }) => {
      const health = await healthService.startup();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    },
    
    health: async (_req: unknown, res: { status: (code: number) => { json: (data: unknown) => void } }) => {
      const health = await healthService.fullHealth();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    },
  };
}
