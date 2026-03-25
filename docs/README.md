# Vayva documentation

This folder is the **single home** for product, engineering, operations, security, and business documentation. Paths below are relative to `docs/` (repository root: `docs/...`).

**Accuracy:** These docs are **not** automatically validated against the running platform or every code path. Numbers (pricing, FX, allocations) can **drift** between files — e.g. [`09_business/operational-expenses.md`](09_business/operational-expenses.md) vs [`09_business/unit-economics.md`](09_business/unit-economics.md). **Production infrastructure** is **two VPS servers** (database stack vs application/services stack) plus **Vercel** for frontends — see [`04_deployment/vps-infrastructure.md`](04_deployment/vps-infrastructure.md). Unused AWS Terraform under `infra/terraform/` has been **removed** from the repo.

---

## Start here (by role)

| If you are… | Start with |
|---|---|
| **New engineer** | [`00_start-here/new-user-onboarding/developer-onboarding.md`](00_start-here/new-user-onboarding/developer-onboarding.md) → [`03_development/local-setup.md`](03_development/local-setup.md) |
| **Setting up locally** | [`00_start-here/getting-started.md`](00_start-here/getting-started.md) |
| **Understanding the system** | [`00_start-here/platform-overview.md`](00_start-here/platform-overview.md) |
| **Shipping to production** | [`04_deployment/procedures/deployment-checklist.md`](04_deployment/procedures/deployment-checklist.md) → [`04_deployment/environment-variables.md`](04_deployment/environment-variables.md) |
| **On-call / operations** | [`05_operations/operations-handbook.md`](05_operations/operations-handbook.md) → [`05_operations/incident-management/incident-response-runbook.md`](05_operations/incident-management/incident-response-runbook.md) |
| **Security & compliance** | [`06_security_compliance/policies/information-security-policy.md`](06_security_compliance/policies/information-security-policy.md) → [`truth_compliance/QUICK_START.md`](truth_compliance/QUICK_START.md) |
| **Product / GTM / finance** | [`01_product/product-overview.md`](01_product/product-overview.md) → [`09_business/company-overview.md`](09_business/company-overview.md) |
| **Support & merchants** | [`07_support/onboarding-guide.md`](07_support/onboarding-guide.md) → [`07_support/merchant-faq.md`](07_support/merchant-faq.md) |

---

## How folders are numbered

Prefixes group docs by **concern**, not by reading order. Use the table above for order; use this list for **where to file** new documents.

| Prefix | Topic | What belongs here |
|---:|---|---|
| **00** | Start here | Onboarding, getting started, platform overview |
| **01** | Product | Personas, features, merchant guides, pricing (product-facing) |
| **02** | Engineering architecture | Backend/frontend architecture, database schema |
| **03** | Development | Local setup, git, testing, coding standards, E2E |
| **04** | Deployment | Environments, Vercel, env vars, monitoring, checklists |
| **05** | Operations | Runbooks, cron/jobs, Redis/DB maintenance, finance ops, ops-console guide |
| **06** | Security & compliance | Policies, audits, webhooks, rate limits, incident procedures |
| **07** | Applications & support | Per-app overviews (`07_applications/*`), support playbooks (`07_support/*`) |
| **08** | Reference | ADRs, glossary, vendor pricing, integrations, deep audits |
| **09** | Business | Revenue model, projections, marketing, partnerships, unit economics |
| **`truth_compliance/`** | Audits & readiness | Implementation tracking, legal/compliance audits, deployment runbooks (see below) |

---

## Directory map

### 00 — Start here

| Document | Purpose |
|---|---|
| [`getting-started.md`](00_start-here/getting-started.md) | Clone, install, env, run apps locally |
| [`platform-overview.md`](00_start-here/platform-overview.md) | Stack, monorepo layout, domains |
| [`new-user-onboarding/developer-onboarding.md`](00_start-here/new-user-onboarding/developer-onboarding.md) | First-week engineer checklist |
| [`new-user-onboarding/new-user-flow.md`](00_start-here/new-user-onboarding/new-user-flow.md) / [`existing-user-flow.md`](00_start-here/new-user-onboarding/existing-user-flow.md) | User journey references |

### 01 — Product

| Document | Purpose |
|---|---|
| [`product-overview.md`](01_product/product-overview.md) | High-level product narrative |
| [`features/feature-catalog.md`](01_product/features/feature-catalog.md) | Feature inventory |
| [`merchant-guide.md`](01_product/merchant-guide.md) | Merchant-facing workflow |
| [`pricing-and-billing.md`](01_product/pricing-and-billing.md) | Tiers and billing concepts |
| [`ai-and-automation.md`](01_product/ai-and-automation.md) | AI/credits overview |
| [`user-personas/target-personas.md`](01_product/user-personas/target-personas.md) | ICPs |

### 02 — Engineering

| Document | Purpose |
|---|---|
| [`backend-architecture.md`](02_engineering/backend-architecture.md) | API, services, jobs |
| [`frontend-architecture.md`](02_engineering/frontend-architecture.md) | Next.js apps, patterns |
| [`database-schema.md`](02_engineering/database-schema.md) | Data model reference |

### 03 — Development

| Document | Purpose |
|---|---|
| [`local-setup.md`](03_development/local-setup.md) | Detailed local dev |
| [`git-workflow.md`](03_development/git-workflow.md) | Branching and PRs |
| [`testing-strategy.md`](03_development/testing-strategy.md) | Test pyramid, tools |
| [`coding-standards.md`](03_development/coding-standards.md) | Style and conventions |
| [`e2e-merchant-smoke.md`](03_development/e2e-merchant-smoke.md) | Smoke E2E scope |

### 04 — Deployment

| Document | Purpose |
|---|---|
| [`environment-variables.md`](04_deployment/environment-variables.md) | Env reference |
| [`environments/environment-matrix.md`](04_deployment/environments/environment-matrix.md) | Env comparison, **VPS hosts/ports** |
| [`vps-infrastructure.md`](04_deployment/vps-infrastructure.md) | **VPS hub** — links to cost, matrix, deploy, security |
| [`vercel-deployment.md`](04_deployment/vercel-deployment.md) | Vercel specifics |
| [`procedures/deployment-checklist.md`](04_deployment/procedures/deployment-checklist.md) | Release checklist |
| [`monitoring/monitoring-strategy.md`](04_deployment/monitoring/monitoring-strategy.md) | Observability |

### 05 — Operations

| Document | Purpose |
|---|---|
| [`operations-handbook.md`](05_operations/operations-handbook.md) | Day-2 ops hub |
| [`ops-console-guide.md`](05_operations/ops-console-guide.md) | Internal console usage |
| [`automation/cron-jobs.md`](05_operations/automation/cron-jobs.md) / [`job-queue-operations.md`](05_operations/automation/job-queue-operations.md) | Schedules and queues |
| [`maintenance/database-maintenance.md`](05_operations/maintenance/database-maintenance.md) / [`redis-operations.md`](05_operations/maintenance/redis-operations.md) | Data layer ops |
| [`finance/wallet-payouts.md`](05_operations/finance/wallet-payouts.md) | Payout procedures |

### 06 — Security & compliance

| Document | Purpose |
|---|---|
| [`policies/`](06_security_compliance/policies/) | Privacy, security, data protection |
| [`procedures/`](06_security_compliance/procedures/) | Access control, incidents, breach response |
| [`audits/`](06_security_compliance/audits/) | Security audit, NDPR checklist |
| [`webhooks.md`](06_security_compliance/webhooks.md) / [`rate-limiting.md`](06_security_compliance/rate-limiting.md) | Hardening topics |

### 07 — Applications & support

**Applications** (`07_applications/`): one overview per surface — merchant, storefront, marketing, ops-console, core-api, worker, ai-agent.

**Support** (`07_support/`): onboarding guide, FAQ, escalation, customer support playbook.

### 08 — Reference

| Document | Purpose |
|---|---|
| [`glossary/platform-glossary.md`](08_reference/glossary/platform-glossary.md) | Terms |
| [`vendor-pricing-register.md`](08_reference/vendor-pricing-register.md) | Vendors, env hints, billing model |
| [`ai-pricing-and-credits.md`](08_reference/ai-pricing-and-credits.md) | AI unit economics |
| [`adr/`](08_reference/adr/) | Architecture decision records |
| [`integrations/`](08_reference/integrations/) | Paystack, WhatsApp, Shopify, Stripe, etc. |

### 09 — Business

| Document | Purpose |
|---|---|
| [`company-overview.md`](09_business/company-overview.md) | Company narrative |
| [`revenue-model.md`](09_business/revenue-model.md) | Streams and assumptions |
| [`operational-expenses.md`](09_business/operational-expenses.md) | Infra + vendor + launch envelope |
| [`financial-projections.md`](09_business/financial-projections.md) | P&L-style projections |
| [`unit-economics.md`](09_business/unit-economics.md) | Per-merchant economics |
| [`marketing-plan.md`](09_business/marketing-plan.md) | GTM and budgets |
| [`go-to-market-strategy.md`](09_business/go-to-market-strategy.md) | Market motion |
| Other files | Partnerships, competitive analysis, investor outline, customer success, etc. |

### `truth_compliance/` — Audits, readiness, and deep implementation notes

These files track **compliance workstreams**, **production readiness**, and **deployment/legal audits**. They are not a substitute for `06_security_compliance/policies/` for policy text, but they are the right place for **checklists and verification** tied to releases.

| Entry | Use when |
|---|---|
| [`QUICK_START.md`](truth_compliance/QUICK_START.md) | Fast orientation |
| [`EXECUTIVE_SUMMARY.md`](truth_compliance/EXECUTIVE_SUMMARY.md) | Leadership snapshot |
| [`DEPLOYMENT_RUNBOOK.md`](truth_compliance/DEPLOYMENT_RUNBOOK.md) | Step-by-step deploy/compliance steps |
| [`PRODUCTION_READINESS_CERTIFICATE.md`](truth_compliance/PRODUCTION_READINESS_CERTIFICATE.md) | Readiness criteria |
| [`DASHBOARD_FEATURE_AUDIT.md`](truth_compliance/DASHBOARD_FEATURE_AUDIT.md) | Product truth vs build |
| Other `*_SUMMARY.md`, `*_CHECKLIST.md`, `*_REPORT.md` | Specific initiatives (gating, legal hub, DB migration, etc.) |

---

## Adding new documentation

1. Pick the **numbered folder** that matches the table in [How folders are numbered](#how-folders-are-numbered).
2. Prefer **one topic per file**; link out instead of duplicating long sections.
3. Add a **one-line link** in the relevant subsection of this README if the doc is a **primary** entry point.
4. For vendor or pricing facts, update [`08_reference/vendor-pricing-register.md`](08_reference/vendor-pricing-register.md) and, if needed, [`09_business/operational-expenses.md`](09_business/operational-expenses.md).

---

## Root repository

The monorepo [`README.md`](../README.md) describes folder layout and tech stack; this `docs/README.md` is the **navigation layer** for everything under `docs/`.
