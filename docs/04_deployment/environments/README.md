# Deployment Environments

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

Vayva uses a multi-environment deployment strategy to ensure safe releases and reliable operations.

## Environment Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     ENVIRONMENT FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Development → Preview → Staging → Production              │
│      ↑            ↑          ↑          ↑                  │
│   Localhost   PR Branch    Main      Tagged               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Local Development

**Purpose:** Individual developer workstations

**Configuration:**
- Local PostgreSQL (Docker)
- Local Redis (Docker)
- Development API keys
- Hot reload enabled

**URLs:**
- Marketing: http://localhost:3000
- Merchant Admin: http://localhost:3001
- Storefront: http://localhost:3002
- Ops Console: http://localhost:3003
- Core API: http://localhost:3004

**Database:**
- Local PostgreSQL instance
- Auto-migrated on startup
- Seeded with test data

---

## Preview Environment

**Purpose:** Pull request validation

**Trigger:** PR creation/update

**Features:**
- Automatic deployment per PR
- Isolated database (ephemeral)
- Production-like configuration
- Comment-based deployment URLs

**Process:**
1. Developer creates PR
2. Vercel deploys automatically
3. Team reviews on preview URL
4. Merges to main when approved

**URLs:**
- `https://{branch}-vayva.vercel.app`

---

## Staging Environment

**Purpose:** Pre-production testing

**Trigger:** Merge to main branch

**Configuration:**
- Production-like infrastructure
- Staging database (neon)
- Staging API keys
- Full monitoring enabled

**URLs:**
- Marketing: https://staging.vayva.ng
- Merchant Admin: https://admin-staging.vayva.ng
- Ops Console: https://ops-staging.vayva.ng
- API: https://api-staging.vayva.ng

**Data:**
- Anonymized production data
- Test merchants and orders
- Sandbox payment processing

**Testing:**
- Automated E2E tests
- QA manual testing
- Performance benchmarks

---

## Production Environment

**Purpose:** Live customer-facing platform

**Trigger:** Git tag push (semantic version)

**Configuration:**
- Full production infrastructure
- Production database (neon)
- Live API keys
- Maximum monitoring

**URLs:**
- Marketing: https://vayva.ng
- Merchant Admin: https://admin.vayva.ng
- Storefront: https://{store}.vayva.ng
- Ops Console: https://ops.vayva.ng
- API: https://api.vayva.ng

**Infrastructure:**

```
┌─────────────────────────────────────────┐
│              Vercel Edge                │
│         (Frontend Applications)         │
│         - Auto-scaling                  │
│         - Global CDN                    │
│         - Edge functions                │
└─────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────┐
│              VPS (Hetzner)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ Core API │ │  Worker  │ │Evolution ││
│  │          │ │          │ │ WhatsApp ││
│  │ - Docker │ │ - Docker │ │ - Docker ││
│  │ - PM2    │ │ - BullMQ │ │          ││
│  └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────┐
│              Data Layer                 │
│  ┌──────────────┐  ┌──────────────┐    │
│  │   Neon DB    │  │ Upstash Redis│    │
│  │  (Postgres)  │  │   (Cache)    │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
```

## Environment Configuration

### Environment Variables

| Variable | Local | Preview | Staging | Production |
|----------|-------|---------|---------|------------|
| `NODE_ENV` | development | production | staging | production |
| `DATABASE_URL` | local | preview | staging | production |
| `REDIS_URL` | local | preview | staging | production |
| `PAYSTACK_KEY` | test | test | test | live |
| `GROQ_API_KEY` | dev | dev | dev | live |

### Feature Flags

| Feature | Local | Preview | Staging | Production |
|---------|-------|---------|---------|------------|
| New Checkout | ✓ | ✓ | ✓ | ✗ (gradual) |
| AI Features | ✓ | ✓ | ✓ | ✓ |
| Beta APIs | ✓ | ✓ | ✓ | ✗ |

## Deployment Process

### Frontend (Vercel)

```
1. Push to branch
2. Vercel builds
3. Deploy to preview
4. PR merged to main
5. Auto-deploy to staging
6. Tag pushed
7. Deploy to production
```

### Backend (VPS)

```
1. Push to main
2. GitHub Actions builds
3. Deploy to staging
4. Run smoke tests
5. Tag pushed
6. Deploy to production
7. Health check verification
```

## Database Migrations

### Migration Strategy

1. **Development:** Auto-migrate on startup
2. **Staging:** Manual migration before deploy
3. **Production:** Maintenance window migration

### Migration Commands

```bash
# Generate migration
pnpm db:migrate:dev --name add_feature

# Deploy to staging
pnpm db:migrate:deploy

# Deploy to production (maintenance mode)
pnpm db:migrate:deploy
```

## Rollback Procedures

### Frontend Rollback

```bash
# Vercel dashboard
# 1. Go to deployments
# 2. Find previous working version
# 3. Click "Promote to Production"
```

### Backend Rollback

```bash
# SSH to VPS
ssh deploy@vayva-vps

# Rollback to previous version
cd /opt/vayva
./scripts/rollback.sh v1.2.0

# Verify health
curl http://localhost:3001/health
```

### Database Rollback

```bash
# Restore from backup
# (only for critical issues)
neonctl restore --backup-id <id>
```

## Monitoring by Environment

| Metric | Local | Preview | Staging | Production |
|--------|-------|---------|---------|------------|
| Error Tracking | Console | Console | Logtail | Logtail |
| Performance | DevTools | Vercel | Vercel | Vercel |
| Uptime | N/A | N/A | Basic | Full |
| Alerts | N/A | N/A | Email | PagerDuty |

## Access Control

| Environment | Access Level |
|-------------|--------------|
| Local | Developer only |
| Preview | Team + Reviewers |
| Staging | Team only |
| Production | Ops team only |

## Security

### Environment Isolation

- Separate databases per environment
- Different API keys
- Network isolation
- No production data in lower envs

### Secrets Management

- Vercel env vars (frontend)
- VPS env files (backend)
- GitHub secrets (CI/CD)
- No secrets in code

---

**Questions?** Contact devops@vayva.ng
