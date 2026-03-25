# Rate Limiting (Policy + Runbook)

> **Audience:** Engineering + Ops  
> **Goal:** Document how rate limiting works and what happens on Redis outages.

---

## Implementation

- **Middleware**: `Backend/core-api/src/middleware/rate-limiter-redis.ts`
- **Backend store**: Redis (`REDIS_URL`)

---

## Current behavior (important)

- Requests are rate-limited using Redis counters.
- If Redis is unavailable, the limiter may **fail open** (allow traffic) to avoid taking the API down due to an infrastructure dependency.

This is an explicit trade-off:
- **Pros:** Higher availability during Redis incidents.
- **Cons:** Higher abuse risk during Redis incidents.

---

## Operational guidance

### If Redis is down

- Expect elevated API load and potential abuse.
- Prioritize restoring Redis availability.
- Consider temporary upstream protections (WAF rules, IP blocks, stricter reverse-proxy limits).

### Monitoring

Monitor:
- Redis availability/latency
- Core API 4xx/5xx rate
- endpoint-specific spikes (login, checkout, webhook ingress)

