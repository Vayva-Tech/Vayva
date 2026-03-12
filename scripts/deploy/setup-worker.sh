#!/usr/bin/env bash
set -euo pipefail

# ============================================
# Vayva Worker VPS Setup Script
# Run this on the VPS as root after rsync'ing the repo
# Usage: bash scripts/deploy/setup-worker.sh
# ============================================

DEPLOY_USER="vayva-deploy"
REPO_DIR="/home/$DEPLOY_USER/src/vayva"
ENV_FILE="/opt/vayva/worker.env"

echo "=== [1/6] Checking prerequisites ==="
command -v node >/dev/null || { echo "FAIL: node not found"; exit 1; }
command -v pnpm >/dev/null || { echo "FAIL: pnpm not found"; exit 1; }
echo "node $(node -v), pnpm $(pnpm -v)"

echo "=== [2/6] Installing dependencies ==="
cd "$REPO_DIR"
sudo -u "$DEPLOY_USER" bash -c "cd $REPO_DIR && corepack enable && pnpm install --frozen-lockfile"

echo "=== [3/6] Building worker ==="
sudo -u "$DEPLOY_USER" bash -c "cd $REPO_DIR && pnpm --filter worker build"

echo "=== [4/6] Installing Playwright Chromium + OS deps ==="
cd "$REPO_DIR"
pnpm --filter worker exec playwright install --with-deps chromium

echo "=== [5/6] Creating env file ==="
install -d -m 755 /opt/vayva
if [ ! -f "$ENV_FILE" ]; then
  cat >"$ENV_FILE" <<'ENVEOF'
NODE_ENV=production

# ---- Database (VPS 2) ----
DATABASE_URL=postgresql://vayva:CHANGE_ME@163.245.209.203:5432/vayva

# ---- Redis (local Docker compose) ----
REDIS_URL=redis://:CHANGE_ME@127.0.0.1:6379

# ---- MinIO Object Storage (local Docker compose) ----
MINIO_ENDPOINT=https://storage.vayva.ng
MINIO_ACCESS_KEY=CHANGE_ME
MINIO_SECRET_KEY=CHANGE_ME
MINIO_BUCKET=vayva-uploads
MINIO_PUBLIC_BASE_URL=https://storage.vayva.ng
MINIO_REGION=us-east-1

# ---- Email (Resend) ----
RESEND_API_KEY=CHANGE_ME
EMAIL_FROM=no-reply@vayva.ng
EMAIL_PROVIDER=resend

# ---- AI (Groq) ----
GROQ_API_KEY=CHANGE_ME

# ---- WhatsApp (Evolution API — local Docker) ----
EVOLUTION_API_URL=http://127.0.0.1:8080
EVOLUTION_API_KEY=CHANGE_ME
EVOLUTION_INSTANCE_NAME=vayva-main

# ---- Paystack (webhook verification) ----
PAYSTACK_SECRET_KEY=CHANGE_ME

# ---- App URLs ----
NEXT_PUBLIC_APP_URL=https://merchant.vayva.ng
VAYVA_DOMAIN=vayva.ng

# ---- Worker Flags ----
WORKER_ENABLE_MAINTENANCE_CLEANUP=true
WORKER_RUNNER=loop
OUTBOX_DRAIN_INTERVAL_SEC=30
ENVEOF
  chown "$DEPLOY_USER:$DEPLOY_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "Created $ENV_FILE — EDIT IT WITH REAL VALUES before starting the worker"
else
  echo "$ENV_FILE already exists, skipping"
fi

echo "=== [6/6] Installing systemd service ==="
cat >/etc/systemd/system/vayva-worker.service <<EOF
[Unit]
Description=Vayva Worker
After=network.target

[Service]
Type=simple
User=$DEPLOY_USER
WorkingDirectory=$REPO_DIR
EnvironmentFile=$ENV_FILE
Environment=NODE_OPTIONS=--max-old-space-size=2048
Environment=PLAYWRIGHT_BROWSERS_PATH=0
ExecStart=/usr/bin/pnpm --filter worker start
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable vayva-worker

echo ""
echo "============================================"
echo "SETUP COMPLETE"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1) Edit $ENV_FILE with real production values (nano $ENV_FILE)"
echo "  2) Start the worker: systemctl start vayva-worker"
echo "  3) Check status: systemctl status vayva-worker --no-pager"
echo "  4) Watch logs: journalctl -u vayva-worker -f"
echo ""
