# Deployment Checklist

> Last updated: 2026-03-23
> Owner: Engineering
> Deployment target: Vercel (all frontends), VPS (backend workers)
> Production branch: `Vayva`

---

## Overview

Vayva deploys four frontend applications via Vercel and background workers on a VPS. All deployments are triggered by pushes to the `Vayva` branch on GitHub. This checklist ensures safe, consistent deployments across all applications.

---

## Pre-Deployment Checks

### Code Quality

- [ ] All TypeScript errors resolved (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Code formatted (`pnpm format`)
- [ ] No `@ts-nocheck` or `@ts-ignore` directives added (fix actual errors instead)
- [ ] No hardcoded secrets, API keys, or credentials in code
- [ ] No hardcoded URLs (use environment variables)

### Testing

- [ ] Unit tests pass (`pnpm test`)
- [ ] E2E tests pass (`pnpm test:e2e`) -- at minimum, critical paths:
  - Merchant login and dashboard load
  - Product creation and listing
  - Order placement flow
  - Payment initiation
- [ ] Smoke tests pass (`pnpm test:smoke`)
- [ ] Manual testing of changed features in development environment

### CI Guards

- [ ] CI guard checks pass (`pnpm ci:guards`):
  - No hardcoded domains (must use environment variables)
  - Auth wrappers present on all protected routes
  - No IDOR vulnerabilities (storeId validation on all tenant-scoped endpoints)
  - Audit logging present on sensitive operations
- [ ] Security audit clean (`pnpm check:security`)
- [ ] Bundle size within limits (`pnpm check:bundle`)

### Database

- [ ] Prisma schema changes have a corresponding migration file
- [ ] Migration tested against a copy of production data
- [ ] Migration is backward-compatible (no column drops without prior code deployment)
- [ ] New required columns have default values
- [ ] Indexes added for new query patterns
- [ ] `pnpm db:generate` run and Prisma client updated

### Dependencies

- [ ] No new critical/high vulnerability dependencies (`pnpm audit`)
- [ ] `pnpm-lock.yaml` committed and up to date
- [ ] No unnecessary dependency additions

---

## Deployment Steps by Application

### Merchant Dashboard (`merchant.vayva.ng`)

**Auto-deploys from `Vayva` branch via Vercel.**

1. **Pre-deploy:**
   - Verify environment variables are current in Vercel project settings
   - Ensure `BACKEND_API_URL` points to the correct API endpoint
   - TypeScript errors must be fixed (this project does NOT ignore build errors)

2. **Deploy:**
   - Merge PR to `Vayva` branch (or push directly for hotfixes)
   - Vercel automatically detects changes in `Frontend/merchant/` and triggers build
   - Build command: `next build`
   - Monitor build logs in Vercel dashboard

3. **Post-deploy:**
   - Verify deployment at `merchant.vayva.ng`
   - Test login flow
   - Test dashboard data loading
   - Check Sentry for new errors
   - Verify cron job still registered (`/api/jobs/cron/trial-reminders`)

### Ops Console (`ops.vayva.ng`)

**Auto-deploys from `Vayva` branch via Vercel.**

1. **Pre-deploy:**
   - Note: TypeScript errors are currently ignored (`ignoreBuildErrors: true`)
   - Verify `DATABASE_URL` and `REDIS_URL` are set

2. **Deploy:**
   - Push to `Vayva` branch
   - Vercel detects changes in `Frontend/ops-console/`

3. **Post-deploy:**
   - Verify login at `ops.vayva.ng/ops/login`
   - Check platform health dashboard
   - Verify merchant listing loads

### Storefront (`store.vayva.ng`)

**Auto-deploys from `Vayva` branch via Vercel.**

1. **Pre-deploy:**
   - Note: TypeScript errors are currently ignored (`ignoreBuildErrors: true`)
   - Verify `PAYSTACK_PUBLIC_KEY` and `PAYSTACK_LIVE_SECRET_KEY` are set for production

2. **Deploy:**
   - Push to `Vayva` branch
   - Vercel detects changes in `Frontend/storefront/`

3. **Post-deploy:**
   - Visit a merchant's store URL to verify rendering
   - Test product page loading
   - Test checkout initiation
   - Verify Paystack integration (test transaction if needed)

### Marketing Site (`vayva.ng`)

**Auto-deploys from `Vayva` branch via Vercel.**

1. **Pre-deploy:**
   - Verify content changes are accurate
   - Check pricing information matches `config/pricing.ts`

2. **Deploy:**
   - Push to `Vayva` branch
   - Vercel detects changes in `Frontend/marketing/`

3. **Post-deploy:**
   - Verify homepage loads at `vayva.ng`
   - Check `www.vayva.ng` redirects correctly
   - Verify signup links point to `merchant.vayva.ng`

### Backend Workers (VPS)

**Manual deployment on VPS.**

1. **Pre-deploy:**
   - SSH into VPS
   - Check current worker status: `pm2 status` or `systemctl status vayva-worker`
   - Ensure no critical jobs are in-progress (check BullMQ queue depths)

2. **Deploy:**
   ```bash
   cd /opt/vayva
   git pull origin Vayva
   pnpm install
   pnpm db:generate
   pnpm --filter @vayva/worker build
   ```

3. **Restart workers:**
   ```bash
   pm2 restart vayva-worker
   # or
   systemctl restart vayva-worker
   ```

4. **Post-deploy:**
   - Verify workers are processing jobs: check queue depths are decreasing
   - Check for startup errors in worker logs
   - Verify scheduled jobs are registered

### Database Migrations

**Run separately before application deployment if schema changes are involved.**

1. **Pre-migration:**
   - Back up the database: `/opt/vayva/scripts/backup-database.sh`
   - Verify migration SQL is safe (review the generated SQL file)
   - Test migration against backup database

2. **Execute migration:**
   ```bash
   cd /opt/vayva
   pnpm --filter @vayva/db prisma migrate deploy
   ```

3. **Post-migration:**
   - Verify `_prisma_migrations` table shows the migration as applied
   - Run basic data integrity queries
   - Monitor for query errors in application logs

---

## Rollback Procedures

### Vercel Rollback (Frontend Applications)

1. Go to the Vercel dashboard for the affected project
2. Navigate to **Deployments**
3. Find the last known-good deployment
4. Click the three-dot menu and select **Promote to Production**
5. Verify the rollback is serving correctly

**Time to rollback:** < 2 minutes

### Database Rollback

Database migrations are generally forward-only. If a migration causes issues:

1. **If the migration is purely additive** (new tables, new columns with defaults): Leave the migration in place, roll back the application code. The old code will simply not use the new columns.

2. **If the migration is destructive** (dropped columns, renamed tables): Restore from backup.
   ```bash
   # Restore the pre-migration backup
   pg_restore --dbname=vayva --clean /opt/vayva/backups/postgres/pre_migration_backup.sql.gz
   ```

3. **Mark the migration as rolled back:**
   ```sql
   UPDATE "_prisma_migrations"
   SET rolled_back_at = NOW()
   WHERE migration_name = '{migration_name}';
   ```

### Worker Rollback

```bash
cd /opt/vayva
git checkout HEAD~1  # or specific known-good commit
pnpm install
pnpm db:generate
pnpm --filter @vayva/worker build
pm2 restart vayva-worker
```

---

## Post-Deployment Verification

### Immediate (within 5 minutes)

- [ ] Application loads without errors
- [ ] No new Sentry errors related to the deployment
- [ ] API response times are within normal range
- [ ] Authentication works (login/logout)

### Short-term (within 1 hour)

- [ ] Monitor error rates in Sentry -- compare with pre-deployment baseline
- [ ] Verify Vercel function execution times are normal
- [ ] Check BullMQ queues are processing (no backlog)
- [ ] Verify external integrations are functional:
  - [ ] Paystack webhooks processing
  - [ ] WhatsApp messages sending/receiving
  - [ ] AI responses generating correctly
  - [ ] Email delivery working

### Extended (within 24 hours)

- [ ] Review Sentry for any slow-building error patterns
- [ ] Check database query performance (no new slow queries)
- [ ] Verify scheduled jobs ran successfully (cron tasks)
- [ ] Review merchant feedback for any issues

---

## Hotfix Procedure

For urgent production fixes:

1. Create a branch from `Vayva`: `git checkout -b hotfix/brief-description Vayva`
2. Make the minimal fix. Do not bundle unrelated changes.
3. Run `pnpm typecheck && pnpm lint && pnpm test`
4. Push and create a PR against `Vayva`
5. Get one approval (expedited review)
6. Merge to `Vayva` -- Vercel auto-deploys
7. Monitor deployment closely for 30 minutes
8. If the fix involves workers, SSH to VPS and deploy manually

---

## Deployment Coordination

### When Multiple Apps Are Affected

If a change spans multiple apps (e.g., shared package update):

1. Deploy in order: **database migration > backend workers > merchant > storefront > ops-console > marketing**
2. Wait for each deployment to succeed before proceeding
3. If any step fails, assess whether to rollback all or just the failed app

### Communication

- **Routine deployments:** No notification needed
- **Breaking changes or maintenance:** Notify the team 1 hour before
- **Emergency hotfixes:** Notify immediately, follow incident response process

---

## Related Documents

- [Vercel Deployment](../vercel-deployment.md)
- [Environment Variables](../environment-variables.md)
- [Monitoring Strategy](../monitoring/monitoring-strategy.md)
- [Incident Response Runbook](../../05_operations/incident-management/incident-response-runbook.md)
- [Database Maintenance](../../05_operations/maintenance/database-maintenance.md)
