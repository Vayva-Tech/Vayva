# Ops Console

> **Application:** `Backend/ops-console`
> **URL:** `https://ops.vayva.ng`
> **Framework:** Next.js 16, TypeScript

## Purpose

The Ops Console is Vayva's internal operations dashboard, used exclusively by the Vayva team to monitor platform health, manage merchant accounts, track AI costs, oversee subscriptions, and respond to operational issues. It is not accessible to merchants or end customers.

## Access Control

### Authentication

- **Ops-only access** -- Restricted to Vayva internal team members
- **Login endpoint** -- `/api/ops/auth/login` with dedicated ops credentials
- **Session management** -- Authenticated sessions with expiry and re-authentication requirements
- **No self-registration** -- Accounts are provisioned manually by platform administrators

### Authorization Levels

| Role | Description |
|------|-------------|
| **Platform Admin** | Full access to all ops features, including destructive actions (account suspension, data deletion) |
| **Ops Engineer** | Access to system health, monitoring, and sync tools. Cannot modify billing or suspend accounts |
| **Support Agent** | Read access to merchant data and order details for support ticket resolution |

## Key Features

### 1. Merchant Monitoring

The merchant monitoring dashboard provides a holistic view of all merchants on the platform:

- **Merchant list** -- Searchable directory of all registered merchants with status indicators
- **Store health** -- Per-store health scores based on product count, order volume, AI agent activity, and payment status
- **Account status** -- Active, trial, suspended, or churned
- **Onboarding progress** -- Track which onboarding steps each merchant has completed
- **Flagged accounts** -- Merchants with compliance issues, payment failures, or unusual activity

### 2. AI Cost Tracking

Monitor and control AI spend across the platform:

- **Aggregate usage** -- Total tokens consumed (input + output) across all merchants
- **Per-merchant usage** -- Drill down into individual merchant AI consumption
- **Provider costs** -- Cost breakdown by AI provider (Groq, DeepSeek, local ML)
- **Cost projections** -- Monthly cost estimates based on current usage trends
- **Credit reconciliation** -- Verify that merchant credit consumption matches actual provider costs
- **Model distribution** -- Which AI models are being used most (Llama 3.1 8B, Llama 3.1 70B, Mixtral, DeepSeek Chat)
- **Margin analysis** -- Revenue from AI credits minus actual provider costs

### 3. Subscription Management

Oversee all merchant subscriptions and billing:

- **Subscription overview** -- Count of merchants per tier (STARTER, PRO, PRO_PLUS)
- **MRR tracking** -- Monthly Recurring Revenue with growth trends
- **Churn monitoring** -- Merchants who cancelled or downgraded, with reasons
- **Dunning status** -- Merchants with failed payments and dunning sequence progress
- **Manual actions** -- Override subscription status, apply credits, extend trials
- **Payment reconciliation** -- Match Paystack transactions to internal billing records

### 4. System Health

Real-time platform health monitoring:

- **Service status** -- Uptime indicators for core-api, worker, ai-agent, storefronts, and WhatsApp gateway
- **Queue depths** -- BullMQ queue sizes for all worker queues (whatsapp-inbound, whatsapp-outbound, payments, delivery, etc.)
- **Error rates** -- API error rate trends with breakdowns by endpoint and error type
- **Response times** -- P50, P95, and P99 latency metrics for API endpoints
- **Database health** -- Connection pool utilization, slow query counts, and replication lag
- **Redis health** -- Memory usage, connected clients, and queue backlogs

### 5. Data Sync

Operational data synchronization tools:

- **Sync endpoint** -- `/api/ops/sync` for triggering data synchronization tasks
- **Inventory sync** -- Reconcile product inventory across systems
- **Payment sync** -- Synchronize Paystack webhook data with internal records
- **Manual corrections** -- Tools for fixing data inconsistencies

## Key Dashboards

### Platform Overview Dashboard

The home screen displaying:

- **Total merchants** -- Active count with weekly growth
- **Total orders (today)** -- Platform-wide order volume
- **AI conversations (today)** -- Active WhatsApp conversations being handled by AI
- **Revenue (MTD)** -- Month-to-date platform revenue from subscriptions and credits
- **System alerts** -- Active alerts requiring attention (failed payments, queue backlogs, error spikes)

### Financial Dashboard

- **MRR breakdown** -- Revenue by tier with month-over-month comparison
- **AI cost vs. revenue** -- Margin analysis for AI credit sales
- **Payment failure rate** -- Percentage of failed subscription renewals
- **Outstanding invoices** -- Unpaid invoices requiring follow-up

### Operations Dashboard

- **Queue health** -- Real-time queue depths and processing rates for all BullMQ queues
- **Worker status** -- Active worker count and job completion rates
- **Failed jobs** -- List of failed background jobs with error details and retry controls
- **Cron job status** -- Last execution time and success/failure for scheduled tasks (SLA monitor, maintenance)

### WhatsApp Dashboard

- **Connected numbers** -- Total WhatsApp Business numbers connected via Evolution API
- **Message volume** -- Inbound and outbound message counts with hourly trends
- **Connection health** -- Numbers with connectivity issues or authentication failures
- **Agent performance** -- AI response times, conversion rates, and escalation rates

## Technical Architecture

```
Browser (Ops Team)
  --> ops.vayva.ng (Next.js frontend)
  --> /api/ops/* (BFF routes)
  --> core-api (backend data access)
  --> PostgreSQL + Redis (data stores)
```

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/ops/auth/login` | Authenticate ops team members |
| `/api/ops/sync` | Trigger data synchronization tasks |

### Security

- **Network isolation** -- Ops console should only be accessible from whitelisted IP addresses or VPN
- **Audit logging** -- All ops actions are logged with the operator's identity and timestamp
- **Read-heavy** -- Most ops operations are read-only; destructive actions require confirmation dialogs
- **No merchant-facing exposure** -- Ops endpoints are completely separate from merchant and customer APIs
