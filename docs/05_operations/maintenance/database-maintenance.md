# Database Maintenance

> Last updated: 2026-03-23
> Owner: Engineering / DevOps
> Database: PostgreSQL via Prisma 5.7 ORM
> Schema location: `platform/infra/db/prisma/schema.prisma`

---

## Overview

Vayva uses PostgreSQL as its primary data store, accessed through Prisma ORM. The database hosts all merchant data in a multi-tenant architecture where every record is scoped by `storeId`. This document covers backup strategy, migration procedures, performance tuning, connection management, and disaster recovery.

---

## Backup Strategy

### Automated Backups

| Backup Type | Frequency | Retention | Method |
|-------------|-----------|-----------|--------|
| Full database dump | Daily at 02:00 UTC | 30 days | `pg_dump` via cron on VPS |
| Incremental WAL archiving | Continuous | 7 days | PostgreSQL WAL archiving |
| Point-in-time snapshots | Weekly (Sunday 03:00 UTC) | 90 days | VPS volume snapshot |

### Backup Script

```bash
#!/bin/bash
# /opt/vayva/scripts/backup-database.sh
# Run via cron: 0 2 * * * /opt/vayva/scripts/backup-database.sh

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/vayva/backups/postgres"
BACKUP_FILE="${BACKUP_DIR}/vayva_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

# Create compressed backup
pg_dump "${DATABASE_URL}" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --file="${BACKUP_FILE}"

# Remove backups older than retention period
find "${BACKUP_DIR}" -name "vayva_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Log completion
echo "[$(date)] Backup completed: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"
```

### Backup Verification

Verify backups weekly by restoring to a test database:

```bash
# Create a test database
createdb vayva_backup_test

# Restore the latest backup
pg_restore --dbname=vayva_backup_test --no-owner /opt/vayva/backups/postgres/latest.sql.gz

# Run basic integrity checks
psql vayva_backup_test -c "SELECT count(*) FROM \"Store\";"
psql vayva_backup_test -c "SELECT count(*) FROM \"Order\";"
psql vayva_backup_test -c "SELECT count(*) FROM \"Product\";"

# Drop the test database
dropdb vayva_backup_test
```

### Off-Site Backup

Backups are synced to a separate storage location daily:

```bash
# Sync to off-site storage (run after backup script)
rsync -avz /opt/vayva/backups/postgres/ backup-storage:/vayva/postgres/
```

---

## Prisma Migrations

### Migration Workflow

Vayva uses Prisma's migration system to manage schema changes. The schema file is at `platform/infra/db/prisma/schema.prisma` (approximately 10,100 lines, 150+ models).

#### Development Flow

```bash
# 1. Edit the schema file
#    platform/infra/db/prisma/schema.prisma

# 2. Generate a migration (creates SQL file in prisma/migrations/)
pnpm --filter @vayva/db prisma migrate dev --name descriptive_name

# 3. Regenerate the Prisma client
pnpm db:generate

# 4. Test the migration locally
pnpm --filter @vayva/merchant dev

# 5. Commit both the migration SQL and updated schema
git add platform/infra/db/prisma/
git commit -m "feat: add {description} to schema"
```

#### Production Migration

```bash
# Deploy pending migrations (non-interactive, CI-safe)
pnpm --filter @vayva/db prisma migrate deploy
```

### Migration Best Practices

1. **Never edit existing migration files.** If a migration needs correction, create a new migration.
2. **Test migrations against a copy of production data** before deploying. Use the backup restoration process to create a test database.
3. **Keep migrations small.** One logical change per migration. Do not bundle unrelated schema changes.
4. **Add indexes in separate migrations** from table creation to allow concurrent index builds.
5. **Use `@default()` values** for new required columns on existing tables to avoid breaking existing rows.
6. **Avoid dropping columns** unless all application code has been deployed without references to them for at least one release cycle.

### Handling Migration Failures

If `prisma migrate deploy` fails in production:

1. **Do not retry blindly.** Read the error message carefully.
2. Check the `_prisma_migrations` table to see which migrations have been applied:
   ```sql
   SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 10;
   ```
3. If a migration was partially applied, you may need to manually complete or roll back the SQL.
4. Mark a failed migration as rolled back if you manually reverted it:
   ```sql
   UPDATE "_prisma_migrations"
   SET rolled_back_at = NOW()
   WHERE migration_name = '{migration_name}';
   ```

### Schema Push (Non-Production Only)

For rapid prototyping in development, use `db:push` which applies schema changes directly without creating migration files:

```bash
pnpm db:push
```

This is useful for iterating quickly but must never be used against production databases.

---

## Performance Tuning

### PostgreSQL Configuration

Key parameters to tune for Vayva's workload profile (read-heavy, multi-tenant):

```ini
# Memory
shared_buffers = 256MB              # 25% of available RAM (for 1GB VPS)
effective_cache_size = 768MB        # 75% of available RAM
work_mem = 4MB                      # Per-operation sort/hash memory
maintenance_work_mem = 64MB         # For VACUUM, CREATE INDEX

# Write-Ahead Log
wal_buffers = 16MB
checkpoint_completion_target = 0.9
max_wal_size = 1GB

# Query Planning
random_page_cost = 1.1              # SSD storage
effective_io_concurrency = 200      # SSD storage

# Connections
max_connections = 100               # Managed by connection pooler
```

### Index Strategy

The Prisma schema defines indexes on frequently queried columns. Key indexes to maintain:

| Table | Index | Purpose |
|-------|-------|---------|
| `Order` | `storeId, createdAt` | Order listing by store |
| `Product` | `storeId, status` | Active product listing |
| `Customer` | `storeId, email` | Customer lookup |
| `Conversation` | `storeId, updatedAt` | Recent conversations |
| `AiUsageEvent` | `storeId, createdAt` | AI usage tracking |
| `AuditLog` | `storeId, createdAt` | Audit trail queries |
| `Message` | `conversationId, createdAt` | Message history |

### Identifying Slow Queries

```sql
-- Enable query logging for queries > 500ms
ALTER SYSTEM SET log_min_duration_statement = 500;
SELECT pg_reload_conf();

-- Find the slowest queries
SELECT
  calls,
  mean_exec_time::numeric(10,2) AS avg_ms,
  total_exec_time::numeric(10,2) AS total_ms,
  query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Check for missing indexes (sequential scans on large tables)
SELECT
  schemaname,
  relname,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan
  AND n_live_tup > 10000
ORDER BY seq_tup_read DESC;
```

### Routine Maintenance Queries

```sql
-- Table sizes (identify growth)
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS data_size,
  pg_size_pretty(pg_indexes_size(relid)) AS index_size,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 20;

-- Bloat check (tables needing VACUUM)
SELECT
  schemaname,
  relname,
  n_dead_tup,
  n_live_tup,
  round(n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100, 2) AS dead_pct,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- Active connections
SELECT
  state,
  count(*),
  max(now() - state_change) AS max_duration
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state;
```

### Autovacuum Tuning

```ini
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 60              # Check every 60 seconds
autovacuum_vacuum_threshold = 50     # Minimum dead tuples before vacuum
autovacuum_vacuum_scale_factor = 0.1 # Vacuum when 10% of rows are dead
autovacuum_analyze_threshold = 50
autovacuum_analyze_scale_factor = 0.05
```

For high-traffic tables (Order, Message, AiUsageEvent), set per-table autovacuum parameters:

```sql
ALTER TABLE "Order" SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_analyze_scale_factor = 0.01
);
```

---

## Connection Pooling

### Architecture

```
Vercel Functions (serverless) ──┐
                                ├──> PgBouncer ──> PostgreSQL
VPS Workers (long-running)    ──┘
```

### Prisma Connection Configuration

Prisma uses two connection URLs:

| Variable | Purpose | Used By |
|----------|---------|---------|
| `DATABASE_URL` | Pooled connection (via PgBouncer) | All application queries |
| `DIRECT_URL` | Direct connection (bypasses pool) | Prisma migrations only |

```env
# Pooled connection for application use
DATABASE_URL="postgresql://user:pass@host:6432/vayva?pgbouncer=true&connection_limit=1"

# Direct connection for migrations
DIRECT_URL="postgresql://user:pass@host:5432/vayva"
```

### PgBouncer Configuration

```ini
[databases]
vayva = host=127.0.0.1 port=5432 dbname=vayva

[pgbouncer]
listen_port = 6432
listen_addr = 0.0.0.0
auth_type = md5
pool_mode = transaction          # Required for serverless
max_client_conn = 200
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3
server_idle_timeout = 300
query_wait_timeout = 120
```

### Connection Limits by Environment

| Environment | Max Connections | Pool Size | Notes |
|-------------|----------------|-----------|-------|
| Production | 200 client / 20 pool | 20 | Via PgBouncer, transaction mode |
| Staging | 50 client / 10 pool | 10 | Shared VPS |
| Development | 10 | Direct | No pooler needed |

### Monitoring Connection Health

```sql
-- Check connection count vs limit
SELECT
  max_conn,
  used,
  max_conn - used AS available
FROM (
  SELECT
    setting::int AS max_conn,
    (SELECT count(*) FROM pg_stat_activity) AS used
  FROM pg_settings
  WHERE name = 'max_connections'
) t;

-- Long-running queries (candidates for termination)
SELECT
  pid,
  now() - query_start AS duration,
  state,
  left(query, 100) AS query_preview
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - query_start > interval '30 seconds'
ORDER BY duration DESC;
```

---

## Disaster Recovery

### Recovery Point Objective (RPO)

- **Target:** 1 hour maximum data loss
- **Method:** WAL archiving (continuous) + daily full backups
- **Credit/payment data:** Near-zero loss (transactional with Paystack as source of truth)

### Recovery Time Objective (RTO)

- **Target:** 4 hours to full restoration
- **Method:** Restore from latest backup + replay WAL logs

### Recovery Procedures

#### Scenario 1: Database Corruption (Single Table)

```bash
# 1. Identify the affected table
# 2. Restore the table from the latest backup into a temporary database
pg_restore --dbname=vayva_recovery --table="{TableName}" /opt/vayva/backups/postgres/latest.sql.gz

# 3. Copy the data back into production
pg_dump --table="{TableName}" --data-only vayva_recovery | psql vayva

# 4. Verify data integrity
psql vayva -c "SELECT count(*) FROM \"{TableName}\";"
```

#### Scenario 2: Full Database Loss

```bash
# 1. Create a fresh database
createdb vayva

# 2. Restore from the latest full backup
pg_restore --dbname=vayva --no-owner --no-privileges /opt/vayva/backups/postgres/latest.sql.gz

# 3. Apply WAL logs to recover data since last backup
pg_wal_replay  # (use pg_basebackup restore process)

# 4. Verify with Prisma
pnpm --filter @vayva/db prisma migrate deploy

# 5. Run integrity checks
psql vayva -c "SELECT count(*) FROM \"Store\" WHERE \"deletedAt\" IS NULL;"
psql vayva -c "SELECT count(*) FROM \"Order\" WHERE \"createdAt\" > NOW() - INTERVAL '24 hours';"

# 6. Restart application services
```

#### Scenario 3: VPS Complete Failure

1. Provision a new VPS with the same specifications.
2. Install PostgreSQL (same version as production).
3. Restore from the latest off-site backup.
4. Update `DATABASE_URL` and `DIRECT_URL` in Vercel environment variables for all projects.
5. Run `prisma migrate deploy` to verify schema is current.
6. Restart all Vercel deployments to pick up the new connection strings.
7. Verify WhatsApp webhook endpoints still resolve to the correct IP.

### Data Integrity Checks

Run these checks after any recovery operation:

```sql
-- Verify store count matches expected
SELECT count(*) AS total_stores FROM "Store";

-- Check for orphaned records (orders without stores)
SELECT count(*) FROM "Order" o
LEFT JOIN "Store" s ON o."storeId" = s.id
WHERE s.id IS NULL;

-- Verify financial consistency (wallet balances)
SELECT
  w.id,
  w.balance,
  COALESCE(SUM(CASE WHEN wt.type = 'DEPOSIT' THEN wt.amount ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN wt.type = 'WITHDRAWAL' THEN wt.amount ELSE 0 END), 0) AS computed_balance
FROM "Wallet" w
LEFT JOIN "WalletTransaction" wt ON wt."walletId" = w.id
GROUP BY w.id, w.balance
HAVING w.balance != COALESCE(SUM(CASE WHEN wt.type = 'DEPOSIT' THEN wt.amount ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN wt.type = 'WITHDRAWAL' THEN wt.amount ELSE 0 END), 0);

-- Verify AI credit consistency
SELECT
  s.id AS store_id,
  s.name,
  mas."creditsRemaining",
  mas."totalCreditsPurchased"
FROM "MerchantAiSubscription" mas
JOIN "Store" s ON mas."storeId" = s.id
WHERE mas."creditsRemaining" < 0;
```

---

## Scheduled Maintenance Windows

| Task | Schedule | Duration | Impact |
|------|----------|----------|--------|
| Autovacuum | Continuous | N/A | None (automatic) |
| Manual VACUUM FULL | Monthly, Sunday 04:00 UTC | 30-60 min | Brief table locks |
| Index rebuild | Quarterly | 15-30 min | None (CONCURRENTLY) |
| PostgreSQL minor upgrade | As needed | 15 min | Brief downtime |
| Backup verification | Weekly, Saturday | 30 min | None (separate database) |

---

## Related Documents

- [Redis Operations](redis-operations.md)
- [Environment Variables](../../04_deployment/environment-variables.md)
- [Deployment Checklist](../../04_deployment/procedures/deployment-checklist.md)
- [Incident Response Runbook](../incident-management/incident-response-runbook.md)
