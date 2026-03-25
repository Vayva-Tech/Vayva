# GitHub Actions Auto-Deployment Setup Instructions

**Status:** ✅ All files created, waiting for VPS SSH access to complete setup

---

## 🎯 What's Been Done

✅ SSH key pair generated at `~/.ssh/github-actions-vps`  
✅ GitHub Actions workflow created at `.github/workflows/deploy-vps.yml`  
✅ Deployment scripts created in `scripts/` directory  
✅ Comprehensive documentation added  

---

## ⚠️ ISSUE: VPS SSH Connection Refused

**Problem:** Cannot connect to VPS at `163.245.209.203:22`  
**Error:** Connection refused

**Possible Causes:**
1. VPS is powered off
2. SSH service is not running
3. SSH is running on a different port
4. Firewall blocking port 22

**Next Steps:**
1. Check VPS status and power it on if needed
2. Verify SSH service is running: `systemctl status sshd`
3. Check SSH port: `grep Port /etc/ssh/sshd_config`
4. Verify firewall rules: `ufw status`

---

## 📋 MANUAL SETUP STEPS

### Step 1: Copy SSH Public Key to VPS

Once VPS is accessible, run:

```bash
# Copy the public key to VPS
ssh-copy-id -i ~/.ssh/github-actions-vps.pub fredrick@163.245.209.203

# OR manually copy:
cat ~/.ssh/github-actions-vps.pub | pbcopy

# Then SSH into VPS and paste:
ssh fredrick@163.245.209.203
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste the key here (Cmd+V)
chmod 600 ~/.ssh/authorized_keys
exit
```

### Step 2: Test SSH Connection

```bash
# Test with the new key
ssh -i ~/.ssh/github-actions-vps fredrick@163.245.209.203 "echo 'Connection successful!'"
```

### Step 3: Add GitHub Secrets

Go to: **GitHub → Your Repo → Settings → Secrets and variables → Actions**

Click **"New repository secret"** and add these 3 secrets:

| Secret Name | Value |
|------------|-------|
| `VPS_HOST` | `163.245.209.203` |
| `VPS_USERNAME` | `fredrick` |
| `VPS_SSH_KEY` | *(paste entire content of `~/.ssh/github-actions-vps`)* |

To get the SSH key content:
```bash
cat ~/.ssh/github-actions-vps | pbcopy
```

### Step 4: Deploy Backend Service on VPS

SSH into VPS and create systemd service:

```bash
ssh fredrick@163.245.209.203

# Create systemd service file
sudo nano /etc/systemd/system/vayva-backend.service
```

Paste this content:
```ini
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
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable vayva-backend
sudo systemctl start vayva-backend
sudo systemctl status vayva-backend
```

### Step 5: Install Deployment Script on VPS

```bash
# Copy deployment script to VPS
scp -i ~/.ssh/github-actions-vps scripts/deploy-vps.sh fredrick@163.245.209.203:/tmp/deploy-vps.sh

# SSH and install it
ssh -i ~/.ssh/github-actions-vps fredrick@163.245.209.203 << 'EOF'
sudo cp /tmp/deploy-vps.sh /usr/local/bin/vayva-deploy.sh
sudo chmod +x /usr/local/bin/vayva-deploy.sh
echo "✅ Deployment script installed"
EOF
```

### Step 6: Test Manual Deployment

```bash
# Test the deployment script
ssh -i ~/.ssh/github-actions-vps fredrick@163.245.209.203 "vayva-deploy"
```

### Step 7: Enable GitHub Actions

The workflow file is already created at `.github/workflows/deploy-vps.yml`

Just push your code:
```bash
git push origin Vayva
```

Then monitor at: **GitHub → Actions → Deploy to VPS**

---

## 🔧 TROUBLESHOOTING VPS CONNECTION

### Check if VPS is Running

```bash
# Ping the VPS
ping 163.245.209.203

# If no response, VPS might be off
# Access your VPS provider dashboard and power it on
```

### Check SSH Service Status

If you have console access to VPS:
```bash
# Check SSH status
sudo systemctl status sshd

# If not running, start it
sudo systemctl start sshd
sudo systemctl enable sshd

# Check what port SSH is listening on
sudo netstat -tlnp | grep ssh
# or
sudo ss -tlnp | grep ssh
```

### Check Firewall Rules

```bash
# Check firewall status
sudo ufw status

# Allow SSH if blocked
sudo ufw allow 22/tcp
sudo ufw reload
```

### Alternative: Use Different SSH Port

If SSH is on a different port (e.g., 2222):

1. Update `.github/workflows/deploy-vps.yml`:
```yaml
- name: Deploy to VPS via SSH
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USERNAME }}
    key: ${{ secrets.VPS_SSH_KEY }}
    port: 2222  # Change this
```

2. Update deployment scripts to use the correct port

---

## ✅ VERIFICATION CHECKLIST

After completing setup, verify:

- [ ] SSH key copied to VPS successfully
- [ ] Can connect without password: `ssh -i ~/.ssh/github-actions-vps fredrick@163.245.209.203`
- [ ] GitHub secrets added (VPS_HOST, VPS_USERNAME, VPS_SSH_KEY)
- [ ] Backend systemd service created and running
- [ ] Deployment script installed at `/usr/local/bin/vayva-deploy.sh`
- [ ] Manual deployment works: `vayva-deploy`
- [ ] GitHub Actions triggered on push
- [ ] Automatic deployment completes successfully

---

## 🚀 QUICK START (When VPS is Accessible)

```bash
# 1. Copy SSH key
ssh-copy-id -i ~/.ssh/github-actions-vps.pub fredrick@163.245.209.203

# 2. Test connection
ssh -i ~/.ssh/github-actions-vps fredrick@163.245.209.203 "echo Connected!"

# 3. Add GitHub secrets (via web UI)
# Go to GitHub → Settings → Secrets → Add:
#   VPS_HOST=163.245.209.203
#   VPS_USERNAME=fredrick
#   VPS_SSH_KEY=<paste ~/.ssh/github-actions-vps>

# 4. Push code
git push origin Vayva

# 5. Watch deployment at GitHub → Actions
```

---

## 📞 SUPPORT

If you encounter issues:

1. **Check VPS is powered on** in your hosting provider dashboard
2. **Verify SSH is running**: `systemctl status sshd`
3. **Check logs**: `journalctl -u sshd -n 50`
4. **Test locally first**: Run `vayva-deploy` manually before enabling auto-deploy

---

**Current Status:** ⏳ Waiting for VPS SSH access to complete setup  
**Files Ready:** ✅ All deployment files committed and ready  
**Next Action:** Fix VPS SSH connectivity issue
