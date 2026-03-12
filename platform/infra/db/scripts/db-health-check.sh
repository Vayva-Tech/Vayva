#!/bin/bash

# Vayva Database Health Check Script
# Comprehensive database diagnostics and health monitoring
# Run this on your VPS: ./db-health-check.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="vayva"
LOG_FILE="db-health-$(date +%Y%m%d-%H%M%S).log"
ALERT_THRESHOLD=80  # Alert if disk/memory exceeds this %

# Load environment
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL not set${NC}"
    exit 1
fi

# Extract connection details
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   VAYVA DATABASE HEALTH CHECK${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Started: $(date)"
echo "Log file: $LOG_FILE"
echo ""

# Function to run SQL query
run_query() {
    psql "$DATABASE_URL" -t -c "$1" 2>/dev/null
}

# Function to check and report
check_status() {
    local name=$1
    local value=$2
    local threshold=$3
    local unit=$4
    
    if [ -z "$value" ]; then
        value=0
    fi
    
    if (( $(echo "$value > $threshold" | bc -l) )); then
        echo -e "${RED}⚠️  $name: $value$unit (threshold: $threshold$unit)${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $name: $value$unit${NC}"
        return 0
    fi
}

# 1. CONNECTION HEALTH
echo -e "${BLUE}[1/10] Connection Health${NC}"
echo "----------------------------------------"
if pg_isready -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -q; then
    echo -e "${GREEN}✓ Database is reachable${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    exit 1
fi

# Check active connections
CONNECTIONS=$(run_query "SELECT count(*) FROM pg_stat_activity;")
MAX_CONNECTIONS=$(run_query "SELECT setting FROM pg_settings WHERE name='max_connections';")
CONNECTION_PCT=$(echo "scale=2; ($CONNECTIONS / $MAX_CONNECTIONS) * 100" | bc)
check_status "Active Connections" "$CONNECTION_PCT" "80" "% ($CONNECTIONS/$MAX_CONNECTIONS)"

# Check long-running queries
echo ""
echo "Long-running queries (> 5 minutes):"
run_query "
SELECT pid, usename, application_name, client_addr, 
       state, EXTRACT(EPOCH FROM (now() - query_start))/60 as minutes,
       LEFT(query, 100) as query_snippet
FROM pg_stat_activity 
WHERE state = 'active' 
  AND query_start < now() - interval '5 minutes'
ORDER BY query_start;
" | while read line; do
    if [ ! -z "$line" ]; then
        echo -e "${YELLOW}  ! $line${NC}"
    fi
done
echo ""

# 2. DATABASE SIZE & STORAGE
echo -e "${BLUE}[2/10] Storage Health${NC}"
echo "----------------------------------------"
DB_SIZE=$(run_query "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));")
echo "Database Size: $DB_SIZE"

# Check table sizes (top 10)
echo ""
echo "Top 10 Largest Tables:"
run_query "
SELECT schemaname || '.' || relname as table_name,
       pg_size_pretty(pg_total_relation_size(relid)) as size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;
" | while read line; do
    echo "  $line"
done
echo ""

# 3. TABLE HEALTH
echo -e "${BLUE}[3/10] Table Health${NC}"
echo "----------------------------------------"

# Check for tables without primary keys
echo "Tables without Primary Keys:"
MISSING_PK=$(run_query "
SELECT tab.table_schema || '.' || tab.table_name
FROM information_schema.tables tab
LEFT JOIN information_schema.table_constraints tco 
    ON tab.table_schema = tco.table_schema 
    AND tab.table_name = tco.table_name 
    AND tco.constraint_type = 'PRIMARY KEY'
WHERE tab.table_type = 'BASE TABLE'
    AND tab.table_schema = 'public'
    AND tco.constraint_name IS NULL;
")

if [ -z "$MISSING_PK" ]; then
    echo -e "${GREEN}✓ All tables have primary keys${NC}"
else
    echo -e "${YELLOW}⚠️  Tables missing PK:${NC}"
    echo "$MISSING_PK" | while read line; do
        echo "  - $line"
    done
fi

# Check for tables without indexes (except very small ones)
echo ""
echo "Tables without indexes:"
run_query "
SELECT schemaname || '.' || relname as table_name
FROM pg_stat_user_tables
WHERE relid NOT IN (
    SELECT indrelid FROM pg_stat_user_indexes
)
AND n_live_tup > 1000
ORDER BY n_live_tup DESC;
" | while read line; do
    if [ ! -z "$line" ]; then
        echo -e "${YELLOW}  ! $line${NC}"
    fi
done
echo ""

# 4. INDEX HEALTH
echo -e "${BLUE}[4/10] Index Health${NC}"
echo "----------------------------------------"

# Duplicate indexes
echo "Duplicate indexes:"
run_query "
SELECT array_agg(indexname ORDER BY indexname) as indexes, 
       pg_size_pretty(sum(pg_relation_size(indexrelid))) as size
FROM pg_indexes
JOIN pg_stat_user_indexes ON indexname = indexrelname
GROUP BY indkey, indclass
HAVING count(*) > 1;
" | while read line; do
    if [ ! -z "$line" ]; then
        echo -e "${YELLOW}  ! $line${NC}"
    else
        echo -e "${GREEN}✓ No duplicate indexes${NC}"
    fi
done

# Unused indexes
echo ""
echo "Unused indexes (0 scans):"
run_query "
SELECT schemaname || '.' || relname || ' -> ' || indexrelname as index_info,
       pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 10;
" | while read line; do
    if [ ! -z "$line" ]; then
        echo -e "${YELLOW}  ! $line${NC}"
    fi
done
echo ""

# 5. VACUUM & AUTOVACUUM STATUS
echo -e "${BLUE}[5/10] Vacuum Health${NC}"
echo "----------------------------------------"

# Tables needing vacuum
echo "Tables needing vacuum (dead tuples > 1000):"
run_query "
SELECT schemaname || '.' || relname as table_name,
       n_dead_tup as dead_tuples,
       last_vacuum,
       last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC
LIMIT 10;
" | while read line; do
    if [ ! -z "$line" ]; then
        echo -e "${YELLOW}  ! $line${NC}"
    else
        echo -e "${GREEN}✓ Vacuum status OK${NC}"
    fi
done
echo ""

# 6. CACHE HIT RATIO
echo -e "${BLUE}[6/10] Cache Performance${NC}"
echo "----------------------------------------"
CACHE_HIT=$(run_query "
SELECT round(
    sum(blks_hit) / (sum(blks_hit) + sum(blks_read)) * 100, 2
) as cache_hit_ratio
FROM pg_stat_database
WHERE datname = '$DB_NAME';
")

if [ -z "$CACHE_HIT" ] || [ "$CACHE_HIT" = "0.00" ]; then
    echo -e "${YELLOW}⚠️  Cache hit ratio: N/A (no data yet)${NC}"
elif (( $(echo "$CACHE_HIT < 95" | bc -l) )); then
    echo -e "${RED}⚠️  Cache hit ratio: $CACHE_HIT% (should be > 95%)${NC}"
else
    echo -e "${GREEN}✓ Cache hit ratio: $CACHE_HIT%${NC}"
fi
echo ""

# 7. REPLICATION STATUS (if applicable)
echo -e "${BLUE}[7/10] Replication Status${NC}"
echo "----------------------------------------"
REPLICATION=$(run_query "
SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn
FROM pg_stat_replication;
")

if [ -z "$REPLICATION" ]; then
    echo -e "${GREEN}✓ Standalone database (no replication)${NC}"
else
    echo "Active replication:"
    echo "$REPLICATION" | while read line; do
        echo "  $line"
    done
fi
echo ""

# 8. LOCK CHECK
echo -e "${BLUE}[8/10] Lock Status${NC}"
echo "----------------------------------------"
LOCKS=$(run_query "
SELECT blocked_locks.pid AS blocked_pid,
       blocked_activity.usename AS blocked_user,
       blocking_locks.pid AS blocking_pid,
       blocking_activity.usename AS blocking_user,
       blocked_activity.query AS blocked_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity 
    ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.relation = blocked_locks.relation
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity 
    ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted
LIMIT 10;
")

if [ -z "$LOCKS" ]; then
    echo -e "${GREEN}✓ No blocking locks detected${NC}"
else
    echo -e "${RED}⚠️  Blocking locks detected:${NC}"
    echo "$LOCKS" | while read line; do
        echo "  ! $line"
    done
fi
echo ""

# 9. BLOAT CHECK
echo -e "${BLUE}[9/10] Table Bloat${NC}"
echo "----------------------------------------"

# Tables with high bloat potential (simplified check)
echo "Tables with bloat potential (live vs dead tuples):"
run_query "
SELECT schemaname || '.' || relname as table_name,
       n_live_tup as live_tuples,
       n_dead_tup as dead_tuples,
       CASE WHEN n_live_tup > 0 
            THEN round(n_dead_tup::numeric / n_live_tup::numeric * 100, 2)
            ELSE 0 
       END as dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > n_live_tup * 0.1  -- More than 10% dead tuples
  AND n_live_tup > 1000
ORDER BY n_dead_tup DESC
LIMIT 10;
" | while read line; do
    if [ ! -z "$line" ]; then
        echo -e "${YELLOW}  ! $line${NC}"
    else
        echo -e "${GREEN}✓ Bloat levels acceptable${NC}"
    fi
done
echo ""

# 10. DATABASE SETTINGS
echo -e "${BLUE}[10/10] Critical Settings${NC}"
echo "----------------------------------------"

# Check critical settings
run_query "
SELECT name, setting, unit, 
       CASE 
           WHEN name = 'shared_buffers' THEN 
               CASE WHEN setting::int < 16384 THEN 'LOW - Consider increasing'
               ELSE 'OK' END
           WHEN name = 'effective_cache_size' THEN 
               CASE WHEN setting::int < 49152 THEN 'LOW - Consider increasing'
               ELSE 'OK' END
           WHEN name = 'max_connections' THEN 'OK'
           WHEN name = 'work_mem' THEN 
               CASE WHEN setting::int < 4096 THEN 'LOW'
               ELSE 'OK' END
           ELSE 'OK'
       END as status
FROM pg_settings
WHERE name IN ('shared_buffers', 'effective_cache_size', 'max_connections', 'work_mem', 
               'maintenance_work_mem', 'autovacuum', 'wal_level', 'max_wal_size')
ORDER BY name;
" | while read line; do
    if [[ $line == *"LOW"* ]]; then
        echo -e "${YELLOW}⚠️  $line${NC}"
    else
        echo "  $line"
    fi
done
echo ""

# SUMMARY
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}         HEALTH CHECK SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Completed: $(date)"
echo ""
echo "RECOMMENDED ACTIONS:"
echo "1. Run VACUUM ANALYZE on tables with high dead tuple counts"
echo "2. Review and drop unused indexes to save space"
echo "3. Consider adding indexes to frequently queried columns"
echo "4. Monitor long-running queries and optimize them"
echo "5. Check connection pool settings if near max_connections"
echo ""
echo "Maintenance Commands:"
echo "  # Full vacuum (may lock tables briefly)"
echo "  psql \"$DATABASE_URL\" -c 'VACUUM ANALYZE;'"
echo ""
echo "  # Reindex all tables"
echo "  psql \"$DATABASE_URL\" -c 'REINDEX DATABASE $DB_NAME;'"
echo ""
echo "  # Update all table statistics"
echo "  psql \"$DATABASE_URL\" -c 'ANALYZE;'"
echo ""

# Save to log
echo "Health check completed at $(date)" >> "$LOG_FILE"
