# Vayva Deployment Guide

## Architecture

| Component | Where | Details |
|---|---|---|
| **Database** (PostgreSQL 16) | VPS 2 (`163.245.209.203`) | `vayva` + `evolution` databases |
| **Docker services** (Redis, Evolution API, MinIO, Nginx Proxy Manager) | VPS 1 (`163.245.209.202`) | `docker-compose.app.yml` |
| **Worker** (BullMQ) | VPS 1 (`163.245.209.202`) | systemd service via `setup-worker.sh` |
| **Web apps** (merchant-admin, ops-console, marketing, marketplace) | Vercel | See `VERCEL_DEPLOY_STEPS.md` |

## Quick Start

### 1. Database Server (VPS 2)

```bash
ssh root@163.245.209.203
bash scripts/deploy/setup-db-server.sh 163.245.209.202

sudo -u postgres psql
CREATE DATABASE vayva;
CREATE DATABASE evolution;
CREATE USER vayva WITH PASSWORD '<STRONG_PASSWORD>';
GRANT ALL PRIVILEGES ON DATABASE vayva TO vayva;
GRANT ALL PRIVILEGES ON DATABASE evolution TO vayva;
\q
```

### 2. App Server (VPS 1) — Docker

```bash
ssh root@163.245.209.202
curl -fsSL https://get.docker.com | sh
mkdir -p ~/vayva && cd ~/vayva

# Copy config files:
#   docker-compose.app.yml → ~/vayva/docker-compose.yml
#   env.app.example        → ~/vayva/.env

nano .env  # Fill in real secrets
docker compose up -d
```

### 3. App Server (VPS 1) — Worker

```bash
# Install Node.js 20+ and pnpm first
bash scripts/deploy/setup-worker.sh
nano /opt/vayva/worker.env  # Fill in real secrets
systemctl start vayva-worker
```

### 4. Vercel Apps

See `VERCEL_DEPLOY_STEPS.md` and `VERCEL_ENV_VARS.md`.

## Detailed Guides

- **[APP_SERVER_DEPLOY.md](./APP_SERVER_DEPLOY.md)** — Full VPS 1 setup: Docker, MinIO, Nginx Proxy Manager, Worker, firewall, troubleshooting
- **[VERCEL_DEPLOY_STEPS.md](./VERCEL_DEPLOY_STEPS.md)** — Vercel project setup
- **[VERCEL_ENV_VARS.md](./VERCEL_ENV_VARS.md)** — All env vars per Vercel app

## Key Files

| File | Purpose |
|---|---|
| `docker-compose.app.yml` | Docker Compose for VPS 1 (Redis, Evolution API, MinIO, Proxy) |
| `env.app.example` | Env template for Docker Compose `.env` |
| `setup-worker.sh` | Worker systemd service installer + env template |
| `setup-db-server.sh` | Database server firewall + PostgreSQL/Redis setup |
