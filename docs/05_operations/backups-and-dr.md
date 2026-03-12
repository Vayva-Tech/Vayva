# Backups and Disaster Recovery (DR)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Define backup strategy and how to recover after failures.

## Databases
### Primary DB (`vayva`)
Runs on VPS 2 (Postgres 16).

### Evolution DB (`evolution`)
Separate DB used by Evolution API to avoid Prisma migration conflicts.

## Backup schedule
### Daily database backups
Example cron (VPS 2):
```bash
0 3 * * * pg_dump -U vayva vayva | gzip > /var/backups/postgresql/vayva_$(date +\%Y\%m\%d).sql.gz
```

## Restore procedure (high level)
1. Provision a new Postgres instance.
2. Restore dump.
3. Update `DATABASE_URL`.
4. Restart apps/worker.

## Object storage
MinIO is used for uploads.
- Ensure bucket exists and access keys are stored securely.
- Back up MinIO volume (`minio_data`) periodically.

## DR drills
- Quarterly restore drill
- Document time to restore (RTO) and acceptable data loss (RPO)
