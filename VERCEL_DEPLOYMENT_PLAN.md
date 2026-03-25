# Vercel Frontend Deployment Plan

**Architecture**: Vercel (Frontend) → VPS (Backend APIs)  
**Date**: March 25, 2026  
**Status**: Ready for Implementation  

---

## 🎯 Current State Analysis

### VPS Server (163.245.209.203)
- ✅ PostgreSQL running (systemd)
- ✅ Redis running (systemd)
- ✅ MinIO available
- ❌ No Next.js apps currently running
- ⚠️ PM2 installed but empty

### Local Repository
- ✅ Build errors FIXED (analytics imports working)
- ✅ 151 files modified, ready to commit
- ✅ TypeScript compilation passing
- ⚠️ Marketing app exists locally but deleted on server

---

## 📋 Implementation Steps

### **PHASE 1: Prepare VPS Backend** 🔴 CRITICAL

The VPS needs to expose backend APIs for Vercel frontend to consume.

#### 1.1 Start Core API Service

**Option A: PM2 (Recommended)**
```bash
ssh root@163.245.209.203

cd /opt/vayva/Backend/core-api
pnpm install
pnpm build

# Create PM2 config
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'core-api',
    cwd: '/opt/vayva/Backend/core-api',
    script: 'npx',
    args: 'next start -p 4000',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      DATABASE_URL: 'postgresql://vayva:PASS@163.245.209.203:5432/vayva',
      REDIS_URL: 'redis://:PASS@163.245.209.203:6379',
      NEXTAUTH_URL: 'https://api.vayva.ng',
      NEXTAUTH_SECRET: 'your-secret-here'
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G'
  }]
}
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Option B: Systemd Service**
```ini
# /etc/systemd/system/vayva-api.service
[Unit]
Description=Vayva Core API
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/vayva/Backend/core-api
ExecStart=/usr/bin/npx next start -p 4000
Environment=NODE_ENV=production
Environment=PORT=4000
Environment=DATABASE_URL=postgresql://vayva:PASS@163.245.209.203:5432/vayva
Environment=REDIS_URL=redis://:PASS@163.245.209.203:6379
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
systemctl daemon-reload
systemctl enable vayva-api
systemctl start vayva-api
systemctl status vayva-api
```

#### 1.2 Configure CORS for Vercel

Update `Backend/core-api/next.config.js`:
```javascript
const nextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Restrict in production
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' }
        ]
      }
    ];
  }
};
```

#### 1.3 Verify API Accessibility

```bash
# Test locally first
curl http://localhost:4000/api/health

# Test from external (should work after deployment)
curl http://163.245.209.203:4000/api/health

# Should return JSON with status
```

---

### **PHASE 2: Configure Frontend for Vercel** 🟢

#### 2.1 Update Environment Variables

Create `.env.vercel` for each frontend app:

**Frontend/merchant/.env.vercel**:
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.vayva.ng
NEXT_PUBLIC_BACKEND_URL=https://api.vayva.ng

# Authentication
NEXTAUTH_URL=https://merchant.vayva.ng
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Services (pointing to VPS)
DATABASE_URL=postgresql://vayva:PASS@163.245.209.203:5432/vayva
REDIS_URL=redis://:PASS@163.245.209.203:6379

# MinIO / Object Storage
MINIO_ENDPOINT=163.245.209.203:9000
MINIO_ACCESS_KEY=vayva
MINIO_SECRET_KEY=Smackdown21!

# Evolution API (WhatsApp)
EVOLUTION_API_URL=http://163.245.209.203:8080
EVOLUTION_API_KEY=your-api-key

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

#### 2.2 Create Vercel Configuration

Add `vercel.json` to each frontend app:

**Frontend/merchant/vercel.json**:
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm install && pnpm --filter @vayva/merchant build",
  "outputDirectory": ".next",
  "devCommand": "cd ../.. && pnpm --filter @vayva/merchant dev",
  "installCommand": "pnpm install",
  "regions": ["fra1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.vayva.ng"
  }
}
```

---

### **PHASE 3: GitHub Repository Setup** 🔵

#### 3.1 Commit and Push Changes

```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva

# Add all changes
git add .

# Commit with clear message
git commit -m "feat: prepare for Vercel deployment

- Fix analytics package webpack imports
- Add Vercel configuration for frontend apps
- Update environment variables for VPS backend communication
- Configure CORS for cross-origin requests
- Add rhel-openssl-3.0.x to Prisma binaryTargets"

# Push to main branch
git push origin main
```

#### 3.2 Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository: `vayva`
3. Configure projects:

**Project 1: Merchant Admin**
- Root Directory: `Frontend/merchant`
- Framework: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`

**Project 2: Marketing**
- Root Directory: `Frontend/marketing`
- Framework: Next.js

**Project 3: Ops Console**
- Root Directory: `Frontend/ops-console`
- Framework: Next.js

**Project 4: Storefront**
- Root Directory: `Frontend/storefront`
- Framework: Next.js

#### 3.3 Set Environment Variables in Vercel

For EACH project in Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add all variables from `.env.vercel`
3. Deploy to all environments (Production, Preview, Development)

---

### **PHASE 4: Domain Configuration** 🟡

#### 4.1 DNS Setup

Add these records to your domain DNS (GoDaddy/Namecheap):

```
# Merchant Admin
A record: merchant.vayva.ng → 76.76.21.21 (Vercel IP)

# Marketing Site  
A record: www.vayva.ng → 76.76.21.21
A record: vayva.ng → 76.76.21.21

# API (if using custom domain for VPS)
A record: api.vayva.ng → 163.245.209.203

# Evolution API
A record: whatsapp.vayva.ng → 163.245.209.202
```

#### 4.2 Add Domains to Vercel

In Vercel dashboard for each project:
1. Go to Project Settings → Domains
2. Add custom domain (e.g., `merchant.vayva.ng`)
3. Wait for SSL certificate (automatic)

---

### **PHASE 5: Testing & Verification** 🟣

#### 5.1 Backend Health Check

```bash
# Test VPS API directly
curl http://163.245.209.203:4000/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-03-25T..."}
```

#### 5.2 Frontend Connection Test

Deploy test frontend to Vercel preview:
```bash
# This creates a preview deployment
git checkout -b test/vercel-deployment
git push origin test/vercel-deployment
```

Check Vercel preview URL and verify:
- ✅ Can load frontend
- ✅ API calls reach VPS backend
- ✅ Authentication works
- ✅ Images load from MinIO

#### 5.3 End-to-End Flow

Test critical user journeys:
1. Login → Dashboard load
2. Create resource → Save to VPS database
3. Upload image → Store in MinIO
4. WhatsApp notification → Via Evolution API

---

## 🔧 Required VPS Services Summary

| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| PostgreSQL | 5432 | Database | ✅ Running |
| Redis | 6379 | Cache/Sessions | ✅ Running |
| MinIO | 9000 | Object Storage | ⚠️ Check |
| Core API | 4000 | Backend APIs | ❌ Need to start |
| Evolution API | 8080 | WhatsApp | ⚠️ On server 202 |

---

## ⚠️ Critical Decisions Needed

### 1. Marketing App
**Current**: Exists locally, deleted on server  
**Decision**: 
- [ ] Keep and deploy to Vercel?
- [ ] Remove from repository?

### 2. API Domain
**Options**:
- Use IP: `http://163.245.209.203:4000` (quick, not professional)
- Use domain: `https://api.vayva.ng` (recommended)

### 3. Database Access
**Security**: Currently database accepts connections from any IP  
**Recommendation**: 
```bash
# Restrict to VPS + Vercel IPs only
# Edit /etc/postgresql/15/main/pg_hba.conf
host    vayva    vayva    76.76.21.0/24    md5    # Vercel IP range
```

---

## 📊 Architecture After Migration

```
┌─────────────────┐
│   Vercel CDN    │
│  (Frontend)     │
│                 │
│ - Merchant      │──────┐
│ - Marketing     │      │
│ - Ops Console   │      │ HTTPS
│ - Storefront    │      │
└─────────────────┘      │
                         ▼
                  ┌─────────────────┐
                  │   VPS Server    │
                  │   (Backend)     │
                  │                 │
                  │ - Core API :4000│◄────┐
                  │ - Evolution :8080│    │
                  └────────┬────────┘    │
                           │              │
                           ▼              │
                  ┌─────────────────┐    │
                  │   PostgreSQL    │◄───┘
                  │   Redis         │
                  │   MinIO         │
                  └─────────────────┘
```

---

## 🚀 Quick Start Commands

### Start Everything on VPS:
```bash
# SSH to VPS
ssh root@163.245.209.203

# Navigate to repo
cd /opt/vayva

# Install dependencies
pnpm install

# Build core API
cd Backend/core-api && pnpm build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

# Verify
pm2 list
curl http://localhost:4000/api/health
```

### Deploy to Vercel:
```bash
# From local machine
cd /Users/fredrick/Documents/Vayva-Tech/vayva

# Commit changes
git add .
git commit -m "Prepare Vercel deployment"
git push origin main

# Open Vercel dashboard
open https://vercel.com/dashboard
```

---

## ✅ Success Criteria

- [ ] VPS running Core API on port 4000
- [ ] API accessible from internet
- [ ] Vercel projects deployed successfully
- [ ] Frontend can call backend APIs
- [ ] Authentication working end-to-end
- [ ] File uploads to MinIO working
- [ ] WhatsApp notifications via Evolution API
- [ ] All tests passing

---

**Next Step**: Execute Phase 1 - Start the Core API on VPS
