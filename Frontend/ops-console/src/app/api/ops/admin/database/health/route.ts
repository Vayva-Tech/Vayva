import { NextRequest, NextResponse } from "next/server";
import { withOpsAuth } from "@/lib/withOpsAuth";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";

/**
 * GET /api/ops/admin/database/health
 * Database health monitoring endpoint for ops console dashboard
 * Requires: users:view permission
 */
export const GET = withOpsAuth(
  async (_req: NextRequest, context: { user?: { id: string; role: string } }) => {
    try {
      // Check permission
      if (!context.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      (OpsAuthService as any).requireRole(context.user, "users:view");
      
      const healthChecks = await Promise.all([
        checkConnection(),
        checkTableStats(),
        checkIndexHealth(),
        checkCacheHitRatio(),
        checkBloat(),
        checkLongRunningQueries(),
        checkConnectionCount(),
      ]);

      const [connection, tables, indexes, cache, bloat, queries, connections] = healthChecks;

      // Calculate overall health score
      const healthScore = calculateHealthScore({
        connection: connection.status,
        cache: cache.cacheHitRatio,
        bloat: bloat.bloatLevel,
        queries: queries.hasLongRunning,
        connections: connections.utilizationPct,
      });

      return NextResponse.json({
        timestamp: new Date().toISOString(),
        overallHealth: healthScore >= 90 ? "HEALTHY" : healthScore >= 70 ? "WARNING" : "CRITICAL",
        healthScore,
        checks: {
          connection,
          tables,
          indexes,
          cache,
          bloat,
          queries,
          connections,
        },
        recommendations: generateRecommendations({ cache, bloat, queries, indexes }),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Database health check failed";
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }
  }
);

async function checkConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "OK", latency: "< 50ms" };
  } catch {
    return { status: "ERROR", latency: "N/A" };
  }
}

async function checkTableStats() {
  const result = await prisma.$queryRaw<{ table_name: string; row_count: bigint; size: string }[]>`
    SELECT 
      schemaname || '.' || relname as table_name,
      n_live_tup::bigint as row_count,
      pg_size_pretty(pg_total_relation_size(relid)) as size
    FROM pg_stat_user_tables
    ORDER BY pg_total_relation_size(relid) DESC
    LIMIT 10
  `;

  const totalSize = await prisma.$queryRaw<{ size: string }[]>`
    SELECT pg_size_pretty(pg_database_size(current_database())) as size
  `;

  return {
    topTables: result,
    totalSize: totalSize[0]?.size || "Unknown",
    totalTables: result.length,
  };
}

async function checkIndexHealth() {
  const unused = await prisma.$queryRaw<{ index_name: string; size: string }[]>`
    SELECT 
      schemaname || '.' || relname || ' -> ' || indexrelname as index_name,
      pg_size_pretty(pg_relation_size(indexrelid)) as size
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
    AND indexrelname NOT LIKE 'pg_toast%'
    ORDER BY pg_relation_size(indexrelid) DESC
    LIMIT 5
  `;

  const totalIndexes = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT count(*) as count FROM pg_indexes WHERE schemaname = 'public'
  `;

  return {
    totalIndexes: Number(totalIndexes[0]?.count || 0),
    unusedIndexes: unused,
    unusedIndexCount: unused.length,
    status: unused.length > 5 ? "WARNING" : "OK",
  };
}

async function checkCacheHitRatio() {
  const result = await prisma.$queryRaw<{ cache_hit_pct: number | null }[]>`
    SELECT 
      CASE 
        WHEN sum(blks_hit + blks_read) > 0 
        THEN round(sum(blks_hit) * 100.0 / sum(blks_hit + blks_read), 2)
        ELSE NULL
      END as cache_hit_pct
    FROM pg_stat_database
    WHERE datname = current_database()
  `;

  const ratio = result[0]?.cache_hit_pct || 0;

  return {
    cacheHitRatio: ratio,
    status: ratio >= 95 ? "EXCELLENT" : ratio >= 90 ? "GOOD" : ratio >= 80 ? "WARNING" : "CRITICAL",
  };
}

async function checkBloat() {
  const result = await prisma.$queryRaw<{ dead_pct: number | null }[]>`
    SELECT 
      CASE WHEN sum(n_live_tup) > 0 
      THEN round(sum(n_dead_tup) * 100.0 / sum(n_live_tup), 2)
      ELSE NULL
      END as dead_pct
    FROM pg_stat_user_tables
  `;

  const deadPct = result[0]?.dead_pct || 0;

  return {
    bloatLevel: deadPct,
    status: deadPct < 10 ? "OK" : deadPct < 20 ? "WARNING" : "CRITICAL",
  };
}

async function checkLongRunningQueries() {
  const result = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT count(*) as count
    FROM pg_stat_activity
    WHERE state = 'active'
    AND query_start < now() - interval '5 minutes'
  `;

  const count = Number(result[0]?.count || 0);

  return {
    hasLongRunning: count > 0,
    count,
    status: count === 0 ? "OK" : count < 3 ? "WARNING" : "CRITICAL",
  };
}

async function checkConnectionCount() {
  const [current, max] = await Promise.all([
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()
    `,
    prisma.$queryRaw<{ setting: string }[]>`
      SELECT setting FROM pg_settings WHERE name = 'max_connections'
    `,
  ]);

  const currentCount = Number(current[0]?.count || 0);
  const maxCount = Number(max[0]?.setting || 100);
  const utilizationPct = (currentCount / maxCount) * 100;

  return {
    current: currentCount,
    max: maxCount,
    utilizationPct,
    status: utilizationPct < 70 ? "OK" : utilizationPct < 85 ? "WARNING" : "CRITICAL",
  };
}

function calculateHealthScore(checks: {
  connection: string;
  cache: number;
  bloat: number;
  queries: boolean;
  connections: number;
}): number {
  let score = 100;

  if (checks.connection !== "OK") score -= 30;
  if (checks.cache < 90) score -= 10;
  if (checks.cache < 80) score -= 10;
  if (checks.bloat > 20) score -= 15;
  if (checks.bloat > 10) score -= 5;
  if (checks.queries) score -= 10;
  if (checks.connections > 85) score -= 10;
  if (checks.connections > 70) score -= 5;

  return Math.max(0, score);
}

function generateRecommendations(checks: {
  cache: { cacheHitRatio: number; status: string };
  bloat: { bloatLevel: number; status: string };
  queries: { hasLongRunning: boolean; count: number };
  indexes: { unusedIndexCount: number; status: string };
}): string[] {
  const recs: string[] = [];

  if (checks.cache.cacheHitRatio < 95) {
    recs.push(`Cache hit ratio is ${checks.cache.cacheHitRatio}%. Consider increasing shared_buffers or reviewing queries causing high disk reads.`);
  }

  if (checks.bloat.bloatLevel > 10) {
    recs.push(`Table bloat is ${checks.bloat.bloatLevel}%. Run VACUUM ANALYZE during low-traffic periods.`);
  }

  if (checks.queries.hasLongRunning) {
    recs.push(`${checks.queries.count} queries running > 5 minutes. Review and optimize slow queries.`);
  }

  if (checks.indexes.unusedIndexCount > 5) {
    recs.push(`${checks.indexes.unusedIndexCount} unused indexes found. Consider dropping them to save space.`);
  }

  if (recs.length === 0) {
    recs.push("Database is in excellent condition. Continue regular maintenance schedule.");
  }

  return recs;
}
