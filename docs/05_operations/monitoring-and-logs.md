# Monitoring and Logs

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Define where to look when something breaks.

## Vercel logs
- Check Vercel project logs per app.

## VPS logs
### Docker
```bash
cd ~/vayva
docker ps
docker logs vayva-evolution --tail 100
docker logs vayva-minio --tail 100
docker logs vayva-redis --tail 100
```

### systemd
```bash
journalctl -u vayva-worker -n 200 --no-pager
```

## Health checks
- Evolution API root endpoint
- MinIO access and bucket existence
- Redis ping
- Postgres connectivity

## Alerting
TBD — define alerting channels and thresholds.
