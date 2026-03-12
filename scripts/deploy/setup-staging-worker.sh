#!/bin/bash
# Staging Worker Setup Script for VPS 1
# Run this on VPS 1 (163.245.209.202) as root

set -e

echo "=== Setting up Staging Worker Service ==="

# Create staging worker environment file
cat > /opt/vayva/worker-staging.env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://vayva:QyKJ8nvIagBUJgrJSG7F1UGxv5kMZz64glkGe0fX@163.245.209.203:5432/vayva_staging
REDIS_URL=redis://:01676b02e755c698d75af7878071460b40e19c126a170b83f04be3251a853ee5@127.0.0.1:6379

MINIO_ENDPOINT=http://127.0.0.1:9000
MINIO_ACCESS_KEY=vayva-admin
MINIO_SECRET_KEY=vvmDURHt3i5rT4oG17woTHy2N5yz4lUh
MINIO_BUCKET=vayva-staging-uploads
MINIO_PUBLIC_BASE_URL=https://storage.vayva.ng
MINIO_REGION=us-east-1

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=01676b02e755c698d75af7878071460b40e19c126a170b83f04be3251a853ee5

# Staging-specific settings
QUEUE_PREFIX=staging
WORKER_ENABLE_MAINTENANCE_CLEANUP=false
EOF

chown vayva-deploy:vayva-deploy /opt/vayva/worker-staging.env
chmod 600 /opt/vayva/worker-staging.env

# Create staging worker systemd service
cat > /etc/systemd/system/vayva-worker-staging.service << 'EOF'
[Unit]
Description=Vayva Staging Worker
After=network.target

[Service]
Type=simple
User=vayva-deploy
WorkingDirectory=/home/vayva-deploy/src/vayva
EnvironmentFile=/opt/vayva/worker-staging.env
Environment=NODE_OPTIONS=--max-old-space-size=2048
Environment=PLAYWRIGHT_BROWSERS_PATH=0
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/vayva-deploy/src/vayva/node_modules/.bin
ExecStart=/bin/bash -c 'cd /home/vayva-deploy/src/vayva && exec /home/vayva-deploy/src/vayva/apps/worker/node_modules/.bin/tsx apps/worker/src/worker.ts'
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start staging worker
systemctl daemon-reload
systemctl enable vayva-worker-staging.service
systemctl start vayva-worker-staging.service

echo "=== Staging Worker Setup Complete ==="
echo ""
echo "Status:"
systemctl status vayva-worker-staging --no-pager
