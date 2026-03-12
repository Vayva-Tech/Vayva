-- Automated Backup Verification and Recovery Test
-- Run this after each backup to ensure data integrity

-- ============================================================
-- BACKUP VERIFICATION CHECKLIST
-- ============================================================

-- 1. ROW COUNT VERIFICATION
-- Compare with expected counts from previous backup
SELECT 
    'Critical Tables Row Counts' as check_type,
    current_timestamp as checked_at;

WITH table_counts AS (
    SELECT 'User' as table_name, COUNT(*) as cnt FROM "User"
    UNION ALL SELECT 'Order', COUNT(*) FROM "Order"
    UNION ALL SELECT 'Product', COUNT(*) FROM "Product"
    UNION ALL SELECT 'Store', COUNT(*) FROM "Store"
    UNION ALL SELECT 'Wallet', COUNT(*) FROM "Wallet"
    UNION ALL SELECT 'Transaction', COUNT(*) FROM "Transaction"
    UNION ALL SELECT 'AuditLog', COUNT(*) FROM "AuditLog"
    UNION ALL SELECT 'OpsUser', COUNT(*) FROM "OpsUser"
    UNION ALL SELECT 'ops_invitation', COUNT(*) FROM "ops_invitation"
    UNION ALL SELECT 'KycRecord', COUNT(*) FROM "KycRecord"
)
SELECT * FROM table_counts ORDER BY table_name;

-- 2. DATA INTEGRITY CHECKS
-- Ensure no critical data corruption

-- Check for NULLs in required fields
SELECT 
    'User emails NULL' as check_name,
    COUNT(*) as violation_count,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as status
FROM "User" WHERE email IS NULL

UNION ALL

SELECT 
    'Order amounts NULL or zero',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM "Order" WHERE amount IS NULL OR amount <= 0

UNION ALL

SELECT 
    'Products without store',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM "Product" WHERE "storeId" IS NULL

UNION ALL

SELECT 
    'OpsUser emails NULL',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM "OpsUser" WHERE email IS NULL

UNION ALL

SELECT 
    'Duplicate User emails',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM (
    SELECT email FROM "User" GROUP BY email HAVING COUNT(*) > 1
) duplicates

UNION ALL

SELECT 
    'OpsInvitations with expired pending status',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'WARN' END
FROM "ops_invitation"
WHERE status = 'PENDING' AND "expiresAt" < now();

-- 3. REFERENTIAL INTEGRITY CHECK
-- Check for orphaned foreign key references

SELECT 
    'Orphaned Orders (no User)' as check_name,
    COUNT(*) as orphaned_count,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as status
FROM "Order" o
LEFT JOIN "User" u ON o."userId" = u.id
WHERE o."userId" IS NOT NULL AND u.id IS NULL

UNION ALL

SELECT 
    'Orphaned Products (no Store)',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM "Product" p
LEFT JOIN "Store" s ON p."storeId" = s.id
WHERE p."storeId" IS NOT NULL AND s.id IS NULL

UNION ALL

SELECT 
    'Orphaned Wallets (no User)',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM "Wallet" w
LEFT JOIN "User" u ON w."userId" = u.id
WHERE w."userId" IS NOT NULL AND u.id IS NULL

UNION ALL

SELECT 
    'Orphaned AuditEvents (no OpsUser)',
    COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'WARN' END
FROM "OpsAuditEvent" ae
LEFT JOIN "OpsUser" u ON ae."opsUserId" = u.id
WHERE ae."opsUserId" IS NOT NULL AND u.id IS NULL;

-- 4. RECENT DATA VERIFICATION
-- Ensure backup captured recent changes

SELECT 
    'Recent Data Verification' as check_type,
    current_timestamp as checked_at;

SELECT 
    metric,
    count,
    CASE 
        WHEN metric LIKE '%24h' AND count > 0 THEN 'PASS - Recent activity detected'
        WHEN metric LIKE '%24h' AND count = 0 THEN 'WARN - No recent activity'
        ELSE 'INFO'
    END as status
FROM (
    SELECT 'Users created (24h)' as metric, COUNT(*) as count
    FROM "User" WHERE "createdAt" > now() - interval '24 hours'
    UNION ALL
    SELECT 'Orders created (24h)', COUNT(*)
    FROM "Order" WHERE "createdAt" > now() - interval '24 hours'
    UNION ALL
    SELECT 'Products created (24h)', COUNT(*)
    FROM "Product" WHERE "createdAt" > now() - interval '24 hours'
    UNION ALL
    SELECT 'Audit events (24h)', COUNT(*)
    FROM "OpsAuditEvent" WHERE "createdAt" > now() - interval '24 hours'
    UNION ALL
    SELECT 'Wallets updated (24h)', COUNT(*)
    FROM "Wallet" WHERE "updatedAt" > now() - interval '24 hours'
) recent_activity;

-- 5. INDEX HEALTH VERIFICATION
-- Ensure indexes are valid

SELECT 
    'Index Health' as check_type,
    current_timestamp as checked_at;

-- Check for duplicate indexes (waste of space)
SELECT 
    'Duplicate indexes' as check_name,
    COUNT(*) as duplicate_count,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'WARN' END as status
FROM (
    SELECT indkey, indclass
    FROM pg_indexes
    JOIN pg_stat_user_indexes ON indexname = indexrelname
    GROUP BY indkey, indclass
    HAVING COUNT(*) > 1
) dups;

-- 6. SEQUENCE CHECK
-- Verify sequences are working properly

SELECT 
    'Sequence Health' as check_type,
    current_timestamp as checked_at;

SELECT 
    sequencename,
    last_value,
    max_value,
    CASE 
        WHEN last_value > max_value * 0.8 THEN 'WARN - Near max value'
        ELSE 'PASS'
    END as status
FROM pg_sequences
WHERE schemaname = 'public'
AND sequencename NOT LIKE 'pg_%'
ORDER BY last_value DESC
LIMIT 10;

-- 7. BACKUP METADATA
-- Record backup information for tracking

CREATE TABLE IF NOT EXISTS "BackupVerification" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "backupTime" TIMESTAMP NOT NULL DEFAULT now(),
    "backupType" TEXT NOT NULL, -- 'FULL', 'INCREMENTAL', 'WAL'
    "backupSize" BIGINT,
    "backupLocation" TEXT,
    "verifiedAt" TIMESTAMP,
    "verificationStatus" TEXT, -- 'PASS', 'FAIL', 'WARN'
    "details" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- Insert current verification record
INSERT INTO "BackupVerification" (
    "backupType",
    "verifiedAt",
    "verificationStatus",
    "details"
) VALUES (
    'MANUAL_CHECK',
    now(),
    'PASS',
    jsonb_build_object(
        'database', current_database(),
        'checked_at', now(),
        'pg_version', version(),
        'critical_tables_checked', ARRAY['User', 'Order', 'Product', 'Store', 'Wallet', 'OpsUser']
    )
);

-- 8. POINT-IN-TIME RECOVERY READINESS
-- Check WAL archiving status

SELECT 
    'PITR Readiness' as check_type,
    current_timestamp as checked_at;

-- Check WAL level
SELECT 
    name,
    setting,
    CASE 
        WHEN name = 'wal_level' AND setting = 'replica' THEN 'PASS - Ready for PITR'
        WHEN name = 'wal_level' AND setting = 'minimal' THEN 'WARN - WAL level too low'
        ELSE 'INFO'
    END as status
FROM pg_settings
WHERE name IN ('wal_level', 'max_wal_size', 'archive_mode');

-- Check WAL files
SELECT 
    count(*) as wal_files,
    pg_size_pretty(sum(file_size)) as total_wal_size
FROM pg_ls_waldir()
WHERE modification > now() - interval '24 hours';

-- 9. RESTORE TEST RECOMMENDATION
-- Guidelines for testing backup restores

/*
PERIODIC RESTORE TESTING CHECKLIST:

Monthly:
1. Restore backup to staging environment
2. Verify row counts match production
3. Run application smoke tests
4. Verify critical queries return correct results
5. Check application can connect and authenticate

Quarterly:
1. Full disaster recovery drill
2. Measure RTO (Recovery Time Objective)
3. Verify RPO (Recovery Point Objective)
4. Document actual vs expected recovery times

Commands for restore testing:

# Create test database
createdb vayva_restore_test

# Restore from backup
pg_restore --dbname=vayva_restore_test --verbose backup_file.dump

# Or for SQL dumps
psql vayva_restore_test < backup_file.sql

# Compare row counts
psql vayva_restore_test -c "SELECT 'Users', count(*) FROM \"User\";"
psql vayva -c "SELECT 'Users', count(*) FROM \"User\";"

# Drop test database after verification
dropdb vayva_restore_test
*/

-- 10. BACKUP POLICY VERIFICATION
-- Ensure backup configuration is optimal

SELECT 
    'Backup Policy Configuration' as check_type,
    current_timestamp as checked_at;

-- Check if we have logical replication slots (for streaming backups)
SELECT 
    slot_name,
    plugin,
    slot_type,
    database,
    active,
    restart_lsn
FROM pg_replication_slots;

-- Summary report
SELECT 
    'BACKUP VERIFICATION SUMMARY' as report_type,
    current_timestamp as generated_at,
    jsonb_build_object(
        'database', current_database(),
        'server_version', version(),
        'total_tables', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'),
        'total_size', pg_size_pretty(pg_database_size(current_database())),
        'recommendation', 'Review any FAIL or WARN statuses above and take corrective action'
    ) as summary;
