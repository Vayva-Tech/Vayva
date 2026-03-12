# Production Deployment (End-to-end)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Goal
Deploy Vayva to production safely with rollback paths.

## 0) Golden rules
- Never deploy without a rollback plan.
- Never run DB changes without backups.
- Prefer small changes.

## 1) Pre-deploy checklist
- CI is green.
- Secrets are set in correct environments.
- Ops team is aware of deploy window.

## 2) Vercel deploy
Follow `vercel-deploy.md`.

Verification:
- `https://vayva.ng`
- `https://merchant.vayva.ng`
- `https://ops.vayva.ng`

## 3) VPS deploy (if applicable)
### 3.1 App server (VPS 1)
Follow `vps-app-server.md`.

Verify:
- Evolution API reachable via `https://api.vayva.ng`
- MinIO reachable via `https://storage.vayva.ng`

### 3.2 Worker
Follow `vps-worker.md`.

Verify:
- `systemctl status vayva-worker`
- queues draining

### 3.3 DB server (VPS 2)
Follow `vps-db-server.md`.

Verify:
- Postgres accepts connections from app server
- Redis accepts connections from app server

## 4) Post-deploy validation
- Merchant login
- Storefront checkout
- Paystack webhook
- Worker processes at least one job

## 5) Rollback
Follow `rollback.md`.
