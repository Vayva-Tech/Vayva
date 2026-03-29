# 🚀 LOCAL ML INFRASTRUCTURE DEVELOPMENT GUIDE
## Complete Setup for Testing Before VPS Deployment

**Last Updated:** March 28, 2026  
**Phase:** Local Development & Testing (2 days)  
**Next:** Deploy to upgraded VPS after validation

---

## 📋 OVERVIEW

This guide walks you through setting up the complete ML infrastructure **locally** on your Mac for testing before deploying to the upgraded VPS.

**What We're Testing:**
- ✅ Ollama (Local LLM - Phi-3 Mini)
- ✅ Qdrant (Vector Database)
- ✅ BGE-M3 Embedding Service
- ✅ Neo4j (Graph Database)
- ✅ Query Router (Fastify API Gateway)
- ✅ Integration with VPS services (PostgreSQL, Redis, Evolution API)

**Benefits of Local Testing:**
- 🚀 Faster iteration (no SSH delays)
- 🔧 Easier debugging (direct access to logs)
- 💰 No VPS costs during development
- ✅ Confidence before production deployment

---

## 🛠️ PREREQUISITES

### System Requirements

**Minimum:**
- macOS 13+ (Ventura or newer)
- 16GB RAM (32GB recommended)
- 50GB free disk space
- Docker Desktop installed
- Node.js 20+ installed
- Python 3.10+ installed

**Check Your System:**
```bash
# Check RAM
sysctl hw.memsize

# Check disk space
df -h /

# Check Docker
docker --version
docker-compose --version

# Check Node.js
node --version  # Should be v20.x

# Check Python
python3 --version  # Should be 3.10+
```

### Install Dependencies (if needed)

**Docker Desktop:**
```bash
# Download from https://www.docker.com/products/docker-desktop/
# Install and start Docker Desktop
```

**Node.js 20:**
```bash
# Using Homebrew
brew install node@20

# Or using nvm
nvm install 20
nvm use 20
```

**Python 3.10+:**
```bash
brew install python@3.10
```

---

## 📦 STEP 1: DEPLOY LOCAL ML STACK

### 1.1 Create Local Docker Compose File

Create `docker-compose.local.yml` in project root:

```yaml
version: '3.8'

# ============================================================================
# LOCAL ML INFRASTRUCTURE - FOR TESTING
# ============================================================================

services:
  # ============================================================================
  # Ollama - Local LLM Inference
  # ============================================================================
  ollama:
    image: ollama/ollama:latest
    container_name: vayva-ollama-local
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_local:/root/.ollama
    environment:
      - OLLAMA_MODELS=/root/.ollama/models
    deploy:
      resources:
        limits:
          memory: 10G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - vayva-local

  # ============================================================================
  # Qdrant - Vector Database
  # ============================================================================
  qdrant:
    image: qdrant/qdrant:latest
    container_name: vayva-qdrant-local
    restart: unless-stopped
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_local:/qdrant/storage
    deploy:
      resources:
        limits:
          memory: 4G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - vayva-local

  # ============================================================================
  # Embedding Service - FastAPI + BGE-M3
  # ============================================================================
  embedding-service:
    build:
      context: ./apps/ml-embeddings
      dockerfile: Dockerfile
    container_name: vayva-embedding-local
    restart: unless-stopped
    ports:
      - "8001:8001"
    environment:
      - MODEL_NAME=BAAI/bge-m3
      - PORT=8001
      - DEVICE=cpu
    depends_on:
      qdrant:
        condition: service_healthy
    deploy:
      resources:
        limits:
          memory: 4G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 120s
    networks:
      - vayva-local

  # ============================================================================
  # Neo4j - Graph Database
  # ============================================================================
  neo4j:
    image: neo4j:5-community
    container_name: vayva-neo4j-local
    restart: unless-stopped
    ports:
      - "7474:7474"  # Browser
      - "7687:7687"  # Bolt
    volumes:
      - neo4j_local:/data
    environment:
      - NEO4J_AUTH=neo4j/local_password_123
      - NEO4J_dbms_memory_heap_initial__size=2G
      - NEO4J_dbms_memory_heap_max__size=4G
    deploy:
      resources:
        limits:
          memory: 6G
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:7474"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - vayva-local

networks:
  vayva-local:
    driver: bridge

volumes:
  ollama_local:
    driver: local
  qdrant_local:
    driver: local
  neo4j_local:
    driver: local
```

### 1.2 Start Local ML Stack

```bash
# Navigate to project root
cd /Users/fredrick/Documents/Vayva-Tech/vayva

# Start all ML services
docker-compose -f docker-compose.local.yml up -d

# Watch startup logs
docker-compose -f docker-compose.local.yml logs -f
```

**Expected Output:**
```
✓ Creating vayva-ollama-local ... done
✓ Creating vayva-qdrant-local ... done
✓ Creating vayva-embedding-local ... done
✓ Creating vayva-neo4j-local ... done
```

### 1.3 Pull Ollama Models

```bash
# Wait for Ollama to start (check health)
curl http://localhost:11434/api/tags

# Pull Phi-3 Mini model (takes 5-10 minutes)
docker exec -it vayva-ollama-local ollama pull phi3:mini

# Optional: Pull Mistral 7B as backup
docker exec -it vayva-ollama-local ollama pull mistral:7b

# Verify models
docker exec -it vayva-ollama-local ollama list
```

---

## 🧪 STEP 2: TEST INDIVIDUAL SERVICES

### 2.1 Test Ollama (LLM)

```bash
# Health check
curl http://localhost:11434/api/tags

# Generate text
curl http://localhost:11434/api/generate -d '{
  "model": "phi3:mini",
  "prompt": "What is artificial intelligence?",
  "stream": false
}'

# Expected response:
# {"response":"Artificial intelligence is...","done":true}
```

**Test Query Examples:**
```bash
# Sales query simulation
curl http://localhost:11434/api/generate -d '{
  "model": "phi3:mini",
  "prompt": "Calculate total sales for product X if sold 100 units at $50 each",
  "stream": false
}'

# Customer insight query
curl http://localhost:11434/api/generate -d '{
  "model": "phi3:mini",
  "prompt": "A customer bought products A, B, and C. What complementary products might they like?",
  "stream": false
}'
```

### 2.2 Test Qdrant (Vector DB)

```bash
# Health check
curl http://localhost:6333/

# Access dashboard (open in browser)
open http://localhost:6333/dashboard

# Create test collection
curl -X PUT 'http://localhost:6333/collections/test-products' -H 'Content-Type: application/json' -d '{
  "vectors": {
    "size": 1024,
    "distance": "Cosine"
  }
}'

# Upload test vector
curl -X POST 'http://localhost:6333/collections/test-products/points' -H 'Content-Type: application/json' -d '{
  "points": [
    {
      "id": 1,
      "vector": [0.12] * 1024,
      "payload": {
        "name": "Test Product",
        "price": 99.99,
        "category": "Electronics"
      }
    }
  ]
}'

# Search test
curl -X POST 'http://localhost:6333/collections/test-products/search' -H 'Content-Type: application/json' -d '{
  "vector": [0.12] * 1024,
  "limit": 5
}'
```

### 2.3 Test Embedding Service

```bash
# Health check
curl http://localhost:8001/health

# Expected: {"status":"ok","model_loaded":true,"device":"cpu"}

# Generate single embedding
curl -X POST http://localhost:8001/embed \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world, this is a test product description"}'

# Expected: 1024-dimensional vector
# {"embedding":[0.0234,-0.0456,...],"model":"BAAI/bge-m3","device":"cpu"}

# Generate batch embeddings
curl -X POST http://localhost:8001/embed/batch \
  -H "Content-Type: application/json" \
  -d '{"texts": ["Product A", "Product B", "Product C"]}'

# Expected: Array of embeddings
```

### 2.4 Test Neo4j (Graph DB)

```bash
# Open Neo4j Browser
open http://localhost:7474

# Login credentials:
# Username: neo4j
# Password: local_password_123

# Test connection query
MATCH (n) RETURN count(n) as node_count;

# Create test graph
CREATE (:Product {id: "prod_1", name: "Nike Shoes", price: 150})
CREATE (:Product {id: "prod_2", name: "Adidas Shoes", price: 120})
CREATE (:Customer {id: "cust_1", name: "John Doe"})
CREATE (:Order {id: "order_1", total: 150, date: datetime()})

MATCH (c:Customer {id: "cust_1"})
MATCH (o:Order {id: "order_1"})
MATCH (p:Product {id: "prod_1"})
CREATE (c)-[:PLACED]->(o)
CREATE (o)-[:CONTAINS]->(p)
CREATE (c)-[:BOUGHT]->(p);

# Query graph
MATCH (c:Customer)-[:BOUGHT]->(p:Product)
RETURN c.name, p.name, p.price;
```

---

## 📊 STEP 3: GENERATE TEST DATA

### 3.1 Export Sample Data from VPS PostgreSQL

```bash
# Connect to VPS database
psql postgresql://vayva:QyKJ8nvIagBUJgrJSG7F1UGxv5kMZz64glkGe0fX@163.245.209.203:5432/vayva

# Export products (limit 100 for testing)
\copy (SELECT id, name, description, category, price, stock FROM products LIMIT 100) TO '/tmp/products_test.csv' WITH CSV HEADER;

# Export customers (limit 100)
\copy (SELECT id, name, email, created_at FROM customers LIMIT 100) TO '/tmp/customers_test.csv' WITH CSV HEADER;

# Exit psql
\q
```

### 3.2 Generate Product Embeddings Locally

Create script `scripts/generate_embeddings_local.py`:

```python
#!/usr/bin/env python3
"""
Generate embeddings for test products locally
"""
import requests
import csv
import json

# Configuration
EMBEDDING_SERVICE_URL = "http://localhost:8001"
QDRANT_URL = "http://localhost:6333"
PRODUCTS_CSV = "/tmp/products_test.csv"

def load_products():
    """Load products from CSV"""
    products = []
    with open(PRODUCTS_CSV, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            products.append(row)
    return products

def generate_embedding(text):
    """Generate embedding using local service"""
    response = requests.post(
        f"{EMBEDDING_SERVICE_URL}/embed",
        json={"text": text}
    )
    return response.json()["embedding"]

def create_qdrant_collection():
    """Create products collection in Qdrant"""
    requests.put(
        f"{QDRANT_URL}/collections/products",
        json={
            "vectors": {"size": 1024, "distance": "Cosine"}
        }
    )

def upload_to_qdrant(products):
    """Upload products with embeddings to Qdrant"""
    points = []
    
    for idx, product in enumerate(products):
        # Generate embedding
        text = f"{product['name']} {product['description']}"
        embedding = generate_embedding(text)
        
        # Create point
        point = {
            "id": int(product['id']) if product['id'].isdigit() else idx,
            "vector": embedding,
            "payload": {
                "product_id": product['id'],
                "name": product['name'],
                "category": product['category'],
                "price": float(product['price']) if product['price'] else 0,
                "stock": int(product['stock']) if product['stock'] else 0
            }
        }
        points.append(point)
    
    # Upload batch
    if points:
        response = requests.post(
            f"{QDRANT_URL}/collections/products/points",
            json={"points": points}
        )
        print(f"Uploaded {len(points)} products: {response.status_code}")

def main():
    print("Loading products...")
    products = load_products()
    print(f"Loaded {len(products)} products")
    
    print("Creating Qdrant collection...")
    create_qdrant_collection()
    
    print("Generating embeddings and uploading...")
    upload_to_qdrant(products)
    
    print("✅ Done!")

if __name__ == "__main__":
    main()
```

Run embedding generation:
```bash
# Make executable
chmod +x scripts/generate_embeddings_local.py

# Run script
python3 scripts/generate_embeddings_local.py
```

---

## 🔗 STEP 4: INTEGRATE WITH VPS SERVICES

### 4.1 Configure Environment for Local Testing

Create `.env.local-testing`:

```bash
# ============================================
# LOCAL TESTING ENVIRONMENT
# ML Infrastructure local, databases on VPS
# ============================================

# Local ML Services
ML_OLLAMA_URL="http://localhost:11434"
ML_QDRANT_URL="http://localhost:6333"
ML_EMBEDDING_URL="http://localhost:8001"
ML_NEO4J_URI="bolt://neo4j:local_password_123@localhost:7687"

# VPS Database Services (remote)
DATABASE_URL="postgresql://vayva:QyKJ8nvIagBUJgrJSG7F1UGxv5kMZz64glkGe0fX@163.245.209.203:5432/vayva"
REDIS_URL="redis://:a79d295f01ac8a34fec52b0435096b4d665160bee2320880@163.245.209.203:6379"

# VPS WhatsApp Service
EVOLUTION_API_URL="http://163.245.209.203:8080"
EVOLUTION_API_KEY="d5881620d4cc79e6c1db0fb6c5627918d1b08b6881e999db6311f248e67ab5ee"

# OpenRouter (fallback)
OPENROUTER_API_KEY="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"

# Query Router Config
QUERY_ROUTER_LOCAL_THRESHOLD=0.7
QUERY_ROUTER_CACHE_TTL=3600
```

### 4.2 Test Database Connectivity

```bash
# Test PostgreSQL connection from local machine
psql postgresql://vayva:QyKJ8nvIagBUJgrJSG7F1UGxv5kMZz64glkGe0fX@163.245.209.203:5432/vayva -c "SELECT version();"

# Test Redis connection
redis-cli -h 163.245.209.203 -p 6379 -a 'a79d295f01ac8a34fec52b0435096b4d665160bee2320880' ping
```

---

## 🎯 STEP 5: BUILD AND TEST QUERY ROUTER

### 5.1 Build Fastify Query Router

Create `apps/ml-gateway/src/index.ts`:

```typescript
import Fastify from 'fastify';
import axios from 'axios';

const fastify = Fastify({ logger: true });

// Configuration
const OLLAMA_URL = process.env.ML_OLLAMA_URL || 'http://localhost:11434';
const QDRANT_URL = process.env.ML_QDRANT_URL || 'http://localhost:6333';
const EMBEDDING_URL = process.env.ML_EMBEDDING_URL || 'http://localhost:8001';

// Query classifier
function classifyQuery(query: string) {
  const internetKeywords = ['competitor', 'market', 'trend', 'news', 'weather'];
  const merchantDataKeywords = ['my sales', 'my inventory', 'customer', 'order', 'product'];
  
  return {
    requires_internet: internetKeywords.some(kw => query.toLowerCase().includes(kw)),
    requires_merchant_data: merchantDataKeywords.some(kw => query.toLowerCase().includes(kw))
  };
}

// AI Query endpoint
fastify.post('/api/v1/ai/query', async (request, reply) => {
  const { query, merchant_id } = request.body as { query: string; merchant_id: string };
  
  // Classify query
  const classification = classifyQuery(query);
  
  try {
    if (classification.requires_internet) {
      // Route to OpenRouter (paid)
      console.log('🌐 Routing to OpenRouter (internet required)');
      // TODO: Implement OpenRouter call
      return { source: 'openrouter', answer: 'Internet query - not implemented yet' };
      
    } else if (classification.requires_merchant_data) {
      // Route to local RAG
      console.log('🏠 Routing to local RAG (merchant data)');
      
      // Get embedding
      const embeddingResponse = await axios.post(`${EMBEDDING_URL}/embed`, {
        text: query
      });
      
      // Search Qdrant
      const searchResponse = await axios.post(`${QDRANT_URL}/collections/products/search`, {
        vector: embeddingResponse.data.embedding,
        limit: 5,
        filter: {
          must: [{ key: 'merchant_id', match: { value: merchant_id } }]
        }
      });
      
      // Query local LLM with context
      const context = searchResponse.data.result.map((r: any) => r.payload.name).join(', ');
      const prompt = `Context: Merchant has these products: ${context}\nQuestion: ${query}\nAnswer:`;
      
      const ollamaResponse = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: 'phi3:mini',
        prompt: prompt,
        stream: false
      });
      
      return {
        source: 'local',
        answer: ollamaResponse.data.response,
        cost: 0
      };
      
    } else {
      // Simple query → local LLM
      console.log('💬 Routing to local LLM (simple query)');
      
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: 'phi3:mini',
        prompt: query,
        stream: false
      });
      
      return {
        source: 'local',
        answer: response.data.response,
        cost: 0
      };
    }
  } catch (error) {
    console.error('Query routing failed:', error);
    reply.code(500).send({ error: 'Query processing failed' });
  }
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 ML Gateway running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

### 5.2 Test Query Router

```bash
# Install dependencies
cd apps/ml-gateway
npm install

# Start gateway
npm run dev

# In another terminal, test queries:

# Test 1: Simple query (should use local LLM)
curl -X POST http://localhost:3000/api/v1/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is 2 + 2?", "merchant_id": "test"}'

# Test 2: Merchant data query (should use local RAG)
curl -X POST http://localhost:3000/api/v1/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What products do I have in stock?", "merchant_id": "test"}'

# Test 3: Internet query (should use OpenRouter)
curl -X POST http://localhost:3000/api/v1/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the latest e-commerce trends?", "merchant_id": "test"}'
```

---

## ✅ LOCAL TESTING CHECKLIST

### Infrastructure Services
- [ ] ✅ Ollama running and responding
- [ ] ✅ Phi-3 Mini model downloaded
- [ ] ✅ Qdrant running and accessible
- [ ] ✅ Products collection created
- [ ] ✅ Embedding service generating vectors
- [ ] ✅ Neo4j running and queryable
- [ ] ✅ All Docker containers healthy

### Data Pipeline
- [ ] ✅ Test products exported from VPS
- [ ] ✅ Embeddings generated for all test products
- [ ] ✅ Vectors uploaded to Qdrant
- [ ] ✅ Graph populated in Neo4j

### Query Router
- [ ] ✅ Fastify gateway running
- [ ] ✅ Query classification working (>95% accuracy)
- [ ] ✅ Local RAG pipeline functional
- [ ] ✅ Cost tracking implemented

### Integration Tests
- [ ] ✅ Can query VPS PostgreSQL from local
- [ ] ✅ Can query VPS Redis from local
- [ ] ✅ End-to-end query flow working
- [ ] ✅ Response times acceptable (<2s local, <5s with VPS)

---

## 📊 PERFORMANCE BENCHMARKS (Local)

| Service | Target Latency | Acceptable |
|---------|---------------|------------|
| Ollama inference | <2s | <3s |
| Qdrant search | <100ms | <200ms |
| Embedding generation | <500ms | <1s |
| Query router (total) | <2.5s | <4s |
| VPS PostgreSQL query | <100ms | <300ms |

**Measure with:**
```bash
# Time a complete query
time curl -X POST http://localhost:3000/api/v1/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me my best selling products", "merchant_id": "test"}'
```

---

## 🎯 SUCCESS CRITERIA (Before VPS Upgrade)

We're ready to deploy when:

1. ✅ All 5 ML services run stably locally for 24 hours
2. ✅ Query router correctly classifies >95% of queries
3. ✅ Local RAG generates accurate answers
4. ✅ End-to-end latency <3 seconds
5. ✅ Zero crashes during testing
6. ✅ Test data successfully loaded into Qdrant and Neo4j
7. ✅ Integration with VPS databases working

---

## 🚀 NEXT: DEPLOY TO UPGRADED VPS

Once local testing passes:

1. **Upgrade VPS** to 16GB RAM, 80GB storage
2. **Deploy tested stack** using same Docker Compose
3. **Migrate test data** to production collections
4. **Gradual rollout** (10% → 50% → 100%)

---

**Happy Local Testing!** 🎉

After validation, we'll deploy to the upgraded VPS with confidence.
