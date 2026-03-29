# 📊 VPS SERVER ASSESSMENT REPORT
## Current State Analysis (Before ML Infrastructure Cleanup)

**Assessment Date:** March 28, 2026  
**Server IP:** 163.245.209.203  
**Assessed By:** DevOps Team  

---

## 🔍 SERVER OVERVIEW

### Hardware Specifications
- **CPU:** Limited resources (shared environment)
- **RAM:** 2GB total (674MB used, 269MB free - **CRITICAL**)
- **Storage:** 39GB SSD (26GB used, 14GB available - 65% full)
- **Swap:** 512MB (10MB used)

**⚠️ CRITICAL FINDING:** This server has only 2GB RAM, which is **INSUFFICIENT** for ML infrastructure deployment.

### Running Services

#### System Services (Active)
✅ PostgreSQL 16 (`postgresql@16-main.service`)  
✅ Redis Server (`redis-server.service`)  
✅ Docker (`docker.service`)  
✅ Nginx (`nginx.service`)  
✅ SSH (`ssh.service`)  
✅ Containerd (`containerd.service`)  

#### Application Processes
⚠️ Node.js Worker Process (PID 1007806) - Running via tsx  
⚠️ PM2 Daemon Installed but NO processes running  

---

## 📁 EXISTING DEPLOYMENTS

### 1. /opt/vayva (Production)
**Size:** 1.3GB  
**Status:** Legacy backend deployment  

**Contents:**
```
/opt/vayva/
├── apps/                    # Application code
├── core-api.env            # API environment config (3.6KB)
├── infra/                  # Infrastructure scripts
├── logs/                   # Application logs
├── repo/                   # Git repository (31 subdirs)
├── scripts/                # Deployment scripts
├── run-worker.sh           # Worker startup script
├── worker.env              # Worker environment (3.2KB)
├── worker.env.production   # Production env (3.3KB)
└── worker.env.staging      # Staging env (3.1KB)
```

**Environment Files Found:**
- `core-api.env` - Contains API configuration
- `worker.env` - Worker runtime configuration
- `worker.env.production` - Production secrets
- `worker.env.staging` - Staging secrets

### 2. /opt/vayva-staging (Staging)
**Size:** 996MB  
**Status:** Legacy staging deployment  

**Contents:** Similar structure to production

### 3. /var/www/html
**Status:** Default nginx directory (empty or static files only)

---

## 🐳 DOCKER STATE

### Containers
```
NAMES     STATUS    PORTS
(No containers running)
```

**Analysis:** Docker is installed but not being used for current deployments. All applications run directly via Node.js/PM2.

### Images
Not checked (no running containers)

### Volumes
Not checked

---

## 🔐 CONFIGURATION ANALYSIS

### Environment Variables (.env.production)

**Database Configuration:**
```bash
DATABASE_URL="postgresql://vayva:QyKJ8nvIagBUJgrJSG7F1UGxv5kMZz64glkGe0fX@163.245.209.203:5432/vayva"
DIRECT_URL="postgresql://vayva:QyKJ8nvIagBUJgrJSG7F1UGxv5kMZz64glkGe0fX@163.245.209.203:5432/vayva"
```

**Redis Configuration:**
```bash
REDIS_URL="redis://:a79d295f01ac8a34fec52b0435096b4d665160bee2320880@163.245.209.203:6379"
REDIS_HOST="163.245.209.203"
REDIS_PORT="6379"
REDIS_PASSWORD="a79d295f01ac8a34fec52b0435096b4d665160bee2320880"
```

**Evolution API (WhatsApp):**
```bash
EVOLUTION_API_URL="http://163.245.209.203:8080"
EVOLUTION_API_KEY="d5881620d4cc79e6c1db0fb6c5627918d1b08b6881e999db6311f248e67ab5ee"
```

**AI Services:**
```bash
OPENROUTER_API_KEY="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"
```

---

## ⚠️ CRITICAL ISSUES IDENTIFIED

### Issue #1: Insufficient RAM ❌
**Current:** 2GB total RAM  
**Required for ML:** 16GB minimum  
**Impact:** Cannot deploy Ollama, Qdrant, or Neo4j on this server

**Root Cause:** This appears to be a shared database/cache server, NOT an ML-ready VPS

### Issue #2: Legacy Deployments Mixed ❌
**Current:** Old backend code in `/opt/vayva`  
**Problem:** No Docker isolation, direct Node.js execution  
**Risk:** Conflicts with new ML infrastructure

### Issue #3: No Containerization ❌
**Current:** Applications run via PM2/tsx directly  
**Problem:** No Docker Compose orchestration  
**Impact:** Difficult to manage, scale, and isolate services

### Issue #4: Disk Space Constraints ⚠️
**Current:** 26GB/39GB used (65%)  
**ML Requirement:** Additional 10-15GB for models  
**Risk:** Will run out of space during ML deployment

---

## 🎯 RECOMMENDATIONS

### IMMEDIATE ACTIONS REQUIRED

#### 1. Provision NEW ML-Ready VPS ✅
**Specification:**
- **RAM:** 16GB minimum (32GB recommended)
- **CPU:** 4 vCPU cores minimum
- **Storage:** 80GB+ NVMe SSD
- **Provider:** Hetzner AX41-NVMe (€4.59/mo) or DigitalOcean Premium ($40/mo)

**Reason:** Current 2GB RAM server cannot support ML workloads

#### 2. Clean Up Legacy Deployments ✅
**Action Plan:**
1. Stop all Node.js processes
2. Remove `/opt/vayva` and `/opt/vayva-staging`
3. Clear old environment files
4. Clean up system services

#### 3. Migrate to Docker-First Approach ✅
**Benefits:**
- Service isolation
- Easy rollback
- Resource management
- Reproducible deployments

---

## 📋 CLEANUP CHECKLIST

### Phase 1: Stop Running Processes
- [ ] Stop Node.js worker process (PID 1007806)
- [ ] Kill any PM2 processes
- [ ] Stop Nginx (if not needed)
- [ ] Verify no critical services interrupted

### Phase 2: Remove Legacy Code
- [ ] Backup environment files
- [ ] Delete `/opt/vayva` directory
- [ ] Delete `/opt/vayva-staging` directory
- [ ] Clean `/var/www/html`

### Phase 3: System Cleanup
- [ ] Clear npm cache
- [ ] Remove old logs
- [ ] Clean apt cache
- [ ] Remove unused Docker images/containers

### Phase 4: Prepare for ML Infrastructure
- [ ] Verify Docker installation
- [ ] Verify Docker Compose installation
- [ ] Test Docker daemon
- [ ] Configure Docker memory limits
- [ ] Set up swap space (8GB recommended)

---

## 🚀 MIGRATION STRATEGY

### Option A: Dual-Server Architecture (RECOMMENDED)

**Server 1 (Current VPS - 163.245.209.203):**
- Keep PostgreSQL, Redis, Evolution API
- Remove legacy backend code
- Continue as database/cache layer

**Server 2 (NEW ML VPS - Provision separately):**
- Deploy Ollama, Qdrant, Neo4j
- Run ML inference workloads
- Handle embedding generation
- Query router and RAG pipeline

**Advantages:**
- No service disruption
- Clear separation of concerns
- Easier to scale independently

### Option B: Single-Server Migration (NOT RECOMMENDED)

**Process:**
1. Provision temporary ML VPS
2. Migrate databases to new server
3. Deploy ML infrastructure on new server
4. Decommission old server

**Risks:**
- Downtime during migration
- Complex cutover
- Higher risk of data loss

---

## 📊 RESOURCE COMPARISON

| Resource | Current VPS | Required for ML | Gap |
|----------|-------------|-----------------|-----|
| **RAM** | 2GB | 16GB | **-14GB** ❌ |
| **CPU** | Unknown (shared) | 4 vCPU | Unknown ❌ |
| **Storage** | 39GB | 80GB+ | **-41GB** ❌ |
| **Available Disk** | 14GB | 20GB+ | **-6GB** ❌ |

**Conclusion:** Current VPS is **severely under-provisioned** for ML workloads.

---

## ✅ NEXT STEPS

### Immediate (Today)
1. **Provision new ML VPS** with 16GB+ RAM
2. **Backup current environment files** from `/opt/vayva`
3. **Document all running services** and their configurations

### Short-term (This Week)
4. **Deploy ML infrastructure** on new VPS (Week 1 plan)
5. **Clean up legacy deployments** from current VPS
6. **Configure networking** between servers

### Medium-term (Next Week)
7. **Test ML services** end-to-end
8. **Migrate traffic** gradually
9. **Monitor performance** and costs

---

## 📞 ACTION REQUIRED

**Decision Point:** Do you want to:

**Option A:** Provision new ML VPS and keep current server as database layer? ✅ **(RECOMMENDED)**

**Option B:** Upgrade current VPS to 16GB RAM and do complete migration?

**Option C:** Deploy ML infrastructure on a completely separate cloud provider?

---

**Assessment Complete.** Awaiting decision on migration strategy before proceeding with cleanup.
