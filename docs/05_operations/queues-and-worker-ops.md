# Queues and Worker Operations (BullMQ)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Operate the background worker safely.

## Where worker runs
- VPS 1 systemd service: `vayva-worker`

## Common commands
### Check status
```bash
systemctl status vayva-worker --no-pager
```

### Tail logs
```bash
journalctl -u vayva-worker -f
```

### Restart
```bash
systemctl restart vayva-worker
```

## Redis
- Worker uses Redis at `127.0.0.1:6379` (password protected).

## Backlog handling
- If queues build up, first check:
  - Redis health
  - Evolution API health
  - External provider outages (Paystack/Groq/Resend/Kwik)

## Playwright (thumbnails)
Worker installs Chromium via Playwright.
If thumbnail jobs fail:
```bash
cd /home/vayva-deploy/src/vayva
pnpm --filter worker exec playwright install --with-deps chromium
```
