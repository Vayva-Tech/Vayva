# VPS App Server Deploy (163.245.209.202)

## Architecture

| Server | IP | Role |
|---|---|---|
| **VPS 1 (App)** | `163.245.209.202` | Docker Compose services + Worker process |
| **VPS 2 (DB)** | `163.245.209.203` | PostgreSQL 16 + Redis 7 (DB server) |
| **Vercel** | — | merchant-admin, ops-console, marketing site |

## Running Services (VPS 1)

### Docker Compose containers

| Container | Image | Port | Purpose |
|---|---|---|---|
| `vayva-redis` | `redis:7-alpine` | 6379 (internal) | Cache for Evolution API + Worker queues |
| `vayva-evolution` | `evoapicloud/evolution-api:latest` | 8080 | WhatsApp API (multi-tenant) |
| `vayva-minio` | `minio/minio:latest` | 9000 (API), 9001 (Console) | Object storage (uploads, thumbnails) |
| `vayva-proxy` | `jc21/nginx-proxy-manager:latest` | 80, 81, 443 | Reverse proxy + SSL |

### Systemd services

| Service | Description |
|---|---|
| `vayva-worker` | BullMQ worker: WhatsApp, AI agent, delivery, payments, emails, thumbnails |

## Databases (VPS 2)

| Database | Owner | Used by |
|---|---|---|
| `vayva` | `vayva` | merchant-admin, ops-console, marketing, worker |
| `evolution` | `vayva` | Evolution API (separate to avoid migration conflicts) |

---

## Prerequisites

```bash
# Logged in as root on VPS 1
# Docker + Docker Compose installed
# Node.js 20+ and pnpm installed (for worker)
# UFW firewall configured
```

## Firewall Rules (VPS 1)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp    # HTTP (Nginx Proxy Manager)
sudo ufw allow 443/tcp   # HTTPS (Nginx Proxy Manager)
sudo ufw allow 81/tcp    # Nginx Proxy Manager admin (restrict to your IP in production)
# Ports 6379, 8080, 9000, 9001 are NOT exposed — accessed via proxy or localhost only
sudo ufw --force enable
```

---

## Step 1: Deploy Docker Compose

```bash
ssh root@163.245.209.202
mkdir -p ~/vayva && cd ~/vayva

# Copy files from repo:
#   scripts/deploy/docker-compose.app.yml → ~/vayva/docker-compose.yml
#   scripts/deploy/env.app.example        → ~/vayva/.env (then edit with real values)

# Edit .env with real secrets:
nano .env

# Start all services:
docker compose up -d

# Verify:
docker ps
docker logs vayva-redis --tail 5
docker logs vayva-evolution --tail 10
docker logs vayva-minio --tail 5
docker logs vayva-proxy --tail 5
```

## Step 2: Configure MinIO

```bash
# 1. Access MinIO Console: http://163.245.209.202:9001
#    Login with MINIO_ROOT_USER / MINIO_ROOT_PASSWORD from .env

# 2. Create bucket:
docker exec vayva-minio mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
docker exec vayva-minio mc mb local/vayva-uploads
docker exec vayva-minio mc anonymous set download local/vayva-uploads

# 3. Create access key for the app (in MinIO Console → Access Keys → Create)
#    Save the Access Key and Secret Key — these go into:
#      - Vercel env vars (MINIO_ACCESS_KEY, MINIO_SECRET_KEY)
#      - Worker env file (/opt/vayva/worker.env)
```

## Step 3: Configure Nginx Proxy Manager

```bash
# Access: http://163.245.209.202:81
# Default login: admin@example.com / changeme (CHANGE IMMEDIATELY)
```

Add these proxy hosts with SSL (Let's Encrypt):

| Domain | Forward To | Port | SSL |
|---|---|---|---|
| `api.vayva.ng` | `vayva-evolution` | 8080 | Yes |
| `storage.vayva.ng` | `vayva-minio` | 9000 | Yes |

For `storage.vayva.ng`, add this custom Nginx config:
```nginx
# Allow large uploads (100MB)
client_max_body_size 100m;
```

## Step 4: Deploy Worker

```bash
# 1. Create deploy user
useradd -m -s /bin/bash vayva-deploy

# 2. Clone/rsync repo
su - vayva-deploy
git clone <repo-url> ~/src/vayva
# OR rsync from local: rsync -avz --exclude node_modules --exclude .next . root@163.245.209.202:/home/vayva-deploy/src/vayva/

# 3. Run setup script (as root)
exit  # back to root
bash /home/vayva-deploy/src/vayva/scripts/deploy/setup-worker.sh

# 4. Edit env file with real values
nano /opt/vayva/worker.env

# 5. Start worker
systemctl start vayva-worker
systemctl status vayva-worker --no-pager

# 6. Watch logs
journalctl -u vayva-worker -f
```

---

## Evolution API

- **Manager UI:** https://api.vayva.ng/manager (or http://localhost:8080/manager)
- **Instance:** `vayva-main` (Baileys / WhatsApp Web)
- **Device name:** Shows as "Vayva (Vayva AI)" in WhatsApp Linked Devices

### Critical env vars
Evolution API v2.x uses `CACHE_REDIS_ENABLED` and `CACHE_REDIS_URI` — **NOT** `REDIS_ENABLED`/`REDIS_URI`.
Using the wrong names causes persistent "redis disconnected" errors and Baileys restart loops.

### Create a new WhatsApp instance
```bash
curl -s -X POST "http://localhost:8080/instance/create" \
  -H "apikey: <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"<NAME>","integration":"WHATSAPP-BAILEYS","qrcode":true}'
```

## Multi-tenant WhatsApp
Each merchant gets their own Evolution API instance named `merchant_<storeId>`.
Instances are created automatically when a merchant clicks "Link WhatsApp" in merchant-admin.
The `WhatsappManager` service (`apps/merchant-admin/src/services/whatsapp.ts`) handles instance lifecycle.

---

## Worker Queues

The worker process (`apps/worker/src/worker.ts`) handles these BullMQ queues:

| Queue | Purpose |
|---|---|
| `whatsapp:inbound` | Process incoming WhatsApp messages, resolve contacts/conversations |
| `whatsapp:outbound` | Send messages via Evolution API |
| `agent:actions` | AI-powered conversation replies (Groq) |
| `delivery:scheduler` | Schedule deliveries via Kwik after payment |
| `payments:webhooks` | Process Paystack webhook events (subscriptions, orders, templates) |
| `maintenance:cleanup` | Nightly: session cleanup, audit log retention, email/notification outbox drain |
| `thumbnail:generation` | Generate store homepage screenshots (Playwright/Chromium) |
| `reconciliation` | Nightly wallet balance vs ledger sum verification |
| `china:catalog:sync` | Sync supplier catalogs |

---

## Redeploy Checklist

### Docker services
```bash
cd ~/vayva
docker compose pull    # Pull latest images
docker compose down
docker compose up -d
```

### Worker
```bash
cd /home/vayva-deploy/src/vayva
git pull
sudo -u vayva-deploy bash -c "cd /home/vayva-deploy/src/vayva && pnpm install --frozen-lockfile && pnpm --filter worker build"
systemctl restart vayva-worker
journalctl -u vayva-worker -f --no-pager -n 20
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Evolution API "redis disconnected" loop | Check `CACHE_REDIS_URI` (not `REDIS_URI`). Must include password. |
| MinIO "Access Denied" on uploads | Verify access key/secret in Vercel env vars match MinIO Console |
| Worker won't start | Check `/opt/vayva/worker.env` — all CHANGE_ME values must be replaced |
| Worker can't connect to Redis | Ensure `REDIS_URL` in worker.env includes password: `redis://:PASSWORD@127.0.0.1:6379` |
| Thumbnails fail | Run `pnpm --filter worker exec playwright install --with-deps chromium` as root |
| Storage uploads fail from merchant-admin | Verify `storage.vayva.ng` proxy is configured in Nginx Proxy Manager |
