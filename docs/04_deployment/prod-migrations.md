# Production Database Migrations (Prisma)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Document how schema changes are applied safely in production.

## Rules
- Backups come first. Do not run *any* schema change on production without a verified backup.
- Prefer additive / backward-compatible changes (expand → backfill → contract).
- Always rehearse on staging against production-like data volume.
- Production uses **Prisma migrations** (`prisma migrate deploy`). Do not use `db:push` on production.
- Every migration PR must include:
  - a rollback plan
  - a verification plan
  - a note about runtime compatibility (old app vs new schema)

## Source of truth
- Root Prisma schema path (from root `package.json`):
  - `platform/infra/db/prisma/schema.prisma`
- Migrations directory:
  - `platform/infra/db/prisma/migrations/`

## Scope
This doc covers **production** (real customer data) and **staging** (rehearsal) workflows.

If you need to iterate on schema locally, use the development workflow, but never copy/paste dev shortcuts into production runbooks.

## Recommended workflow (backup-first)
This is the safe sequence.

### Phase A — Prepare (PR stage)
1. Update the Prisma schema.
2. Generate a migration locally:
   - `prisma migrate dev` (creates a migration folder + updates migration lock state)
3. Ensure you can generate Prisma client and run checks:
   - typecheck
   - tests
4. Write the migration runbook in the PR description:
   - backup steps
   - deploy order
   - verification checklist
   - rollback plan

### Phase B — Rehearse in staging
1. Deploy the exact commit you intend to ship.
2. Take a staging DB backup.
3. Run `prisma migrate deploy` against the staging DB.
4. Verify core flows:
   - merchant login
   - dashboard loads (no 500s)
   - checkout/payment
   - worker jobs / queues
   - webhook processing

### Phase C — Production window
1. Choose a low-traffic window.
2. Announce a change window (internal).
3. Take production backup (required).
4. Apply production migrations.
5. Verify.
6. Monitor.

## Generate Prisma client
From repo root:
```bash
pnpm -w db:generate
```

Expected:
- Prisma client outputs generated for packages that depend on it.

## Dev/staging helpers (do not use in production)

### `db:push`
```bash
pnpm -w db:push
```

Warning:
- `db:push` can be destructive depending on changes.
- It bypasses the migrations history.
- **Do not use on production.**

## Production approach (Prisma migrate deploy)
Production uses migration folders committed to the repo.

### Required pre-flight checks
1. Confirm the migration PR is merged and deployed artifact is ready.
2. Confirm the migration is **backward-compatible** with the currently running app (if you will deploy code after migrations).
3. Confirm backups are configured and you can restore them.

### Backup-first checklist (production)
1. Confirm there is a recent automated backup.
2. Take a fresh manual backup immediately before applying migrations.
3. Verify the backup file exists and is non-empty.
4. Verify you have restore credentials/procedure.

### Backup command (example)
Use your production database host. Do not paste real passwords into docs or chat.

```bash
# Example only — replace placeholders.
# Prefer a URL/credentials source managed outside of your shell history.
pg_dump --format=custom --no-owner --no-acl \
  "postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST:5432/YOUR_DB_NAME" \
  --file "backup-$(date +%Y%m%d-%H%M%S).dump"
```

### Apply migrations (production)
Run migrations using Prisma migrate deploy.

```bash
# From repo root (ensure the environment points to production DB)
pnpm -w prisma migrate deploy
```

Notes:
- `prisma migrate deploy` applies all pending migrations in order.
- If your deploy platform runs migrations automatically, ensure it uses this command.
- If the command fails, stop and follow rollback guidance below.

## Verification checklist (after migration)
- Can a merchant log in?
- Can a customer complete checkout?
- Are queues draining?
- Are webhooks processing?

Also verify:
- No spike in 5xx rate.
- Background jobs remain healthy.
- The Prisma client can connect and query expected tables.

## Rollback
Rollback depends on the type of migration:
- If schema change is additive (new tables/columns), rollback may be as simple as app rollback.
- If schema change is destructive, rollback may require restoring DB from backup.

Always document rollback steps in the PR that introduces the migration.

### Rollback decision tree
1. **Migration failed before completing**
   - Do not retry repeatedly.
   - Capture logs.
   - If safe and understood, fix-forward with a new migration.
   - Otherwise restore from the pre-migration backup.
2. **Migration succeeded but app errors**
   - Roll back app deploy first (Vercel: promote older deployment; VPS: redeploy previous build).
   - If errors persist due to schema incompatibility, restore DB backup.

### Restore (example)
```bash
# Example only — replace placeholders.
pg_restore --clean --no-owner --no-acl \
  --dbname "postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST:5432/YOUR_DB_NAME" \
  "backup-YYYYMMDD-HHMMSS.dump"
```
