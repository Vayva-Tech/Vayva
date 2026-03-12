/**
 * Health Check API Route
 * 
 * Provides system health status for monitoring and load balancers.
 * Checks database connectivity and critical service availability.
 */

import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

interface HealthCheck {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  version: string;
  checks: {
    database: {
      status: "healthy" | "unhealthy";
      responseTime: number;
      message?: string;
    };
    externalServices?: Record<string, {
      status: "healthy" | "unhealthy" | "unknown";
      responseTime?: number;
      message?: string;
    }>;
  };
}

const START_TIME = Date.now();

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheck["checks"]["database"]> {
  const start = Date.now();
  try {
    // Simple query to verify database connection
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: "healthy",
      responseTime: Date.now() - start,
    };
  } catch (error) {
    logger.error("[HEALTH_CHECK] Database connection failed", { error });
    return {
      status: "unhealthy",
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : "Database connection failed",
    };
  }
}

/**
 * GET /api/ops/health
 * 
 * Public health check endpoint (no authentication required)
 * Used by load balancers and monitoring systems
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  
  // Run checks in parallel
  const [dbCheck] = await Promise.all([
    checkDatabase(),
  ]);

  // Determine overall health
  const isHealthy = dbCheck.status === "healthy";
  
  const health: HealthCheck = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp,
    version: process.env.npm_package_version || "1.0.0",
    checks: {
      database: dbCheck,
    },
  };

  // Return 503 if unhealthy, 200 if healthy
  const status = isHealthy ? 200 : 503;
  
  // Add cache headers to prevent caching
  const headers = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };

  return NextResponse.json(health, { status, headers });
}

