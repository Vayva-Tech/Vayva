# PostgreSQL Operations (VPS 2)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Operational procedures for the production Postgres server.

## Where it runs
- VPS 2: `163.245.209.203`
- Postgres version: 16

## Quick health checks
### Service status
```bash
systemctl status postgresql --no-pager
```

### Connectivity (from app server)
From VPS 1:
```bash
psql postgresql://vayva:<PASSWORD>@163.245.209.203:5432/vayva -c "select 1;"
```
Expected: `1`.

### Check active connections
On VPS 2:
```bash
sudo -u postgres psql -c "select count(*) from pg_stat_activity;"
```

## Backup verification
### Ensure backups exist
If using a cron-based backup:
```bash
ls -la /var/backups/postgresql | tail -n 20
```

### Test restore (staging)
At least monthly:
- restore the latest dump into a staging database
- verify core flows

## Common failures
### Disk full
Symptoms:
- writes fail
- Postgres errors

Fix:
- free disk
- rotate logs
- remove old backups

### Too many connections
Fix:
- identify connection leaks
- restart misbehaving services

## Security
- Only allow inbound 5432 from app server IP.
- Rotate DB password on schedule.
