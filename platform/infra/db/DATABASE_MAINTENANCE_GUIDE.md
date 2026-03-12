# Vayva Database Optimization & Maintenance Guide

## Overview
This guide ensures your PostgreSQL database remains in excellent condition with optimal performance, data integrity, and reliability.

---

## 📊 Database Health Monitoring

### Daily Checks (Automated)
Run these via cron on your VPS:

```bash
# Add to crontab (crontab -e)
# Daily health check at 6 AM
0 6 * * * cd /var/www/vayva/platform/infra/db && ./scripts/db-health-check.sh >> /var/log/db-health.log 2>&1

# Weekly deep maintenance (Sundays at 2 AM)
0 2 * * 0 cd /var/www/vayva/platform/infra/db && psql "$DATABASE_URL" -f scripts/maintenance-routines.sql >> /var/log/db-maintenance.log 2>&1
```

### Manual Health Check
```bash
# SSH to your VPS, then:
cd /Users/fredrick/Documents/Vayva-Tech/vayva/platform/infra/db
./scripts/db-health-check.sh
```

---

## 🔧 Maintenance Routines

### 1. VACUUM & ANALYZE (Weekly)
Reclaims storage and updates query planner statistics:

```bash
# Basic vacuum
psql "$DATABASE_URL" -c "VACUUM ANALYZE;"

# Or for specific tables
psql "$DATABASE_URL" -c "VACUUM ANALYZE \"Order\", \"Product\", \"User\";"
```

### 2. INDEX MAINTENANCE (Monthly)
Rebuild fragmented indexes:

```bash
# Check index bloat first
psql "$DATABASE_URL" -f - <<EOF
SELECT 
    indexrelname as index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    idx_scan as scans
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
EOF

# Rebuild specific index (concurrently to avoid locks)
psql "$DATABASE_URL" -c "REINDEX INDEX CONCURRENTLY \"Order_pkey\";"
```

### 3. CACHE OPTIMIZATION
Monitor and optimize cache hit ratio:

```bash
# Check cache hit ratio (should be > 95%)
psql "$DATABASE_URL" -c "
SELECT 
    round(blks_hit * 100.0 / (blks_hit + blks_read), 2) as cache_hit_pct
FROM pg_stat_database
WHERE datname = current_database();
"
```

**If cache hit ratio < 95%:**
- Increase `shared_buffers` in postgresql.conf (25% of RAM)
- Review queries causing high disk reads
- Consider adding indexes for frequently accessed data

---

## 💾 Backup Strategy

### Automated Backups

```bash
# Add to crontab

# Daily full backup at 1 AM
0 1 * * * pg_dump "$DATABASE_URL" | gzip > /backups/vayva-$(date +\%Y\%m\%d).sql.gz

# Hourly WAL backups for point-in-time recovery
0 * * * * cp -r $PGDATA/pg_wal /backups/wal/

# Weekly backup verification (Sundays at 3 AM)
0 3 * * 0 cd /var/www/vayva/platform/infra/db && psql "$DATABASE_URL" -f scripts/backup-verification.sql
```

### Backup Retention Policy
- **Daily backups**: Keep 7 days
- **Weekly backups**: Keep 4 weeks
- **Monthly backups**: Keep 12 months

```bash
# Cleanup old backups (add to cron)
# Delete backups older than 7 days
find /backups -name "vayva-*.sql.gz" -mtime +7 -delete
```

### Restore Testing
Test your backups monthly:

```bash
# Create test database
createdb vayva_restore_test

# Restore backup
gunzip < /backups/vayva-$(date +%Y%m%d).sql.gz | psql vayva_restore_test

# Verify row counts match
psql vayva_restore_test -c "SELECT 'Users', count(*) FROM \"User\";"
psql vayva -c "SELECT 'Users', count(*) FROM \"User\";"

# Cleanup
dropdb vayva_restore_test
```

---

## ⚡ Performance Optimization

### 1. Connection Pooling
Use PgBouncer for connection pooling:

```bash
# Install
sudo apt install pgbouncer

# Configure /etc/pgbouncer/pgbouncer.ini
[databases]
vayva = host=localhost port=5432 dbname=vayva

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
max_client_conn = 1000
default_pool_size = 20
reserve_pool_size = 5

# Update app to use pgbouncer
DATABASE_URL="postgresql://user:pass@localhost:6432/vayva?sslmode=require"
```

### 2. Query Optimization
Find and optimize slow queries:

```bash
# Enable query logging in postgresql.conf
log_min_duration_statement = 1000  # Log queries > 1 second
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# View slow queries
psql "$DATABASE_URL" -c "
SELECT 
    query,
    calls,
    mean_time,
    max_time,
    total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
"
```

### 3. Table Partitioning (for large tables)
For tables > 100GB, consider partitioning:

```sql
-- Example: Partition Order table by month
CREATE TABLE "Order_2024_01" PARTITION OF "Order"
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

---

## 🔒 Security & Integrity

### 1. Data Integrity Checks
Run weekly:

```bash
cd /var/www/vayva/platform/infra/db
psql "$DATABASE_URL" -f scripts/maintenance-routines.sql
```

Key checks:
- ✅ No orphaned foreign keys
- ✅ No duplicate unique values
- ✅ No negative amounts in financial tables
- ✅ All required fields have values

### 2. Row Level Security (RLS)
Enable RLS on sensitive tables:

```sql
-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY user_isolation ON "User"
FOR ALL
USING (id = current_setting('app.current_user_id')::uuid);
```

### 3. Audit Logging
Ensure audit events are being captured:

```bash
# Check audit log table growth
psql "$DATABASE_URL" -c "
SELECT 
    pg_size_pretty(pg_total_relation_size('OpsAuditEvent')) as size,
    count(*) as event_count
FROM \"OpsAuditEvent\";
"

# Archive old audit events (keep 90 days)
psql "$DATABASE_URL" -c "
DELETE FROM \"OpsAuditEvent\" 
WHERE \"createdAt\" < now() - interval '90 days';
"
```

---

## 📈 Monitoring Dashboard

### Key Metrics to Track

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Cache Hit Ratio | > 95% | 90-95% | < 90% |
| Connections | < 70% | 70-85% | > 85% |
| Table Bloat | < 10% | 10-20% | > 20% |
| Replication Lag | < 1s | 1-5s | > 5s |
| Disk Usage | < 70% | 70-85% | > 85% |

### Ops Console Integration
Access the database health API:
```
GET /api/ops/admin/database/health
```

Returns:
```json
{
  "overallHealth": "HEALTHY",
  "healthScore": 95,
  "checks": {
    "connection": { "status": "OK" },
    "cache": { "cacheHitRatio": 98.5, "status": "EXCELLENT" },
    "bloat": { "bloatLevel": 5.2, "status": "OK" }
  },
  "recommendations": ["..."]
}
```

---

## 🚨 Troubleshooting

### Database Won't Connect
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Check connection
pg_isready -h 163.245.209.203 -p 5432
```

### High CPU Usage
```bash
# Find top queries by CPU
psql "$DATABASE_URL" -c "
SELECT 
    pid,
    now() - query_start as duration,
    state,
    left(query, 100) as query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start;
"
```

### Disk Space Full
```bash
# Find large tables
psql "$DATABASE_URL" -c "
SELECT 
    schemaname || '.' || relname as table,
    pg_size_pretty(pg_total_relation_size(relid)) as size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;
"

# Vacuum to free space
psql "$DATABASE_URL" -c "VACUUM FULL;"  # Note: Locks tables!
```

### Slow Queries
```bash
# Enable query timing
psql "$DATABASE_URL" -c "\timing on"

# Explain slow query
psql "$DATABASE_URL" -c "EXPLAIN ANALYZE SELECT * FROM ..."
```

---

## 📋 Maintenance Checklist

### Daily
- [ ] Check connection health
- [ ] Monitor disk space
- [ ] Review error logs
- [ ] Verify backups completed

### Weekly
- [ ] Run `VACUUM ANALYZE`
- [ ] Check cache hit ratio
- [ ] Review long-running queries
- [ ] Check table bloat levels
- [ ] Run data integrity checks

### Monthly
- [ ] Rebuild fragmented indexes
- [ ] Review and drop unused indexes
- [ ] Test backup restore
- [ ] Analyze query performance trends
- [ ] Update statistics on all tables
- [ ] Review and optimize slow queries

### Quarterly
- [ ] Full disaster recovery drill
- [ ] Review and update backup strategy
- [ ] Security audit
- [ ] Capacity planning review
- [ ] Update PostgreSQL if needed

---

## 🔗 Quick Reference Commands

```bash
# Health check
./scripts/db-health-check.sh

# Quick stats
psql "$DATABASE_URL" -c "\dt+"

# Table sizes
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_total_relation_size('User'));"

# Active connections
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"

# Lock status
psql "$DATABASE_URL" -c "SELECT * FROM pg_locks WHERE NOT granted;"

# Database size
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

---

## 📞 Support

For critical database issues:
1. Check logs: `/var/log/postgresql/`
2. Review monitoring dashboard
3. Run health check script
4. Contact DBA if needed

---

*Last updated: February 2026*
*PostgreSQL Version: 15+*
