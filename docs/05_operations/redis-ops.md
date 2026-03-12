# Redis Operations (VPS 1 + VPS 2)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Redis is used for:
- BullMQ queues
- caching (Evolution API)

## Where Redis runs
- VPS 1 (Docker): `vayva-redis` (used by Evolution + worker)
- VPS 2 (system Redis): shared Redis for Vercel apps (confirm)

## VPS 1 Redis (Docker)
### Check container
```bash
ssh root@163.245.209.202
docker ps | grep vayva-redis
```

### Ping
```bash
# Requires password from ~/vayva/.env
redis-cli -a <REDIS_PASSWORD> -h 127.0.0.1 -p 6379 ping
```
Expected: `PONG`.

### Logs
```bash
docker logs vayva-redis --tail 100
```

## VPS 2 Redis
### Service status
```bash
ssh root@163.245.209.203
systemctl status redis --no-pager
```

### Ping
```bash
redis-cli -a <REDIS_PASSWORD> ping
```

## Common failures
### Auth failures
- Ensure URLs include password.
- For worker: `redis://:<PASSWORD>@127.0.0.1:6379`

### Evolution “redis disconnected”
- Evolution uses `CACHE_REDIS_URI` not `REDIS_URL`.

### Memory pressure
- If Redis evicts keys or restarts, increase memory or adjust policies.
