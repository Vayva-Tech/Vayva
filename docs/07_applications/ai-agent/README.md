# AI Agent with ML Capabilities

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Status:** Production Ready

---

## Overview

The Vayva AI Agent is a machine learning-enhanced service that provides intelligent features for merchant operations, customer interactions, and business analytics. All ML capabilities run locally on the VPS with **zero external API costs**.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI AGENT (VPS)                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    HTTP Server (Port 4000)                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │  │
│  │  │   Health    │  │    ML API   │  │  AI Providers     │  │  │
│  │  │   Check     │  │  Endpoints  │  │  (Groq/DeepSeek)  │  │  │
│  │  └─────────────┘  └──────┬──────┘  └───────────────────┘  │  │
│  │                          │                                  │  │
│  │  ┌───────────────────────┴─────────────────────────────┐   │  │
│  │  │              ML Inference Engine (FREE)              │   │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │   │  │
│  │  │  │Sentiment │ │  Intent  │ │ Forecast │ │Anomaly  │ │   │  │
│  │  │  │ Analysis │ │Classifier│ │  Engine  │ │Detection│ │   │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │   │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │   │  │
│  │  │  │Recommend │ │  Price   │ │  Similar │             │   │  │
│  │  │  │  Engine  │ │Optimize  │ │  Search  │             │   │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘             │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┼───────────────────────────────┐  │
│  │         DATA LAYER        │                               │  │
│  │  ┌─────────────┐  ┌───────┴────────┐  ┌────────────────┐ │  │
│  │  │  PostgreSQL │  │     Redis      │  │  Evolution API │ │  │
│  │  │  (Prisma)   │  │   (BullMQ)     │  │   (WhatsApp)   │ │  │
│  │  └─────────────┘  └────────────────┘  └────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## ML Features

### 1. Sentiment Analysis
Lexicon-based sentiment analysis for customer messages and reviews.

**Cost:** FREE (no API calls)

```typescript
// Example usage
const result = await mlClient.analyzeSentiment("I love this product!");
// { score: 1, label: "positive", confidence: 0.75 }
```

### 2. Intent Classification
Rule-based intent detection for 15+ conversation intents.

**Cost:** FREE (no API calls)

```typescript
// Example usage
const result = await mlClient.classifyIntent("How much does this cost?");
// { intent: "check_price", confidence: 0.95, entities: {} }
```

**Supported Intents:**
- `browse_products` - User wants to see products
- `check_price` - Price inquiry
- `check_availability` - Stock check
- `place_order` - Purchase intent
- `track_order` - Order status inquiry
- `cancel_order` - Cancellation request
- `request_refund` - Refund request
- `ask_support` - Help request
- `complaint` - Negative feedback
- `compliment` - Positive feedback
- `ask_shipping` - Delivery questions
- `negotiate_price` - Price negotiation
- `compare_products` - Product comparison
- `greeting` - Hello/hi
- `goodbye` - Farewell

### 3. Sales Forecasting
Statistical forecasting using moving averages, exponential smoothing, and linear regression.

**Cost:** FREE (no API calls)

```typescript
// Example usage
const forecast = await mlClient.predictSales(historicalData, 7);
// {
//   predictedRevenue: 150000,
//   predictedOrders: 45,
//   confidence: 0.85,
//   trend: "up",
//   dailyBreakdown: [...]
// }
```

### 4. Anomaly Detection
Statistical outlier detection using standard deviation.

**Cost:** FREE (no API calls)

```typescript
// Example usage
const anomalies = await mlClient.detectAnomalies([100, 102, 500, 99], 2);
// [{ index: 2, value: 500, isAnomaly: true }]
```

### 5. Product Recommendations
Collaborative and content-based filtering for personalized recommendations.

**Cost:** FREE (no API calls)

```typescript
// Example usage
const recommendations = await mlClient.recommendProducts(
  customerId,
  purchaseHistory,
  products,
  5
);
// [{ productId: "...", score: 0.95, reason: "Similar to items you viewed" }]
```

### 6. Price Optimization
Market-based price suggestions using competitor analysis.

**Cost:** FREE (no API calls)

```typescript
// Example usage
const suggestion = await mlClient.suggestPriceOptimization(
  currentPrice,
  salesVolume,
  competitorPrices
);
// { suggestedPrice: 15000, expectedImpact: "increase", reasoning: "..." }
```

## API Endpoints

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-07T20:16:53.746Z",
  "version": "0.0.0",
  "ml": {
    "available": true,
    "features": {
      "sentimentAnalysis": true,
      "intentClassification": true,
      "salesForecasting": true,
      "productRecommendations": true,
      "anomalyDetection": true,
      "priceOptimization": true
    }
  },
  "uptime": 32.15
}
```

### Sentiment Analysis
```
POST /ml/sentiment
Content-Type: application/json

{
  "text": "I love this product!"
}
```

**Response:**
```json
{
  "result": {
    "score": 1,
    "label": "positive",
    "confidence": 0.75
  }
}
```

### Intent Classification
```
POST /ml/intent
Content-Type: application/json

{
  "message": "How much does this cost?"
}
```

**Response:**
```json
{
  "result": {
    "intent": "check_price",
    "confidence": 0.67,
    "entities": {}
  }
}
```

### Sales Forecasting
```
POST /ml/forecast
Content-Type: application/json

{
  "historicalData": [
    { "date": "2026-03-01", "revenue": 100000, "orders": 30 },
    { "date": "2026-03-02", "revenue": 120000, "orders": 35 }
  ],
  "days": 7
}
```

**Response:**
```json
{
  "result": {
    "predictedRevenue": 150000,
    "predictedOrders": 45,
    "confidence": 0.85,
    "trend": "up",
    "dailyBreakdown": [...]
  }
}
```

### Anomaly Detection
```
POST /ml/anomalies
Content-Type: application/json

{
  "data": [100, 102, 98, 105, 500, 101, 99],
  "threshold": 2
}
```

**Response:**
```json
{
  "result": [
    { "index": 0, "value": 100, "isAnomaly": false },
    { "index": 4, "value": 500, "isAnomaly": true }
  ]
}
```

## Integration

### Via MerchantBrainService

The AI Agent integrates with the existing `MerchantBrainService`:

```typescript
import { MerchantBrainService } from "@vayva/ai-agent";

// Sales forecasting
const forecast = await MerchantBrainService.predictSales(storeId, 7);

// Sentiment analysis
const sentiment = await MerchantBrainService.analyzeSentiment(messages);

// Anomaly detection
const anomalies = await MerchantBrainService.detectSalesAnomalies(storeId);

// Product recommendations
const recommendations = await MerchantBrainService.getProductRecommendations(
  storeId, 
  customerId
);

// Price optimization
const optimization = await MerchantBrainService.suggestPriceOptimization(
  storeId, 
  productId
);
```

### Direct ML Client Usage

For custom implementations:

```typescript
import { MLInferenceClient } from "@vayva/ai-agent";

const ml = new MLInferenceClient();

// Any ML operation
const result = await ml.analyzeSentiment(text);
const intent = await ml.classifyIntent(message);
const forecast = await ml.predictSales(data, days);
```

## Configuration

### Environment Variables

```bash
# Server
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Evolution API (WhatsApp)
EVOLUTION_API_URL=http://127.0.0.1:8080
EVOLUTION_API_KEY=...
EVOLUTION_INSTANCE_NAME=vayva-main

# AI Providers (optional - ML works without these)
GROQ_API_KEY_MERCHANT=
GROQ_API_KEY_SUPPORT=
DEEPSEEK_API_KEY=
OPENAI_API_KEY=

# ML Features (all default to true)
ML_ENABLED=true
ML_SENTIMENT_ENABLED=true
ML_FORECAST_ENABLED=true
ML_RECOMMENDATIONS_ENABLED=true
ML_ANOMALY_DETECTION_ENABLED=true
```

## Deployment

The AI Agent runs as a systemd service on the VPS alongside the Evolution API.

**Location:** VPS 163.245.209.202 (Staging)  
**Port:** 4000  
**Service:** `vayva-ai-agent`

See [Deployment Guide](deployment.md) for detailed instructions.

## Monitoring

### Health Check
```bash
curl http://127.0.0.1:4000/health
```

### Logs
```bash
journalctl -u vayva-ai-agent -f
```

### Service Status
```bash
systemctl status vayva-ai-agent
```

## Cost Analysis

| Feature | Traditional API Cost | Vayva ML Cost | Savings |
|---------|---------------------|---------------|---------|
| Sentiment Analysis | $0.001-0.01/request | $0 | 100% |
| Intent Classification | $0.001-0.01/request | $0 | 100% |
| Sales Forecasting | $0.01-0.10/request | $0 | 100% |
| Recommendations | $0.001-0.01/request | $0 | 100% |
| Anomaly Detection | $0.001-0.01/request | $0 | 100% |

**Total Monthly Savings:** ~$500-2000 (depending on volume)

## Performance

- **Response Time:** < 50ms for all ML operations
- **Memory Usage:** ~100-200MB
- **CPU Usage:** Low (statistical models, no neural networks)
- **Throughput:** 1000+ requests/second

## Troubleshooting

### Service Won't Start
```bash
# Check logs
journalctl -u vayva-ai-agent -n 50

# Verify environment
cat /opt/vayva/ai-agent.env

# Check port availability
netstat -tlnp | grep 4000
```

### ML Features Not Available
```bash
# Check health endpoint
curl http://127.0.0.1:4000/health

# Verify ML configuration
grep ML_ /opt/vayva/ai-agent.env
```

### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

## Related Documentation

- [Deployment Guide](deployment.md)
- [API Reference](api-reference.md)
- [Integration Guide](integration-guide.md)
- [VPS Worker Deployment](../04_deployment/vps-worker.md)
- [Evolution API Setup](../04_deployment/vps-app-server.md)

---

**Questions?** Contact the platform team or check the troubleshooting section.
