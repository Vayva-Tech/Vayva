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
ENV_TEMPLATE="$REPO_DIR/platform/scripts/deploy/env.worker.example"

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
  if [ ! -f "$ENV_TEMPLATE" ]; then
    echo "FAIL: Missing worker env template at $ENV_TEMPLATE"
    exit 1
  fi

  cp "$ENV_TEMPLATE" "$ENV_FILE"
  chown "$DEPLOY_USER:$DEPLOY_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "Created $ENV_FILE from $ENV_TEMPLATE — EDIT IT WITH REAL VALUES before starting the worker"
else
  echo "$ENV_FILE already exists, skipping"
fi

echo "=== [5.5/6] Validating worker env secrets ==="
if grep -Eq 'CHANGE_ME|^\s*$' "$ENV_FILE"; then
  if grep -Eq 'CHANGE_ME' "$ENV_FILE"; then
    echo "FAIL: Placeholder values detected in $ENV_FILE (CHANGE_ME...)."
    echo "Please replace all placeholder secrets before continuing."
    exit 1
  fi
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
echo "  1) Start the worker: systemctl start vayva-worker"
echo "  2) Check status: systemctl status vayva-worker --no-pager"
echo "  3) Watch logs: journalctl -u vayva-worker -f"
echo ""
