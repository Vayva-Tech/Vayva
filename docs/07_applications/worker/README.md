# Worker Documentation

**Application:** Background Worker  
**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Framework:** Node.js + BullMQ + TypeScript  
**Runtime:** Systemd service on VPS

---

## Overview

The Vayva Worker is a background job processing system built on BullMQ. It handles asynchronous tasks such as sending notifications, processing webhooks, syncing data, and performing maintenance operations.

## Architecture

```
Backend/worker/
├── src/
│   ├── workers/                # Worker implementations
│   │   ├── email.worker.ts     # Email delivery
│   │   ├── whatsapp.worker.ts  # WhatsApp messaging
│   │   ├── webhook.worker.ts   # Webhook processing
│   │   ├── order.worker.ts     # Order processing
│   │   ├── payment.worker.ts   # Payment reconciliation
│   │   └── maintenance.worker.ts # Scheduled maintenance
│   ├── lib/                    # Utilities
│   │   ├── worker-rescue.ts    # Rescue service
│   │   ├── queue-manager.ts    # Queue management
│   │   └── logger.ts           # Logging
│   ├── jobs/                   # Job definitions
│   │   ├── send-email.ts
│   │   ├── send-whatsapp.ts
│   │   └── process-webhook.ts
│   ├── config/                 # Configuration
│   │   └── queues.ts           # Queue definitions
│   └── index.ts                # Entry point
├── package.json
└── tsconfig.json
```

## Queue Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      REDIS QUEUES                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    email     │  │   whatsapp   │  │   webhook    │      │
│  │   (high)     │  │   (high)     │  │  (normal)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐      │
│  │  order       │  │  payment     │  │ maintenance  │      │
│  │  (normal)    │  │  (critical)  │  │  (low)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   WORKER POOL     │
                    │  (4 concurrent)   │
                    └───────────────────┘
```

## Queues

### 1. Email Queue

**Name:** `email`

**Priority:** High

**Jobs:**
- `send-transactional` - Order confirmations, receipts
- `send-marketing` - Promotional emails
- `send-notification` - Alerts and updates

**Payload:**
```typescript
{
  type: 'send-transactional',
  to: string,
  template: string,
  data: object,
  attachments?: Array<{
    filename: string,
    content: Buffer
  }>
}
```

### 2. WhatsApp Queue

**Name:** `whatsapp`

**Priority:** High

**Jobs:**
- `send-message` - Text messages
- `send-template` - Template messages
- `send-media` - Images, documents
- `process-inbound` - Handle incoming messages

**Payload:**
```typescript
{
  type: 'send-message',
  to: string,
  message: string,
  merchantId?: string
}
```

### 3. Webhook Queue

**Name:** `webhook`

**Priority:** Normal

**Jobs:**
- `process-paystack` - Payment webhooks
- `process-kwik` - Delivery webhooks
- `process-custom` - Merchant webhooks

**Payload:**
```typescript
{
  type: 'process-paystack',
  event: string,
  data: object,
  signature: string
}
```

### 4. Order Queue

**Name:** `order`

**Priority:** Normal

**Jobs:**
- `process-new` - New order processing
- `update-status` - Status change handling
- `sync-inventory` - Inventory updates
- `send-notifications` - Customer notifications

**Payload:**
```typescript
{
  type: 'process-new',
  orderId: string,
  merchantId: string
}
```

### 5. Payment Queue

**Name:** `payment`

**Priority:** Critical

**Jobs:**
- `reconcile` - Payment reconciliation
- `process-payout` - Merchant payouts
- `handle-dispute` - Dispute resolution

**Payload:**
```typescript
{
  type: 'reconcile',
  transactionId: string,
  provider: 'paystack'
}
```

### 6. Maintenance Queue

**Name:** `maintenance`

**Priority:** Low

**Jobs:**
- `cleanup-old-data` - Data retention
- `generate-reports` - Scheduled reports
- `backup-database` - Database backups
- `health-check` - System health checks

**Payload:**
```typescript
{
  type: 'cleanup-old-data',
  table: string,
  olderThan: Date
}
```

## Worker Implementation

### Email Worker

**File:** `src/workers/email.worker.ts`

```typescript
export const emailWorker = new Worker(
  'email',
  async (job) => {
    const { type, to, template, data } = job.data;
    
    switch (type) {
      case 'send-transactional':
        return await sendTransactionalEmail(to, template, data);
      case 'send-marketing':
        return await sendMarketingEmail(to, template, data);
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 4,
    limiter: {
      max: 100,
      duration: 1000
    }
  }
);
```

### WhatsApp Worker

**File:** `src/workers/whatsapp.worker.ts`

Handles WhatsApp messaging via Evolution API:

```typescript
export const whatsappWorker = new Worker(
  'whatsapp',
  async (job) => {
    const { type, to, message } = job.data;
    
    try {
      await evolutionAPI.sendMessage(to, message);
    } catch (error) {
      // Report to rescue system
      await WorkerRescueService.reportJobFailure('whatsapp', job.id, error);
      throw error;
    }
  },
  { connection: redisConnection }
);
```

## Rescue System Integration

**File:** `src/lib/worker-rescue.ts`

The worker integrates with [Vayva Rescue](../../05_operations/automation/vayva-rescue.md) for incident tracking:

```typescript
export class WorkerRescueService {
  static async reportJobFailure(
    queueName: string,
    jobId: string,
    error: unknown
  ) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const fingerprint = this.generateFingerprint(queueName, errorMsg);

    await prisma.rescueIncident.upsert({
      where: { fingerprint },
      create: {
        surface: 'WORKER',
        errorType: 'JOB_FAILURE',
        errorMessage: errorMsg,
        severity: 'HIGH',
        fingerprint,
        status: 'OPEN',
        diagnostics: {
          queueName,
          jobId,
          stack: error instanceof Error ? error.stack : undefined
        }
      },
      update: {
        status: 'OPEN',
        updatedAt: new Date()
      }
    });
  }
}
```

## Job Scheduling

### Scheduled Jobs

**File:** `src/config/scheduler.ts`

```typescript
// Daily at 3 AM
cron.schedule('0 3 * * *', () => {
  maintenanceQueue.add('cleanup-old-data', {
    table: 'WebhookEvent',
    olderThan: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  });
});

// Hourly
cron.schedule('0 * * * *', () => {
  maintenanceQueue.add('health-check', {});
});

// Daily at 1 AM
cron.schedule('0 1 * * *', () => {
  paymentQueue.add('reconcile', { provider: 'paystack' });
});
```

## Error Handling

### Retry Policy

```typescript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  },
  removeOnComplete: 100,
  removeOnFail: 50
}
```

### Dead Letter Queue

Failed jobs after max retries are moved to:
- Queue: `failed:{original-queue-name}`
- Can be manually reviewed and reprocessed

## Monitoring

### Queue Metrics

Track via BullMQ Dashboard or custom metrics:

```typescript
// Get queue stats
const stats = await queue.getJobCounts();
// { waiting: 10, active: 2, completed: 100, failed: 5, delayed: 0 }
```

### Health Checks

**Endpoint:** Worker exposes health status

```typescript
// Check all workers are running
const health = {
  email: emailWorker.isRunning(),
  whatsapp: whatsappWorker.isRunning(),
  webhook: webhookWorker.isRunning(),
  order: orderWorker.isRunning(),
  payment: paymentWorker.isRunning()
};
```

## Deployment

### Systemd Service

**File:** `/etc/systemd/system/vayva-worker.service`

```ini
[Unit]
Description=Vayva Background Worker
After=network.target redis.service

[Service]
Type=simple
User=vayva
WorkingDirectory=/var/www/vayva/Backend/worker
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Commands

```bash
# Start worker
sudo systemctl start vayva-worker

# Stop worker
sudo systemctl stop vayva-worker

# Restart worker
sudo systemctl restart vayva-worker

# View logs
sudo journalctl -u vayva-worker -f

# Check status
sudo systemctl status vayva-worker
```

## Environment Variables

```bash
# Required
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Email
RESEND_API_KEY=

# WhatsApp
EVOLUTION_API_URL=
EVOLUTION_API_KEY=

# Integrations
PAYSTACK_SECRET_KEY=
KWIK_BASE_URL=
KWIK_EMAIL=
KWIK_PASSWORD=

# AI
GROQ_API_KEY=

# Logging
LOG_LEVEL=info
```

## Troubleshooting

### Worker Not Processing Jobs

1. Check Redis connection: `redis-cli ping`
2. Verify worker is running: `systemctl status vayva-worker`
3. Check logs: `journalctl -u vayva-worker -n 100`
4. Verify queue names match between producer and consumer

### High Failure Rate

1. Check external service health (Paystack, Kwik, Evolution)
2. Review error patterns in logs
3. Check Rescue incidents: `SELECT * FROM "RescueIncident" WHERE surface = 'WORKER'`
4. Verify rate limits not exceeded

### Memory Issues

1. Check for memory leaks in job processors
2. Reduce concurrency: `concurrency: 2`
3. Add memory monitoring
4. Restart worker periodically via cron

## Development

### Local Testing

```bash
cd Backend/worker

# Install dependencies
pnpm install

# Run in dev mode (with auto-reload)
pnpm dev

# Run single job
pnpm test:job --job=send-email
```

### Adding a New Worker

1. Create worker file: `src/workers/{name}.worker.ts`
2. Define job types in `src/jobs/`
3. Add to queue manager: `src/lib/queue-manager.ts`
4. Register in main entry: `src/index.ts`
5. Add tests

## Performance Tuning

### Concurrency

```typescript
// Default: 4 concurrent jobs per worker
// Increase for CPU-bound tasks
// Decrease for memory-intensive tasks
{
  concurrency: 4
}
```

### Rate Limiting

```typescript
// Prevent overwhelming external APIs
{
  limiter: {
    max: 100,      // Max jobs per duration
    duration: 1000 // Duration in ms
  }
}
```

## Related Documentation

- [Vayva Rescue](../../05_operations/automation/vayva-rescue.md)
- [Queue Operations](../../05_operations/queues-and-worker-ops.md)
- [Redis Operations](../../05_operations/redis-ops.md)
- [Evolution Integration](../../08_reference/integrations/evolution-whatsapp.md)

---

**Worker Issues?** Check logs with `journalctl -u vayva-worker -f` or contact platform engineering.
