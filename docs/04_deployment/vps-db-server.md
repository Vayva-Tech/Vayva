# VPS Database Server Deployment (VPS 2)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Target
- VPS 2 (DB Server)
  - IP: `163.245.209.203`
  - Role: PostgreSQL 16 + Redis 7

## Source of truth
- `platform/scripts/deploy/setup-db-server.sh`

## Prerequisites
- SSH access
- Ubuntu/Debian environment

Verify (on VPS 2):
```bash
ssh root@163.245.209.203 "lsb_release -a 2>/dev/null || cat /etc/os-release"
```

## 1) Run setup script
On VPS 2:
```bash
./setup-db-server.sh <APP_SERVER_IP> <REDIS_PASSWORD>
```

Example:
```bash
./setup-db-server.sh 163.245.209.202 <REDIS_PASSWORD>
```

Expected output:
- The script prints step headers like `=== [1/5] ... ===`
- It ends with `DATABASE SERVER INITIALIZED`

What it does:
- installs Postgres 16 + Redis + UFW
- configures firewall to only allow app server IP
- configures Postgres to listen on `*`
- configures Redis bind + password
- creates databases: `vayva`, `evolution`

Verify the firewall rules:
```bash
ufw status
```
Expected:
- inbound 5432 allowed only from app server IP
- inbound 6379 allowed only from app server IP

## 2) Postgres hardening
### Change DB user password
```bash
sudo -u postgres psql -c "ALTER USER vayva WITH PASSWORD '<STRONG_PASSWORD>';"
```

Verify Postgres is listening and running (on VPS 2):
```bash
ss -ltnp | grep 5432 || true
systemctl status postgresql --no-pager
```
Expected:
- `postgres` is listening on `0.0.0.0:5432` or `*:5432`
- systemd shows `active (running)`

### Verify connection from app server
From VPS 1:
```bash
psql postgresql://vayva:<PASSWORD>@163.245.209.203:5432/vayva
```

Expected:
- `psql` connects and you can run `select 1;`

## 3) Redis hardening
- Ensure Redis binds to localhost + app server IP only.
- Ensure `requirepass` is set.

Verify Redis requires auth:
```bash
redis-cli -h 127.0.0.1 -p 6379 ping
```
Expected:
- `(error) NOAUTH Authentication required.`

Then verify with password:
```bash
redis-cli -h 127.0.0.1 -p 6379 -a <REDIS_PASSWORD> ping
```
Expected:
- `PONG`

## 4) Backups
Recommended daily backup (example):
```bash
0 3 * * * pg_dump -U vayva vayva | gzip > /var/backups/postgresql/vayva_$(date +\%Y\%m\%d).sql.gz
```

Verify backup directory exists:
```bash
mkdir -p /var/backups/postgresql
ls -la /var/backups/postgresql | tail -n 5
```

## Rollback
- Revert changes in `/etc/postgresql/16/main/` and `/etc/redis/redis.conf`.

## Verification checklist
- Postgres running: `systemctl status postgresql`
- Redis running: `systemctl status redis`
- Firewall: `ufw status`

## Common failures
### App server cannot connect to Postgres
- Confirm UFW rule allows 5432 from app server IP.
- Confirm Postgres is listening on `*` and `pg_hba.conf` includes the app server.

### Redis accessible from the public internet
- This is a security incident.
- Immediately fix `bind` + UFW rules.
