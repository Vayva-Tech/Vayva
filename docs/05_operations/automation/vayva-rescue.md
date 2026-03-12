# Vayva Rescue System

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Version:** 1.0.0

---

## Overview

**Vayva Rescue** is an automated Tier-3 SRE (Site Reliability Engineering) helper designed to triage platform incidents when engineering is unavailable. It uses AI-powered diagnostics to analyze errors, classify incidents, and suggest remediation steps while maintaining strict safety guardrails.

## Core Principles

1. **Read-Only by Default** - The system analyzes and diagnoses; it does not execute fixes automatically
2. **Auditable** - Every intake, analysis, and proposed action is logged to the `OpsAuditEvent` table
3. **Guardrails** - PII and secrets are automatically redacted before AI analysis
4. **Human-in-the-Loop** - All write actions require operator approval

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VAYVA RESCUE SYSTEM                             │
├─────────────────────────────────────────────────────────────────────────┤
│  Error Surfaces:                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Marketing  │  │   Merchant  │  │  Core API   │  │   Worker    │    │
│  │  (Next.js)  │  │   Admin     │  │  (Next.js)  │  │  (BullMQ)   │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │                │           │
│         ▼                ▼                ▼                ▼           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Error Boundaries (RescueOverlay)              │   │
│  │  - global-error.tsx     - error.tsx     - WorkerRescueService   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                         │
│                              ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Rescue API Endpoints (/api/rescue/report)           │   │
│  │  - MarketingRescueService                                        │   │
│  │  - MerchantRescueService                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                         │
│                              ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Ops Console (Central Hub)                     │   │
│  │  ┌───────────────────────────────────────────────────────────┐   │   │
│  │  │              RescueService (AI Diagnosis)                  │   │   │
│  │  │  - Intake incidents                                        │   │   │
│  │  │  - Groq Llama-3 AI analysis                                │   │   │
│  │  │  - Classification & escalation                             │   │   │
│  │  └───────────────────────────────────────────────────────────┘   │   │
│  │                              │                                     │   │
│  │                              ▼                                     │   │
│  │  ┌───────────────────────────────────────────────────────────┐   │   │
│  │  │              RescueGroqClient (AI Client)                  │   │   │
│  │  │  - PII redaction (emails, keys, cards)                     │   │   │
│  │  │  - Safe mode fallback                                      │   │   │
│  │  └───────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                         │
│                              ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Database (Prisma)                             │   │
│  │  - RescueIncident (stores incidents)                             │   │
│  │  - RescueFixAction (proposed fixes)                              │   │
│  │  - OpsAuditEvent (audit trail)                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## How It Works

### 1. Error Detection & Intake

When an error occurs in any frontend app or worker:

**Frontend Applications:**
- `global-error.tsx` or `error.tsx` catches the error
- Renders `RescueOverlay` component
- Reports to `/api/rescue/report`

**Background Workers:**
- `WorkerRescueService.reportJobFailure()` captures job failures
- Creates incident in database

**Reported Data:**
```typescript
{
  route: string;           // Path where error occurred
  errorMessage: string;    // PII-redacted error message
  stackHash?: string;      // Stack trace fingerprint
  fingerprint?: string;    // Incident deduplication key
}
```

### 2. Incident Creation

Each surface has its own rescue service:

| Surface | Service | Location |
|---------|---------|----------|
| Marketing | `MarketingRescueService` | `Frontend/marketing/src/lib/rescue/` |
| Merchant Admin | `MerchantRescueService` | `Backend/core-api/src/lib/rescue/` |
| Core API | `MerchantRescueService` | `Backend/core-api/src/lib/rescue/` |
| Worker | `WorkerRescueService` | `Backend/worker/src/lib/worker-rescue.ts` |

**Incident Deduplication:**
- Incidents are deduplicated using a fingerprint hash
- Same error type + message = same incident
- Re-opening an existing incident updates `updatedAt`

### 3. AI-Powered Diagnosis

The central `RescueService` performs:

1. **Audit Logging** - Creates `SYSTEM_RESCUE_INTAKE` event
2. **AI Analysis** - Sends error to Groq Llama-3.1-70b
3. **Classification** - Categorizes incident type
4. **Remediation** - Suggests safe step-by-step fixes
5. **Escalation** - Determines team to notify

**Classification Categories:**
- `AUTH` - Authentication or Authorization failures
- `DATABASE` - Prisma, Postgres, or indexing issues
- `PAYMENTS` - Paystack or wallet transaction failures
- `DELIVERY` - Kwik, logistics, or shipment status issues
- `NETWORKING` - API Gateway, service timeouts, or CORS
- `AI_LOGIC` - SalesAgent, MerchantBrain, or prompt engineering issues

### 4. Safety & Guardrails

**PII Redaction:**
The `RescueGroqClient.sanitizeInput()` method removes:
- Email addresses → `[REDACTED_EMAIL]`
- Phone numbers → `[REDACTED_PHONE]`
- Credit card numbers → `[REDACTED_SENSITIVE]`
- API keys (sk-, pk-, rk_) → `[REDACTED_KEY]`
- JWT tokens → `[REDACTED_JWT]`
- Bearer tokens → `Bearer [REDACTED_TOKEN]`
- SSH private keys → `[REDACTED_PRIVATE_KEY]`

**Mutation Guardrails:**
- AI is forbidden from suggesting direct DB mutations
- Write actions must be prefixed with `[REQUIRES APPROVAL]`
- Stop sequence `MUTATION_ATTEMPT` triggers guardrail

### 5. Runbook Execution

Operators can execute automated runbooks via `/api/ops/rescue/runbooks`:

| Runbook ID | Description |
|------------|-------------|
| `webhook-recovery` | Find and retry failed webhooks from last 24h |
| `job-stuck-mitigation` | Detect stuck webhook processing jobs |
| `auth-sync-repair` | Verify session consistency |

## Configuration

### Environment Variables

```bash
# Required
GROQ_API_KEY_RESCUE=<your_groq_api_key>

# Feature Flag
OPS_RESCUE_ENABLE=true  # Enable/disable rescue system
```

### Database Schema

**RescueIncident Model:**
```prisma
model RescueIncident {
  id           String                 @id @default(uuid())
  createdAt    DateTime               @default(now())
  updatedAt    DateTime               @updatedAt
  severity     RescueIncidentSeverity // LOW | MEDIUM | HIGH | CRITICAL
  surface      RescueSurface          // MERCHANT_ADMIN | STOREFRONT | OPS | WORKER
  route        String?
  storeId      String?
  userId       String?
  errorType    String
  errorMessage String
  fingerprint  String                 @unique
  status       RescueIncidentStatus   @default(OPEN) // OPEN | ACKED | RESOLVED | CLOSED
  diagnostics  Json?
  
  fixActions   RescueFixAction[]
  auditLogs    OpsAuditEvent[]
  
  @@index([status, severity])
  @@index([surface, createdAt])
}
```

**RescueFixAction Model:**
```prisma
model RescueFixAction {
  id           String          @id @default(uuid())
  incidentId   String
  createdAt    DateTime        @default(now())
  actionType   FixActionType
  actionStatus FixActionStatus @default(PENDING)
  summary      String
  beforeState  Json?
  afterState   Json?
}
```

## API Endpoints

### Public Endpoints (Per-App)

```
POST /api/rescue/report
GET  /api/rescue/incidents/:id
```

### Ops Console Endpoints (Authenticated)

```
GET    /api/ops/rescue/incidents           # List incidents
GET    /api/ops/rescue/incidents/:id       # Get incident details
POST   /api/ops/rescue/incidents/:id/actions  # Perform action
POST   /api/ops/rescue/runbooks            # Execute runbook
GET    /api/ops/rescue/runbooks            # List available runbooks
```

## Usage

### Manual Incident Trigger (Development)

```bash
# Trigger a test incident
curl -X POST http://localhost:3000/api/rescue/report \
  -H "Content-Type: application/json" \
  -d '{
    "route": "/test",
    "errorMessage": "Test error for rescue system",
    "stackHash": "test-hash-123"
  }'
```

### Viewing Incidents

1. Navigate to Ops Console: `https://ops.vayva.ng`
2. Go to **Rescue** section
3. View incident list with filters (status, severity, surface)
4. Click incident for detailed analysis and remediation steps

### Executing Runbooks

1. In Ops Console, navigate to **Rescue > Runbooks**
2. Select runbook from dropdown
3. Provide required parameters
4. Review execution logs
5. Confirm results

## Escalation Paths

| Severity | Response Time | Action |
|----------|---------------|--------|
| CRITICAL | Immediate | Wake on-call engineer, AI starts diagnostics |
| HIGH | 30 minutes | Agent analyzes root cause, staff notified |
| MEDIUM | Business hours | Agent logs issue, review during business hours |
| LOW | Next sprint | Logged for tracking, no immediate action |

**Escalation Teams:**
- `@eng-payments` - Payment-related issues
- `@eng-logistics` - Delivery/Kwik issues
- `@eng-platform` - Infrastructure issues
- `@eng-ai` - AI/SalesAgent issues
- `@engineering-on-call` - General incidents

## Monitoring & Alerts

### Key Metrics

- **Incident Volume** - Number of incidents per hour/day
- **Resolution Time** - Time from intake to resolution
- **AI Accuracy** - Correct classification rate
- **Escalation Rate** - Percentage requiring human intervention

### Audit Events

All rescue activities are logged:

```
SYSTEM_RESCUE_INTAKE    - Incident received
SYSTEM_RESCUE_RESULT    - Analysis completed
OPS_RUNBOOK_EXECUTION   - Runbook executed
```

## Troubleshooting

### Rescue System Not Responding

1. Check `OPS_RESCUE_ENABLE` is set to `true`
2. Verify `GROQ_API_KEY_RESCUE` is valid
3. Check Ops Console logs for API errors
4. Review `RescueGroqClient` initialization logs

### AI Analysis Failing

1. Check Groq API status
2. Verify API key quotas
3. Review sanitized input (should not contain PII)
4. Check `RescueIncident` table for failed analyses

### Incidents Not Being Created

1. Verify error boundaries are rendering `RescueOverlay`
2. Check `/api/rescue/report` endpoint is accessible
3. Review Prisma connection to database
4. Check for fingerprint collisions

## Security Considerations

- All error data is PII-redacted before AI analysis
- No secrets or credentials are sent to Groq
- Database mutations require explicit approval
- All actions are audited in `OpsAuditEvent`
- Read-only mode is the default

## References

- [Incident Response Runbook](../incident-response.md)
- [Ops Console Documentation](../../07_applications/ops-console/)
- [Database Schema](../../02_engineering/data-model/)
- Source Code:
  - `Frontend/ops-console/src/lib/rescue/`
  - `Backend/core-api/src/lib/rescue/`
  - `Backend/worker/src/lib/worker-rescue.ts`

---

**Questions?** Contact @engineering-on-call or refer to the [Incident Response](../incident-response.md) documentation.
