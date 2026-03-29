# 🚀 ML INFRASTRUCTURE DEPLOYMENT GUIDE
## Week 1: Server Setup & Ollama Deployment

**Last Updated:** March 28, 2026  
**Phase:** Week 1 (Foundation)  
**Status:** READY FOR DEPLOYMENT

---

## 📋 OVERVIEW

This guide walks you through deploying **ML Server 1** with:
- ✅ Ollama (Local LLM Inference)
- ✅ Qdrant (Vector Database)
- ✅ BGE-M3 Embedding Service

**Total Deployment Time:** 30-45 minutes  
**Prerequisites:** VPS with 16GB RAM, 4 vCPU, 80GB SSD

---

## 🛠️ PRE-REQUISITES

### 1. Provision VPS Server

**Recommended Providers:**
- **Hetzner** (€4.59/month - best value): AX41-NVMe (16GB RAM, 4 vCPU, 240GB NVMe)
- **DigitalOcean** ($40/month): Premium Intel/AMD (16GB RAM, 4 vCPU, 80GB SSD)
- **AWS** ($48.62/month): t5.xlarge (16GB RAM, 4 vCPU, 80GB GP3)

**Server Requirements:**
- **OS:** Ubuntu 22.04 LTS or newer
- **RAM:** 16GB minimum
- **CPU:** 4 vCPU cores
- **Storage:** 80GB+ SSD/NVMe
- **Network:** 1Gbps+ connection
- **Root Access:** SSH key or password

### 2. SSH Access

```bash
# Test SSH connection
ssh root@your-server-ip

# If successful, continue with deployment
```

---

## 📦 DEPLOYMENT STEPS

### Step 1: Clone Repository (if needed)

```bash
# SSH into server
ssh root@your-server-ip

# Navigate to vayva directory
cd /path/to/vayva

# Or clone if not already on server
git clone https://github.com/your-org/vayva.git
cd vayva
```

### Step 2: Run Deployment Script

```bash
# Make script executable
chmod +x platform/scripts/deploy/setup-ml-server1.sh

# Execute deployment
./platform/scripts/deploy/setup-ml-server1.sh
```

**What this does:**
1. Checks Docker installation
2. Verifies Docker Compose
3. Validates compose file
4. Pulls Docker images (ollama, qdrant, python)
5. Starts all services
6. Runs health checks

**Expected Output:**
```
✓ Step 1/6: Checking Docker installation...
✓ Docker found: Docker version 25.0.3, build c4f71d0
✓ Step 2/6: Checking Docker Compose...
✓ Docker Compose found: Docker Compose version v2.24.5
✓ Step 3/6: Verifying deployment configuration...
✓ Compose file verified: platform/scripts/deploy/docker-compose.ml-server1.yml
✓ Step 4/6: Pulling Docker images...
✓ Step 5/6: Starting ML services...
ℹ Waiting for services to start (this may take 2-3 minutes)...
✓ Step 6/6: Verifying service health...
ℹ Checking Ollama...
✓ Ollama is running and healthy
ℹ Checking Qdrant...
✓ Qdrant is running and healthy
ℹ Checking Embedding Service...
✓ Embedding Service is running and healthy

=============================================
✓ ML Server 1 Setup Complete!
=============================================

Services running:
  • Ollama (LLM):       http://localhost:11434
  • Qdrant (Vector DB): http://localhost:6333
  • Embedding Service:  http://localhost:8001
```

### Step 3: Pull LLM Models

```bash
# Make script executable
chmod +x platform/scripts/deploy/pull-ollama-models.sh

# Pull Phi-3 Mini (primary model)
./platform/scripts/deploy/pull-ollama-models.sh phi3:mini

# Optional: Also pull Mistral 7B as backup
./platform/scripts/deploy/pull-ollama-models.sh phi3:mini mistral:7b
```

**Model Sizes:**
- Phi-3 Mini (3.8B): ~2.3GB download
- Mistral 7B: ~4.1GB download

**Download Time:** 5-15 minutes depending on connection speed

---

## 🧪 TESTING THE DEPLOYMENT

### Test 1: Ollama Health Check

```bash
# Verify Ollama is running
curl http://localhost:11434/api/tags

# Expected output: JSON with available models
{"models":[{"name":"phi3:mini","size":2300000000,...}]}
```

### Test 2: Generate Text with Phi-3 Mini

```bash
# Simple query
curl http://localhost:11434/api/generate -d '{
  "model": "phi3:mini",
  "prompt": "What is artificial intelligence?",
  "stream": false
}'

# Expected output: AI-generated response
{"response":"Artificial intelligence is the simulation of human intelligence..."}
```

### Test 3: Qdrant Vector DB

```bash
# Check Qdrant dashboard (open in browser)
http://your-server-ip:6333/dashboard

# Or via curl
curl http://localhost:6333/collections

# Expected: Empty collections initially
{"collections":[]}
```

### Test 4: Embedding Service

```bash
# Health check
curl http://localhost:8001/health

# Expected: Model loaded status
{"status":"ok","model_loaded":true,"device":"cpu"}

# Generate embedding
curl -X POST http://localhost:8001/embed \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world, this is a test"}'

# Expected: 1024-dimensional vector
{"embedding":[0.0234,-0.0456,0.0789,...],"model":"BAAI/bge-m3","device":"cpu"}
```

---

## 🔍 MONITORING & MAINTENANCE

### Quick Health Check

```bash
# Run comprehensive health check
chmod +x platform/scripts/deploy/health-check-ml.sh
./platform/scripts/deploy/health-check-ml.sh
```

**Sample Output:**
```
🏥 ML Infrastructure Health Check
==================================

✓ Ollama (LLM): HEALTHY
   Models: phi3:mini, mistral:7b
✓ Qdrant (Vector DB): HEALTHY
   Collections: None yet
✓ Embedding Service: HEALTHY
   Model: Loaded ✓

Docker Container Status:
------------------------
CONTAINER ID   IMAGE                    STATUS
ml-ollama      ollama/ollama:latest     Up 2 hours
ml-qdrant      qdrant/qdrant:latest     Up 2 hours
ml-embedding   python:3.10-slim         Up 2 hours

Resource Usage:
---------------
Memory:
NAME              MEM USAGE               CPU %
ml-ollama         8.5GiB / 10GiB          2.3%
ml-qdrant         1.2GiB / 4GiB           0.5%
ml-embedding      2.8GiB / 4GiB           1.1%

=============================================
Health check complete!
=============================================
```

### View Logs

```bash
# All services
docker-compose -f platform/scripts/deploy/docker-compose.ml-server1.yml logs -f

# Specific service
docker logs ml-ollama -f
docker logs ml-qdrant -f
docker logs ml-embedding-service -f
```

### Resource Monitoring

```bash
# Real-time stats
docker stats ml-ollama ml-qdrant ml-embedding-service

# Check disk usage
df -h
du -sh /var/lib/docker/volumes/ollama_data
du -sh /var/lib/docker/volumes/qdrant_storage
```

---

## ⚙️ CONFIGURATION REFERENCE

### Docker Compose Services

| Service | Port | Memory Limit | Purpose |
|---------|------|--------------|---------|
| **Ollama** | 11434 | 10GB | LLM inference (Phi-3, Mistral) |
| **Qdrant** | 6333, 6334 | 4GB | Vector database for similarity search |
| **Embedding Service** | 8001 | 4GB | BGE-M3 text embeddings |

### Environment Variables (.env.production)

```bash
# ML Server 1 Configuration
ML_SERVER1_HOST="localhost"
ML_SERVER1_OLLAMA_URL="http://localhost:11434"
ML_SERVER1_QDRANT_URL="http://localhost:6333"
ML_SERVER1_EMBEDDING_URL="http://localhost:8001"

# Model Selection
OLLAMA_PRIMARY_MODEL="phi3:mini"
OPENROUTER_API_KEY="your_openrouter_key_here"
```

---

## 🐛 TROUBLESHOOTING

### Issue: Docker Not Installed

**Symptom:** `command not found: docker`

**Solution:**
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add user to docker group
sudo usermod -aG docker $USER

# Reconnect SSH
exit
ssh root@your-server-ip
```

### Issue: Out of Memory

**Symptom:** Containers crash or restart frequently

**Solution:**
```bash
# Add swap space (8GB)
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verify
free -h
```

### Issue: Ollama Download Fails

**Symptom:** Model download times out or fails

**Solution:**
```bash
# Increase timeout
docker exec -it ml-ollama ollama pull phi3:mini --timeout 30m

# Or download manually
wget https://ollama.com/download/ollama-linux-amd64.tgz
```

### Issue: Embedding Service Slow

**Symptom:** >5 seconds per embedding

**Solution:**
1. Check memory usage: `docker stats`
2. Reduce batch size in API calls
3. Consider GPU upgrade for production

---

## 📊 PERFORMANCE BENCHMARKS

### Expected Latency (CPU-only)

| Operation | Target | Acceptable |
|-----------|--------|------------|
| Ollama inference (Phi-3) | <2s | <5s |
| Qdrant vector search | <100ms | <200ms |
| Embedding generation | <500ms | <1s |

### Memory Usage

| Service | Idle | Under Load | Max Limit |
|---------|------|------------|-----------|
| Ollama (Phi-3) | 6-8GB | 9-10GB | 10GB |
| Qdrant | 1-2GB | 3-4GB | 4GB |
| Embedding Service | 2-3GB | 3-4GB | 4GB |
| **Total** | **9-13GB** | **15-18GB** | **18GB** |

---

## ✅ WEEK 1 ACCEPTANCE CRITERIA

Before moving to Week 2, verify:

- [ ] ✅ Ollama responds to API requests
- [ ] ✅ Phi-3 Mini model loaded and generating text
- [ ] ✅ Qdrant dashboard accessible
- [ ] ✅ Embedding service generates 1024-dim vectors
- [ ] ✅ All services pass health checks
- [ ] ✅ Memory usage stable (<14GB total)
- [ ] ✅ No container crashes in 24-hour period

---

## 🎯 NEXT STEPS (WEEK 2)

Once Week 1 is complete:

1. **Deploy Qdrant Collections**
   - Create `products` collection
   - Create `customers` collection
   - Configure HNSW index parameters

2. **Generate Test Embeddings**
   - Export sample products from PostgreSQL
   - Generate embeddings for 100 test products
   - Upload to Qdrant

3. **Optimize Performance**
   - Tune HNSW `m` and `ef_construct` parameters
   - Test search latency with 1000+ vectors
   - Implement caching layer (Redis)

---

## 📞 SUPPORT & RESOURCES

### Documentation Links
- [Ollama Docs](https://ollama.ai/docs)
- [Qdrant Docs](https://qdrant.tech/documentation/)
- [Sentence Transformers](https://www.sbert.net/)
- [BGE-M3 Model](https://huggingface.co/BAAI/bge-m3)

### Internal Contacts
- **DevOps Lead:** @your-devops-lead
- **ML Engineer:** @your-ml-engineer
- **Backend Lead:** @your-backend-lead

### Emergency Contacts
- **On-Call Engineer:** Check PagerDuty rotation
- **Slack Channel:** #ml-infrastructure

---

**Congratulations!** You've successfully deployed ML Server 1 foundation. 🎉

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Verification Complete:** ☐ Yes ☐ No  
**Issues Encountered:** _______________
