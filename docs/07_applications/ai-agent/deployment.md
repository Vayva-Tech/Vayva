# AI Agent Deployment Guide

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Environment:** VPS (Staging/Production)

---

## Overview

This guide covers deploying the ML-enhanced AI Agent to the VPS alongside the Evolution API (WhatsApp gateway).

## Prerequisites

- VPS access (root)
- Deploy user created (`vayva-deploy`)
- Repository synced to `/opt/vayva`
- Evolution API running on the same VPS
- PostgreSQL database accessible
- Redis accessible

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         VPS                                  │
│  ┌──────────────────┐      ┌─────────────────────────────┐  │
│  │  Evolution API   │      │       AI Agent              │  │
│  │   (Port 8080)    │◄────►│      (Port 4000)            │  │
│  │   WhatsApp GW    │      │  - ML Inference Engine      │  │
│  └──────────────────┘      │  - HTTP API Server          │  │
│           │                └─────────────────────────────┘  │
│           │                         │                       │
│           └─────────────────────────┤                       │
│                                     ▼                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Shared Services                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │   Redis      │  │  PostgreSQL  │  │   MinIO    │  │  │
│  │  │  (Port 6379) │  │   (Port 5432)│  │ (Port 9000)│  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Steps

### 1. Verify Prerequisites

```bash
# Check Evolution API is running
docker ps | grep evolution

# Verify Redis
docker ps | grep redis

# Check database connectivity
psql $DATABASE_URL -c "SELECT 1"
```

### 2. Create Environment File

```bash
# Create environment file
cat > /opt/vayva/ai-agent.env << 'EOF'
# ============================================
# VAYVA AI AGENT ENVIRONMENT CONFIGURATION
# ============================================
NODE_ENV=production

# Server Configuration
PORT=4000

# Database (same as worker)
DATABASE_URL=postgresql://vayva:PASSWORD@HOST:5432/vayva

# Redis (local to VPS)
REDIS_URL=redis://:PASSWORD@127.0.0.1:6379

# Evolution API (local on same VPS)
EVOLUTION_API_URL=http://127.0.0.1:8080
EVOLUTION_API_KEY=your-evolution-api-key
EVOLUTION_INSTANCE_NAME=vayva-main

# AI Provider API Keys (optional - ML works without these)
GROQ_API_KEY_MERCHANT=
GROQ_API_KEY_SUPPORT=
DEEPSEEK_API_KEY=
OPENAI_API_KEY=

# ML Configuration (all local - no external APIs needed)
ML_ENABLED=true
ML_SENTIMENT_ENABLED=true
ML_FORECAST_ENABLED=true
ML_RECOMMENDATIONS_ENABLED=true
ML_ANOMALY_DETECTION_ENABLED=true

# Performance
NODE_OPTIONS=--max-old-space-size=2048
ML_WORKER_THREADS=2
EOF

# Set permissions
chmod 600 /opt/vayva/ai-agent.env
chown vayva-deploy:vayva-deploy /opt/vayva/ai-agent.env
```

### 3. Build the Application

```bash
# Switch to deploy user
su - vayva-deploy

# Navigate to project
cd /opt/vayva/packages/ai-agent

# Install dependencies (if needed)
pnpm install

# Build TypeScript
npx tsc

# Verify build
ls -la dist/
# Should show: server.js, index.js, lib/, services/
```

### 4. Create Systemd Service

```bash
# Create service file (as root)
cat > /etc/systemd/system/vayva-ai-agent.service << 'EOF'
[Unit]
Description=Vayva AI Agent (ML-Enhanced)
After=network.target
Wants=vayva-evolution.service

[Service]
Type=simple
User=vayva-deploy
WorkingDirectory=/opt/vayva/packages/ai-agent
EnvironmentFile=/opt/vayva/ai-agent.env
Environment=NODE_OPTIONS=--max-old-space-size=2048
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload
```

### 5. Start the Service

```bash
# Start service
systemctl start vayva-ai-agent

# Enable auto-start
systemctl enable vayva-ai-agent

# Check status
systemctl status vayva-ai-agent --no-pager
```

### 6. Verify Deployment

```bash
# Health check
curl http://127.0.0.1:4000/health

# Test sentiment analysis
curl -X POST http://127.0.0.1:4000/ml/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text":"I love this product!"}'

# Test intent classification
curl -X POST http://127.0.0.1:4000/ml/intent \
  -H "Content-Type: application/json" \
  -d '{"message":"How much does this cost?"}'

# View logs
journalctl -u vayva-ai-agent -f
```

## Environment-Specific Configuration

### Staging (VPS 163.245.209.202)

```bash
# Port: 4000 (change if conflicting)
PORT=4000

# Database: Staging DB
DATABASE_URL=postgresql://vayva:PASSWORD@163.245.209.203:5432/vayva

# Redis: Local
REDIS_URL=redis://:PASSWORD@127.0.0.1:6379

# Evolution API: Local
EVOLUTION_API_URL=http://127.0.0.1:8080
```

### Production

```bash
# Port: 4000
PORT=4000

# Database: Production DB
DATABASE_URL=postgresql://vayva:PASSWORD@PROD_HOST:5432/vayva

# Redis: Production
REDIS_URL=redis://:PASSWORD@PROD_REDIS:6379

# Evolution API: Production
EVOLUTION_API_URL=http://127.0.0.1:8080
```

## Redeployment

### Quick Redeploy (Code Changes)

```bash
# As deploy user
su - vayva-deploy
cd /opt/vayva/packages/ai-agent

# Pull latest code (if git repo)
git pull

# Or rsync from local
# rsync -avz ./src/ root@vps:/opt/vayva/packages/ai-agent/src/

# Rebuild
npx tsc

# Restart service (as root)
sudo systemctl restart vayva-ai-agent

# Verify
sudo systemctl status vayva-ai-agent
```

### Full Redeploy (Clean Build)

```bash
# Stop service
systemctl stop vayva-ai-agent

# Clean and rebuild
su - vayva-deploy -c "cd /opt/vayva/packages/ai-agent && rm -rf dist && npx tsc"

# Start service
systemctl start vayva-ai-agent

# Verify
sleep 3
curl http://127.0.0.1:4000/health
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
journalctl -u vayva-ai-agent -n 50 --no-pager

# Common issues:
# 1. Port already in use
netstat -tlnp | grep 4000

# 2. Environment variables missing
grep -E "^(PORT|DATABASE_URL|REDIS_URL)" /opt/vayva/ai-agent.env

# 3. Build errors
ls -la /opt/vayva/packages/ai-agent/dist/
```

### Port Conflicts

If port 4000 is in use:

```bash
# Find available port
netstat -tlnp | grep -E '400[0-9]'

# Update environment
sed -i 's/PORT=4000/PORT=4001/' /opt/vayva/ai-agent.env

# Restart
systemctl restart vayva-ai-agent
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection string format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/db
```

### Redis Connection Issues

```bash
# Test Redis
redis-cli -u $REDIS_URL ping

# Should return: PONG
```

### Build Errors

```bash
# Clean build
rm -rf /opt/vayva/packages/ai-agent/dist

# Rebuild with verbose output
cd /opt/vayva/packages/ai-agent
npx tsc --listEmittedFiles

# Check TypeScript version
npx tsc --version
```

## Monitoring

### Service Status

```bash
# Check if running
systemctl is-active vayva-ai-agent

# View status
systemctl status vayva-ai-agent --no-pager

# Resource usage
systemctl show vayva-ai-agent --property=MemoryCurrent,CPUUsageNSec
```

### Logs

```bash
# Follow logs
journalctl -u vayva-ai-agent -f

# Last 100 lines
journalctl -u vayva-ai-agent -n 100 --no-pager

# Since last boot
journalctl -u vayva-ai-agent --since today
```

### Health Monitoring

```bash
# Create simple health check script
cat > /usr/local/bin/check-ai-agent.sh << 'EOF'
#!/bin/bash
if ! curl -sf http://127.0.0.1:4000/health > /dev/null; then
  echo "AI Agent is down!"
  systemctl restart vayva-ai-agent
fi
EOF
chmod +x /usr/local/bin/check-ai-agent.sh

# Add to crontab (every 5 minutes)
echo "*/5 * * * * /usr/local/bin/check-ai-agent.sh" | crontab -
```

## Backup and Recovery

### Backup Configuration

```bash
# Backup environment file
cp /opt/vayva/ai-agent.env /opt/vayva/ai-agent.env.bak-$(date +%Y%m%d)

# Backup build
tar czf /opt/vayva/ai-agent-backup-$(date +%Y%m%d).tar.gz \
  /opt/vayva/packages/ai-agent/dist \
  /opt/vayva/ai-agent.env
```

### Recovery

```bash
# Restore from backup
cp /opt/vayva/ai-agent.env.bak-20260307 /opt/vayva/ai-agent.env

# Restore build
tar xzf /opt/vayva/ai-agent-backup-20260307.tar.gz -C /

# Restart
systemctl restart vayva-ai-agent
```

## Security Considerations

### File Permissions

```bash
# Environment file should be readable only by owner
chmod 600 /opt/vayva/ai-agent.env
chown vayva-deploy:vayva-deploy /opt/vayva/ai-agent.env

# Build files readable by all, writable by owner
chmod -R 755 /opt/vayva/packages/ai-agent/dist
chown -R vayva-deploy:vayva-deploy /opt/vayva/packages/ai-agent/dist
```

### Network Security

```bash
# AI Agent only listens on localhost (127.0.0.1:4000)
# To expose externally, use reverse proxy (nginx)

# Check listening address
netstat -tlnp | grep 4000
# Should show: 127.0.0.1:4000
```

### API Key Security

- Never commit `.env` files
- Rotate API keys regularly
- Use different keys for staging/production
- Monitor API usage for anomalies

## Rollback

```bash
# Stop service
systemctl stop vayva-ai-agent

# Restore previous build (if backed up)
cp -r /opt/vayva/ai-agent-dist-backup /opt/vayva/packages/ai-agent/dist

# Start service
systemctl start vayva-ai-agent

# Verify
curl http://127.0.0.1:4000/health
```

## Related Documentation

- [AI Agent Overview](README.md)
- [API Reference](api-reference.md)
- [Integration Guide](integration-guide.md)
- [VPS Worker Deployment](../04_deployment/vps-worker.md)
- [Evolution API Setup](../04_deployment/vps-app-server.md)

---

**Questions?** Check the troubleshooting section or contact the platform team.
