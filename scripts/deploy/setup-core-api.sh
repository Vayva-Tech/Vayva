#!/bin/bash
# Core API Deployment Script for VPS
# Deploys the core-api backend to the VPS server

set -e

# Configuration
VPS_IP="163.245.209.202"
DEPLOY_USER="vayva-deploy"
APP_DIR="/home/vayva-deploy/core-api"
ENV_FILE="/opt/vayva/core-api.env"
SERVICE_NAME="vayva-core-api"
PORT="3001"

echo "🚀 Core API Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root"
    exit 1
fi

# Step 1: Create deploy user if not exists
log_info "Creating deploy user..."
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$DEPLOY_USER"
    log_info "Created user: $DEPLOY_USER"
else
    log_info "User $DEPLOY_USER already exists"
fi

# Step 2: Install Node.js 20+ if not installed
log_info "Checking Node.js installation..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "20" ]; then
    log_info "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
log_info "Node.js version: $(node -v)"

# Step 3: Install pnpm if not installed
log_info "Checking pnpm installation..."
if ! command -v pnpm &> /dev/null; then
    log_info "Installing pnpm..."
    npm install -g pnpm@10.2.0
fi
log_info "pnpm version: $(pnpm -v)"

# Step 4: Create app directory
log_info "Creating application directory..."
mkdir -p "$APP_DIR"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

# Step 5: Create environment file directory
log_info "Creating environment file directory..."
mkdir -p /opt/vayva
touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

# Step 6: Create environment file template
cat > "$ENV_FILE" << 'EOF'
# Core API Environment Configuration
# Replace all CHANGE_ME values with actual secrets

# Database
DATABASE_URL="postgresql://vayva:CHANGE_ME_DB_PASSWORD@163.245.209.203:5432/vayva?schema=public"

# Redis
REDIS_URL="redis://:CHANGE_ME_REDIS_PASSWORD@163.245.209.203:6379"

# Authentication
NEXTAUTH_SECRET="CHANGE_ME_NEXTAUTH_SECRET"
NEXTAUTH_URL="https://api.vayva.ng"
JWT_SECRET="CHANGE_ME_JWT_SECRET"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_CHANGE_ME"
NEXT_PUBLIC_PAYSTACK_KEY="pk_test_CHANGE_ME"

# Email
RESEND_API_KEY="re_CHANGE_ME"
RESEND_FROM_EMAIL="noreply@vayva.ng"

# MinIO / S3
MINIO_ENDPOINT="storage.vayva.ng"
MINIO_PORT="443"
MINIO_USE_SSL="true"
MINIO_ACCESS_KEY="CHANGE_ME_MINIO_ACCESS"
MINIO_SECRET_KEY="CHANGE_ME_MINIO_SECRET"
MINIO_BUCKET="vayva-uploads"

# Evolution API (WhatsApp)
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="CHANGE_ME_EVOLUTION_KEY"

# AI / Groq
GROQ_API_KEY="gsk_CHANGE_ME"

# Sentry (optional)
SENTRY_DSN=""

# Node Environment
NODE_ENV="production"
PORT="3001"
EOF

chown "$DEPLOY_USER:$DEPLOY_USER" "$ENV_FILE"
chmod 600 "$ENV_FILE"

log_warn "Environment file created at: $ENV_FILE"
log_warn "Please edit it and replace all CHANGE_ME values before starting the service!"

# Step 7: Create systemd service file
cat > "/etc/systemd/system/${SERVICE_NAME}.service" << EOF
[Unit]
Description=Vayva Core API Backend
After=network.target

[Service]
Type=simple
User=$DEPLOY_USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=$PORT
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
EOF

log_info "Created systemd service: $SERVICE_NAME"

# Step 8: Instructions for deployment
cat << EOF

========================================
🎉 Core API Setup Complete!
========================================

Next steps:

1. Edit the environment file:
   nano $ENV_FILE

   Required changes:
   - DATABASE_URL (update password)
   - REDIS_URL (update password)
   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
   - JWT_SECRET (generate with: openssl rand -base64 32)
   - PAYSTACK_SECRET_KEY
   - RESEND_API_KEY
   - MINIO_ACCESS_KEY and MINIO_SECRET_KEY
   - EVOLUTION_API_KEY
   - GROQ_API_KEY (optional)

2. Deploy the code:
   - Option A: Clone from git
     su - $DEPLOY_USER
     git clone <your-repo> $APP_DIR
     cd $APP_DIR/Backend/core-api
     pnpm install --frozen-lockfile
     pnpm build

   - Option B: Copy from local
     rsync -avz --exclude node_modules --exclude .next \
       ./Backend/core-api/ root@$VPS_IP:$APP_DIR/

3. Start the service:
   systemctl daemon-reload
   systemctl enable $SERVICE_NAME
   systemctl start $SERVICE_NAME

4. Check status:
   systemctl status $SERVICE_NAME --no-pager
   journalctl -u $SERVICE_NAME -f

5. Configure Nginx Proxy Manager:
   - Access: http://$VPS_IP:81
   - Add proxy host: api.vayva.ng → localhost:$PORT
   - Enable SSL with Let's Encrypt

========================================
EOF

log_info "Setup complete!"
