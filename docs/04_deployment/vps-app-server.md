# VPS App Server Deployment (VPS 1)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Target
- VPS 1 (App Server)
  - IP: `163.245.209.202`
  - Role: Docker Compose services + worker process

## What runs on VPS 1
From `scripts/deploy/APP_SERVER_DEPLOY.md` and `platform/scripts/deploy/docker-compose.app.yml`:

### Docker containers
- `vayva-redis` (Redis 7, password protected)
- `vayva-evolution` (Evolution API v2.2.3)
- `vayva-minio` (MinIO, object storage)
- `vayva-proxy` (Nginx Proxy Manager)

### System services
- `vayva-worker` (systemd): BullMQ worker

## Prerequisites
- SSH access as root
- Docker + Docker Compose installed
- Node 20+ and pnpm installed (for worker)
- Firewall via UFW

Verification:
```bash
ssh root@163.245.209.202 "docker --version && docker compose version && node -v && pnpm -v"
```
Expected:
- Docker and Docker Compose print versions
- Node version is >= 20

## 1) Firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 81/tcp
sudo ufw --force enable
```

Verify:
```bash
sudo ufw status
```
Expected:
- Status: active
- Rules include 22/tcp, 80/tcp, 81/tcp, 443/tcp

If SSH breaks:
- You likely blocked port 22; regain console access via your VPS provider and re-open SSH.

## 2) Deploy Docker Compose stack
### 2.1 Copy compose + env to server
On VPS 1:
```bash
ssh root@163.245.209.202
mkdir -p ~/vayva
cd ~/vayva
```

From repo:
- Copy `platform/scripts/deploy/docker-compose.app.yml` → `~/vayva/docker-compose.yml`
- Copy `platform/scripts/deploy/env.app.example` → `~/vayva/.env`

Edit `.env` with real values.

### 2.2 Start services
```bash
cd ~/vayva
docker compose up -d

docker ps
```

Expected:
- Containers `vayva-redis`, `vayva-evolution`, `vayva-proxy` are running.
- `vayva-minio` runs if MinIO profile is enabled (depends on compose usage).

### 2.3 Verify
```bash
docker logs vayva-redis --tail 20
docker logs vayva-evolution --tail 50
docker logs vayva-minio --tail 20
docker logs vayva-proxy --tail 20
```

Quick health checks:
```bash
curl -sS -I http://127.0.0.1:8080/ | head
redis-cli -a "${REDIS_PASSWORD}" -h 127.0.0.1 -p 6379 ping
```
Expected:
- Evolution returns HTTP headers (200/302 acceptable)
- Redis returns `PONG`

## 3) MinIO setup
### 3.1 Access console
- MinIO Console: `http://163.245.209.202:9001`
- Login using `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` from `.env`

Verify port is reachable:
```bash
curl -sS -I http://127.0.0.1:9001/ | head
```

### 3.2 Create bucket + public downloads
From VPS 1:
```bash
# The mc client is inside the container
export MINIO_ROOT_USER=...
export MINIO_ROOT_PASSWORD=...

docker exec vayva-minio mc alias set local http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"
docker exec vayva-minio mc mb local/vayva-uploads
docker exec vayva-minio mc anonymous set download local/vayva-uploads
```

Verify:
```bash
docker exec vayva-minio mc ls local
```
Expected:
- `vayva-uploads/` exists

### 3.3 Create app access keys
In MinIO Console:
- Access Keys → Create
- Save access key + secret key

These values must be copied to:
- Vercel env vars (if Vercel apps upload directly)
- Worker env file: `/opt/vayva/worker.env`

## 4) Nginx Proxy Manager
### 4.1 Access
- Admin UI: `http://163.245.209.202:81`
- Default login: `admin@example.com / changeme` (change immediately)

Verify NPM is reachable:
```bash
curl -sS -I http://127.0.0.1:81/ | head
```

### 4.2 Proxy hosts
Create proxy hosts with SSL:
- `api.vayva.ng` → `vayva-evolution:8080`
- `storage.vayva.ng` → `vayva-minio:9000`

For `storage.vayva.ng`, add custom nginx config:
```nginx
client_max_body_size 100m;
```

Verify externally (after DNS + SSL):
```bash
curl -sS -I https://api.vayva.ng/ | head
curl -sS -I https://storage.vayva.ng/ | head
```

## 5) Evolution API notes
### Critical Redis env var naming
Evolution API v2.x uses:
- `CACHE_REDIS_ENABLED`
- `CACHE_REDIS_URI`

It does **not** use `REDIS_ENABLED` / `REDIS_URI`. Using the wrong names can cause restart loops.

### Create an instance
```bash
curl -s -X POST "http://localhost:8080/instance/create" \
  -H "apikey: <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"<NAME>","integration":"WHATSAPP-BAILEYS","qrcode":true}'
```

Expected:
- Response includes QR or instance created status.

If you get 401/403:
- Check the `apikey` header value matches `AUTHENTICATION_API_KEY`.

## 6) Worker deployment
See `vps-worker.md`.

## Rollback
- For Docker: revert `docker-compose.yml` / `.env`, then `docker compose down && docker compose up -d`
- For proxy config: revert in Nginx Proxy Manager UI

## Troubleshooting
- Evolution “redis disconnected”: verify `CACHE_REDIS_URI` includes password.
- MinIO AccessDenied: verify keys match.
- Upload failures: verify `storage.vayva.ng` proxy.
