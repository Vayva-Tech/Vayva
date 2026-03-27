# Backend Deployment Guide - VPS (163.245.209.203)

## Prerequisites

- VPS with Ubuntu 20.04+ or similar
- Node.js 18+ installed
- PostgreSQL database accessible
- Domain configured (optional but recommended)

---

## 1. Server Setup

### SSH into VPS
```bash
ssh root@163.245.209.203
```

### Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Git
apt install -y git
```

---

## 2. Clone & Setup Repository

### Clone Repository
```bash
cd /var/www
git clone <your-repo-url> vayva-backend
cd vayva-backend/Backend/core-api
```

### Install Dependencies
```bash
pnpm install --prod
```

### Build Application
```bash
pnpm build
```

---

## 3. Environment Configuration

Create `.env.production`:

```bash
# Server
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vayva?schema=public"

# JWT Secret (GENERATE A STRONG SECRET!)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# CORS - Add your Vercel domain
ALLOWED_ORIGINS="https://your-app.vercel.app,https://your-domain.com"

# Logging
LOG_LEVEL=info

# Frontend URL (for CORS)
NEXT_PUBLIC_API_URL="http://163.245.209.203:3001/api/v1"
```

**Important**: 
- Generate a strong JWT secret: `openssl rand -base64 32`
- Update DATABASE_URL with your actual credentials
- Add your Vercel domain to ALLOWED_ORIGINS

---

## 4. PM2 Process Management

### Start Application with PM2
```bash
cd /var/www/vayva-backend/Backend/core-api
pm2 start ecosystem.config.js --env production
```

### Save PM2 Configuration
```bash
pm2 save
pm2 startup
# Run the command output by pm2 startup to enable on boot
```

### PM2 Commands
```bash
# View logs
pm2 logs vayva-backend

# Monitor
pm2 monit

# Restart
pm2 restart vayva-backend

# Stop
pm2 stop vayva-backend

# Delete
pm2 delete vayva-backend
```

---

## 5. Nginx Reverse Proxy (Recommended)

### Install Nginx
```bash
apt install -y nginx
```

### Create Nginx Configuration
```bash
nano /etc/nginx/sites-available/vayva-backend
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name 163.245.209.203;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
            add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
}
```

### Enable Site
```bash
ln -s /etc/nginx/sites-available/vayva-backend /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 6. SSL Certificate (Let's Encrypt)

### Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### Get SSL Certificate
```bash
certbot --nginx -d your-domain.com
```

### Auto-Renewal
Certbot automatically sets up renewal. Verify with:
```bash
certbot renew --dry-run
```

---

## 7. Firewall Configuration

### Configure UFW
```bash
# Allow SSH
ufw allow ssh

# Allow HTTP
ufw allow http

# Allow HTTPS
ufw allow https

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## 8. Database Setup

### Install PostgreSQL (if not already installed)
```bash
apt install -y postgresql postgresql-contrib
```

### Create Database & User
```bash
sudo -u postgres psql

CREATE DATABASE vayva;
CREATE USER vayva_user WITH PASSWORD 'strong-password-here';
GRANT ALL PRIVILEGES ON DATABASE vayva TO vayva_user;
\q
```

### Run Migrations
```bash
cd /var/www/vayva-backend
pnpm db:migrate
```

---

## 9. Monitoring & Logs

### Application Logs
```bash
# PM2 logs
pm2 logs vayva-backend --lines 100

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### Health Check Endpoint
Test the health check:
```bash
curl http://163.245.209.203/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-27T..."
}
```

---

## 10. Frontend Configuration

Update your frontend (Vercel) environment variables:

```bash
# In Vercel Dashboard > Project Settings > Environment Variables
NEXT_PUBLIC_API_URL="http://163.245.209.203:3001/api/v1"
# Or with domain:
NEXT_PUBLIC_API_URL="https://your-domain.com/api/v1"
```

Redeploy your frontend after setting these variables.

---

## 11. Testing Deployment

### Test Authentication
```bash
curl -X POST http://163.245.209.203:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@store.com","password":"password123"}'
```

### Test Inventory Endpoint
```bash
curl http://163.245.209.203:3001/api/v1/inventory/stock/test-variant \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 12. Backup Strategy

### Database Backup Script
Create `/usr/local/bin/backup-vayva-db.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d-%H%M)
BACKUP_DIR="/var/backups/vayva"
mkdir -p $BACKUP_DIR

pg_dump -U vayva_user vayva > $BACKUP_DIR/db-backup-$DATE.sql
gzip $BACKUP_DIR/db-backup-$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Make executable and add to crontab:
```bash
chmod +x /usr/local/bin/backup-vayva-db.sh
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-vayva-db.sh
```

---

## 13. Security Hardening

### Disable Root Login (Optional but Recommended)
```bash
# Create sudo user
adduser deploy
usermod -aG sudo deploy

# Edit SSH config
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no (if using SSH keys)

# Restart SSH
systemctl restart sshd
```

### Regular Updates
```bash
# Enable automatic security updates
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 14. Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs vayva-backend --err

# Check if port is in use
netstat -tulpn | grep 3001

# Check environment variables
cat .env.production
```

### Database Connection Issues
```bash
# Test connection
psql -U vayva_user -d vayva -h localhost

# Check PostgreSQL status
systemctl status postgresql
```

### CORS Errors
- Verify ALLOWED_ORIGINS includes your frontend domain
- Check Nginx CORS headers are configured correctly
- Test with curl to isolate backend issues

---

## Quick Reference

| Service | Command |
|---------|---------|
| Start Backend | `pm2 start vayva-backend` |
| Restart Backend | `pm2 restart vayva-backend` |
| View Logs | `pm2 logs vayva-backend` |
| Database Backup | `/usr/local/bin/backup-vayva-db.sh` |
| Nginx Reload | `systemctl reload nginx` |
| Check Status | `pm2 status` |

---

## Support & Monitoring

- **PM2 Monitor**: `pm2 monit`
- **Logs**: `/var/log/nginx/`, `~/.pm2/logs/`
- **Database**: `systemctl status postgresql`
- **Disk Space**: `df -h`
- **Memory**: `free -h`

---

**Last Updated**: 2026-03-27  
**Version**: 1.0  
**Status**: Production Ready ✅
