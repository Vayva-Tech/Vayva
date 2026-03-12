# Ops Console Documentation

**Application:** Operations Console  
**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Framework:** Next.js 15 + React + TypeScript  
**URL:** `https://ops.vayva.ng`

---

## Overview

The Ops Console is the internal operations dashboard for Vayva platform administrators. It provides tools for merchant management, platform monitoring, incident response, and system administration.

## Architecture

```
Frontend/ops-console/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/              # Main app layout (authenticated)
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── merchants/      # Merchant management
│   │   │   ├── orders/         # Platform-wide orders
│   │   │   ├── users/          # User management
│   │   │   ├── finance/        # Platform finances
│   │   │   ├── rescue/         # Vayva Rescue system
│   │   │   ├── runbook/        # SOPs and runbooks
│   │   │   └── settings/       # Platform settings
│   │   ├── api/                # API routes
│   │   │   └── ops/            # Ops-specific endpoints
│   │   │       ├── rescue/     # Rescue system API
│   │   │       ├── webhooks/   # Webhook management
│   │   │       └── auth/       # Auth endpoints
│   │   ├── ops/                # Public ops routes
│   │   │   └── login/          # Ops login page
│   │   ├── layout.tsx          # Root layout
│   │   └── global-error.tsx    # Global error handler
│   ├── components/             # React components
│   │   ├── ops/                # Ops console components
│   │   ├── merchants/          # Merchant management UI
│   │   ├── rescue/             # Rescue system UI
│   │   └── ui/                 # Shared UI
│   ├── lib/                    # Utilities and services
│   │   ├── ops-auth.ts         # Ops authentication
│   │   ├── rescue/             # Rescue services
│   │   │   ├── rescue.service.ts
│   │   │   ├── rescue-client.ts
│   │   │   └── rescue-service.ts
│   │   └── logger.ts           # Logging utility
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets
└── package.json
```

## Key Features

### 1. Merchant Management

**Location:** `/merchants` route

**Capabilities:**
- **Merchant List** - View all platform merchants
- **Merchant Details** - Full merchant profile
- **Onboarding Status** - Track KYC and setup progress
- **Plan Management** - Upgrade/downgrade subscriptions
- **Store Status** - Enable/disable stores
- **Impersonation** - Login as merchant for support

**Merchant Statuses:**
```
ONBOARDING → ACTIVE → SUSPENDED
    ↓           ↓          ↓
PENDING_KYC  DORMANT    BANNED
```

### 2. Order Oversight

**Location:** `/orders` route

**Capabilities:**
- **Platform Orders** - View all orders across merchants
- **Order Search** - Find by ID, customer, or merchant
- **Dispute Resolution** - Handle order disputes
- **Refund Approval** - Approve large refunds
- **Fraud Detection** - Flag suspicious orders

### 3. User Management

**Location:** `/users` route

**Capabilities:**
- **User List** - All platform users
- **User Details** - Profile and activity
- **Role Management** - Assign ops roles
- **Access Control** - Manage permissions
- **Session Management** - View/revoke sessions

### 4. Financial Overview

**Location:** `/finance` route

**Capabilities:**
- **Platform Revenue** - Aggregated earnings
- **Payout Management** - Track merchant payouts
- **Fee Structure** - Platform fee configuration
- **Transaction Log** - All financial transactions
- **Reports** - Financial reports and exports

### 5. Vayva Rescue System

**Location:** `/rescue` route

The Ops Console is the **central hub** for the [Vayva Rescue](../../05_operations/automation/vayva-rescue.md) system.

**Capabilities:**
- **Incident List** - View all platform incidents
- **Incident Details** - AI analysis and recommendations
- **Runbook Execution** - Automated remediation
- **Audit Log** - Complete incident history
- **Configuration** - Rescue system settings

**Incident Views:**
- Filter by status (OPEN, ACKED, RESOLVED, CLOSED)
- Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
- Filter by surface (MERCHANT_ADMIN, STOREFRONT, OPS, WORKER)
- Sort by created/updated time

**Runbooks:**
| Runbook | Description |
|---------|-------------|
| `webhook-recovery` | Retry failed webhooks |
| `job-stuck-mitigation` | Detect stuck jobs |
| `auth-sync-repair` | Fix session issues |

### 6. Webhook Management

**Location:** `/webhooks` route

**Capabilities:**
- **Webhook Events** - View all webhook deliveries
- **Replay** - Manually retry failed webhooks
- **Providers** - Paystack, Kwik, etc.
- **Logs** - Delivery history and responses

### 7. Runbook & SOPs

**Location:** `/runbook` route

**Standard Operating Procedures:**
- Incident response workflows
- Platform maintenance procedures
- Merchant support playbooks
- Emergency contacts

## Authentication & Authorization

**Auth System:** Custom ops authentication (`lib/ops-auth.ts`)

**Roles:**

| Role | Permissions |
|------|-------------|
| `OPS_OWNER` | Full platform access |
| `OPS_ADMIN` | Most operations, no deletion |
| `OPS_OPERATOR` | Day-to-day operations |
| `OPS_SUPPORT` | View-only, basic support |
| `OPS_FINANCE` | Financial data only |
| `OPS_ENGINEER` | Technical operations |

**Authentication Flow:**
1. Navigate to `/ops/login`
2. Enter ops credentials
3. MFA verification (if enabled)
4. Redirect to intended page or dashboard

**Session Management:**
- Sessions stored in `OpsSession` table
- Expires after configurable timeout
- Can be revoked by admins

## API Routes

### Rescue System

```
GET    /api/ops/rescue/incidents              # List incidents
GET    /api/ops/rescue/incidents/:id          # Get incident
POST   /api/ops/rescue/incidents/:id/actions  # Perform action
POST   /api/ops/rescue/runbooks               # Execute runbook
GET    /api/ops/rescue/runbooks               # List runbooks
```

### Webhooks

```
GET    /api/ops/webhooks                      # List webhook events
POST   /api/ops/webhooks/:id/replay           # Replay webhook
GET    /api/ops/webhooks/stats                # Webhook statistics
```

### Auth

```
POST   /api/ops/auth/login                    # Login
POST   /api/ops/auth/logout                   # Logout
GET    /api/ops/auth/session                  # Get current session
POST   /api/ops/auth/mfa/verify               # Verify MFA
```

## Rescue Service Implementation

**Files:**
- `src/lib/rescue/rescue.service.ts` - Main service
- `src/lib/rescue/rescue-client.ts` - Groq client
- `src/lib/rescue/rescue-service.ts` - Alternative implementation

**Key Classes:**

```typescript
// RescueService - Main entry point
class RescueService {
  static async intakeIncident(report: IncidentReport, actorOpsUserId?: string): Promise<IncidentAnalysis>
  private static async diagnoseError(report: IncidentReport): Promise<string | null>
  private static extractRemediation(diagnosis: string): string[]
  private static extractClassification(diagnosis: string): string
  private static extractEscalation(diagnosis: string): string
}

// RescueGroqClient - AI client
class RescueGroqClient {
  sanitizeInput(text: string): string
  async diagnosticCompletion(messages, options): Promise<string | null>
}
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_APP_URL=https://ops.vayva.ng
NEXT_PUBLIC_API_URL=https://api.vayva.ng

# Auth
OPS_AUTH_SECRET=
OPS_SESSION_TIMEOUT=3600

# Rescue System
GROQ_API_KEY_RESCUE=
OPS_RESCUE_ENABLE=true

# Internal API
INTERNAL_API_SECRET=
```

## Deployment

**Platform:** Vercel

**Domains:**
- Production: `ops.vayva.ng`
- Staging: `staging-ops.vayva.ng`

**Security:**
- IP allowlisting recommended
- MFA enforced for all ops users
- Audit logging for all actions

## Monitoring

- Vercel Analytics
- Sentry error tracking
- Custom ops metrics dashboard
- Rescue system health checks

## Runbook: Ops Console Access

### New Ops User Onboarding

1. **Create Account:**
   ```sql
   INSERT INTO "OpsUser" (id, email, name, role, status)
   VALUES (gen_random_uuid(), 'user@vayva.ng', 'Name', 'OPS_SUPPORT', 'ACTIVE');
   ```

2. **Set Password:**
   - User receives invite email
   - Clicks link to set password
   - Configures MFA (recommended)

3. **Verify Access:**
   - Login at `https://ops.vayva.ng/ops/login`
   - Verify dashboard loads
   - Check permissions match role

### Emergency Access

If primary ops console is down:
1. Check Vercel status
2. Verify database connectivity
3. Use direct database access (read-only)
4. Contact platform engineering

## Related Documentation

- [Vayva Rescue System](../../05_operations/automation/vayva-rescue.md)
- [Incident Response](../../05_operations/incident-response.md)
- [Access Control](../../06_security_compliance/access-control.md)
- [Core API Documentation](../core-api/)

---

**Emergency Contact:** @engineering-on-call (Slack)  
**Questions?** Check the [Operations Guide](../../05_operations/)
