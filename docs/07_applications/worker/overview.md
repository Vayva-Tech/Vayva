# Worker

> **Application:** `apps/worker`
> **Framework:** Node.js, BullMQ, TypeScript
> **Queue Backend:** Redis

## Purpose

The Worker is Vayva's background job processor. It handles all asynchronous tasks that should not block the request-response cycle of the Core API, including WhatsApp message processing, payment handling, delivery coordination, image processing, and scheduled maintenance. The worker connects to Redis-backed BullMQ queues and processes jobs reliably with retry logic and error handling.

## BullMQ Queue System

### Architecture

```
Core API / Storefront / AI Agent
  --> Enqueue job to Redis (BullMQ)
  --> Worker picks up job from queue
  --> Worker processes job
  --> On success: job removed (removeOnComplete)
  --> On failure: job retried or moved to failed set
```

### Queue Configuration

The worker uses named queues defined in `@vayva/shared` (the `QUEUES` constant). Each queue has its own dedicated worker registration function and processes a specific category of jobs.

### Worker Startup

On startup (`worker.ts`), the worker:

1. Loads environment configuration
2. Establishes a Redis connection via `@vayva/redis`
3. Optionally schedules the nightly maintenance job (if `WORKER_ENABLE_MAINTENANCE_CLEANUP=true`)
4. Registers all worker handlers against their respective queues

```typescript
// Registered workers
registerMaintenanceWorker(connection);
registerWhatsAppInboundWorker(connection);
registerWhatsAppOutboundWorker(connection);
registerAgentActionsWorker(connection);
registerDeliveryWorker(connection);
registerPaymentsWorker(connection);
registerReconciliationWorker(connection);
registerThumbnailWorker(connection);
registerChinaSyncWorker(connection);
```

## Job Types

### WhatsApp Inbound (`whatsapp-inbound.worker.ts`)

Processes incoming WhatsApp messages from customers:

- **Trigger** -- Evolution API webhook delivers a new message
- **Processing** -- Parses the message, identifies the store, loads conversation context
- **AI invocation** -- Calls `SalesAgent.handleMessage()` to generate a response
- **Output** -- Enqueues the AI response to the whatsapp-outbound queue

### WhatsApp Outbound (`whatsapp-outbound.worker.ts`)

Sends outgoing WhatsApp messages to customers:

- **Trigger** -- AI response generated or merchant sends a manual message
- **Processing** -- Formats the message for WhatsApp (text, images, buttons)
- **Delivery** -- Sends the message via Evolution API
- **Confirmation** -- Logs delivery status

### Agent Actions (`agent-actions.worker.ts`)

Processes actions initiated by the AI agent:

- **Order creation** -- When the AI agent completes a sale, this worker creates the order record
- **Cart updates** -- Adding or removing items from a customer's cart
- **Payment link generation** -- Creating Paystack payment links for WhatsApp orders
- **Notification dispatch** -- Sending merchant notifications about AI actions

### Delivery (`delivery.worker.ts`)

Coordinates order fulfillment with logistics partners:

- **Dispatch** -- Creates delivery requests with integrated providers (Kwik, GIG Logistics)
- **Tracking updates** -- Polls logistics APIs for delivery status changes
- **Status sync** -- Updates order status in the database when delivery milestones are reached
- **Customer notifications** -- Triggers WhatsApp messages to customers with delivery updates

### Payments (`payments.worker.ts`)

Handles asynchronous payment operations:

- **Webhook processing** -- Processes Paystack webhook events (charge.success, refund.processed)
- **Payment verification** -- Verifies payment status with Paystack API
- **Settlement tracking** -- Records payment settlements for merchant payouts
- **Failure handling** -- Manages failed payment events and triggers dunning

### Reconciliation (`reconciliation.worker.ts`)

Ensures financial data consistency:

- **Payment reconciliation** -- Matches Paystack transactions with internal order records
- **Credit reconciliation** -- Verifies AI credit consumption against provider costs
- **Discrepancy detection** -- Flags mismatches for ops team review
- **Automated corrections** -- Applies corrections for known reconciliation patterns

### Thumbnail (`thumbnail.worker.ts`)

Processes product images:

- **Image resizing** -- Generates multiple thumbnail sizes for product images
- **Format conversion** -- Converts images to WebP for optimal web delivery
- **CDN upload** -- Uploads processed images to the CDN/storage
- **Metadata update** -- Updates the product record with generated image URLs

### Maintenance (`maintenance.worker.ts`)

Scheduled maintenance tasks:

- **Schedule** -- Runs nightly at 2:00 AM (cron: `0 2 * * *`)
- **Gated** -- Only runs when `WORKER_ENABLE_MAINTENANCE_CLEANUP=true`
- **Tasks** -- Database cleanup, expired session removal, stale data purging, temporary file cleanup

### Subscription Lifecycle (`subscription-lifecycle.worker.ts`)

Manages subscription state transitions:

- **Trial expiry** -- Handles merchants whose free trial has ended
- **Renewal processing** -- Processes subscription renewals at billing cycle boundaries
- **Downgrade execution** -- Applies tier downgrades and adjusts feature access
- **Cancellation** -- Processes subscription cancellations and handles grace periods

### Dunning (`dunning.worker.ts`)

Handles failed payment recovery:

- **Retry sequence** -- Attempts to re-charge failed subscription payments on a defined schedule
- **Notifications** -- Sends payment failure notifications to merchants via email and WhatsApp
- **Grace period** -- Maintains service during the retry window
- **Suspension** -- Suspends accounts after all retry attempts are exhausted

### Cart Recovery (`cart-recovery.worker.ts`)

Recovers abandoned shopping carts:

- **Detection** -- Identifies carts that have been inactive beyond a configurable threshold
- **WhatsApp messages** -- Sends recovery messages to customers via WhatsApp with a link to complete their purchase
- **Incentives** -- Optionally includes discount codes in recovery messages
- **Tracking** -- Records recovery attempt outcomes (converted, ignored, unsubscribed)

### Usage Billing (`usage-billing.worker.ts`)

Processes metered billing for AI usage:

- **Credit aggregation** -- Aggregates AI credit consumption per billing period
- **Invoice generation** -- Creates usage-based invoice line items
- **Overage calculation** -- Calculates charges when usage exceeds plan allowances

### Webhook Delivery (`webhook-delivery.worker.ts`)

Delivers outbound webhooks to merchant-configured endpoints:

- **Event types** -- Order created, payment received, delivery status change, etc.
- **Delivery** -- HTTP POST to the merchant's webhook URL with signed payload
- **Retry** -- Failed deliveries are retried with exponential backoff
- **Logging** -- All delivery attempts are logged for debugging

### Calendar Sync (`calendar-sync.worker.ts`)

Synchronizes booking/event data with external calendars:

- **Google Calendar** -- Sync bookings to merchant's Google Calendar
- **iCal** -- Generate iCal feeds for calendar subscriptions

### China Sync (`china-sync.worker.ts`)

Synchronizes product data with Chinese suppliers:

- **Product imports** -- Pull product data from supplier APIs
- **Inventory sync** -- Update stock levels based on supplier availability
- **Pricing updates** -- Reflect supplier price changes

### Metrics Reporter (`metrics-reporter.worker.ts`)

Aggregates and reports platform metrics:

- **Usage metrics** -- Aggregate API calls, message volumes, and storage usage
- **Business metrics** -- Calculate MRR, churn, and growth rates
- **Health metrics** -- Report queue depths, error rates, and latency

## Scheduled Jobs

### Cron Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Nightly maintenance | `0 2 * * *` (2 AM daily) | Database cleanup and expired data removal |
| SLA monitoring | Configurable | Monitor service level compliance |

### Job Files (`src/jobs/`)

| Job | Description |
|-----|-------------|
| `databaseBackup.ts` | Trigger database backup procedures |
| `drainNotificationOutbox.ts` | Process queued notifications |
| `drainEmailOutbox.ts` | Send queued emails |
| `generateThumbnail.ts` | Generate product image thumbnails |

## Retry Strategy

### Default Retry Configuration

- **Max attempts** -- 3 retries per job (configurable per queue)
- **Backoff strategy** -- Exponential backoff with jitter
- **Backoff base delay** -- 1 second, doubling with each attempt (1s, 2s, 4s)
- **Dead letter** -- After all retries are exhausted, failed jobs remain in the failed set for inspection

### Per-Queue Retry Overrides

| Queue | Max Retries | Rationale |
|-------|-------------|-----------|
| WhatsApp inbound | 5 | Message processing is critical; more retries allowed |
| WhatsApp outbound | 3 | Excessive retries could result in duplicate messages |
| Payments | 5 | Payment processing failures need thorough retry |
| Webhook delivery | 5 | External endpoints may have intermittent issues |
| Thumbnail | 2 | Image processing failures are usually permanent |
| Maintenance | 1 | Maintenance tasks can be retried the next night |

### Failure Handling

- **Logging** -- All job failures are logged with error details, job data, and attempt count
- **Alerting** -- Critical job failures (payments, WhatsApp) trigger alerts to the ops team
- **Worker rescue** -- The `lib/worker-rescue.ts` module provides recovery utilities for stuck or failed jobs

## Monitoring

### Queue Health

Monitor queue health through:

- **Queue depth** -- Number of waiting jobs per queue (should stay low)
- **Processing rate** -- Jobs completed per second
- **Failed count** -- Number of jobs in the failed set
- **Delayed count** -- Number of jobs scheduled for future processing

### Observability

- **Structured logging** -- All workers use the `@vayva/shared` logger with context (queue name, job ID, store ID)
- **SLA monitoring** -- The `crons/sla-monitor.ts` cron tracks service level metrics
- **Reliability utilities** -- The `lib/reliability.ts` module provides circuit breakers and health checks
- **Meta tracking** -- The `lib/meta.ts` module tracks job metadata for debugging

### Health Endpoints

The worker application exposes health check endpoints via API routes:

- `/api/cron/sla-monitor` -- SLA monitoring cron endpoint
- `/api/analytics/cookie-consent` -- Analytics consent tracking

## Environment Configuration

Key environment variables:

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection string for BullMQ |
| `DATABASE_URL` | PostgreSQL connection string |
| `WORKER_ENABLE_MAINTENANCE_CLEANUP` | Enable/disable nightly maintenance (default: false) |
| `EVOLUTION_API_URL` | Evolution API base URL for WhatsApp |
| `EVOLUTION_API_KEY` | Evolution API authentication key |
| `PAYSTACK_SECRET_KEY` | Paystack API secret for payment verification |
| `GROQ_API_KEY_SUPPORT` | Groq API key for AI agent responses |

## Provider Integrations

The worker integrates with several external providers via `lib/providers.ts`:

- **Kwik** (`lib/kwik.ts`) -- Kwik delivery API for last-mile logistics
- **AI** (`lib/ai.ts`) -- AI model invocation for agent actions
- **Meta** (`lib/meta.ts`) -- Meta/WhatsApp Business API utilities
