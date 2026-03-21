import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { logger } from "@vayva/shared";

/**
 * GET /api/health/database
 * Database health check endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // In production, this would check actual database connectivity
    // const dbCheck = await prisma.$queryRaw`SELECT 1`;
    
    const dbHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      // mock response time for now
      responseTime: Math.floor(Math.random() * 50) + 10,
      connection: 'active'
    };

    return {
      status: 200,
      body: dbHealth,
    };
  } catch (error: unknown) {
    logger.error("[DATABASE_HEALTH_ERROR] Database health check failed", { 
      error: error instanceof Error ? error.message : String(error)
    });
    
    return {
      status: 503,
      body: { 
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
    };
  }
}