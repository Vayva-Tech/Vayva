# Redis Operations

> Last updated: 2026-03-23
> Owner: Engineering / DevOps
> Connection: `REDIS_URL` environment variable
> Client library: ioredis

---

## Overview

Vayva uses Redis for caching, rate limiting, session management, and as the message broker for BullMQ job queues. Redis is a critical infrastructure component -- its unavailability degrades performance and disables background job processing.

---

## Cache Strategy

### Cache Layers

```
Client Request
    |
    v
Next.js API Route
    |
    ├── L1: In-memory cache (per-instance, request-scoped)
    |   └── Short-lived, used for rate limiter counters in development
    |
    ├── L2: Redis cache (shared across all instances)
    |   └── Dashboard data, analytics aggregations, store settings
    |
    └── L3: PostgreSQL (source of truth)
        └── All persistent data
```

### What Gets Cached

| Data | Cache Key Pattern | TTL | Invalidation Strategy |
|------|------------------|-----|----------------------|
| Dashboard metrics | `dashboard:{storeId}:metrics` | 5 minutes | Time-based expiry |
| Store settings | `store:{storeId}:settings` | 15 minutes | Explicit invalidation on update |
| Product catalog (summary) | `catalog:{storeId}:summary` | 10 minutes | Explicit invalidation on product change |
| AI credit balance | `credits:{storeId}:balance` | 1 minute | Explicit invalidation on deduction |
| Rate limit counters | `ratelimit:{tier}:{identifier}` | 1 hour (sliding window) | Automatic expiry |
| Session data | `session:{sessionId}` | 30 minutes | Sliding window refresh |
| WhatsApp instance status | `wa:{instanceId}:status` | 2 minutes | Explicit on status change |
| Analytics aggregations | `analytics:{storeId}:{period}` | 30 minutes | Time-based expiry |
| Feature flags | `features:{storeId}` | 5 minutes | Explicit on plan change |

### What Does NOT Get Cached

- **Order data** -- always read from PostgreSQL for consistency
- **Payment/financial data** -- always from PostgreSQL or Paystack
- **Audit logs** -- always written and read from PostgreSQL
- **Prisma query results** -- Prisma handles its own query-level optimization

---

## Key Naming Convention

All Redis keys follow a hierarchical namespace pattern:

```
{namespace}:{scope}:{identifier}:{sub-key}
```

### Namespace Definitions

| Prefix | Purpose | Example |
|--------|---------|---------|
| `vayva:cache` | Application-level caches | `vayva:cache:dashboard:store_abc:metrics` |
| `vayva:rate` | Rate limiting counters | `vayva:rate:api:192.168.1.1:count` |
| `vayva:session` | User sessions | `vayva:session:sess_xyz` |
| `vayva:lock` | Distributed locks | `vayva:lock:order:order_123:process` |
| `vayva:wa` | WhatsApp-related state | `vayva:wa:instance_abc:status` |
| `bull` | BullMQ queues (managed by BullMQ) | `bull:email-queue:waiting` |

### Key Rules

1. Use lowercase, colon-separated segments.
2. Include the `storeId` in tenant-scoped keys for easy debugging and selective flush.
3. Never use user-supplied values directly in keys without sanitization.
4. Keep key names under 128 bytes.

---

## TTL Policies

### TTL by Data Category

| Category | Default TTL | Rationale |
|----------|------------|-----------|
| Real-time metrics | 1-5 minutes | Balance freshness with database load |
| Configuration data | 15 minutes | Changes infrequently, explicit invalidation on update |
| Analytics aggregations | 30 minutes | Expensive queries, acceptable staleness |
| Rate limit windows | 1 hour | Sliding window for API rate limiting |
| Session tokens | 30 minutes | Security requirement, sliding window |
| Distributed locks | 30 seconds | Prevent deadlocks on abandoned locks |
| WhatsApp state | 2 minutes | Need near-real-time accuracy for message routing |

### TTL Best Practices

1. **Always set a TTL.** Never store keys without expiry unless there is an explicit business reason.
2. **Use shorter TTLs for financial data** (credit balances, wallet info) to prevent serving stale amounts.
3. **Use jitter for cache stampede prevention.** Add a random 0-30 second offset to TTLs for frequently accessed keys.
4. **Implement cache-aside pattern.** On cache miss, fetch from PostgreSQL, write to cache with TTL, return result.

```typescript
// Cache-aside pattern example
async function getDashboardMetrics(storeId: string) {
  const cacheKey = `vayva:cache:dashboard:${storeId}:metrics`;
  const cached = await redis.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const metrics = await computeMetricsFromDatabase(storeId);
  const jitter = Math.floor(Math.random() * 30);
  await redis.setex(cacheKey, 300 + jitter, JSON.stringify(metrics));

  return metrics;
}
```

---

## Memory Management

### Memory Budget

| Environment | Max Memory | Eviction Policy |
|-------------|-----------|-----------------|
| Production | 256MB | `allkeys-lru` |
| Staging | 128MB | `allkeys-lru` |
| Development | 64MB | `noeviction` |

### Redis Configuration

```conf
# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence (RDB snapshots for recovery)
save 900 1          # Snapshot if 1 key changed in 15 min
save 300 10         # Snapshot if 10 keys changed in 5 min
save 60 10000       # Snapshot if 10000 keys changed in 1 min

# AOF (Append-Only File) for BullMQ durability
appendonly yes
appendfsync everysec

# Connections
maxclients 100
timeout 300         # Close idle connections after 5 minutes

# Logging
loglevel notice
```

### Memory Monitoring

```bash
# Check current memory usage
redis-cli INFO memory | grep -E "used_memory_human|maxmemory_human|mem_fragmentation_ratio"

# Key count by namespace
redis-cli --scan --pattern "vayva:cache:*" | wc -l
redis-cli --scan --pattern "vayva:rate:*" | wc -l
redis-cli --scan --pattern "bull:*" | wc -l

# Find large keys
redis-cli --bigkeys

# Memory usage of a specific key
redis-cli MEMORY USAGE "vayva:cache:dashboard:store_abc:metrics"
```

### Memory Pressure Response

When Redis memory usage exceeds 80%:

1. **Check for key leaks** -- keys without TTL that should not persist:
   ```bash
   redis-cli --scan --pattern "vayva:*" | while read key; do
     ttl=$(redis-cli TTL "$key")
     if [ "$ttl" -eq "-1" ]; then
       echo "NO TTL: $key"
     fi
   done
   ```

2. **Flush non-critical caches:**
   ```bash
   # Flush all dashboard caches (will rebuild on next request)
   redis-cli --scan --pattern "vayva:cache:dashboard:*" | xargs -r redis-cli DEL

   # Flush analytics caches
   redis-cli --scan --pattern "vayva:cache:analytics:*" | xargs -r redis-cli DEL
   ```

3. **Do NOT flush BullMQ keys** (`bull:*`) -- this will lose queued jobs.

4. **Do NOT flush rate limit keys** (`vayva:rate:*`) during an active attack -- this resets all counters.

---

## Monitoring

### Key Metrics to Track

| Metric | Alert Threshold | Check Command |
|--------|----------------|---------------|
| Memory usage | > 80% of maxmemory | `INFO memory` |
| Connected clients | > 80 (of 100 max) | `INFO clients` |
| Evicted keys | > 100/minute | `INFO stats` |
| Keyspace hits/misses | Hit rate < 70% | `INFO stats` |
| Blocked clients | > 0 for > 30 seconds | `INFO clients` |
| Latency | > 10ms average | `redis-cli --latency` |
| RDB last save status | `rdb_last_bgsave_status` != "ok" | `INFO persistence` |

### Health Check Script

```bash
#!/bin/bash
# /opt/vayva/scripts/redis-health.sh

REDIS_URL="${REDIS_URL:-redis://localhost:6379}"

# Ping
if ! redis-cli -u "${REDIS_URL}" PING | grep -q PONG; then
  echo "CRITICAL: Redis is not responding to PING"
  exit 1
fi

# Memory check
USED=$(redis-cli -u "${REDIS_URL}" INFO memory | grep used_memory: | tr -d '\r' | cut -d: -f2)
MAX=$(redis-cli -u "${REDIS_URL}" CONFIG GET maxmemory | tail -1 | tr -d '\r')

if [ "${MAX}" -gt 0 ]; then
  PCT=$((USED * 100 / MAX))
  if [ "${PCT}" -gt 80 ]; then
    echo "WARNING: Redis memory at ${PCT}%"
    exit 1
  fi
fi

echo "OK: Redis healthy"
exit 0
```

### Common Debugging Commands

```bash
# Monitor all commands in real-time (use briefly, high overhead)
redis-cli MONITOR

# Check slow queries
redis-cli SLOWLOG GET 10

# Client list (who is connected)
redis-cli CLIENT LIST

# Key expiry info
redis-cli TTL "vayva:cache:dashboard:store_abc:metrics"
redis-cli PTTL "vayva:cache:dashboard:store_abc:metrics"
```

---

## Operational Procedures

### Flushing Caches Safely

```bash
# Flush all application caches (safe -- does not affect BullMQ or sessions)
redis-cli --scan --pattern "vayva:cache:*" | xargs -r redis-cli DEL

# Flush caches for a specific store
redis-cli --scan --pattern "vayva:cache:*:store_abc:*" | xargs -r redis-cli DEL

# NEVER run FLUSHALL or FLUSHDB in production
# This would destroy BullMQ queues and all rate limit state
```

### Redis Restart Procedure

1. Ensure BullMQ workers are paused (see [Job Queue Operations](../automation/job-queue-operations.md)).
2. Check that no critical jobs are in-progress.
3. Restart Redis: `sudo systemctl restart redis`
4. Verify with `redis-cli PING`.
5. Resume BullMQ workers.
6. Verify dashboard caches are rebuilding (first requests will be slower).

### Redis Version Upgrade

1. Schedule during the maintenance window (Sunday 04:00-06:00 UTC).
2. Create a backup: `redis-cli BGSAVE` and copy the RDB file.
3. Stop Redis, upgrade packages, restart.
4. Verify persistence and connectivity.
5. Run the health check script.

---

## Failure Scenarios

| Scenario | Impact | Mitigation |
|----------|--------|------------|
| Redis completely down | Rate limiting falls back to in-memory, caches return to DB, BullMQ stops processing | Restart Redis, BullMQ resumes automatically |
| Redis memory full (eviction) | Cache misses increase, database load increases | LRU eviction handles gracefully; monitor for cascading DB load |
| Redis slow (high latency) | API response times increase | Check slow log, reduce MONITOR usage, check network |
| Data loss (RDB corruption) | Cache data lost (rebuilt automatically), BullMQ jobs may be lost | Restore from AOF file; re-enqueue critical jobs manually |

---

## Related Documents

- [Database Maintenance](database-maintenance.md)
- [Job Queue Operations](../automation/job-queue-operations.md)
- [Monitoring Strategy](../../04_deployment/monitoring/monitoring-strategy.md)
- [Environment Variables](../../04_deployment/environment-variables.md)
