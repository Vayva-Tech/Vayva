#!/usr/bin/env bash
set -euo pipefail

# ============================================
# VAYVA AI AGENT VPS DEPLOYMENT SCRIPT
# Deploys ML-enhanced AI Agent to VPS alongside Evolution API
# ============================================

DEPLOY_USER="vayva-deploy"
REPO_DIR="/home/$DEPLOY_USER/src/vayva"
ENV_FILE="/opt/vayva/ai-agent.env"
LOG_DIR="/var/log/vayva"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "============================================"
echo "VAYVA AI AGENT DEPLOYMENT"
echo "============================================"

# [1/8] Check prerequisites
echo "=== [1/8] Checking prerequisites ==="
command -v node >/dev/null || { log_error "node not found"; exit 1; }
command -v pnpm >/dev/null || { log_error "pnpm not found"; exit 1; }
command -v docker >/dev/null || { log_error "docker not found"; exit 1; }
log_info "node $(node -v), pnpm $(pnpm -v), docker $(docker --version)"

# [2/8] Verify repository
echo "=== [2/8] Verifying repository ==="
if [ ! -d "$REPO_DIR" ]; then
    log_error "Repository not found at $REPO_DIR"
    exit 1
fi
cd "$REPO_DIR"
log_info "Repository found at $REPO_DIR"

# [3/8] Install dependencies
echo "=== [3/8] Installing dependencies ==="
sudo -u "$DEPLOY_USER" bash -c "cd $REPO_DIR && corepack enable && pnpm install --frozen-lockfile"
log_info "Dependencies installed"

# [4/8] Build packages
echo "=== [4/8] Building packages ==="
sudo -u "$DEPLOY_USER" bash -c "cd $REPO_DIR && pnpm --filter @vayva/db build"
sudo -u "$DEPLOY_USER" bash -c "cd $REPO_DIR && pnpm --filter @vayva/ai-agent build"
sudo -u "$DEPLOY_USER" bash -c "cd $REPO_DIR && pnpm --filter worker build"
log_info "Packages built successfully"

# [5/8] Create environment file
echo "=== [5/8] Setting up environment ==="
install -d -m 755 /opt/vayva
install -d -m 755 "$LOG_DIR"

if [ ! -f "$ENV_FILE" ]; then
    cat > "$ENV_FILE" << 'EOF'
# ============================================
# VAYVA AI AGENT ENVIRONMENT CONFIGURATION
# ============================================
NODE_ENV=production

# Database (same as worker)
DATABASE_URL=postgresql://vayva:CHANGE_ME@163.245.209.203:5432/vayva

# Redis (local to VPS)
REDIS_URL=redis://:CHANGE_ME@127.0.0.1:6379/0

# Evolution API (local on same VPS)
EVOLUTION_API_URL=http://127.0.0.1:8080
EVOLUTION_API_KEY=CHANGE_ME
EVOLUTION_INSTANCE_NAME=vayva-production

# AI Provider API Keys (if using external providers)
# GROQ_API_KEY_MERCHANT=gsk_...
# GROQ_API_KEY_SUPPORT=gsk_...
# DEEPSEEK_API_KEY=sk-...
# OPENAI_API_KEY=sk-...

# ML Configuration (all local - no external APIs needed)
ML_ENABLED=true
ML_SENTIMENT_ENABLED=true
ML_FORECAST_ENABLED=true
ML_RECOMMENDATIONS_ENABLED=true
ML_ANOMALY_DETECTION_ENABLED=true

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/vayva/ai-agent.log

# Performance
NODE_OPTIONS=--max-old-space-size=4096
ML_WORKER_THREADS=2
EOF
    chown "$DEPLOY_USER:$DEPLOY_USER" "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    log_warn "Created $ENV_FILE - PLEASE EDIT WITH REAL VALUES"
else
    log_info "Environment file exists at $ENV_FILE"
fi

# [6/8] Validate environment
echo "=== [6/8] Validating environment ==="
if grep -Eq 'CHANGE_ME|^
' "$ENV_FILE"; then
    log_error "Placeholder values found in $ENV_FILE"
    log_error "Please edit the file and replace all CHANGE_ME values"
    exit 1
fi
log_info "Environment validated"

# [7/8] Create systemd service
echo "=== [7/8] Installing systemd service ==="
cat > /etc/systemd/system/vayva-ai-agent.service << EOF
[Unit]
Description=Vayva AI Agent (ML-Enhanced)
After=network.target vayva-evolution.service
Wants=vayva-evolution.service

[Service]
Type=simple
User=$DEPLOY_USER
WorkingDirectory=$REPO_DIR
EnvironmentFile=$ENV_FILE
Environment=NODE_OPTIONS=--max-old-space-size=4096
ExecStart=/usr/bin/pnpm --filter @vayva/ai-agent start
Restart=always
RestartSec=5
StandardOutput=append:$LOG_DIR/ai-agent.log
StandardError=append:$LOG_DIR/ai-agent-error.log

# Security
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$LOG_DIR

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable vayva-ai-agent
log_info "Systemd service installed"

# [8/8] Setup log rotation
echo "=== [8/8] Setting up log rotation ==="
cat > /etc/logrotate.d/vayva-ai-agent << EOF
$LOG_DIR/ai-agent*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 $DEPLOY_USER $DEPLOY_USER
    sharedscripts
    postrotate
        systemctl reload vayva-ai-agent || true
    endscript
}
EOF
log_info "Log rotation configured"

echo ""
echo "============================================"
echo "DEPLOYMENT COMPLETE"
echo "============================================"
echo ""
echo "AI Agent with ML capabilities is ready!"
echo ""
echo "Next steps:"
echo "  1) Edit environment: nano $ENV_FILE"
echo "  2) Start service: systemctl start vayva-ai-agent"
echo "  3) Check status: systemctl status vayva-ai-agent --no-pager"
echo "  4) View logs: journalctl -u vayva-ai-agent -f"
echo ""
echo "ML Features Available:"
echo "  - Sentiment Analysis (FREE)"
echo "  - Sales Forecasting (FREE)"
echo "  - Product Recommendations (FREE)"
echo "  - Anomaly Detection (FREE)"
echo "  - Intent Classification (FREE)"
echo ""
