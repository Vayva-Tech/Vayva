# Deployment Procedures

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

This document outlines the procedures for deploying Vayva applications to various environments.

## Pre-Deployment Checklist

### Code Review

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] No security vulnerabilities
- [ ] Documentation updated
- [ ] CHANGELOG.md updated

### Testing

- [ ] Unit tests: `pnpm test:unit`
- [ ] Integration tests: `pnpm test:integration`
- [ ] E2E tests: `pnpm test:e2e`
- [ ] Manual QA on staging
- [ ] Performance benchmarks

### Database

- [ ] Migrations reviewed
- [ ] Migration tested on staging
- [ ] Rollback plan prepared
- [ ] Backup completed (production)

## Frontend Deployment

### Vercel Deployment

Vercel deployments are automatic:

**Preview Deployments:**
```
Push to any branch → Automatic preview deployment
```

**Staging Deployment:**
```
Merge to main → Automatic staging deployment
```

**Production Deployment:**
```
Push tag (v1.x.x) → Automatic production deployment
```

### Manual Deployment

If needed, deploy manually via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Backend Deployment

### VPS Deployment

**Prerequisites:**
- SSH access to VPS
- Docker installed
- Environment variables configured

**Deployment Steps:**

```bash
# 1. SSH to VPS
ssh deploy@vayva-vps

# 2. Navigate to app directory
cd /opt/vayva

# 3. Pull latest code
git fetch origin
git checkout v1.2.0

# 4. Install dependencies
pnpm install --frozen-lockfile

# 5. Build application
pnpm build

# 6. Run database migrations
pnpm db:migrate:deploy

# 7. Restart services
pm2 restart all

# 8. Verify deployment
curl http://localhost:3001/health
```

### Docker Deployment

```bash
# Build image
docker build -t vayva/api:v1.2.0 .

# Push to registry
docker push vayva/api:v1.2.0

# Deploy on VPS
docker pull vayva/api:v1.2.0
docker-compose up -d
```

## Database Deployment

### Migration Deployment

**Staging:**
```bash
# Deploy migrations
pnpm db:migrate:deploy

# Verify
pnpm db:status
```

**Production:**
```bash
# 1. Enable maintenance mode
# (Set maintenance flag in database)

# 2. Create backup
neonctl backup create

# 3. Deploy migrations
pnpm db:migrate:deploy

# 4. Verify
pnpm db:status

# 5. Disable maintenance mode
```

### Rollback Procedure

If migration fails:

```bash
# 1. Identify last successful migration
pnpm db:migrate:status

# 2. Rollback to previous version
pnpm db:migrate:rollback

# 3. If needed, restore from backup
neonctl restore --backup-id <id>
```

## Worker Deployment

### BullMQ Worker

```bash
# 1. Deploy new code
# (Same as API deployment)

# 2. Graceful restart
# Workers finish current jobs before restarting
pm2 reload worker --update-env

# 3. Monitor queue
# Check BullMQ dashboard
```

### Queue Monitoring

```bash
# Check queue status
curl http://localhost:3001/health/queue

# Expected response:
{
  "status": "healthy",
  "queues": {
    "email": { "pending": 0, "active": 0 },
    "whatsapp": { "pending": 5, "active": 2 },
    "payment": { "pending": 0, "active": 0 }
  }
}
```

## Post-Deployment Verification

### Health Checks

```bash
# API health
curl https://api.vayva.ng/health

# Frontend health
curl https://vayva.ng/api/health

# Database health
curl https://api.vayva.ng/health/db
```

### Smoke Tests

```bash
# Run automated smoke tests
pnpm test:smoke

# Manual checks:
# - Homepage loads
# - Login works
# - Create test order
# - Payment processes
# - Webhooks fire
```

### Monitoring

- Check error rates in Logtail
- Verify metrics in dashboards
- Monitor queue depths
- Check database performance

## Rollback Procedures

### Frontend Rollback

**Vercel:**
```bash
# Via CLI
vercel rollback

# Or via Dashboard:
# 1. Go to Deployments
# 2. Find previous working version
# 3. Click "Promote to Production"
```

### Backend Rollback

```bash
# 1. SSH to VPS
ssh deploy@vayva-vps

# 2. Navigate to app
cd /opt/vayva

# 3. Checkout previous version
git checkout v1.1.9

# 4. Reinstall dependencies
pnpm install --frozen-lockfile

# 5. Rebuild
pnpm build

# 6. Restart services
pm2 restart all

# 7. Verify
curl http://localhost:3001/health
```

### Database Rollback

```bash
# If migration was applied:
# 1. Rollback migration
pnpm db:migrate:rollback

# If data corruption:
# 1. Stop application
# 2. Restore from backup
neonctl restore --backup-id <id>
# 3. Restart application
```

## Emergency Procedures

### Production Down

1. **Immediate Actions:**
   - Acknowledge incident
   - Enable maintenance page
   - Notify team

2. **Assessment:**
   - Check error logs
   - Verify infrastructure status
   - Identify root cause

3. **Recovery:**
   - If code issue: Rollback
   - If infra issue: Scale/restart
   - If DB issue: Restore backup

4. **Post-Incident:**
   - Document incident
   - Update runbooks
   - Schedule post-mortem

### Security Incident

1. **Immediate:**
   - Isolate affected systems
   - Preserve logs
   - Notify security team

2. **Investigation:**
   - Analyze attack vector
   - Assess data exposure
   - Identify compromised accounts

3. **Remediation:**
   - Patch vulnerabilities
   - Rotate secrets
   - Reset affected passwords

4. **Communication:**
   - Internal notification
   - Customer notification (if required)
   - Regulatory reporting (if required)

## Deployment Schedule

### Regular Deployments

| Environment | Schedule | Window |
|-------------|----------|--------|
| Staging | On merge to main | Any time |
| Production | Tuesday-Thursday | 10 AM - 4 PM WAT |

### Maintenance Windows

| Type | Schedule | Duration |
|------|----------|----------|
| Database migrations | Sunday 2 AM | 1 hour |
| Infrastructure updates | Sunday 2 AM | 2 hours |

### Freeze Periods

- Black Friday week
- Holiday season (Dec 20 - Jan 5)
- Major merchant events (by request)

---

**Questions?** Contact devops@vayva.ng
