# Redeploy Procedures (Vercel + VPS)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
This is the step-by-step manual for deploying changes safely.

## Golden rules
- Deploy small changes.
- Always have a rollback plan.
- Always verify critical flows.

## Part A — Vercel redeploy (web apps)
### When to use
- UI changes
- API route handler changes in a Vercel-hosted app

### Steps
1. Confirm CI is green (GitHub Actions).
2. Merge to the branch that triggers production (commonly `main`).
3. In Vercel, watch builds for:
   - `Frontend/marketing`
   - `Frontend/merchant-admin`
   - `Frontend/ops-console`

### Verification (after deploy)
- Marketing: `https://vayva.ng`
- Merchant Admin: `https://merchant.vayva.ng`
- Ops Console: `https://ops.vayva.ng`

### Rollback
- Promote previous deployment in Vercel.

## Part B — VPS 1 redeploy (Docker services)
### When to use
- Evolution API changes
- MinIO changes
- Proxy changes

### Steps (VPS 1)
```bash
ssh root@163.245.209.202
cd ~/vayva

# Pull newer images if needed
docker compose pull

# Restart stack
docker compose down
docker compose up -d

docker ps
```

### Verification
```bash
docker logs vayva-evolution --tail 50
docker logs vayva-minio --tail 50
docker logs vayva-redis --tail 50
docker logs vayva-proxy --tail 50
```

Also verify public endpoints:
- `https://api.vayva.ng` (Evolution proxy)
- `https://storage.vayva.ng` (MinIO proxy)

### Rollback
- Revert `~/vayva/docker-compose.yml` and `~/vayva/.env`
- Restart stack.

## Part C — VPS 1 redeploy (worker)
### When to use
- Worker code changes
- Queue processing issues

### Steps
```bash
ssh root@163.245.209.202

# Pull latest code (assuming repo is on VPS)
cd /home/vayva-deploy/src/vayva
git pull

# Build worker
sudo -u vayva-deploy bash -c "cd /home/vayva-deploy/src/vayva && corepack enable && pnpm install --frozen-lockfile && pnpm --filter worker build"

# Restart
systemctl restart vayva-worker
systemctl status vayva-worker --no-pager
journalctl -u vayva-worker -n 80 --no-pager
```

### Verification
- Logs show worker started
- Queue backlog decreases

### Rollback
- Checkout previous commit
- Rebuild
- Restart service

## Emergency checklist
If production is down:
- Roll back first, diagnose second.
