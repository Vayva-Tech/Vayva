# Job Queue Operations

> Last updated: 2026-03-23
> Owner: Engineering
> Technology: BullMQ (backed by Redis)
> Worker location: `Backend/worker/` and `Backend/core-api/src/jobs/`

---

## Overview

Vayva uses BullMQ for background job processing. Jobs handle tasks that are too slow or too unreliable for synchronous API responses: email delivery, AI autopilot runs, webhook processing, scheduled reports, voice note transcription, and domain verification. BullMQ uses Redis as its message broker and persistence layer.

---

## Architecture

```
API Route / Webhook / Cron Trigger
    |
    v
Job Producer (enqueues job with payload)
    |
    v
Redis (BullMQ storage)
    |
    v
Worker Process (Backend/worker)
    |
    ├── Processes job
    ├── Retries on failure
    └── Moves to dead letter queue after max retries
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Job producers | `Backend/core-api/src/` (various services) | Enqueue jobs from API routes and webhooks |
| Worker process | `Backend/worker/` | Long-running process that consumes and processes jobs |
| Job definitions | `Backend/core-api/src/jobs/` | Job handler implementations |
| Queue configuration | Shared via `@vayva/shared` or local config | Queue names, concurrency, retry policies |

---

## Queue Types

### Email Queue

| Property | Value |
|----------|-------|
| Queue name | `email-queue` |
| Concurrency | 5 |
| Max retries | 3 |
| Backoff | Exponential, 30s base |
| TTL | 24 hours |
| Use cases | Transactional emails (order confirmation, password reset, OTP), marketing campaigns, scheduled reports |

### AI Processing Queue

| Property | Value |
|----------|-------|
| Queue name | `ai-processing` |
| Concurrency | 3 |
| Max retries | 2 |
| Backoff | Exponential, 10s base |
| TTL | 1 hour |
| Use cases | Autopilot analysis runs, bulk content generation, product description generation |

### WhatsApp Queue

| Property | Value |
|----------|-------|
| Queue name | `whatsapp-queue` |
| Concurrency | 10 |
| Max retries | 3 |
| Backoff | Fixed, 5s |
| TTL | 4 hours |
| Use cases | Outbound WhatsApp messages, broadcast delivery, template messages |

### Webhook Processing Queue

| Property | Value |
|----------|-------|
| Queue name | `webhook-processing` |
| Concurrency | 5 |
| Max retries | 5 |
| Backoff | Exponential, 15s base |
| TTL | 12 hours |
| Use cases | Paystack webhook verification, Evolution API event processing |

### Scheduled Tasks Queue

| Property | Value |
|----------|-------|
| Queue name | `scheduled-tasks` |
| Concurrency | 2 |
| Max retries | 2 |
| Backoff | Exponential, 60s base |
| TTL | 6 hours |
| Use cases | Daily report generation, domain verification checks, subscription renewal checks, trial expiry processing |

### Media Processing Queue

| Property | Value |
|----------|-------|
| Queue name | `media-processing` |
| Concurrency | 2 |
| Max retries | 2 |
| Backoff | Exponential, 30s base |
| TTL | 2 hours |
| Use cases | Voice note transcription, image processing, file uploads to MinIO |

### Notification Queue

| Property | Value |
|----------|-------|
| Queue name | `notification-queue` |
| Concurrency | 10 |
| Max retries | 3 |
| Backoff | Fixed, 10s |
| TTL | 8 hours |
| Use cases | Push notifications, in-app notifications, notification outbox processing |

---

## Job Priorities

BullMQ supports numeric priorities where lower numbers mean higher priority.

| Priority | Value | Use Cases |
|----------|-------|-----------|
| Critical | 1 | Payment webhook processing, order state transitions |
| High | 3 | Transactional emails (OTP, password reset), WhatsApp AI responses |
| Normal | 5 | Marketing emails, analytics aggregation, scheduled reports |
| Low | 10 | Bulk operations, content generation, domain verification |
| Background | 20 | Cleanup tasks, data archival, non-urgent notifications |

### Setting Priority

```typescript
await queue.add('job-name', payload, {
  priority: 3,  // High priority
  attempts: 3,
  backoff: { type: 'exponential', delay: 30000 },
});
```

---

## Retry Policies

### Retry Strategy by Queue

| Queue | Strategy | Base Delay | Max Delay | Max Attempts |
|-------|----------|-----------|-----------|-------------|
| email-queue | Exponential | 30s | 15 min | 3 |
| ai-processing | Exponential | 10s | 5 min | 2 |
| whatsapp-queue | Fixed | 5s | 5s | 3 |
| webhook-processing | Exponential | 15s | 10 min | 5 |
| scheduled-tasks | Exponential | 60s | 30 min | 2 |
| media-processing | Exponential | 30s | 10 min | 2 |
| notification-queue | Fixed | 10s | 10s | 3 |

### Exponential Backoff Calculation

```
delay = baseDelay * 2^(attemptNumber - 1)
```

Example for email-queue (base 30s):
- Attempt 1: immediate
- Retry 1: 30 seconds
- Retry 2: 60 seconds
- Retry 3: 120 seconds (then moves to DLQ)

### When NOT to Retry

Some failures should not be retried:
- **4xx API errors from external services** (invalid payload, unauthorized) -- the same request will fail again
- **Credit exhaustion** -- retrying will not add credits
- **Validation errors** -- bad data will remain bad

Use a custom error class to signal non-retryable failures:

```typescript
import { UnrecoverableError } from 'bullmq';

// This will NOT be retried -- goes directly to failed state
throw new UnrecoverableError('Invalid Paystack reference');
```

---

## Dead Letter Queues

Jobs that exhaust all retry attempts are moved to a dead letter queue (DLQ) for manual inspection.

### DLQ Behavior

| Property | Value |
|----------|-------|
| Naming convention | `{queue-name}-dlq` |
| Retention | 7 days |
| Alert threshold | > 10 jobs in any DLQ |
| Review cadence | Daily |

### Inspecting Dead Letter Jobs

```bash
# Count jobs in DLQ
redis-cli LLEN "bull:email-queue-dlq:waiting"

# View a failed job's data
redis-cli HGETALL "bull:email-queue:{jobId}"
```

### Reprocessing DLQ Jobs

After fixing the underlying issue, manually re-enqueue DLQ jobs:

```typescript
// Script to reprocess DLQ jobs
import { Queue } from 'bullmq';

const dlq = new Queue('email-queue-dlq', { connection: redisConnection });
const mainQueue = new Queue('email-queue', { connection: redisConnection });

const failedJobs = await dlq.getWaiting(0, 100);
for (const job of failedJobs) {
  await mainQueue.add(job.name, job.data, {
    priority: job.opts.priority,
    attempts: 3,
  });
  await job.remove();
}
```

### DLQ Monitoring Alerts

Set up alerts when DLQ depth exceeds thresholds:

| Queue DLQ | Warning | Critical |
|-----------|---------|----------|
| email-queue-dlq | > 10 jobs | > 50 jobs |
| webhook-processing-dlq | > 5 jobs | > 20 jobs |
| whatsapp-queue-dlq | > 10 jobs | > 50 jobs |
| ai-processing-dlq | > 5 jobs | > 20 jobs |

---

## Scheduled Jobs

### Cron-Triggered Jobs

| Job | Schedule | Queue | Description |
|-----|----------|-------|-------------|
| Trial expiry reminders | `0 8 * * *` (daily 08:00 UTC) | scheduled-tasks | Send reminders to merchants whose trials are ending soon |
| Weekly merchant reports | `0 9 * * 1` (Monday 09:00 UTC) | email-queue | Generate and send weekly business reports |
| Monthly merchant reports | `0 9 1 * *` (1st of month 09:00 UTC) | email-queue | Generate and send monthly summary reports |
| Domain verification | `0 */6 * * *` (every 6 hours) | scheduled-tasks | Check DNS for custom domain verification |
| Subscription renewal check | `0 0 * * *` (daily midnight UTC) | scheduled-tasks | Process pending subscription renewals |
| AI autopilot runs | `0 6 * * *` (daily 06:00 UTC) | ai-processing | Run autopilot analysis for PRO/PRO_PLUS stores |
| Stale cart cleanup | `0 3 * * *` (daily 03:00 UTC) | scheduled-tasks | Remove abandoned carts older than 30 days |

### Cron Implementation

Cron jobs are triggered via Vercel Cron (configured in `vercel.json` for the merchant app) which hits an API endpoint. The endpoint enqueues the actual work into BullMQ:

```
Vercel Cron → GET /api/jobs/cron/trial-reminders → enqueue to scheduled-tasks queue → Worker processes
```

---

## Monitoring

### Key Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| Queue depth (waiting) | Number of jobs waiting to be processed | > 100 for any queue |
| Active jobs | Jobs currently being processed | Matches concurrency setting |
| Failed jobs (last hour) | Jobs that failed in the past hour | > 20 |
| DLQ depth | Jobs in dead letter queues | > 10 |
| Job completion rate | Percentage of jobs completing successfully | < 95% |
| Average processing time | Time from enqueue to completion | Varies by queue (see below) |
| Worker uptime | Whether worker processes are running | Must be > 0 |

### Expected Processing Times

| Queue | Expected Avg | Alert If Exceeds |
|-------|-------------|-----------------|
| email-queue | < 2s | 10s |
| whatsapp-queue | < 3s | 15s |
| webhook-processing | < 5s | 30s |
| ai-processing | < 30s | 120s |
| media-processing | < 60s | 300s |
| notification-queue | < 1s | 5s |

### Monitoring Commands

```bash
# Check all queue depths
for queue in email-queue ai-processing whatsapp-queue webhook-processing scheduled-tasks media-processing notification-queue; do
  waiting=$(redis-cli LLEN "bull:${queue}:wait" 2>/dev/null || echo 0)
  active=$(redis-cli LLEN "bull:${queue}:active" 2>/dev/null || echo 0)
  failed=$(redis-cli ZCARD "bull:${queue}:failed" 2>/dev/null || echo 0)
  echo "${queue}: waiting=${waiting} active=${active} failed=${failed}"
done
```

---

## Operational Procedures

### Pausing a Queue

To pause a queue (e.g., during maintenance or to stop processing a problematic job type):

```typescript
import { Queue } from 'bullmq';
const queue = new Queue('email-queue', { connection: redisConnection });
await queue.pause();
// ... perform maintenance ...
await queue.resume();
```

### Draining a Queue

To remove all waiting jobs from a queue (use with caution):

```typescript
await queue.drain();  // Removes all waiting jobs
```

### Worker Restart Procedure

1. Pause all queues to stop new job pickup.
2. Wait for active jobs to complete (check `active` count reaches 0).
3. Restart the worker process.
4. Resume all queues.
5. Verify jobs are being processed (check `waiting` count is decreasing).

### Scaling Workers

To handle traffic spikes, adjust concurrency per queue:

```typescript
const worker = new Worker('email-queue', processEmail, {
  connection: redisConnection,
  concurrency: 10,  // Increase from default 5
});
```

When increasing concurrency, ensure:
- Redis has enough connections (each worker uses 2 connections per queue)
- The VPS has enough memory for concurrent job payloads
- External APIs (Resend, Evolution API) can handle the increased request rate

---

## Failure Scenarios

| Scenario | Impact | Resolution |
|----------|--------|------------|
| Redis down | All queues stop processing | Fix Redis, workers resume automatically |
| Worker process crash | Jobs remain in queue, no processing | Restart worker, jobs will be picked up |
| External API down (Resend) | Email jobs fail and retry | Jobs retry with backoff, move to DLQ after max retries |
| External API down (Evolution API) | WhatsApp jobs fail | Jobs retry, messages delivered when API recovers |
| Poison message (always fails) | Blocks queue slot during retries | Moves to DLQ after max retries, worker continues |
| Queue backlog (spike) | Processing delays | Increase concurrency temporarily, monitor |

---

## Related Documents

- [Redis Operations](../maintenance/redis-operations.md)
- [Monitoring Strategy](../../04_deployment/monitoring/monitoring-strategy.md)
- [Incident Response Runbook](../incident-management/incident-response-runbook.md)
