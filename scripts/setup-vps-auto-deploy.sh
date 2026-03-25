#!/bin/bash
set -e

echo "🚀 Vayva VPS Auto-Deployment Setup Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="163.245.209.203"
VPS_USER="fredrick"
SSH_KEY="$HOME/.ssh/github-actions-vps"

echo "Configuration:"
echo "  VPS Host: $VPS_HOST"
echo "  VPS User: $VPS_USER"
echo "  SSH Key: $SSH_KEY"
echo ""

# Step 1: Check if SSH key exists
echo "Step 1: Checking SSH key..."
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${YELLOW}⚠️ SSH key not found. Generating new key...${NC}"
    ssh-keygen -t ed25519 -C "github-actions@vayva" -f "$SSH_KEY" -N ""
else
    echo -e "${GREEN}✅ SSH key exists${NC}"
fi
echo ""

# Step 2: Test VPS connection
echo "Step 2: Testing VPS connection..."
if ssh -i "$SSH_KEY" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "echo 'Connection successful'" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ VPS connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to VPS at $VPS_HOST${NC}"
    echo ""
    echo "Possible issues:"
    echo "  1. VPS is powered off"
    echo "  2. SSH service is not running"
    echo "  3. SSH is on a different port"
    echo "  4. Firewall blocking port 22"
    echo ""
    echo "Please check your VPS status and try again."
    exit 1
fi
echo ""

# Step 3: Copy SSH key to VPS
echo "Step 3: Copying SSH key to VPS..."
ssh-copy-id -i "${SSH_KEY}.pub" "$VPS_USER@$VPS_HOST"
echo -e "${GREEN}✅ SSH key copied successfully${NC}"
echo ""

# Step 4: Clone/update repository on VPS
echo "Step 4: Setting up repository on VPS..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" << 'ENDSSH'
if [ ! -d "/home/fredrick/vayva" ]; then
    echo "Cloning repository..."
    cd /home/fredrick
    # You'll need to provide the repo URL here
    echo "⚠️ Please clone your repository manually:"
    echo "   git clone <your-repo-url> /home/fredrick/vayva"
else
    echo "Repository already exists"
    cd /home/fredrick/vayva
    echo "Current commit:"
    git log -1 --oneline
fi
ENDSSH
echo ""

# Step 5: Install dependencies on VPS
echo "Step 5: Installing dependencies on VPS..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" << 'ENDSSH'
cd /home/fredrick/vayva
if [ ! -f "node_modules/.bin/pnpm" ]; then
    echo "Installing pnpm globally..."
    npm install -g pnpm
else
    echo "pnpm already installed"
fi

echo "Installing project dependencies..."
pnpm install
ENDSSH
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 6: Create systemd service
echo "Step 6: Creating systemd service for backend..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" << 'ENDSSH'
# Check if service already exists
if systemctl is-active --quiet vayva-backend 2>/dev/null; then
    echo "Backend service already running"
else
    echo "Creating systemd service..."
    sudo tee /etc/systemd/system/vayva-backend.service > /dev/null << 'EOSERVICE'
[Unit]
Description=Vayva Backend API
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=fredrick
WorkingDirectory=/home/fredrick/vayva
ExecStart=/usr/bin/node Backend/core-api/dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/home/fredrick/vayva/.env
StandardOutput=journal
StandardError=journal
SyslogIdentifier=vayva-backend

[Install]
WantedBy=multi-user.target
EOSERVICE

    echo "Enabling and starting service..."
    sudo systemctl daemon-reload
    sudo systemctl enable vayva-backend
    sudo systemctl start vayva-backend
    
    sleep 2
    
    if systemctl is-active --quiet vayva-backend; then
        echo "✅ Backend service started successfully"
    else
        echo "⚠️ Backend service may have issues. Check with: systemctl status vayva-backend"
    fi
fi
ENDSSH
echo ""

# Step 7: Install deployment script
echo "Step 7: Installing deployment script on VPS..."
scp -i "$SSH_KEY" scripts/deploy-vps.sh "$VPS_USER@$VPS_HOST:/tmp/deploy-vps.sh"
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" << 'ENDSSH'
sudo cp /tmp/deploy-vps.sh /usr/local/bin/vayva-deploy.sh
sudo chmod +x /usr/local/bin/vayva-deploy.sh
rm /tmp/deploy-vps.sh
echo "✅ Deployment script installed at /usr/local/bin/vayva-deploy.sh"
ENDSSH
echo ""

# Step 8: Test deployment
echo "Step 8: Testing deployment script..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "vayva-deploy || echo 'Deployment test completed (may have failed due to missing .env or other config)'"
echo ""

# Step 9: Instructions for GitHub secrets
echo ""
echo "=========================================="
echo "✅ VPS Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps to enable automatic deployment:"
echo ""
echo "1. Add GitHub Secrets:"
echo "   Go to: GitHub → Your Repo → Settings → Secrets and variables → Actions"
echo ""
echo "   Add these secrets:"
echo "   - VPS_HOST: $VPS_HOST"
echo "   - VPS_USERNAME: $VPS_USER"
echo "   - VPS_SSH_KEY: $(cat $SSH_KEY | pbcopy && echo '(copied to clipboard)')"
echo ""
echo "2. Push code to trigger deployment:"
echo "   git push origin Vayva"
echo ""
echo "3. Monitor deployment at:"
echo "   GitHub → Actions → Deploy to VPS"
echo ""
echo "Manual deployment command:"
echo "   ssh $VPS_USER@$VPS_HOST 'vayva-deploy'"
echo ""
echo -e "${GREEN}Setup complete! 🎉${NC}"
