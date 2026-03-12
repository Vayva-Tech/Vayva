# Monitoring & Observability

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

Vayva uses a comprehensive monitoring strategy to ensure platform reliability and quick incident response.

## Monitoring Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    MONITORING LAYERS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Vercel     │  │   Logtail    │  │   Custom     │      │
│  │  Analytics   │  │   Logging    │  │   Health     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  Frontend Metrics    Backend Logs       System Status       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Monitoring

### Vercel Analytics

**Metrics Tracked:**
- Core Web Vitals (LCP, FID, CLS)
- Page load times
- Real User Monitoring (RUM)
- Traffic and bandwidth

**Access:**
- Vercel Dashboard → Analytics

**Alerts:**
- LCP > 2.5s
- Error rate > 1%

### Web Vitals Targets

| Metric | Target | Poor |
|--------|--------|------|
| LCP | < 2.5s | > 4s |
| FID | < 100ms | > 300ms |
| CLS | < 0.1 | > 0.25 |
| FCP | < 1.8s | > 3s |
| TTFB | < 600ms | > 1s |

## Backend Monitoring

### Logtail

**Log Aggregation:**
- Application logs
- Error tracking
- Request logs
- Performance logs

**Log Levels:**

| Level | Usage |
|-------|-------|
| ERROR | Application errors |
| WARN | Warning conditions |
| INFO | General information |
| DEBUG | Debug information |

**Search Queries:**

```
# Find errors
level:error

# Find slow requests
duration:>5000

# Find specific user
userId:12345

# Find API errors
path:/api/orders status:>=400
```

### Health Checks

**Endpoints:**

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | General health |
| `GET /health/db` | Database connectivity |
| `GET /health/redis` | Redis connectivity |
| `GET /health/queue` | Queue status |

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-03-07T10:30:00Z",
  "checks": {
    "database": { "status": "up", "latency": "5ms" },
    "redis": { "status": "up", "latency": "2ms" },
    "queue": { "status": "up", "pending": 0 }
  }
}
```

## Key Metrics

### Business Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Order Success Rate | > 99% | < 95% |
| Payment Success Rate | > 98% | < 95% |
| WhatsApp Delivery Rate | > 95% | < 90% |
| API Uptime | > 99.9% | < 99% |

### Performance Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time (p95) | < 200ms | > 500ms |
| Database Query Time | < 50ms | > 100ms |
| Page Load Time | < 3s | > 5s |
| Queue Processing Time | < 5s | > 30s |

### Infrastructure Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| CPU Usage | < 70% | > 85% |
| Memory Usage | < 80% | > 90% |
| Disk Usage | < 70% | > 85% |
| Database Connections | < 80% | > 90% |

## Alerting

### Alert Channels

| Severity | Channel | Response Time |
|----------|---------|---------------|
| P0 (Critical) | PagerDuty + SMS | 5 minutes |
| P1 (High) | PagerDuty + Email | 15 minutes |
| P2 (Medium) | Email + Slack | 1 hour |
| P3 (Low) | Slack | 4 hours |

### Alert Rules

**P0 Alerts:**
- Production down
- Database unavailable
- Payment processing failure
- Security incident

**P1 Alerts:**
- Error rate > 5%
- Queue backlog > 1000
- API latency > 1s
- WhatsApp gateway down

**P2 Alerts:**
- Error rate > 1%
- Memory usage > 80%
- Failed backup

## Dashboards

### Vercel Dashboard

**URL:** https://vercel.com/dashboard

**Views:**
- Deployment status
- Performance metrics
- Error tracking
- Traffic analysis

### Logtail Dashboard

**URL:** https://logtail.com

**Views:**
- Live logs
- Error tracking
- Performance insights
- Custom queries

### Custom Ops Dashboard

**URL:** https://ops.vayva.ng/monitoring

**Views:**
- System health
- Queue status
- Merchant activity
- Revenue metrics

## Log Format

### Structured Logging

```json
{
  "timestamp": "2026-03-07T10:30:00Z",
  "level": "info",
  "message": "Order created",
  "context": {
    "requestId": "req-123",
    "userId": "user-456",
    "merchantId": "merch-789"
  },
  "metadata": {
    "orderId": "ord-abc",
    "amount": 25000,
    "duration": 150
  }
}
```

### Request Logging

```
[2026-03-07T10:30:00Z] INFO: POST /api/orders
  → Status: 201
  → Duration: 150ms
  → User: user-456
  → Merchant: merch-789
```

## Error Tracking

### Error Classification

| Category | Examples | Priority |
|----------|----------|----------|
| Critical | Payment failures, data loss | P0 |
| High | Order errors, auth failures | P1 |
| Medium | Validation errors | P2 |
| Low | Minor UI issues | P3 |

### Error Response

```json
{
  "error": {
    "code": "ORDER_CREATION_FAILED",
    "message": "Failed to create order",
    "requestId": "req-123",
    "timestamp": "2026-03-07T10:30:00Z"
  }
}
```

## Performance Monitoring

### APM Metrics

- Request throughput
- Response times (p50, p95, p99)
- Error rates
- Database query performance
- External API latency

### Profiling

- CPU profiling (Node.js)
- Memory profiling
- Database query analysis
- Bundle size analysis

## Capacity Planning

### Scaling Triggers

| Metric | Scale Up | Scale Down |
|--------|----------|------------|
| CPU | > 70% | < 30% |
| Memory | > 80% | < 40% |
| Requests/min | > 1000 | < 100 |
| Queue depth | > 100 | < 10 |

## Incident Response

### Runbooks

Common issues and resolution steps:

1. **High Error Rate**
   - Check recent deployments
   - Review error logs
   - Consider rollback

2. **Database Slowdown**
   - Check query performance
   - Review connection pool
   - Consider scaling

3. **Queue Backlog**
   - Check worker status
   - Scale workers if needed
   - Review job processing time

---

**Questions?** Contact ops@vayva.ng
