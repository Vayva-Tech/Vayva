# AI Agent API Reference

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Base URL:** `http://127.0.0.1:4000`

---

## Overview

The AI Agent exposes HTTP endpoints for machine learning operations. All endpoints return JSON and accept JSON payloads.

## Authentication

Currently, the AI Agent runs on localhost and does not require authentication. For production deployments behind a reverse proxy, implement authentication at the proxy level.

## Base URL

```
http://127.0.0.1:4000
```

## Common Response Format

All responses follow this structure:

```json
{
  "result": { ... },
  "error": "..."  // Only present on errors
}
```

## Endpoints

### Health Check

Check service status and ML feature availability.

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

**Status Codes:**
- `200` - Service healthy
- `503` - Service unhealthy

---

### Sentiment Analysis

Analyze text sentiment using lexicon-based approach.

```
POST /ml/sentiment
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "I love this product!"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | Text to analyze |

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

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| score | number | Sentiment score (-1 to 1) |
| label | string | "positive", "negative", or "neutral" |
| confidence | number | Confidence level (0 to 1) |

**Example:**
```bash
curl -X POST http://127.0.0.1:4000/ml/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text":"I love this product!"}'
```

---

### Intent Classification

Classify user message intent using rule-based approach.

```
POST /ml/intent
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "How much does this cost?"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User message to classify |

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

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| intent | string | Detected intent |
| confidence | number | Confidence level (0 to 1) |
| entities | object | Extracted entities (if any) |

**Supported Intents:**
| Intent | Description | Example |
|--------|-------------|---------|
| browse_products | User wants to see products | "Show me products" |
| check_price | Price inquiry | "How much is this?" |
| check_availability | Stock check | "Is this in stock?" |
| place_order | Purchase intent | "I want to buy this" |
| track_order | Order status inquiry | "Where is my order?" |
| cancel_order | Cancellation request | "Cancel my order" |
| request_refund | Refund request | "I want a refund" |
| ask_support | Help request | "I need help" |
| complaint | Negative feedback | "This is terrible" |
| compliment | Positive feedback | "Great service!" |
| ask_shipping | Delivery questions | "How long is shipping?" |
| negotiate_price | Price negotiation | "Can you lower the price?" |
| compare_products | Product comparison | "Compare these two" |
| greeting | Hello/hi | "Hello" |
| goodbye | Farewell | "Goodbye" |
| unknown | Unrecognized intent | - |

**Example:**
```bash
curl -X POST http://127.0.0.1:4000/ml/intent \
  -H "Content-Type: application/json" \
  -d '{"message":"How much does this cost?"}'
```

---

### Sales Forecasting

Predict future sales using statistical models.

```
POST /ml/forecast
Content-Type: application/json
```

**Request Body:**
```json
{
  "historicalData": [
    { "date": "2026-03-01", "revenue": 100000, "orders": 30 },
    { "date": "2026-03-02", "revenue": 120000, "orders": 35 },
    { "date": "2026-03-03", "revenue": 110000, "orders": 32 }
  ],
  "days": 7
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| historicalData | array | Yes | Array of daily sales data |
| days | number | No | Days to forecast (default: 7) |

**Historical Data Format:**
| Field | Type | Description |
|-------|------|-------------|
| date | string (ISO 8601) | Date of data point |
| revenue | number | Daily revenue |
| orders | number | Daily order count |

**Response:**
```json
{
  "result": {
    "predictedRevenue": 150000,
    "predictedOrders": 45,
    "confidence": 0.85,
    "trend": "up",
    "dailyBreakdown": [
      { "date": "2026-03-04", "revenue": 115000, "orders": 33 },
      { "date": "2026-03-05", "revenue": 118000, "orders": 34 },
      { "date": "2026-03-06", "revenue": 120000, "orders": 35 },
      { "date": "2026-03-07", "revenue": 122000, "orders": 36 },
      { "date": "2026-03-08", "revenue": 125000, "orders": 37 },
      { "date": "2026-03-09", "revenue": 128000, "orders": 38 },
      { "date": "2026-03-10", "revenue": 130000, "orders": 39 }
    ]
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| predictedRevenue | number | Total predicted revenue |
| predictedOrders | number | Total predicted orders |
| confidence | number | Forecast confidence (0 to 1) |
| trend | string | "up", "down", or "stable" |
| dailyBreakdown | array | Day-by-day predictions |

**Example:**
```bash
curl -X POST http://127.0.0.1:4000/ml/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "historicalData": [
      {"date":"2026-03-01","revenue":100000,"orders":30},
      {"date":"2026-03-02","revenue":120000,"orders":35},
      {"date":"2026-03-03","revenue":110000,"orders":32}
    ],
    "days": 7
  }'
```

---

### Anomaly Detection

Detect outliers in numerical data using statistical methods.

```
POST /ml/anomalies
Content-Type: application/json
```

**Request Body:**
```json
{
  "data": [100, 102, 98, 105, 500, 101, 99],
  "threshold": 2
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data | array of numbers | Yes | Data points to analyze |
| threshold | number | No | Standard deviations threshold (default: 2) |

**Response:**
```json
{
  "result": [
    { "index": 0, "value": 100, "isAnomaly": false },
    { "index": 1, "value": 102, "isAnomaly": false },
    { "index": 2, "value": 98, "isAnomaly": false },
    { "index": 3, "value": 105, "isAnomaly": false },
    { "index": 4, "value": 500, "isAnomaly": true },
    { "index": 5, "value": 101, "isAnomaly": false },
    { "index": 6, "value": 99, "isAnomaly": false }
  ]
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| index | number | Position in input array |
| value | number | Original value |
| isAnomaly | boolean | Whether value is an outlier |

**Example:**
```bash
curl -X POST http://127.0.0.1:4000/ml/anomalies \
  -H "Content-Type: application/json" \
  -d '{"data":[100,102,98,105,500,101,99],"threshold":2}'
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Common Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing or invalid 'text' field | Sentiment endpoint missing text |
| 400 | Missing or invalid 'message' field | Intent endpoint missing message |
| 400 | Missing or invalid 'historicalData' field | Forecast endpoint missing data |
| 400 | Missing or invalid 'data' field | Anomalies endpoint missing data |
| 404 | Not found | Invalid endpoint |
| 405 | Method not allowed | Wrong HTTP method |
| 500 | Internal server error | Server error |

### Example Error

```json
{
  "error": "Missing or invalid 'text' field"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, implement rate limiting at the reverse proxy level (nginx).

**Recommended Limits:**
- 1000 requests per minute per IP
- 10,000 requests per hour per IP

---

## Performance

| Endpoint | Avg Response Time | Max Payload |
|----------|-------------------|-------------|
| GET /health | < 10ms | - |
| POST /ml/sentiment | < 50ms | 10KB text |
| POST /ml/intent | < 50ms | 10KB text |
| POST /ml/forecast | < 100ms | 90 days data |
| POST /ml/anomalies | < 50ms | 1000 data points |

---

## SDK Usage

### TypeScript/JavaScript

```typescript
// Using fetch
async function analyzeSentiment(text: string) {
  const response = await fetch('http://127.0.0.1:4000/ml/sentiment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return response.json();
}

// Using MLInferenceClient (recommended)
import { MLInferenceClient } from '@vayva/ai-agent';

const ml = new MLInferenceClient();
const result = await ml.analyzeSentiment('I love this!');
```

### cURL

```bash
# Sentiment
curl -X POST http://127.0.0.1:4000/ml/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text":"Great product!"}'

# Intent
curl -X POST http://127.0.0.1:4000/ml/intent \
  -H "Content-Type: application/json" \
  -d '{"message":"How much is shipping?"}'

# Forecast
curl -X POST http://127.0.0.1:4000/ml/forecast \
  -H "Content-Type: application/json" \
  -d '{"historicalData":[{"date":"2026-03-01","revenue":100000,"orders":30}],"days":7}'

# Anomalies
curl -X POST http://127.0.0.1:4000/ml/anomalies \
  -H "Content-Type: application/json" \
  -d '{"data":[100,102,500,99],"threshold":2}'
```

---

## Testing

### Health Check

```bash
curl http://127.0.0.1:4000/health | jq .
```

### Load Testing

```bash
# Using ab (Apache Bench)
ab -n 1000 -c 10 -T application/json \
  -p sentiment.json \
  http://127.0.0.1:4000/ml/sentiment

# Using wrk
wrk -t12 -c400 -d30s \
  -s sentiment.lua \
  http://127.0.0.1:4000/ml/sentiment
```

---

## Related Documentation

- [AI Agent Overview](README.md)
- [Deployment Guide](deployment.md)
- [Integration Guide](integration-guide.md)

---

**Questions?** Check the troubleshooting section or contact the platform team.
