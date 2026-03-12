# Worker Deployment (VPS 1 systemd)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Deploy and operate the BullMQ worker on VPS 1.

## Source of truth
- `platform/scripts/deploy/setup-worker.sh`
- `platform/scripts/deploy/env.worker.example`

## 1) Create deploy user
On VPS 1:
```bash
useradd -m -s /bin/bash vayva-deploy
```

Verify:
```bash
id vayva-deploy
```

## 2) Get the repo onto the server
Option A: Clone
```bash
su - vayva-deploy
git clone <repo-url> ~/src/vayva
```

Option B: rsync from local machine
```bash
rsync -avz --exclude node_modules --exclude .next . root@163.245.209.202:/home/vayva-deploy/src/vayva/
```

## 3) Run setup script
As root:
```bash
bash /home/vayva-deploy/src/vayva/platform/scripts/deploy/setup-worker.sh
```

This script:
- installs deps with `pnpm install --frozen-lockfile`
- builds the worker: `pnpm --filter worker build`
- installs Playwright Chromium deps
- creates `/opt/vayva/worker.env` from template
- installs systemd unit `vayva-worker.service`

Verify the unit exists:
```bash
systemctl cat vayva-worker
```

## 4) Configure `/opt/vayva/worker.env`
Edit the env file:
```bash
nano /opt/vayva/worker.env
```

Critical rules:
- Replace all `CHANGE_ME_*` placeholders
- `EVOLUTION_API_KEY` must match `AUTHENTICATION_API_KEY` in app server `.env`
- Redis URL must include password:
  - `redis://:<PASSWORD>@127.0.0.1:6379`

Verify you removed placeholders:
```bash
grep -n "CHANGE_ME" /opt/vayva/worker.env || echo "OK: no placeholders"
```

## 5) Start worker
```bash
systemctl start vayva-worker
systemctl status vayva-worker --no-pager
journalctl -u vayva-worker -f
```

Expected:
- systemd shows Active: active (running)
- logs show worker startup without crash loop

## 6) Redeploy worker
```bash
cd /home/vayva-deploy/src/vayva
git pull
sudo -u vayva-deploy bash -c "cd /home/vayva-deploy/src/vayva && corepack enable && pnpm install --frozen-lockfile && pnpm --filter worker build"
systemctl restart vayva-worker
journalctl -u vayva-worker -n 50 --no-pager
```

## Rollback
- Checkout previous commit
- Rebuild
- Restart service

## Troubleshooting
- Worker won’t start: check logs, env placeholders.
- Thumbnails fail: ensure Playwright chromium installed (`playwright install --with-deps chromium`).

Common failure modes:
- **Exit code 1 immediately**: missing env var or bad `DATABASE_URL`
- **Redis auth errors**: check `REDIS_URL` includes password
- **Evolution auth errors**: `EVOLUTION_API_KEY` mismatch with Evolution `AUTHENTICATION_API_KEY`
