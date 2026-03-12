-- Vayva Database Maintenance Routines
-- Run these periodically to keep database in excellent condition

-- ============================================================
-- 1. VACUUM AND ANALYZE (Run weekly)
-- ============================================================
-- Full vacuum to reclaim space and update statistics
-- Run during low-traffic periods

-- Vacuum all tables with analyze
VACUUM ANALYZE;

-- Or vacuum specific large tables
-- VACUUM ANALYZE "Order";
-- VACUUM ANALYZE "Product";
-- VACUUM ANALYZE "User";

-- ============================================================
-- 2. INDEX MAINTENANCE (Run monthly)
-- ============================================================

-- Rebuild bloated indexes (safer than full reindex for production)
-- Check index bloat first:
SELECT 
    schemaname,
    relname as table_name,
    indexrelname as index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- Reindex specific indexes if needed:
-- REINDEX INDEX CONCURRENTLY "Order_pkey";

-- Full database reindex (use with caution - locks tables)
-- REINDEX DATABASE vayva;

-- ============================================================
-- 3. STATISTICS UPDATE (Run daily during low traffic)
-- ============================================================

-- Update statistics for query planner
ANALYZE VERBOSE;

-- Analyze specific tables that change frequently
ANALYZE "Order";
ANALYZE "Product";
ANALYZE "User";
ANALYZE "AuditLog";
ANALYZE "ops_invitation";
ANALYZE "OpsUser";

-- ============================================================
-- 4. DATA INTEGRITY CHECKS (Run weekly)
-- ============================================================

-- Check for orphaned records
-- Example: Orders without users
SELECT COUNT(*) as orphaned_orders
FROM "Order" o
LEFT JOIN "User" u ON o."userId" = u.id
WHERE u.id IS NULL;

-- Check for orphaned audit events
SELECT COUNT(*) as orphaned_audit_events
FROM "OpsAuditEvent" ae
LEFT JOIN "OpsUser" u ON ae."opsUserId" = u.id
WHERE u.id IS NULL AND ae."opsUserId" IS NOT NULL;

-- Check for negative amounts (should never happen)
SELECT 'Wallet with negative balance' as issue, COUNT(*) 
FROM "Wallet" WHERE balance < 0
UNION ALL
SELECT 'Order with negative amount', COUNT(*) 
FROM "Order" WHERE amount < 0
UNION ALL
SELECT 'Refund exceeding order', COUNT(*)
FROM "Refund" r
JOIN "Order" o ON r."orderId" = o.id
WHERE r.amount > o.amount;

-- Check for duplicate emails (should be unique)
SELECT email, COUNT(*) as count
FROM "User"
GROUP BY email
HAVING COUNT(*) > 1;

-- Check for duplicate OpsUser emails
SELECT email, COUNT(*) as count
FROM "OpsUser"
GROUP BY email
HAVING COUNT(*) > 1;

-- ============================================================
-- 5. PERFORMANCE OPTIMIZATION (Run monthly)
-- ============================================================

-- Identify missing indexes (tables with high seq scans)
SELECT 
    schemaname || '.' || relname as table_name,
    seq_scan,
    idx_scan,
    CASE WHEN seq_scan + idx_scan > 0 
         THEN round(100.0 * seq_scan / (seq_scan + idx_scan), 2)
         ELSE 0 
    END as seq_scan_pct,
    n_live_tup as estimated_rows
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_scan DESC
LIMIT 20;

-- Check for unused indexes (candidates for removal)
SELECT 
    schemaname || '.' || relname as table_name,
    indexrelname as index_name,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pg_toast%'
AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================
-- 6. TABLE BLOAT CHECK (Run weekly)
-- ============================================================

-- Tables with bloat (simplified estimation)
SELECT 
    schemaname || '.' || relname as table_name,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    CASE WHEN n_live_tup > 0 
         THEN round(100.0 * n_dead_tup / n_live_tup, 2)
         ELSE 0 
    END as bloat_pct,
    pg_size_pretty(pg_total_relation_size(relid)) as total_size
FROM pg_stat_user_tables
WHERE n_dead_tup > n_live_tup * 0.1  -- More than 10% dead tuples
ORDER BY n_dead_tup DESC
LIMIT 20;

-- ============================================================
-- 7. CONNECTION AND LOCK MONITORING (Run as needed)
-- ============================================================

-- Current connections
SELECT 
    datname as database,
    usename as username,
    application_name,
    client_addr,
    state,
    EXTRACT(EPOCH FROM (now() - backend_start))::int as connection_seconds,
    EXTRACT(EPOCH FROM (now() - state_change))::int as state_seconds
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY backend_start;

-- Long-running transactions (potential issues)
SELECT 
    pid,
    usename,
    application_name,
    state,
    EXTRACT(EPOCH FROM (now() - query_start))::int / 60 as minutes_running,
    LEFT(query, 100) as query_snippet
FROM pg_stat_activity
WHERE state = 'active'
AND query_start < now() - interval '5 minutes'
ORDER BY query_start;

-- Check for locks
SELECT 
    blocked_locks.pid as blocked_pid,
    blocked_activity.usename as blocked_user,
    blocking_locks.pid as blocking_pid,
    blocking_activity.usename as blocking_user,
    blocked_activity.query as blocked_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.relation = blocked_locks.relation
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- ============================================================
-- 8. CACHE HIT RATIO (Run weekly)
-- ============================================================

-- Overall cache hit ratio (should be > 95%)
SELECT 
    datname,
    round(blks_hit * 100.0 / (blks_hit + blks_read), 2) as cache_hit_pct,
    blks_hit,
    blks_read
FROM pg_stat_database
WHERE blks_read + blks_hit > 0
AND datname = current_database();

-- Table-level cache hit ratio
SELECT 
    schemaname || '.' || relname as table_name,
    heap_blks_hit,
    heap_blks_read,
    CASE WHEN heap_blks_hit + heap_blks_read > 0
         THEN round(heap_blks_hit * 100.0 / (heap_blks_hit + heap_blks_read), 2)
         ELSE 0
    END as cache_hit_pct
FROM pg_statio_user_tables
WHERE heap_blks_read > 0
ORDER BY heap_blks_read DESC
LIMIT 20;

-- ============================================================
-- 9. AUTOMATIC MAINTENANCE TASKS (Run via cron)
-- ============================================================

-- Reset statistics (run monthly to get fresh metrics)
-- SELECT pg_stat_reset();

-- Reset specific table statistics
-- SELECT pg_stat_reset_single_table_counters('tablename');

-- ============================================================
-- 10. BACKUP VERIFICATION (Run after each backup)
-- ============================================================

-- Check if we can query all critical tables (verifies backup integrity)
SELECT 'Users' as table_name, COUNT(*) as row_count FROM "User"
UNION ALL
SELECT 'Orders', COUNT(*) FROM "Order"
UNION ALL
SELECT 'Products', COUNT(*) FROM "Product"
UNION ALL
SELECT 'Wallets', COUNT(*) FROM "Wallet"
UNION ALL
SELECT 'AuditLogs', COUNT(*) FROM "AuditLog"
UNION ALL
SELECT 'OpsUsers', COUNT(*) FROM "OpsUser"
UNION ALL
SELECT 'OpsInvitations', COUNT(*) FROM "ops_invitation";

-- Check recent data (verifies backup is current)
SELECT 
    'Orders in last 24h' as metric,
    COUNT(*) as count
FROM "Order"
WHERE "createdAt" > now() - interval '24 hours'
UNION ALL
SELECT 'Users in last 24h', COUNT(*)
FROM "User"
WHERE "createdAt" > now() - interval '24 hours'
UNION ALL
SELECT 'Audit events in last 24h', COUNT(*)
FROM "OpsAuditEvent"
WHERE "createdAt" > now() - interval '24 hours';
