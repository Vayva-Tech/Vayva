# VPS Automatic Deployment Setup Guide

**Purpose:** Configure VPS to automatically pull and deploy updates from Git repository

---

## 🎯 Deployment Architecture

```
GitHub Push → VPS Webhook/Script → Git Pull → Build → Restart Services
```

**Current Setup:**
- VPS IP: `163.245.203`
- Service Manager: **systemd** (not PM2/Docker)
- Backend: Core API running via systemd
- Frontend: Static files served by Nginx

---

## 📋 Prerequisites Check

### 1. Verify SSH Access
```bash
# Test connection to VPS
ssh fredrick@163.245.209.203
```

### 2. Check Current Services
```bash
# On VPS - check what's running
systemctl status vayva-backend
systemctl status nginx
systemctl status postgresql
systemctl status redis
```

### 3. Verify Git Installation
```bash
# On VPS
git --version
node --version
pnpm --version
```

---

## 🔧 Setup Options

### **Option 1: GitHub Actions Auto-Deploy (RECOMMENDED)**

Automatically deploys on push to main branch.

#### Step 1: Create GitHub Action Workflow

Create `.github/workflows/deploy-vps.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main, Vayva]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build backend
        run: pnpm --filter=@vayva/core-api build
        env:
          NODE_ENV: production
          DATABASE_URL: ${{ secrets.VPS_DATABASE_URL }}
      
      - name: Deploy to VPS via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          script: |
            cd /path/to/vayva
            
            # Pull latest changes
            git pull origin Vayva
            
            # Install dependencies
            pnpm install --prod
            
            # Build backend
            pnpm --filter=@vayva/core-api build
            
            # Run database migrations
            pnpm --filter=@vayva/db migrate
            
            # Restart backend service
            sudo systemctl restart vayva-backend
            
            # Build frontend if changed
            if git diff HEAD~1 HEAD --quiet -- Frontend/; then
              echo "No frontend changes"
            else
              pnpm --filter=@vayva/merchant build
              pnpm --filter=marketing build
              sudo systemctl reload nginx
            fi
            
            # Check service status
            systemctl status vayva-backend --no-pager
            
            # Cleanup old builds
            pnpm store prune
```

#### Step 2: Add GitHub Secrets

Go to: `GitHub Repo → Settings → Secrets and variables → Actions`

Add these secrets:
```
VPS_HOST=163.245.209.203
VPS_USERNAME=fredrick
VPS_SSH_KEY=<your-ssh-private-key>
VPS_DATABASE_URL=postgresql://user:pass@localhost:5432/vayva
```

#### Step 3: Create SSH Key for GitHub Actions

On your local machine:
```bash
# Generate dedicated SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions@vayva" -f ~/.ssh/github-actions-vps
```

Copy the public key to VPS:
```bash
ssh-copy-id -i ~/.ssh/github-actions-vps.pub fredrick@163.245.209.203
```

Add private key to GitHub Secrets (copy entire content):
```bash
cat ~/.ssh/github-actions-vps | pbcopy
```

---

### **Option 2: Manual Deployment Script (SIMPLER)**

For manual deployments with a single command.

#### Step 1: Create Deployment Script on VPS

SSH into VPS:
```bash
ssh fredrick@163.245.209.203
```

Create deployment script:
```bash
sudo nano /usr/local/bin/vayva-deploy.sh
```

Add this content:
```bash
#!/bin/bash
set -e

echo "🚀 Starting Vayva deployment..."

# Navigate to repo
cd /home/fredrick/vayva || exit 1

# Pull latest changes
echo "📦 Pulling latest changes..."
git pull origin Vayva

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install --prod

# Build backend
echo "🔨 Building backend..."
pnpm --filter=@vayva/core-api build

# Run migrations
echo "🗄️ Running database migrations..."
pnpm --filter=@vayva/db migrate

# Restart backend service
echo "🔄 Restarting backend service..."
sudo systemctl restart vayva-backend

# Check if frontend changed
if git diff HEAD~1 HEAD --quiet -- Frontend/; then
    echo "✅ No frontend changes detected"
else
    echo "🎨 Building frontend applications..."
    pnpm --filter=@vayva/merchant build
    pnpm --filter=marketing build
    
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
fi

# Verify services
echo "✅ Checking service status..."
systemctl is-active vayva-backend
systemctl is-active nginx

# Cleanup
echo "🧹 Cleaning up..."
pnpm store prune

echo "✅ Deployment completed successfully!"
```

Make it executable:
```bash
sudo chmod +x /usr/local/bin/vayva-deploy.sh
```

#### Step 2: Deploy from Local Machine

Now you can deploy with one command:
```bash
# Push to git
git push origin Vayva

# Then SSH and deploy
ssh fredrick@163.245.209.203 'sudo /usr/local/bin/vayva-deploy.sh'
```

Or create a local alias in `~/.zshrc`:
```bash
alias vayva-deploy='ssh fredrick@163.245.209.203 "sudo /usr/local/bin/vayva-deploy.sh"'
```

Then just run:
```bash
vayva-deploy
```

---

### **Option 3: GitHub Webhook Auto-Deploy (ADVANCED)**

Fully automatic deployment when you push to GitHub.

#### Step 1: Create Webhook Receiver on VPS

On VPS, create webhook script:
```bash
nano /var/www/webhook/deploy-webhook.js
```

```javascript
const http = require('http');
const { exec } = require('child_process');
const crypto = require('crypto');

const SECRET = process.env.WEBHOOK_SECRET;
const PORT = 8080;

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      // Verify signature
      const signature = req.headers['x-hub-signature-256'];
      const hmac = crypto.createHmac('sha256', SECRET);
      const digest = 'sha256=' + hmac.update(body).digest('hex');
      
      if (signature !== digest) {
        res.writeHead(401);
        res.end('Unauthorized');
        return;
      }
      
      // Execute deployment
      exec('/usr/local/bin/vayva-deploy.sh', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error}`);
          res.writeHead(500);
          res.end(stderr);
          return;
        }
        
        console.log(`Output: ${stdout}`);
        res.writeHead(200);
        res.end(stdout);
      });
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
```

#### Step 2: Create Systemd Service for Webhook

Create service file:
```bash
sudo nano /etc/systemd/system/vayva-webhook.service
```

Add:
```ini
[Unit]
Description=Vayva Deployment Webhook
After=network.target

[Service]
Type=simple
User=fredrick
WorkingDirectory=/var/www/webhook
ExecStart=/usr/bin/node /var/www/webhook/deploy-webhook.js
Restart=always
Environment=NODE_ENV=production
Environment=WEBHOOK_SECRET=your-secret-key-here

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable vayva-webhook
sudo systemctl start vayva-webhook
sudo systemctl status vayva-webhook
```

#### Step 3: Configure Nginx Reverse Proxy

Add to Nginx config:
```bash
sudo nano /etc/nginx/sites-available/vayva
```

Add location block:
```nginx
location /webhook {
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 4: Add Webhook to GitHub

Go to: `GitHub Repo → Settings → Webhooks → Add webhook`

Configure:
- **Payload URL:** `http://163.245.209.203/webhook`
- **Content type:** `application/json`
- **Secret:** `your-secret-key-here` (same as in script)
- **Events:** Just the push event
- **Active:** ✅

---

## 🔒 Security Hardening

### 1. SSH Key Authentication Only

Edit SSH config on VPS:
```bash
sudo nano /etc/ssh/sshd_config
```

Set:
```
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
AllowUsers fredrick
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

### 2. Firewall Configuration

Allow only necessary ports:
```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

### 3. Fail2Ban Protection

Install and configure:
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📊 Monitoring & Rollback

### Deployment Logging

Create log directory:
```bash
mkdir -p ~/deploy-logs
```

Update deploy script to log:
```bash
/usr/local/bin/vayva-deploy.sh 2>&1 | tee ~/deploy-logs/deploy-$(date +%Y%m%d-%H%M%S).log
```

### Health Check After Deploy

Add to deploy script:
```bash
# Wait for service to be ready
sleep 5

# Check backend health
curl -f http://localhost:4000/api/health || exit 1

# Check frontend health  
curl -f http://localhost:3000/api/health || exit 1

echo "✅ All health checks passed!"
```

### Quick Rollback Script

Create rollback script:
```bash
sudo nano /usr/local/bin/vayva-rollback.sh
```

```bash
#!/bin/bash
set -e

echo "↩️ Rolling back deployment..."

cd /home/fredrick/vayva

# Get previous commit
PREV_COMMIT=$(git rev-parse HEAD~1)

# Reset to previous
git reset --hard $PREV_COMMIT

# Rebuild and restart
pnpm install --prod
pnpm --filter=@vayva/core-api build
sudo systemctl restart vayva-backend

# Rebuild frontend if needed
pnpm --filter=@vayva/merchant build
pnpm --filter=marketing build
sudo systemctl reload nginx

echo "✅ Rolled back to commit: $PREV_COMMIT"
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/vayva-rollback.sh
```

Use rollback:
```bash
vayva-rollback
```

---

## 🎯 Recommended Setup

**For Production:** Use **Option 1 (GitHub Actions)**
- ✅ Automated testing before deploy
- ✅ Audit trail of deployments
- ✅ Easy rollback to previous versions
- ✅ No manual intervention needed

**For Development/Staging:** Use **Option 2 (Manual Script)**
- ✅ Simple and reliable
- ✅ Full control over timing
- ✅ Easy to debug issues

**For Advanced Automation:** Use **Option 3 (Webhook)**
- ✅ Instant deployment
- ✅ No CI/CD minutes used
- ⚠️ Requires more setup and maintenance

---

## 📝 Quick Start Commands

### Initial Setup (One-time)
```bash
# 1. Clone repo on VPS
ssh fredrick@163.245.209.203
git clone <repo-url> /home/fredrick/vayva
cd /home/fredrick/vayva

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env
# Edit .env with production values

# 4. Build applications
pnpm --filter=@vayva/core-api build
pnpm --filter=@vayva/merchant build
pnpm --filter=marketing build

# 5. Create systemd service (if not exists)
sudo nano /etc/systemd/system/vayva-backend.service

# 6. Enable and start
sudo systemctl daemon-reload
sudo systemctl enable vayva-backend
sudo systemctl start vayva-backend
```

### Deploy Command (After Setup)
```bash
# Option A: GitHub Actions (automatic on push)
git push origin Vayva

# Option B: Manual script
vayva-deploy

# Option C: Webhook (automatic on push)
git push origin Vayva
```

---

## 🔍 Troubleshooting

### Deployment Fails
```bash
# Check logs
journalctl -u vayva-backend -n 50

# Check recent deploy logs
tail -f ~/deploy-logs/latest.log

# Manually run deploy script with debug
bash -x /usr/local/bin/vayva-deploy.sh
```

### Service Won't Start
```bash
# Check service status
systemctl status vayva-backend

# Check for port conflicts
sudo lsof -i :4000

# Verify build output
ls -la Backend/core-api/dist/
```

### Git Pull Fails
```bash
# Check permissions
ls -la .git/

# Fix ownership
sudo chown -R fredrick:fredrick .git

# Stash local changes
git stash
git pull
git stash pop
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] SSH key authentication works
- [ ] GitHub Actions can connect
- [ ] Deploy script runs successfully
- [ ] Backend service restarts properly
- [ ] Frontend rebuilds correctly
- [ ] Nginx serves updated files
- [ ] Health checks pass
- [ ] Rollback works
- [ ] Logs are being created
- [ ] Firewall rules are correct

---

**Next Steps:** Choose your preferred deployment method and follow the setup guide above!
