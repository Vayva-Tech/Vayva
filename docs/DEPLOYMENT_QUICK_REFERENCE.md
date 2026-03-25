# VPS Deployment Quick Reference

## 🚀 Quick Deploy Commands

### Option 1: Manual Deployment (Recommended for now)

**Deploy to VPS:**
```bash
# SSH into VPS and run deploy script
ssh fredrick@163.245.209.203 "sudo /usr/local/bin/vayva-deploy.sh"
```

**Or copy script to VPS first:**
```bash
# Copy deployment script to VPS
scp scripts/deploy-vps.sh fredrick@163.245.209.203:/tmp/deploy-vps.sh

# SSH and install it
ssh fredrick@163.245.209.203 "sudo cp /tmp/deploy-vps.sh /usr/local/bin/vayva-deploy.sh && sudo chmod +x /usr/local/bin/vayva-deploy.sh"

# Then deploy
ssh fredrick@163.245.209.203 "vayva-deploy"
```

### Option 2: GitHub Actions (Automatic)

**Just push to Git:**
```bash
git add .
git commit -m "feat: your changes"
git push origin Vayva
```

GitHub Actions will automatically deploy to VPS!

---

## 📋 Setup Checklist

### First Time Setup on VPS:

```bash
# 1. SSH into VPS
ssh fredrick@163.245.209.203

# 2. Clone repo (if not already done)
git clone <your-repo-url> /home/fredrick/vayva
cd /home/fredrick/vayva

# 3. Install dependencies
pnpm install

# 4. Setup environment file
cp .env.example .env
nano .env  # Edit with production values

# 5. Build applications
pnpm --filter=@vayva/core-api build
pnpm --filter=@vayva/merchant build
pnpm --filter=marketing build

# 6. Create systemd service for backend
sudo nano /etc/systemd/system/vayva-backend.service

# Add this content:
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

# 7. Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable vayva-backend
sudo systemctl start vayva-backend

# 8. Verify it's running
systemctl status vayva-backend
curl http://localhost:4000/api/health

# 9. Copy deployment script
sudo cp /path/to/scripts/deploy-vps.sh /usr/local/bin/vayva-deploy.sh
sudo chmod +x /usr/local/bin/vayva-deploy.sh
```

---

## 🔑 GitHub Actions Setup

### Step 1: Generate SSH Key

```bash
# Generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions@vayva" -f ~/.ssh/github-actions-vps

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/github-actions-vps.pub fredrick@163.245.209.203

# Test connection
ssh -i ~/.ssh/github-actions-vps fredrick@163.245.209.203
```

### Step 2: Add GitHub Secrets

Go to: `GitHub → Settings → Secrets and variables → Actions → New repository secret`

Add these secrets:
```
VPS_HOST=163.245.209.203
VPS_USERNAME=fredrick
VPS_SSH_KEY=<paste contents of ~/.ssh/github-actions-vps>
```

### Step 3: Enable Workflow

The workflow is already created at `.github/workflows/deploy-vps.yml`

Just push to trigger it:
```bash
git push origin Vayva
```

Check deployment status at: `GitHub → Actions → Deploy to VPS`

---

## 🔧 Useful Commands

### Monitor Deployment

```bash
# Watch deployment logs in real-time
journalctl -u vayva-backend -f

# Check recent deployments
tail -f ~/deploy-logs/*.log

# View backend service status
systemctl status vayva-backend

# View Nginx status
systemctl status nginx
```

### Rollback if Something Breaks

```bash
# SSH and rollback
ssh fredrick@163.245.209.203 "sudo /usr/local/bin/vayva-rollback.sh"
```

### Health Checks

```bash
# Check backend health
curl http://localhost:4000/api/health

# Check frontend health
curl http://localhost:3000/api/health

# Check all services
systemctl is-active vayva-backend nginx postgresql redis
```

### Debug Failed Deployments

```bash
# Check what went wrong
systemctl status vayva-backend --no-pager

# View detailed logs
journalctl -u vayva-backend -n 50 --no-pager

# Manually run deploy script with debug
bash -x /usr/local/bin/vayva-deploy.sh

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
top
```

---

## 🎯 Common Scenarios

### Scenario 1: Quick Bug Fix

```bash
# Make changes
# Test locally

# Commit and push
git add .
git commit -m "fix: urgent bug fix"
git push origin Vayva

# If using GitHub Actions, deployment starts automatically
# If manual, SSH and deploy:
ssh fredrick@163.245.209.203 "vayva-deploy"
```

### Scenario 2: Database Migration

```bash
# The deploy script automatically runs migrations
# But you can also run manually:

ssh fredrick@163.245.209.203
cd /home/fredrick/vayva
pnpm --filter=@vayva/db migrate
```

### Scenario 3: Frontend Only Changes

```bash
# The deploy script detects frontend changes
# It will only rebuild frontend if Frontend/ or packages/ changed

# To force frontend rebuild:
ssh fredrick@163.245.209.203
cd /home/fredrick/vayva
pnpm --filter=@vayva/merchant build
pnpm --filter=marketing build
sudo systemctl reload nginx
```

### Scenario 4: Backend Service Crashes

```bash
# Restart the service
ssh fredrick@163.245.209.203 "sudo systemctl restart vayva-backend"

# Check if it started
ssh fredrick@163.245.209.203 "systemctl status vayva-backend"

# If still failing, check logs
ssh fredrick@163.245.209.203 "journalctl -u vayva-backend -n 100"
```

---

## ⚠️ Troubleshooting

### Problem: Deployment Fails with Permission Error

**Solution:**
```bash
# SSH into VPS
ssh fredrick@163.245.209.203

# Fix directory permissions
sudo chown -R fredrick:fredrick /home/fredrick/vayva
chmod -R 755 /home/fredrick/vayva
```

### Problem: Out of Disk Space

**Solution:**
```bash
# SSH into VPS
ssh fredrick@163.245.209.203

# Clean up old builds and node_modules
cd /home/fredrick/vayva
pnpm store prune
rm -rf node_modules/.cache

# Remove old logs
sudo journalctl --vacuum-time=7d
```

### Problem: Port Already in Use

**Solution:**
```bash
# Find what's using the port
sudo lsof -i :4000

# Kill the process if needed
sudo kill -9 <PID>

# Or stop conflicting service
sudo systemctl stop <service-name>
```

### Problem: Database Connection Fails

**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
sudo -u postgres psql -c "\l" | grep vayva

# Check connection string in .env
cat /home/fredrick/vayva/.env | grep DATABASE_URL
```

### Problem: GitHub Actions Can't Connect

**Solution:**
```bash
# Regenerate SSH key
ssh-keygen -t ed25519 -C "github-actions@vayva" -f ~/.ssh/github-actions-vps

# Copy to VPS again
ssh-copy-id -i ~/.ssh/github-actions-vps.pub fredrick@163.245.209.203

# Update GitHub secret with new key
cat ~/.ssh/github-actions-vps | pbcopy
# Paste to GitHub → Settings → Secrets → VPS_SSH_KEY
```

---

## 📊 Monitoring Dashboard

Create a simple monitoring script:

```bash
# Create monitoring script
nano /usr/local/bin/vayva-status.sh
```

```bash
#!/bin/bash
echo "Vayva System Status"
echo "==================="
echo ""
echo "Backend: $(systemctl is-active vayva-backend)"
echo "Nginx: $(systemctl is-active nginx)"
echo "PostgreSQL: $(systemctl is-active postgresql)"
echo "Redis: $(systemctl is-active redis)"
echo ""
echo "Disk Usage: $(df -h / | tail -1 | awk '{print $5}')"
echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo ""
echo "Last Deployment:"
cd /home/fredrick/vayva && git log -1 --format="%h %s (%cr)"
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/vayva-status.sh
```

Run anytime:
```bash
vayva-status
```

---

## 🎉 Success Criteria

Deployment is successful when:

✅ All services show "active (running)"  
✅ Health check returns HTTP 200  
✅ No errors in recent logs  
✅ Application responds correctly  
✅ Database migrations completed  
✅ Static assets load properly  

---

**Remember:** Always test deployments in staging before production!
