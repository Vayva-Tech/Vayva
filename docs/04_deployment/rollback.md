# Rollback (Vercel + VPS)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Goal
Rollback safely when a deploy causes production breakage.

## 1) Vercel rollback
### Option A: Promote previous deployment
- Open the Vercel project
- Deployments → select the last known good deployment
- “Promote to Production”

### Option B: Revert env var changes
- Revert the env vars in Vercel
- Redeploy

## 2) VPS rollback (Docker)
On VPS 1:
- Revert `~/vayva/docker-compose.yml` and `~/vayva/.env` to last known good versions
- Then:
```bash
cd ~/vayva
docker compose down
docker compose up -d
```

## 3) VPS rollback (worker)
- Checkout known good commit
- Build
- Restart systemd:
```bash
systemctl restart vayva-worker
journalctl -u vayva-worker -n 50 --no-pager
```

## Verification
- Confirm primary flows: merchant login, storefront checkout, ops login
- Confirm webhooks healthy
- Confirm queues draining
