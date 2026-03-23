# Incident Response Runbook

> Last updated: 2026-03-23
> Owner: DevOps / Engineering

---

## Purpose

This runbook defines how the Vayva team identifies, responds to, communicates about, and learns from production incidents. Every team member with on-call responsibilities must read this document before joining the rotation.

---

## Severity Levels

### SEV1 -- Critical

**Definition:** Complete platform outage or data loss affecting all merchants.

| Attribute | Value |
|-----------|-------|
| Impact | All merchants unable to process orders, accept payments, or access dashboards |
| Examples | Database down, Paystack webhook processing failure, authentication system broken, data corruption |
| Response time | 15 minutes |
| Resolution target | 1 hour |
| Communication cadence | Every 15 minutes until mitigated |
| Escalation | Immediate -- engineering lead + founder |
| Status page | Update within 10 minutes |

### SEV2 -- Major

**Definition:** Significant degradation affecting a large subset of merchants or a critical feature.

| Attribute | Value |
|-----------|-------|
| Impact | Major feature broken for many merchants (e.g., WhatsApp agent down, AI credits not deducting, storefront 5xx errors) |
| Examples | Evolution API connection lost, OpenRouter API errors, Redis cache failure, BullMQ workers stalled |
| Response time | 30 minutes |
| Resolution target | 4 hours |
| Communication cadence | Every 30 minutes |
| Escalation | Engineering lead within 1 hour if unresolved |
| Status page | Update within 20 minutes |

### SEV3 -- Minor

**Definition:** Partial degradation affecting a small subset of merchants or a non-critical feature.

| Attribute | Value |
|-----------|-------|
| Impact | Non-critical feature broken, minor performance degradation, single merchant affected |
| Examples | Analytics dashboard slow, email delivery delays, single industry module error, ops console page broken |
| Response time | 2 hours |
| Resolution target | 24 hours |
| Communication cadence | Daily update |
| Escalation | Normal sprint process |
| Status page | Update if merchant-visible |

### SEV4 -- Low

**Definition:** Cosmetic issue, minor bug, or improvement opportunity discovered during operations.

| Attribute | Value |
|-----------|-------|
| Impact | No merchant impact or minimal inconvenience |
| Examples | UI alignment issue, log noise, non-critical deprecation warning, documentation gap |
| Response time | Next business day |
| Resolution target | Next sprint |
| Communication cadence | None required |
| Escalation | Normal backlog |
| Status page | No update needed |

---

## Response Procedures

### Step 1: Detect and Acknowledge

1. Incident is detected via:
   - **Sentry alert** (error rate spike, new unhandled exception)
   - **Vercel Analytics** (response time degradation, 5xx spike)
   - **Merchant report** (support ticket, WhatsApp message)
   - **Automated health check** (`/healthz` endpoint failure)
   - **BullMQ dashboard** (queue backlog, failed jobs)
   - **Manual observation** (ops console monitoring)

2. First responder acknowledges the incident within the response time SLA.

3. First responder assigns a severity level using the definitions above.

4. First responder creates an incident record:
   - **Channel:** Dedicated incident thread (Slack/WhatsApp group)
   - **Title:** `[SEV{N}] Brief description`
   - **Timestamp:** Time of first detection
   - **Affected systems:** List of impacted components

### Step 2: Triage and Diagnose

1. **Identify scope:**
   - Which apps are affected? (merchant, storefront, ops-console, marketing)
   - Which merchants are impacted? (all, specific tier, specific industry)
   - Is the issue data-affecting? (data loss, data corruption, financial impact)

2. **Check common failure points:**
   - Database connectivity (`DATABASE_URL`, connection pool exhaustion)
   - Redis availability (`REDIS_URL`)
   - External API status (Paystack, OpenRouter, Evolution API)
   - Vercel deployment status (recent deploy, build failure)
   - DNS resolution (vayva.ng subdomains)

3. **Gather diagnostic data:**
   - Sentry error details and stack traces
   - Vercel function logs (Runtime Logs tab)
   - Database query performance (Prisma query logs)
   - Redis memory usage and connection count
   - BullMQ queue depths and failed job counts

### Step 3: Mitigate

Priority is always to **restore service first**, then investigate root cause.

**Common mitigation actions:**

| Scenario | Mitigation |
|----------|------------|
| Bad deployment | Roll back via Vercel dashboard (Deployments > select previous > Promote to Production) |
| Database connection exhaustion | Restart connection pool, check for long-running queries, kill idle connections |
| Redis memory full | Flush non-critical caches, increase memory limit, check for key leaks |
| External API down (Paystack) | Enable maintenance mode for affected features, queue failed webhooks for retry |
| External API down (OpenRouter) | AI responses return graceful fallback message; no merchant action needed |
| External API down (Evolution API) | WhatsApp messages queue; merchants notified of delay |
| BullMQ workers stalled | Restart worker processes, check for poison messages in dead letter queue |
| Rate limiting triggered | Increase limits temporarily if legitimate traffic, block if attack |

### Step 4: Communicate

**Internal communication:**
- Post updates in the incident thread at the cadence defined by severity level.
- Each update must include: current status, actions taken, next steps, ETA.

**External communication (merchants):**
- SEV1/SEV2: Send notification via ops console broadcast or email.
- Include: what happened, current status, expected resolution time.
- Never blame external vendors by name in merchant-facing communications.

### Step 5: Resolve and Verify

1. Confirm the fix is deployed and operational.
2. Verify with monitoring tools:
   - Error rates returned to baseline in Sentry
   - Response times normal in Vercel Analytics
   - Affected merchants can access their dashboards
   - Payment processing is functional (test transaction if needed)
3. Declare incident resolved in the thread.
4. Schedule post-mortem within 48 hours for SEV1/SEV2 incidents.

---

## Escalation Paths

```
First Responder (on-call engineer)
    |
    ├── SEV3/SEV4: Resolve independently, log in backlog
    |
    ├── SEV2: Escalate to Engineering Lead if unresolved within 1 hour
    |   └── Engineering Lead escalates to Founder if unresolved within 4 hours
    |
    └── SEV1: Immediately notify Engineering Lead + Founder
        └── Founder coordinates cross-functional response
```

### Contact Chain

| Role | Responsibility |
|------|---------------|
| On-call engineer | First response, triage, initial mitigation |
| Engineering lead | Technical decision-making, resource allocation, vendor escalation |
| Founder (Fredrick) | Business decisions, merchant communication approval, financial impact assessment |
| DevOps | Infrastructure-level issues, VPS access, database operations |

---

## Communication Templates

### SEV1/SEV2 -- Initial Notification to Merchants

```
Subject: [Vayva] Service Disruption -- {Feature Name}

We are currently experiencing an issue affecting {brief description}.

What is happening:
{1-2 sentences describing the impact in merchant terms}

What we are doing:
Our engineering team is actively working to resolve this issue.

We will provide an update within {timeframe}.

If you have urgent questions, please contact support@vayva.ng.

-- Vayva Team
```

### SEV1/SEV2 -- Resolution Notification

```
Subject: [Vayva] Resolved -- {Feature Name}

The issue affecting {brief description} has been resolved.

What happened:
{1-2 sentences in plain language}

Duration:
{start time} to {end time} ({total duration})

Impact:
{what merchants experienced}

What we have done:
{brief description of fix and preventive measures}

We apologize for the inconvenience. If you notice any remaining issues, please contact support@vayva.ng.

-- Vayva Team
```

### Internal Incident Update Template

```
[SEV{N}] {Title} -- Update #{n} at {HH:MM UTC}

Status: Investigating / Mitigating / Monitoring / Resolved
Impact: {who is affected and how}
Actions taken: {what was done since last update}
Next steps: {what will be done next}
ETA: {expected resolution time or "unknown"}
```

---

## Post-Mortem Template

Post-mortems are required for all SEV1 and SEV2 incidents. They must be completed within 5 business days.

```markdown
# Post-Mortem: {Incident Title}

**Date:** {YYYY-MM-DD}
**Severity:** SEV{N}
**Duration:** {start} to {end} ({total})
**Author:** {name}
**Participants:** {names of responders}

## Summary

{2-3 sentence summary of what happened and the impact}

## Timeline (all times in UTC)

| Time | Event |
|------|-------|
| HH:MM | {First detection} |
| HH:MM | {Acknowledged by} |
| HH:MM | {Key diagnostic finding} |
| HH:MM | {Mitigation action taken} |
| HH:MM | {Service restored} |
| HH:MM | {Incident declared resolved} |

## Root Cause

{Detailed technical explanation of what caused the incident}

## Impact

- **Merchants affected:** {count or percentage}
- **Duration of impact:** {time}
- **Financial impact:** {estimated revenue lost, credits consumed, etc.}
- **Data impact:** {any data loss or corruption -- specify "none" if applicable}

## What Went Well

- {Thing that worked}
- {Thing that worked}

## What Went Poorly

- {Thing that did not work}
- {Thing that did not work}

## Action Items

| Action | Owner | Priority | Due Date |
|--------|-------|----------|----------|
| {Preventive measure} | {name} | P1/P2/P3 | {date} |
| {Detection improvement} | {name} | P1/P2/P3 | {date} |
| {Process improvement} | {name} | P1/P2/P3 | {date} |

## Lessons Learned

{Key takeaways that should inform future engineering decisions}
```

---

## On-Call Expectations

1. **Availability:** On-call engineer must be reachable within 15 minutes during their rotation.
2. **Tools access:** On-call must have access to Vercel dashboard, Sentry, database (read-only), Redis CLI, and VPS SSH.
3. **Runbook familiarity:** On-call must have read this runbook and the deployment checklist before starting a rotation.
4. **Handoff:** At rotation end, hand off any open incidents with a written summary of current state and next steps.
5. **Escalation:** Never hesitate to escalate. Escalating is not a failure; delayed escalation is.

---

## Related Documents

- [Deployment Checklist](../../04_deployment/procedures/deployment-checklist.md)
- [Monitoring Strategy](../../04_deployment/monitoring/monitoring-strategy.md)
- [Database Maintenance](../maintenance/database-maintenance.md)
- [Data Breach Response](../../06_security_compliance/procedures/data-breach-response.md)
