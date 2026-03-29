# ML Gateway - Intelligent Query Router

**Version:** 0.1.0  
**Purpose:** Route AI queries between local LLM (FREE) and OpenRouter (PAID)

---

## 🎯 WHAT IT DOES

This Fastify-based API gateway intelligently routes merchant queries:

### Routing Logic

1. **Internet Research Required** → OpenRouter (PAID)
   - Market trends, competitor analysis
   - News, weather, social media
   - Industry benchmarks

2. **Merchant Data Required** → Local RAG (FREE)
   - Sales queries ("What were my sales yesterday?")
   - Product inventory ("Show me my products")
   - Customer orders ("Which customers bought X?")

3. **Simple Queries** → Local LLM (FREE)
   - General knowledge
   - Basic calculations
   - Content generation

### Cost Optimization

| Query Type | Before | After | Savings |
|------------|--------|-------|---------|
| Merchant data | $0.002 (OpenRouter) | $0.00 (Local) | 100% |
| Internet research | $0.002 (OpenRouter) | $0.002 (OpenRouter) | 0% |
| Simple query | $0.002 (OpenRouter) | $0.00 (Local) | 100% |

**Expected Reduction:** 70-80% on AI credits

---

## 🚀 QUICK START

### Prerequisites

- Node.js 20+
- Ollama running locally (port 11434)
- Qdrant running locally (port 6333)
- Embedding service running (port 8001)
- Neo4j running (port 7687)

### Installation

```bash
# Install dependencies
cd apps/ml-gateway
pnpm install

# Start development server
pnpm run dev
```

### Configuration

Set environment variables in `.env` or use defaults:

```bash
# ML Services (local)
ML_OLLAMA_URL=http://localhost:11434
ML_QDRANT_URL=http://localhost:6333
ML_EMBEDDING_URL=http://localhost:8001
ML_NEO4J_URI=bolt://localhost:7687
ML_NEO4J_USER=neo4j
ML_NEO4J_PASSWORD=local_password_123

# OpenRouter (optional - only for internet queries)
OPENROUTER_API_KEY=your_key_here
OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions

# Server config
ML_GATEWAY_PORT=3000
ML_GATEWAY_HOST=0.0.0.0
```

---

## 📡 API ENDPOINTS

### POST /api/v1/ai/query

Main query endpoint with intelligent routing.

**Request:**
```json
{
  "query": "What were my sales yesterday?",
  "merchant_id": "merchant_123",
  "stream": false
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Your sales yesterday were ₦45,230 from 12 orders.",
  "source": "local",
  "cost": 0,
  "latency_ms": 1250,
  "context_used": [
    "Products: Laptop Pro X1, Wireless Mouse, USB-C Hub",
    "Recent orders: Laptop Pro X1 (₦350,000), Wireless Mouse (₦15,000)"
  ]
}
```

**Response Fields:**
- `source`: `"local"` (FREE) or `"openrouter"` (PAID)
- `cost`: Actual cost in USD
- `latency_ms`: Response time in milliseconds
- `context_used`: Context retrieved from databases

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-28T17:00:00.000Z",
  "services": {
    "ollama": "http://localhost:11434",
    "qdrant": "http://localhost:6333",
    "embedding": "http://localhost:8001",
    "neo4j": "bolt://localhost:7687"
  }
}
```

### GET /metrics

Service metrics endpoint.

**Response:**
```json
{
  "uptime": 3600,
  "memory": {
    "rss": 125000000,
    "heapTotal": 85000000,
    "heapUsed": 65000000
  },
  "config": {
    "port": 3000,
    "host": "0.0.0.0"
  }
}
```

---

## 🧪 TESTING EXAMPLES

### Test 1: Simple Query (Local LLM - FREE)

```bash
curl -X POST http://localhost:3000/api/v1/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is 2 + 2?",
    "merchant_id": "test_merchant"
  }'
```

**Expected:** Uses Phi-3 Mini locally (FREE)

### Test 2: Merchant Data Query (Local RAG - FREE)

```bash
curl -X POST http://localhost:3000/api/v1/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What products do I have in stock?",
    "merchant_id": "test_merchant"
  }'
```

**Expected:** 
1. Generates embedding via local service
2. Searches Qdrant for similar products
3. Queries Neo4j for order relationships
4. Uses Phi-3 Mini to generate answer from context

### Test 3: Internet Research Query (OpenRouter - PAID)

```bash
curl -X POST http://localhost:3000/api/v1/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the latest e-commerce trends in Nigeria?",
    "merchant_id": "test_merchant"
  }'
```

**Expected:** Routes to OpenRouter (PAID ~$0.002)

---

## 🏗️ ARCHITECTURE

### Components

```
┌─────────────┐
│   Merchant  │
│   Query     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│   Query Classifier          │
│   (Keyword Matching)        │
└──────┬──────────────────────┘
       │
       ├─ Requires Internet? ──────► OpenRouter (PAID)
       │
       ├─ Needs Merchant Data? ────► Local RAG Pipeline
       │                              ├─ Generate Embedding
       │                              ├─ Search Qdrant
       │                              ├─ Query Neo4j
       │                              └─ Phi-3 Mini (FREE)
       │
       └─ Simple Query ─────────────► Phi-3 Mini (FREE)
```

### Query Classification Examples

| Query | Classification | Router Decision | Cost |
|-------|---------------|-----------------|------|
| "What were my sales yesterday?" | Merchant data | Local RAG | FREE |
| "Which products are trending in Nigeria?" | Internet research | OpenRouter | PAID |
| "Show me customers who bought X" | Merchant data | Local RAG + Neo4j | FREE |
| "Calculate profit margin for Y" | Math + merchant data | Local calculation | FREE |
| "What are competitors charging?" | Internet research | OpenRouter | PAID |
| "Generate WhatsApp message" | Creative + context | Hybrid | PARTIAL |

---

## 📊 MONITORING

### Logs

The gateway logs detailed information:

```
🔍 Query Classification:
   Query: "What were my sales yesterday?"
   Intent: sales_query
   Requires Internet: false
   Requires Merchant Data: true

🏠 Routing to local RAG (merchant data)
   → Generating embedding...
   → Searching Qdrant...
   → Querying Neo4j...
   → Querying local LLM (Phi-3)...

✅ Query Result:
   Source: local
   Cost: ₦0.0000
   Latency: 1250ms
```

### Cost Tracking

Monitor costs by checking the `source` field:
- `"source": "local"` → FREE
- `"source": "openrouter"` → PAID (~$0.002/query)

**Monthly Cost Calculation:**
```
Total Queries: 1000/day × 30 = 30,000/month
Local Queries: 80% × 30,000 = 24,000 × $0.00 = $0.00
OpenRouter Queries: 20% × 30,000 = 6,000 × $0.002 = $12.00

Total Monthly Cost: $12.00 (vs $60.00 before = 80% savings)
```

---

## 🔧 DEVELOPMENT

### Commands

```bash
# Install dependencies
pnpm install

# Development mode (watch)
pnpm run dev

# Build for production
pnpm build

# Run production build
pnpm start

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Project Structure

```
apps/ml-gateway/
├── src/
│   ├── index.ts           # Main server & router
│   ├── classifier.ts      # Query classification (TODO: extract)
│   ├── rag-pipeline.ts    # RAG implementation (TODO: extract)
│   └── types.ts           # TypeScript types (TODO: extract)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚦 STATUS

**Current Phase:** Development ✅

- [x] Query router implementation
- [x] Classification logic (keyword-based)
- [x] Local RAG pipeline
- [x] OpenRouter integration
- [x] Neo4j integration
- [ ] Qdrant integration (needs test data)
- [ ] Cost tracking dashboard
- [ ] Enhanced ML classifier
- [ ] Unit tests
- [ ] Integration tests
- [ ] Production deployment

---

## 🎯 NEXT STEPS

### Immediate (This Week)
1. Test with local ML services
2. Populate Qdrant with test products
3. Populate Neo4j with test graph
4. Verify end-to-end flow

### Short Term (Next Week)
1. Add cost tracking dashboard
2. Implement enhanced query classifier (ML-based)
3. Add caching layer (Redis)
4. Write unit tests

### Long Term (Before Production)
1. Load testing (1000 concurrent users)
2. Security audit
3. Monitoring setup (Prometheus + Grafana)
4. Alert configuration
5. Documentation completion

---

## 📞 TROUBLESHOOTING

### Common Issues

**Issue:** "Cannot connect to Ollama"
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
docker ps | grep ollama
```

**Issue:** "Neo4j connection failed"
```bash
# Verify Neo4j is running
docker ps | grep neo4j

# Check credentials
echo $ML_NEO4J_URI
echo $ML_NEO4J_USER
echo $ML_NEO4J_PASSWORD
```

**Issue:** "Qdrant collection not found"
```bash
# Collection needs to be created first
# Run the embedding generation script:
python3 scripts/generate_embeddings_local.py
```

---

## 📚 RELATED DOCUMENTATION

- [ML Infrastructure Plan](../../ML_INFRASTRUCTURE_PLAN.md)
- [Local Testing Guide](../../docs/LOCAL_ML_TESTING_GUIDE.md)
- [Query Router Design](../../docs/ML_LOCAL_STATUS_LIVE.md)

---

**Built with ❤️ by Vayva Team**
