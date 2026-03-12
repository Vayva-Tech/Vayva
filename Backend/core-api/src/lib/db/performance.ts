import { PrismaClient } from "@vayva/db";
import { logger } from "@vayva/shared";

const SLOW_QUERY_THRESHOLD_MS = 500;

/**
 * Prisma middleware for logging slow queries
 * Automatically logs queries that exceed the threshold to the audit_log table
 */
export function slowQueryMiddleware(prisma: PrismaClient): void {
  // The generated Prisma client type in this repo does not expose middleware types.
  // We still want the middleware at runtime, so we call via an `any` cast.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (prisma as any).$use(async (params: any, next: any) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;

    // Log slow queries
    if (duration > SLOW_QUERY_THRESHOLD_MS) {
      const query = `${params.model}.${params.action}`;
      
      logger.warn("Slow query detected", {
        query,
        model: params.model,
        action: params.action,
        duration,
        args: JSON.stringify(params.args).slice(0, 500), // Truncate long args
      });

      // Log to database async (don't block)
      try {
        // Use raw query to avoid triggering this middleware again
        await prisma.$executeRaw`
          INSERT INTO audit_log (
            id, action, entity_type, entity_id, 
            changes, metadata, performed_by_id, created_at
          ) VALUES (
            gen_random_uuid(), 
            'SLOW_QUERY',
            ${params.model || 'system'},
            NULL,
            '{}'::jsonb,
            jsonb_build_object(
              'query', ${query},
              'duration_ms', ${duration},
              'action', ${params.action},
              'args_preview', ${JSON.stringify(params.args).slice(0, 200)}
            ),
            NULL,
            NOW()
          )
        `.catch(() => {
          // Silent fail - don't crash on audit log failure
        });
      } catch {
        // Silent fail
      }
    }

    return result;
  });
}

/**
 * Performance monitoring utilities
 */
export const dbPerformance = {
  /**
   * Get slow query statistics from audit log
   */
  async getSlowQueryStats(prisma: PrismaClient, hours = 24) {
    const stats = await prisma.$queryRaw<{ query: string; count: number; avg_duration: number; max_duration: number }[]>`
      SELECT 
        metadata->>'query' as query,
        COUNT(*) as count,
        AVG(CAST(metadata->>'duration_ms' as INTEGER)) as avg_duration,
        MAX(CAST(metadata->>'duration_ms' as INTEGER)) as max_duration
      FROM audit_log
      WHERE action = 'SLOW_QUERY'
        AND created_at > NOW() - INTERVAL '${hours} hours'
      GROUP BY metadata->>'query'
      ORDER BY count DESC
      LIMIT 20
    `;

    return stats;
  },

  /**
   * Get table row counts for capacity planning
   */
  async getTableStats(prisma: PrismaClient) {
    const tables = [
      "Order",
      "Product",
      "Customer",
      "LedgerEntry",
      "Transaction",
      "NotificationOutbox",
      "AuditLog",
    ];

    const stats: Record<string, number> = {};
    
    for (const table of tables) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = await (prisma as Record<string, any>)[table.toLowerCase()]?.count?.() || 0;
        stats[table] = count;
      } catch {
        stats[table] = -1;
      }
    }

    return stats;
  },
};
