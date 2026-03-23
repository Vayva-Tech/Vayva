# Monitoring Strategy

> Last updated: 2026-03-23
> Owner: Engineering / DevOps

---

## Overview

Vayva's monitoring strategy covers four pillars: error tracking, performance monitoring, infrastructure health, and business metrics. The goal is to detect issues before merchants do and to have enough data to diagnose problems quickly.

---

## Monitoring Stack

| Tool | Purpose | Coverage |
|------|---------|----------|
| **Sentry** | Error tracking, exception monitoring, performance traces | All frontend apps + backend API |
| **Vercel Analytics** | Web vitals, request latency, deployment metrics | All Vercel-deployed frontends |
| **Vercel Logs** | Runtime function logs, build logs | All Vercel-deployed frontends |
| **PostgreSQL stats** | Query performance, connection health, table bloat | Database server |
| **Redis INFO** | Memory usage, connection count, hit rates | Redis server |
| **BullMQ metrics** | Queue depths, job completion rates, failure counts | Worker processes |
| **Custom APM** | Structured logging with request IDs and timing | Backend API routes |
| **Health endpoints** | Synthetic monitoring via `/healthz` | All apps |

---

## What to Monitor

### Application Layer

| Metric | Source | Normal Range | Warning | Critical |
|--------|--------|-------------|---------|----------|
| Error rate (5xx) | Sentry / Vercel | < 0.1% of requests | > 1% | > 5% |
| Error rate (new exceptions) | Sentry | 0 new issues/day | > 5 new issues | > 20 new issues |
| API response time (p50) | Vercel Analytics | < 200ms | > 500ms | > 2000ms |
| API response time (p99) | Vercel Analytics | < 1000ms | > 3000ms | > 10000ms |
| Serverless function duration | Vercel | < 5s | > 10s | > 25s (near timeout) |
| Build success rate | Vercel | 100% | Any failure | Consecutive failures |

### Database Layer

| Metric | Source | Normal Range | Warning | Critical |
|--------|--------|-------------|---------|----------|
| Active connections | `pg_stat_activity` | < 50 | > 80 | > 95 (of 100 max) |
| Query latency (p99) | `pg_stat_statements` | < 100ms | > 500ms | > 2000ms |
| Dead tuple ratio | `pg_stat_user_tables` | < 10% | > 20% | > 40% |
| Database size growth | `pg_database_size` | < 100MB/week | > 500MB/week | > 1GB/week |
| Replication lag | `pg_stat_replication` | < 1s | > 10s | > 60s |
| Failed queries | Application logs | 0/hour | > 10/hour | > 50/hour |

### Redis Layer

| Metric | Source | Normal Range | Warning | Critical |
|--------|--------|-------------|---------|----------|
| Memory usage | `INFO memory` | < 60% of max | > 80% | > 95% |
| Connected clients | `INFO clients` | < 50 | > 80 | > 95 |
| Cache hit rate | `INFO stats` | > 80% | < 70% | < 50% |
| Evicted keys/min | `INFO stats` | 0 | > 50 | > 500 |
| Command latency | `INFO commandstats` | < 1ms | > 5ms | > 20ms |

### Job Queue Layer

| Metric | Source | Normal Range | Warning | Critical |
|--------|--------|-------------|---------|----------|
| Queue depth (waiting) | BullMQ / Redis | < 50 | > 100 | > 500 |
| Failed jobs/hour | BullMQ | < 5 | > 20 | > 50 |
| DLQ depth | BullMQ / Redis | 0 | > 10 | > 50 |
| Job processing time | BullMQ | Varies by queue | > 2x expected | > 5x expected |
| Worker count | Process monitoring | >= 1 | 0 workers | 0 workers > 5 min |

### External Services

| Service | What to Monitor | Method | Alert On |
|---------|----------------|--------|----------|
| Paystack | Webhook delivery, transaction success rate | Webhook logs + Paystack dashboard | Webhook failures, transaction decline spike |
| OpenRouter | API response time, error rate, model availability | Application logs, credit deduction tracking | > 5s response time, > 5% error rate |
| Evolution API | Instance connectivity, message delivery | WhatsApp channel status, delivery receipts | Instance disconnected, delivery failure > 10% |
| Resend | Email delivery rate, bounce rate | Resend dashboard, application logs | Delivery rate < 95%, bounce rate > 5% |
| MinIO | Storage availability, upload success rate | Application logs | Upload failures |

### Business Metrics

| Metric | Source | Purpose | Alert On |
|--------|--------|---------|----------|
| New merchant signups/day | Database | Growth tracking | Drop > 50% vs 7-day average |
| Active stores | Database | Platform health | Drop > 10% week-over-week |
| Orders processed/hour | Database | Commerce health | Drop > 50% vs same hour yesterday |
| AI credit consumption/day | Database | AI system health | Spike > 3x average (possible abuse) |
| Payment success rate | Paystack logs | Revenue health | < 90% success rate |
| WhatsApp messages/hour | Application logs | Engagement health | Drop > 50% vs average |
| Subscription churn (cancellations) | Database | Business health | > 5 cancellations/day |

---

## Sentry Configuration

### Project Setup

Each frontend application and the backend API have a separate Sentry project for clear ownership and noise isolation.

| Sentry Project | Application | Environment |
|----------------|-------------|-------------|
| `vayva-merchant` | Merchant Dashboard | production, staging |
| `vayva-storefront` | Storefront | production, staging |
| `vayva-ops-console` | Ops Console | production |
| `vayva-marketing` | Marketing Site | production |
| `vayva-api` | Backend API | production, staging |
| `vayva-worker` | Background Workers | production |

### Sentry Best Practices

1. **Tag all errors with `storeId`** for tenant-scoped debugging.
2. **Set user context** with the authenticated merchant's ID (never PII).
3. **Use breadcrumbs** to trace the sequence of events before an error.
4. **Set performance sample rate** to 10% in production (100% is too expensive at scale).
5. **Configure release tracking** so errors are linked to the correct deployment.

```typescript
// Example Sentry initialization
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Strip PII before sending to Sentry
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});
```

### Alert Rules

| Rule | Condition | Action | Channel |
|------|-----------|--------|---------|
| New issue spike | > 10 new issues in 1 hour | Notify on-call | Slack / WhatsApp |
| Error rate spike | > 5% error rate for 5 minutes | Notify on-call | Slack / WhatsApp |
| Performance regression | p95 > 3s for 10 minutes | Notify engineering lead | Slack |
| Unhandled rejection | Any unhandled promise rejection | Create issue | Sentry dashboard |

---

## Vercel Analytics

### What Vercel Provides

- **Web Vitals:** LCP, FID, CLS, TTFB, INP for all frontend apps
- **Function metrics:** Invocation count, duration, memory usage, errors
- **Deployment metrics:** Build time, cold start frequency
- **Traffic:** Request volume, geographic distribution, device types

### Vercel Analytics Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s - 4s | > 4s |
| FID (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| INP (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |
| TTFB (Time to First Byte) | < 800ms | 800ms - 1800ms | > 1800ms |

### Key Pages to Watch

| Page | App | Why |
|------|-----|-----|
| `/dashboard` | Merchant | Most visited page, heavy data loading |
| `/products` | Merchant | Large catalog renders |
| `/orders` | Merchant | Frequent access, real-time updates |
| `/` (storefront) | Storefront | Customer-facing, SEO-critical |
| `/product/[slug]` | Storefront | Product pages, conversion-critical |
| `/checkout` | Storefront | Payment flow, must be fast |

---

## Health Checks

### Endpoint: `/healthz`

Every application exposes a `/healthz` endpoint that returns system status.

```json
{
  "status": "healthy",
  "timestamp": "2026-03-23T10:00:00Z",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "version": "1.0.0"
  }
}
```

### Synthetic Monitoring

Set up external monitoring (e.g., UptimeRobot or a simple cron) to hit health endpoints every 60 seconds:

| Endpoint | Expected | Alert After |
|----------|----------|-------------|
| `https://merchant.vayva.ng/healthz` | 200 OK | 2 consecutive failures |
| `https://store.vayva.ng/healthz` | 200 OK | 2 consecutive failures |
| `https://ops.vayva.ng/healthz` | 200 OK | 3 consecutive failures |
| `https://vayva.ng/healthz` | 200 OK | 3 consecutive failures |

---

## On-Call Rotation

### Structure

| Role | Schedule | Responsibility |
|------|----------|---------------|
| Primary on-call | Weekly rotation | First responder for all alerts |
| Secondary on-call | Weekly rotation (offset by 1 week) | Backup if primary is unavailable within 15 min |
| Engineering lead | Always available for escalation | SEV1/SEV2 decision-making |

### On-Call Hours

- **Active monitoring:** 08:00 - 22:00 WAT (07:00 - 21:00 UTC) -- respond within 15 minutes
- **Off-hours:** 22:00 - 08:00 WAT -- respond within 30 minutes for SEV1, next business day for SEV3/SEV4

### On-Call Checklist

Before starting an on-call rotation, verify access to:

- [ ] Sentry dashboard (all projects)
- [ ] Vercel dashboard (all apps)
- [ ] VPS SSH access (database and Redis host)
- [ ] Redis CLI access
- [ ] Database read-only access
- [ ] Paystack dashboard
- [ ] Evolution API dashboard
- [ ] Incident communication channel (Slack/WhatsApp group)

---

## Alerting Thresholds Summary

| Category | Warning | Critical | Notification |
|----------|---------|----------|-------------|
| 5xx error rate | > 1% | > 5% | Slack + WhatsApp |
| API latency p99 | > 3s | > 10s | Slack |
| Database connections | > 80% | > 95% | Slack + WhatsApp |
| Redis memory | > 80% | > 95% | Slack + WhatsApp |
| Queue depth | > 100 | > 500 | Slack |
| DLQ depth | > 10 | > 50 | Slack + WhatsApp |
| Health check failure | 1 failure | 2 consecutive | Slack + WhatsApp |
| Payment failure rate | > 5% | > 10% | Slack + WhatsApp |
| Worker down | 0 workers | 0 workers > 5 min | WhatsApp (immediate) |

---

## Dashboards

### Ops Console Monitoring Views

The ops console (`ops.vayva.ng`) provides built-in monitoring views:

| View | Metrics |
|------|---------|
| Platform Health | Store count, active stores, error rates, system status |
| Revenue | Daily/weekly/monthly revenue, payment success rates, average order value |
| AI Usage | Credits consumed, API call volume, model distribution, cost tracking |
| Merchant Activity | Signups, churn, active sessions, feature usage |
| WhatsApp | Message volume, delivery rates, conversation counts, instance health |
| Support | Open tickets, response times, resolution rates |

---

## Related Documents

- [Incident Response Runbook](../../05_operations/incident-management/incident-response-runbook.md)
- [Database Maintenance](../../05_operations/maintenance/database-maintenance.md)
- [Redis Operations](../../05_operations/maintenance/redis-operations.md)
- [Job Queue Operations](../../05_operations/automation/job-queue-operations.md)
- [Deployment Checklist](../procedures/deployment-checklist.md)
