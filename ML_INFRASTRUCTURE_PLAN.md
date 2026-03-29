# 🧠 COMPREHENSIVE ML INFRASTRUCTURE PLAN
## Hybrid AI Architecture for Cost Optimization

**Date:** March 28, 2026  
**Infrastructure:** 2x VPS (16GB RAM each)  
**Goal:** Minimize OpenRouter costs, maximize local AI capabilities  

---

## 📊 EXECUTIVE SUMMARY

### Current Problem 💸
- OpenRouter credits being wasted on simple merchant queries
- Every "What were my sales yesterday?" costs money
- WhatsApp image analysis requires expensive API calls
- No cost differentiation between simple and complex queries

### Solution 🎯
**Hybrid AI Architecture:**
- **Local ML** (FREE) - Handles 80% of queries (merchant-specific data)
- **OpenRouter** (PAID) - Reserved for 20% (internet research, complex reasoning)

**Expected Cost Reduction:** 70-80% on AI credits

---

## 🏗️ ARCHITECTURE OVERVIEW

### Two-Server Strategy

#### Server 1: ML Inference & Vector Search (16GB RAM)
```
┌─────────────────────────────────────┐
│  Local LLM (Phi-3/Mistral 7B)       │
│  - Merchant Q&A                     │
│  - Sales queries                    │
│  - Inventory lookups                │
│  - Customer insights                │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Qdrant Vector DB                   │
│  - Product embeddings               │
│  - Customer embeddings              │
│  - Order embeddings                 │
│  - Semantic search                  │
└─────────────────────────────────────┘
```

#### Server 2: Graph DB & API Gateway (16GB RAM)
```
┌─────────────────────────────────────┐
│  Neo4j Graph Database               │
│  - Customer→Order→Product graph     │
│  - Relationship mapping             │
│  - Advanced pattern recognition     │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Fastify API Gateway                │
│  - Query routing                    │
│  - Cost monitoring                  │
│  - Rate limiting                    │
└─────────────────────────────────────┘
```

---

## 🔧 COMPONENT BREAKDOWN

### 1. LOCAL LLM INFERENCE SERVER

#### Model Selection (Optimized for 16GB RAM)

**Primary Model: Microsoft Phi-3 Mini (3.8B parameters)**
- **RAM Usage:** ~8GB (quantized to 4-bit)
- **Context:** 128K tokens
- **Speed:** ~50 tokens/sec on CPU
- **Use Cases:**
  - Merchant data queries ("Show me last week's sales")
  - Simple customer insights
  - Inventory questions
  - Basic report generation

**Backup Model: Mistral 7B (quantized)**
- **RAM Usage:** ~12GB (4-bit quantization)
- **Context:** 32K tokens
- **Speed:** ~30 tokens/sec
- **Use Cases:**
  - More complex reasoning
  - Multi-step analysis
  - Better language understanding

#### Inference Engine Options

**Option A: Ollama (RECOMMENDED)**
```bash
# Easy setup, good performance
docker run -d -p 11434:11434 ollama/ollama
ollama pull phi3:mini
```
- **Pros:** Easy deployment, auto-quantization, REST API
- **Cons:** Slightly slower than vLLM
- **RAM:** 8-12GB depending on model

**Option B: llama.cpp (MAXIMUM PERFORMANCE)**
```bash
# Compile from source for best CPU performance
git clone https://github.com/ggerganov/llama.cpp
make -j4
./server -m phi-3-mini.Q4_K_M.gguf --host 0.0.0.0 --port 8080
```
- **Pros:** Fastest CPU inference, low memory overhead
- **Cons:** More complex setup
- **RAM:** 6-10GB

**Option C: Text Generation Inference (TGI)**
```bash
# Hugging Face's production server
docker run --gpus all ghcr.io/huggingface/text-generation-inference
```
- **Pros:** Production-ready, token streaming
- **Cons:** Requires GPU for best performance
- **RAM:** 10-14GB

**Recommendation:** Start with **Ollama** for simplicity, migrate to **llama.cpp** if you need more performance.

---

### 2. VECTOR DATABASE (Qdrant)

#### Why Qdrant?
- Written in Rust (fast, memory-efficient)
- Built-in filtering (metadata + vector search)
- Supports multiple indexes (HNSW, IVF)
- RESTful API
- Docker deployment ready

#### Deployment Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - ./qdrant_storage:/qdrant/storage
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334
    deploy:
      resources:
        limits:
          memory: 4G
```

#### Memory Optimization
- **Limit:** 4GB RAM max
- **Index Type:** HNSW (fast, low memory)
- **Quantization:** Scalar INT8 (reduces memory by 4x)
- **Batch Size:** Small batches (32-64 vectors)

#### Collection Design

```python
# Product Embeddings Collection
{
  "name": "products",
  "vectors": {
    "size": 1024,  # BGE-M3 embedding size
    "distance": "Cosine"
  },
  "hnsw_config": {
    "m": 16,  # Lower = less memory
    "ef_construct": 100
  },
  "quantization_config": {
    "scalar": {
      "type": "int8",
      "quantile": 0.99
    }
  }
}

# Customer Embeddings Collection
{
  "name": "customers",
  "vectors": {"size": 1024, "distance": "Cosine"},
  # ... same config
}

# Order Embeddings Collection
{
  "name": "orders",
  "vectors": {"size": 1024, "distance": "Cosine"},
  # ... same config
}
```

---

### 3. EMBEDDING MODEL (Local)

#### Model: BGE-M3 (BAI General Embedding)

**Why BGE-M3?**
- **Multilingual** (supports 100+ languages)
- **Multi-functionality** (dense + sparse + multi-vector)
- **Long context** (up to 8192 tokens)
- **Efficient** (~500MB model size)
- **State-of-the-art** performance

**Deployment:**
```python
from sentence_transformers import SentenceTransformer

# Load once, reuse
model = SentenceTransformer('BAAI/bge-m3', device='cpu')

# Generate embeddings
embedding = model.encode(
    "Product description or customer query",
    prompt_name='query',  # Important for retrieval
    normalize_embeddings=True
)
```

**Memory Usage:** ~2GB RAM  
**Speed:** ~100 embeddings/sec on CPU

#### Alternative: e5-large-v2
- Slightly better quality
- Larger model (~1.5GB)
- Slower inference

**Recommendation:** Use **BGE-M3** for speed/memory efficiency.

---

### 4. GRAPH DATABASE (Neo4j)

#### Why Neo4j?
- Native graph storage (nodes + relationships)
- Cypher query language (powerful for patterns)
- Community Edition is FREE (open-source)
- Perfect for: Customer→Order→Product→Inventory relationships

#### Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  neo4j:
    image: neo4j:5-community
    ports:
      - "7474:7474"  # Browser
      - "7687:7687"  # Bolt protocol
    volumes:
      - ./neo4j_data:/data
    environment:
      - NEO4J_AUTH=neo4j/your_password_here
      - NEO4J_dbms_memory_heap_initial__size=2G
      - NEO4J_dbms_memory_heap_max__size=4G
    deploy:
      resources:
        limits:
          memory: 6G
```

#### Graph Schema Design

```cypher
// Customer Node
CREATE (:Customer {
  id: "cust_123",
  name: "John Doe",
  email: "john@example.com",
  lifetime_value: 5000,
  segment: "VIP"
})

// Product Node
CREATE (:Product {
  id: "prod_456",
  name: "Nike Air Max",
  category: "Shoes",
  price: 150.00,
  stock: 45,
  embedding: [0.12, -0.45, ...]  // Vector embedding
})

// Order Node
CREATE (:Order {
  id: "order_789",
  date: datetime(),
  total: 450.00,
  status: "completed"
})

// Relationships
MATCH (c:Customer {id: "cust_123"})
MATCH (o:Order {id: "order_789"})
MATCH (p:Product {id: "prod_456"})
CREATE (c)-[:PLACED]->(o)
CREATE (o)-[:CONTAINS]->(p)
CREATE (c)-[:BOUGHT]->(p)
```

#### Example Queries

```cypher
// Find customers who bought similar products
MATCH (c1:Customer {id: $customer_id})-[:BOUGHT]->(p:Product)
<-[:BOUGHT]-(c2:Customer)
WHERE c1.id <> c2.id
RETURN c2, count(p) as similarity
ORDER BY similarity DESC
LIMIT 10

// Product recommendations based on purchase history
MATCH (c:Customer {id: $customer_id})-[:BOUGHT]->(:Product)<-[:CONTAINS]-(:Order)<-[:PLACED]-(other:Customer)
MATCH (other)-[:PLACED]->(:Order)-[:CONTAINS]->(rec:Product)
WHERE NOT (c)-[:BOUGHT]->(rec)
RETURN rec, count(*) as frequency
ORDER BY frequency DESC
LIMIT 5

// Inventory alert: Products frequently bought together but one is low stock
MATCH (p1:Product)<-[:CONTAINS]-(o:Order)-[:CONTAINS]->(p2:Product)
WHERE p1.stock < 10 AND p1 <> p2
RETURN p1.name, p2.name, count(*) as bought_together
ORDER BY bought_together DESC
```

---

### 5. QUERY ROUTER (Intelligent Routing)

#### Router Logic

```python
class QueryRouter:
    def __init__(self):
        self.local_llm = OllamaClient(model="phi3:mini")
        self.openrouter_client = OpenRouterClient()
        self.qdrant_client = QdrantClient()
        self.neo4j_driver = Neo4jDriver()
    
    async def route_query(self, query: str, merchant_id: str) -> str:
        # Step 1: Classify query intent
        intent = await self.classify_intent(query)
        
        # Step 2: Route accordingly
        if intent['requires_internet']:
            return await self.use_openrouter(query)
        elif intent['requires_merchant_data']:
            return await self.use_local_rag(query, merchant_id)
        elif intent['simple_math']:
            return await self.calculate_locally(query, merchant_id)
        else:
            return await self.use_local_llm(query)
    
    async def classify_intent(self, query: str) -> dict:
        # Use small local classifier (can be rule-based initially)
        internet_keywords = [
            "competitor", "market trend", "industry benchmark",
            "news", "weather", "social media", "review site"
        ]
        
        merchant_data_keywords = [
            "my sales", "my inventory", "my customers",
            "last week", "yesterday", "this month",
            "product X", "customer Y", "order Z"
        ]
        
        requires_internet = any(kw in query.lower() for kw in internet_keywords)
        requires_merchant_data = any(kw in query.lower() for kw in merchant_data_keywords)
        
        return {
            "requires_internet": requires_internet,
            "requires_merchant_data": requires_merchant_data,
            "simple_math": any(op in query for op in ["%", "average", "total", "sum"])
        }
    
    async def use_local_rag(self, query: str, merchant_id: str) -> str:
        # Step 1: Generate embedding for query
        query_embedding = self.embedding_model.encode(query)
        
        # Step 2: Search Qdrant for relevant context
        search_results = self.qdrant_client.search(
            collection_name="merchant_data",
            query_vector=query_embedding,
            filter=Filter(field="merchant_id", value=merchant_id),
            limit=5
        )
        
        # Step 3: Get additional context from Neo4j
        graph_context = self.neo4j_driver.query(
            """
            MATCH (m:Merchant {id: $merchant_id})-[:HAS]->(data)
            RETURN data LIMIT 10
            """,
            merchant_id=merchant_id
        )
        
        # Step 4: Build prompt with context
        context = "\n".join([r.text for r in search_results])
        prompt = f"""
        Context from merchant database:
        {context}
        
        Graph relationships:
        {graph_context}
        
        Question: {query}
        
        Answer using ONLY the provided context. If you don't know, say so.
        """
        
        # Step 5: Query local LLM
        response = await self.local_llm.generate(prompt)
        return response
    
    async def use_openrouter(self, query: str) -> str:
        # Only for internet-required queries
        # Track cost for monitoring
        response = await self.openrouter_client.generate(
            query,
            model="meta-llama/llama-3-70b-instruct",  # Use best model for complex tasks
            track_cost=True
        )
        return response
```

#### Query Classification Examples

| Query | Classification | Router Decision | Cost |
|-------|---------------|-----------------|------|
| "What were my sales yesterday?" | Merchant data | Local RAG | FREE |
| "Which products are trending in Nigeria?" | Internet research | OpenRouter | PAID |
| "Show me customers who bought X" | Merchant data | Local RAG + Neo4j | FREE |
| "Calculate profit margin for product Y" | Math + merchant data | Local calculation | FREE |
| "What are competitors charging?" | Internet research | OpenRouter | PAID |
| "Generate WhatsApp message for customer" | Creative + context | Hybrid (local context + OpenRouter polish) | PARTIAL |
| "Analyze this product image" | Vision task | Local CLIP + matching | FREE |

---

## 🖼️ IMAGE ANALYSIS PIPELINE (WhatsApp Commerce)

### Problem
Customer sends product image via WhatsApp → Need to find matching inventory items

### Solution: Local Vision Models

#### Option A: CLIP (Contrastive Language-Image Pre-training)

**Model:** ViT-B/32 (Vision Transformer)
- **RAM:** ~3GB
- **Size:** ~600MB
- **Speed:** ~50 images/sec on CPU

**How it Works:**
```python
from PIL import Image
import clip
import torch

# Load CLIP model
device = "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# Customer sends image
image = preprocess(Image.open("customer_image.jpg")).unsqueeze(0).to(device)

# Generate image embedding
with torch.no_grad():
    image_embedding = model.encode_image(image)

# Search product database (pre-computed embeddings)
similarities = cosine_similarity(image_embedding, product_embeddings)
top_matches = similarities.argsort(descending=True)[:5]

# Return matching products
for idx in top_matches:
    print(f"Match: {products[idx].name} ({similarities[0][idx]:.2f}% similar)")
```

**Workflow:**
1. **Pre-process:** Generate embeddings for ALL merchant products (one-time)
2. **Store:** Save in Qdrant with metadata (product_id, merchant_id)
3. **Query:** When customer sends image → generate embedding → search Qdrant
4. **Return:** Top 5-10 matches with similarity scores

**Accuracy:** 85-95% for clear product images

---

#### Option B: MobileCLIP (Faster, Lighter)

**Model:** MobileCLIP-S2
- **RAM:** ~2GB
- **Size:** ~300MB
- **Speed:** ~100 images/sec on CPU
- **Accuracy:** Slightly lower than CLIP but much faster

**Best for:** High-volume WhatsApp commerce

---

#### Option C: BLIP-2 (For Detailed Descriptions)

**Model:** BLIP-2 (Bootstrapping Language-Image Pre-training)
- **RAM:** ~8GB (needs GPU for best performance)
- **Capability:** Generates text descriptions from images
- **Use Case:** "Describe this product" → AI generates detailed description

**Example:**
```python
from transformers import Blip2Processor, Blip2ForConditionalGeneration

processor = Blip2Processor.from_pretrained("Salesforce/blip2-opt-2.7b")
model = Blip2ForConditionalGeneration.from_pretrained("Salesforce/blip2-opt-2.7b")

image = Image.open("product.jpg")
inputs = processor(images=image, return_tensors="pt")

generated_ids = model.generate(**inputs, max_new_tokens=50)
description = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

print(description)
# Output: "A red Nike running shoe with white sole and black laces"
```

**Use Case:** 
- Generate product descriptions from photos
- Automatic alt-text for accessibility
- Catalog enrichment

---

### Complete WhatsApp Image Analysis Pipeline

```
Customer sends image via WhatsApp
         ↓
┌─────────────────────────────────┐
│  WhatsApp Business API          │
│  - Receives image               │
│  - Forwards to ML server        │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  Image Preprocessing            │
│  - Resize to 224x224            │
│  - Normalize                    │
│  - Convert to tensor            │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  CLIP Image Encoder             │
│  - Generate 512-dim embedding   │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  Qdrant Vector Search           │
│  - Cosine similarity            │
│  - Filter by merchant_id        │
│  - Return top 10 matches        │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  Response Generator             │
│  - Format results               │
│  - Add prices, availability     │
│  - Generate natural language    │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  WhatsApp Reply                 │
│  - Send product matches         │
│  - Images + prices + buy link   │
└─────────────────────────────────┘
```

**Response Time:** <3 seconds end-to-end  
**Cost:** FREE (all local)  
**Accuracy:** 90%+ for standard products

---

## 📦 DEPLOYMENT PLAN

### Phase 1: Foundation (Weeks 1-2)

#### Server 1 Setup (ML Inference)
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull phi3:mini
ollama pull nomic-embed-text  # For embeddings

# Install Qdrant
docker run -d -p 6333:6333 qdrant/qdrant

# Install Python dependencies
pip install sentence-transformers qdrant-client fastapi uvicorn
```

#### Server 2 Setup (Graph + API)
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Neo4j
docker run -d \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5-community

# Install Fastify + dependencies
npm install fastify @fastify/cors neo4j-driver
```

---

### Phase 2: Data Pipeline (Weeks 3-4)

#### Embedding Generation Script
```python
# scripts/generate_embeddings.py
import pandas as pd
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

model = SentenceTransformer('BAAI/bge-m3')
client = QdrantClient(host='localhost', port=6333)

# Load merchant data
products_df = pd.read_csv('products.csv')
customers_df = pd.read_csv('customers.csv')
orders_df = pd.read_csv('orders.csv')

# Generate product embeddings
product_texts = products_df['name'] + " " + products_df['description']
product_embeddings = model.encode(product_texts.tolist(), normalize_embeddings=True)

# Upload to Qdrant
points = []
for idx, row in products_df.iterrows():
    points.append(PointStruct(
        id=row['id'],
        vector=product_embeddings[idx],
        payload={
            "merchant_id": row['merchant_id'],
            "name": row['name'],
            "category": row['category'],
            "price": row['price']
        }
    ))

client.upsert(collection_name="products", points=points)
```

#### Graph Population Script
```cypher
// scripts/populate_graph.cypher
LOAD CSV WITH HEADERS FROM 'file:///products.csv' AS row
CREATE (:Product {
  id: row.id,
  name: row.name,
  category: row.category,
  price: toFloat(row.price),
  stock: toInteger(row.stock)
})

LOAD CSV WITH HEADERS FROM 'file:///customers.csv' AS row
CREATE (:Customer {
  id: row.id,
  name: row.name,
  email: row.email,
  lifetime_value: toFloat(row.ltv)
})

LOAD CSV WITH HEADERS FROM 'file:///orders.csv' AS row
MATCH (c:Customer {id: row.customer_id})
MATCH (p:Product {id: row.product_id})
MERGE (o:Order {id: row.id})
MERGE (c)-[:PLACED]->(o)
MERGE (o)-[:CONTAINS]->(p)
```

---

### Phase 3: Query Router (Weeks 5-6)

#### Build Fastify API Gateway
```typescript
// apps/ml-gateway/src/index.ts
import Fastify from 'fastify';
import { QueryRouter } from './router';
import { CostTracker } from './cost-tracker';

const fastify = Fastify({ logger: true });
const router = new QueryRouter();
const costTracker = new CostTracker();

fastify.post('/api/v1/ai/query', async (request, reply) => {
  const { query, merchant_id } = request.body as { query: string; merchant_id: string };
  
  // Route query
  const result = await router.route_query(query, merchant_id);
  
  // Track cost
  await costTracker.log_query({
    merchant_id,
    query,
    used_openrouter: result.source === 'openrouter',
    cost: result.cost || 0
  });
  
  return {
    answer: result.answer,
    source: result.source, // 'local' or 'openrouter'
    cost: result.cost
  };
});

fastify.post('/api/v1/ai/image-match', async (request, reply) => {
  const { image_buffer, merchant_id } = request.body;
  
  // Process image with CLIP
  const matches = await imageMatcher.find_similar_products(
    image_buffer,
    merchant_id,
    limit=5
  );
  
  return { matches };
});

fastify.listen({ port: 3000, host: '0.0.0.0' });
```

---

### Phase 4: Integration (Weeks 7-8)

#### Integrate with Existing Systems

**1. WhatsApp Bot Integration**
```typescript
// apps/whatsapp-bot/src/handlers/message.ts
import { mlGatewayClient } from '../clients/ml-gateway';

export async function handleCustomerMessage(message: WhatsAppMessage) {
  const merchantId = getMerchantFromPhone(message.to);
  
  if (message.hasImage()) {
    // Image matching
    const imageBuffer = await message.downloadImage();
    const matches = await mlGatewayClient.matchImage(imageBuffer, merchantId);
    
    await sendProductMatches(message.from, matches);
  } else {
    // Text query
    const response = await mlGatewayClient.query(
      message.text,
      merchantId
    );
    
    await sendMessage(message.from, response.answer);
  }
}
```

**2. Dashboard Integration**
```typescript
// Frontend merchant dashboard
async function askAI(question: string) {
  const response = await fetch('/api/ai/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      merchant_id: currentMerchant.id
    })
  });
  
  const result = await response.json();
  
  // Show cost savings
  if (result.source === 'local') {
    showNotification('✅ Answered locally - $0.00 cost');
  } else {
    showNotification(`💰 Used OpenRouter - $${result.cost}`);
  }
  
  return result.answer;
}
```

---

## 💰 COST ANALYSIS

### Infrastructure Costs (Monthly)

| Component | Resource | Cost |
|-----------|----------|------|
| Server 1 (ML Inference) | 4 vCPU, 16GB RAM, 80GB SSD | $40/month |
| Server 2 (Graph + API) | 4 vCPU, 16GB RAM, 80GB SSD | $40/month |
| **Total Infrastructure** | | **$80/month** |

### OpenRouter Cost Comparison

#### Before (100% OpenRouter)
- **Queries/day:** 1,000
- **Avg cost/query:** $0.002
- **Daily cost:** $2.00
- **Monthly cost:** $60.00

#### After (Hybrid Approach)
- **Local queries (80%):** 800/day × $0.00 = $0.00
- **OpenRouter queries (20%):** 200/day × $0.002 = $0.40
- **Daily cost:** $0.40
- **Monthly cost:** $12.00

### Savings
- **Monthly savings:** $48.00 (80% reduction)
- **Annual savings:** $576.00
- **ROI:** Infrastructure pays for itself in <2 months

---

## 📈 PERFORMANCE METRICS

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Local query accuracy | >90% | Compare to ground truth |
| Query latency (local) | <2s | P95 response time |
| Query latency (OpenRouter) | <5s | P95 response time |
| Image match accuracy | >85% | User click-through rate |
| Cost per query | <$0.0004 | Weighted average |
| OpenRouter reduction | >70% | % of queries routed locally |

### Monitoring Dashboard

Build a Grafana dashboard showing:
- Queries per hour (local vs OpenRouter)
- Cost per day/week/month
- Query latency distribution
- Most common query types
- Accuracy metrics
- Cache hit rates

---

## 🚀 OPTIMIZATION STRATEGIES

### Memory Optimization

1. **Model Quantization**
   - Use 4-bit quantization for LLMs
   - Reduces RAM by 4x with minimal quality loss

2. **Vector Quantization in Qdrant**
   - Use INT8 scalar quantization
   - Reduces vector storage by 4x

3. **Neo4j Heap Tuning**
   - Set initial heap = max heap = 2-4GB
   - Avoid garbage collection pauses

4. **Batch Processing**
   - Process embeddings in batches of 32-64
   - Avoid loading entire dataset into RAM

### Speed Optimization

1. **Caching Layer (Redis)**
   ```python
   # Cache frequent queries
   cache_key = f"query:{hash(query)}"
   cached_result = redis.get(cache_key)
   
   if cached_result:
       return cached_result
   else:
       result = await process_query(query)
       redis.setex(cache_key, 3600, result)  # Cache for 1 hour
       return result
   ```

2. **Pre-computed Embeddings**
   - Generate product embeddings offline
   - Update only when products change

3. **HNSW Index Tuning**
   - Increase `ef_construct` for better accuracy
   - Increase `ef_search` for faster queries

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Out of Memory
**Mitigation:**
- Strict memory limits in Docker
- Monitor with Prometheus + Grafana
- Auto-restart on OOM
- Swap space as backup (slower but prevents crashes)

### Risk 2: Slow Inference
**Mitigation:**
- Use smaller models (Phi-3 instead of Mistral)
- Quantization (4-bit)
- Batch requests when possible
- Consider GPU upgrade if CPU too slow

### Risk 3: Poor Accuracy
**Mitigation:**
- Fine-tune models on merchant data
- Improve RAG context retrieval
- Add few-shot examples to prompts
- Human feedback loop for corrections

### Risk 4: Single Point of Failure
**Mitigation:**
- Deploy redundant instances
- Health checks every 30s
- Automatic failover
- Regular backups of Qdrant + Neo4j

---

## 📋 IMPLEMENTATION CHECKLIST

### Week 1-2: Foundation
- [ ] Provision 2 VPS servers (16GB RAM each)
- [ ] Install Docker on both servers
- [ ] Deploy Ollama on Server 1
- [ ] Deploy Qdrant on Server 1
- [ ] Deploy Neo4j on Server 2
- [ ] Test basic connectivity

### Week 3-4: Data Pipeline
- [ ] Write embedding generation script
- [ ] Populate Qdrant with product embeddings
- [ ] Populate Neo4j with merchant graph
- [ ] Test vector search performance
- [ ] Test graph query performance

### Week 5-6: Query Router
- [ ] Build Fastify API gateway
- [ ] Implement query classifier
- [ ] Integrate local LLM (Ollama)
- [ ] Integrate OpenRouter fallback
- [ ] Add cost tracking

### Week 7-8: Integration
- [ ] Integrate with WhatsApp bot
- [ ] Integrate with merchant dashboard
- [ ] Add image matching pipeline (CLIP)
- [ ] End-to-end testing
- [ ] Performance optimization

### Week 9-10: Production Launch
- [ ] Load testing (simulate 1000 concurrent users)
- [ ] Security audit (penetration testing)
- [ ] Monitoring setup (Prometheus + Grafana)
- [ ] Alert configuration (PagerDuty/Slack)
- [ ] Documentation completion
- [ ] Gradual rollout (10% → 50% → 100%)

---

## 🎯 SUCCESS CRITERIA

### Technical Success
- ✅ All queries answered correctly (90%+ accuracy)
- ✅ Response time <3s for local queries
- ✅ Response time <5s for OpenRouter queries
- ✅ Zero downtime deployment
- ✅ Memory usage stable (<14GB per server)

### Business Success
- ✅ 70%+ reduction in OpenRouter costs
- ✅ Merchant satisfaction >4.5/5
- ✅ WhatsApp image matching accuracy >85%
- ✅ ROI positive within 2 months

---

**This plan transforms your AI infrastructure from a cost center to a competitive advantage.** 🚀
