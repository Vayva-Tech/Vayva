# Operations Console Guide

> Last updated: 2026-03-23
> Application: `Frontend/ops-console` at `ops.vayva.ng`

---

## Overview

The Vayva Operations Console is an internal-only application used by the Vayva team to monitor, manage, and operate the entire platform. It provides visibility into merchant activity, financial health, AI usage, compliance status, and system health. Only authorized Vayva team members have access.

---

## Authentication

### Login

The ops console uses a separate authentication system from the merchant dashboard. Access is through `ops.vayva.ng/ops/login` with:

- **Email + password** credentials (dedicated ops user accounts, stored in `OpsUser` model)
- **MFA support** -- optional multi-factor authentication via code entry
- **Session management** via `OpsSession` model
- **Environment indicator** -- the login page displays whether the environment is PRODUCTION or STAGING

### Authorization Model

All API routes in the ops console are wrapped with `withOpsAuth()` -- a structural auth wrapper that makes it impossible to accidentally expose an unprotected endpoint.

#### Roles

The ops console supports 14 roles with hierarchical permissions:

| Role | Access Level |
|------|-------------|
| `OPS_OWNER` | Full platform access -- can manage all settings, users, and data |
| `OPS_ADMIN` | Administrator -- can manage users and most settings |
| `SUPERVISOR` | Operations supervisor -- can approve/reject actions |
| `OPERATOR` | General operator -- read-only access to most areas |
| `CUSTOMER_SUPPORT` | Support agent -- tickets and basic merchant view |
| `CUSTOMER_SUPPORT_LEAD` | Support lead -- can escalate and view reports |
| `DEVELOPER` | Dev team -- API access, logs, technical tools |
| `DEVOPS` | DevOps -- infrastructure, health monitoring |
| `INVESTOR` | Investor/analyst -- analytics and financial data (read-only) |
| `FINANCE` | Finance team -- payments, refunds, revenue |
| `GROWTH_MANAGER` | Growth -- marketing, campaigns, partnerships |
| `CONTENT_MODERATOR` | Content -- marketplace listings, reviews |
| `COMPLIANCE_OFFICER` | Compliance -- KYC, fraud, risk flags |
| `OPS_SUPPORT` | Legacy support role |

#### Permission System

Permissions are defined by **category** and **action**:

**Categories:** dashboard, analytics, merchants, orders, kyc, disputes, support, users, finance, settings, audit, communications, partners, risk, security, tools, webhooks, rescue, growth, content

**Actions:** view, create, update, delete, approve, export

Routes can require:
- A specific **role** (e.g., `OPS_OWNER` only)
- A specific **permission** (e.g., `{ category: "kyc", action: "approve" }`)
- Access to a **category** (any action within it)

---

## Key Dashboards and Pages

### Top-Level Dashboards

| Dashboard | Path | Purpose |
|-----------|------|---------|
| Monitoring | `/monitoring` | Platform health, uptime, and system metrics |
| Revenue | `/revenue` | Revenue overview, MRR, churn, growth trends |
| Customer Success | `/customer-success` | Merchant health scores, at-risk accounts, retention |

### Merchant Management

| Page | Path | Purpose |
|------|------|---------|
| Merchants | `/ops/merchants` | Full merchant directory with search, filter, and drill-down |
| Merchant Detail | `/ops/merchants/[id]` | Individual merchant profile, store settings, activity log |
| Onboarding | `/ops/onboarding` | Monitor merchants in the onboarding pipeline, identify stuck accounts |
| Rescue | `/ops/rescue` | AI-assisted merchant rescue -- intervene when merchants are struggling |

**What you can do:**
- View and search all merchant accounts
- See store status (live, onboarding, inactive)
- Review subscription tier and billing status
- Check onboarding progress and completion
- Identify and assist struggling merchants via the Rescue tool

### Order and Payment Monitoring

| Page | Path | Purpose |
|------|------|---------|
| Orders | `/ops/orders` | Platform-wide order monitoring |
| Payments | `/ops/payments` | Payment processing oversight |
| Payouts | `/ops/payouts` | Merchant withdrawal management |
| Subscriptions | `/ops/subscriptions` | Subscription lifecycle tracking |

**What you can do:**
- Monitor all orders across the platform
- Track payment processing status
- Manage merchant payout requests
- View subscription status and billing history
- Identify payment failures and stuck transactions

### Financial Reporting

| Page | Path | Purpose |
|------|------|---------|
| Financials | `/ops/financials` | Platform financial reporting |
| Analytics | `/ops/analytics` | Sales and growth analytics |
| Revenue (historical) | API: `/api/revenue/historical` | Historical revenue data |

**Key metrics:**
- Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Churn rate
- Transaction volume and value
- Withdrawal fees collected
- AI credit revenue

### AI Monitoring

| Page | Path | Purpose |
|------|------|---------|
| AI | `/ops/ai` | AI usage monitoring across all merchants |

**What you can do:**
- View AI credit usage per merchant
- Monitor credit consumption trends
- Identify merchants approaching credit exhaustion
- Track model usage distribution (GPT-4o Mini vs. Llama vs. fallbacks)
- Review AI subscription statuses

### Compliance and Verification

| Page | Path | Purpose |
|------|------|---------|
| Compliance | `/ops/compliance` | Regulatory compliance overview |
| KYC | `/ops/kyc` | Identity verification management |
| Risk | `/ops/risk` | Risk assessment dashboard |
| Fraud Detection | `/api/webhooks/fraud-detection` | Automated fraud signals |

**What you can do:**
- Review and approve/reject KYC submissions
- Monitor compliance status across merchants
- Flag and investigate suspicious activity
- Manage abuse rules
- Track signup abuse signals

### Dispute Resolution

| Page | Path | Purpose |
|------|------|---------|
| Disputes | `/ops/disputes` | Payment dispute management |
| Refunds | `/ops/refunds` | Refund processing and approval |

### Customer Support

| Page | Path | Purpose |
|------|------|---------|
| Support | `/ops/support` | Support ticket management |
| Live Chat | `/ops/live-chat` | Real-time chat with merchants |
| Inbox | `/ops/inbox` | Unified support inbox |

### System Health

| Page | Path | Purpose |
|------|------|---------|
| Health | `/ops/health` | System health monitoring |
| Alerts | `/ops/alerts` | Alert configuration and history |
| Runbook | `/ops/runbook` | Operational runbooks for common incidents |

### Platform Management

| Page | Path | Purpose |
|------|------|---------|
| Security | `/ops/security` | Security settings and audit |
| Team | `/ops/team` | Ops team member management |
| Users | `/ops/users` | User account management |
| Settings | `/ops/settings` | Platform-level settings |
| Webhooks | `/ops/webhooks` | Webhook logs and configuration |
| Developers | `/ops/developers` | Developer tools and API monitoring |
| Partners | `/ops/partners` | Partner program management |
| Marketplace | `/ops/marketplace` | Marketplace management |

### Admin Pages

| Page | Path | Purpose |
|------|------|---------|
| Subprocessors | `/admin/subprocessors` | Third-party subprocessor registry (NDPR compliance) |
| Cookie Consent | `/analytics/cookie-consent` | Cookie consent analytics |

---

## Key Monitoring Workflows

### Daily Operations Checklist

1. **Check system health** at `/ops/health` -- verify all services are operational
2. **Review alerts** at `/ops/alerts` -- address any triggered alerts
3. **Monitor orders** at `/ops/orders` -- check for stuck or failed orders
4. **Review payouts** at `/ops/payouts` -- process pending withdrawal requests
5. **Check KYC queue** at `/ops/kyc` -- approve/reject pending verifications
6. **Review support tickets** at `/ops/support` -- respond to merchant issues

### Merchant Onboarding Monitoring

1. Navigate to `/ops/onboarding` to see the onboarding pipeline
2. Identify merchants stuck at specific steps (common: payment setup, KYC)
3. Use the Rescue tool at `/ops/rescue` for AI-assisted intervention
4. Contact merchants directly through the support inbox

### Revenue Monitoring

1. Check `/revenue` for daily/weekly/monthly revenue trends
2. Review subscription churn at `/ops/subscriptions`
3. Monitor AI credit revenue at `/ops/ai`
4. Export financial reports from `/ops/financials`

### Incident Response

1. Check `/ops/health` for system status
2. Review `/ops/runbook` for the relevant playbook
3. Monitor affected merchants at `/ops/merchants`
4. Communicate via support channels
5. Log the incident in the audit trail

---

## Audit Logging

All sensitive operations in the ops console create entries in the `AdminAuditLog` model:

- Who performed the action (ops user ID and role)
- What action was taken
- Which resource was affected
- Timestamp and IP address
- Before and after state (where applicable)

The regular `AuditLog` model tracks merchant-side actions. Both are accessible from the ops console for compliance investigations.

---

## Technical Details

- **Framework:** Next.js (App Router) with React 19
- **UI:** Radix UI components, Tailwind CSS, Lucide icons
- **Auth wrapper:** `withOpsAuth()` from `Frontend/ops-console/src/lib/withOpsAuth.ts`
- **Auth service:** `OpsAuthService` from `Frontend/ops-console/src/lib/ops-auth.ts`
- **Role system:** `Frontend/ops-console/src/lib/roles.ts`
- **Deployment:** Vercel at `ops.vayva.ng`
- **React Compiler:** Enabled for performance optimization
- **TypeScript:** Build errors currently ignored (`ignoreBuildErrors: true`) due to pending Prisma migrations
