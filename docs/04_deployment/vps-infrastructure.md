# VPS infrastructure (self-hosted backend)

> **Purpose:** One place to find **where** the VPS is described in this repo, **what** runs on it, and **how** that relates to code and cost docs.  
> **Not a substitute** for the linked runbooks — read those for procedures.

---

## What production uses (repo-aligned)

Vayva runs on **two VPS hosts** (see finance baseline **$35 + $35/mo** in [`../09_business/operational-expenses.md`](../09_business/operational-expenses.md) §2.2), not on AWS compute:

| Server role | Typical workloads (per ops docs) |
|---|---|
| **Database VPS** | PostgreSQL, Redis (and related data-layer services) |
| **Application / services VPS** | Core API and app processes, worker, MinIO (if self-hosted there), Evolution API (WhatsApp), optional monitoring |

**Frontends:** deployed on **Vercel** (`merchant`, `marketing`, `ops-console`, `storefront` as documented in [`environment-matrix.md`](environments/environment-matrix.md)).

**In-repo deploy artifact:** [`vps-sync/ecosystem.config.js`](../../vps-sync/ecosystem.config.js) defines **PM2** apps under `/opt/vayva/apps/*` (e.g. `core-api` on port 4000, merchant 3000) for the self-hosted side — this is the concrete “how we run on VPS” config in the tree.

**S3-compatible client:** upload code uses an **S3 protocol client** with **`MINIO_*`** endpoints, e.g. [`Backend/core-api/src/lib/storage/storageService.ts`](../../Backend/core-api/src/lib/storage/storageService.ts). That targets **MinIO** (or any S3-compatible store) on your VPS, not a third-party object-storage cloud as primary hosting.

**Optional enterprise secrets:** [`packages/secrets/src/vault.ts`](../../packages/secrets/src/vault.ts) supports **HashiCorp Vault** and **Azure Key Vault** backends when configured.

---

## Canonical references (by topic)

| Topic | Document |
|---|---|
| **Hosts, ports, env matrix** (staging/prod URLs, `163.245.209.x`, DB/Redis/Evolution) | [`environments/environment-matrix.md`](environments/environment-matrix.md) |
| **Monthly cost** ($35 + $35, provider name, scaling notes) | [`../09_business/operational-expenses.md`](../09_business/operational-expenses.md) §2.2 |
| **Vendor line item** (baseline $70/mo) | [`../08_reference/vendor-pricing-register.md`](../08_reference/vendor-pricing-register.md) |
| **Worker / manual deploy** | [`procedures/deployment-checklist.md`](procedures/deployment-checklist.md) — Backend Workers (VPS) |
| **Database backups, cron on VPS** | [`../05_operations/maintenance/database-maintenance.md`](../05_operations/maintenance/database-maintenance.md) |
| **WhatsApp gateway** | [`../08_reference/integrations/whatsapp-evolution-api.md`](../08_reference/integrations/whatsapp-evolution-api.md) |
| **Why frontends are not on VPS** | [`../08_reference/adr/003-vercel-deployment.md`](../08_reference/adr/003-vercel-deployment.md) |
| **SSH access, secrets on VPS** | [`../06_security_compliance/procedures/access-control-procedures.md`](../06_security_compliance/procedures/access-control-procedures.md) |
| **Outage / DB unreachable playbooks** | [`../truth_compliance/VPS_DATABASE_OUTAGE_ACTION_PLAN.md`](../truth_compliance/VPS_DATABASE_OUTAGE_ACTION_PLAN.md) |

**Deploy config hints in repo:** `platform/scripts/deploy/.env.app`, `vps-sync/.env.production` / `vps-sync/.env.example` (paths cited in the environment matrix).

---

## Repo truth vs narrative docs

1. **Finance consistency:** [`../09_business/unit-economics.md`](../09_business/unit-economics.md) splits VPS into line items (e.g. appserver vs dbserver **₦** amounts) that are **allocation models** for per-merchant math. [`../09_business/operational-expenses.md`](../09_business/operational-expenses.md) uses **$35 + $35/mo** as the **baseline bill**. Those sections are not guaranteed to use the same FX or the same “4 Vercel projects vs one Pro line” assumptions — **reconcile** when you publish external numbers.

2. **IPs and hostnames** in `environment-matrix.md` are **operational documentation**, not enforced by TypeScript. Actual values live in **env files and deployment**; if hosts move, update the matrix and any runbooks that cite IPs.

---

## Quick checklist when something changes

- [ ] `docs/04_deployment/environments/environment-matrix.md` — URLs, IPs, ports  
- [ ] `docs/08_reference/vendor-pricing-register.md` + `docs/09_business/operational-expenses.md` — if provider or monthly price changes  
- [ ] `docs/04_deployment/procedures/deployment-checklist.md` — if deploy path changes  
- [ ] Security docs citing `163.245.209.x` — if network layout changes  

---

*This file is an index and consistency notice, not a live monitoring dashboard.*
