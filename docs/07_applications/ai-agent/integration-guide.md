# AI Agent Integration Guide

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Audience:** Developers integrating ML features

---

## Overview

This guide explains how to integrate the AI Agent's ML capabilities into your applications.

## Integration Options

### Option 1: HTTP API (Recommended for External Services)

Use the HTTP API for services running outside the Node.js ecosystem.

```typescript
// Example: Frontend integration
async function analyzeCustomerMessage(message: string) {
  const response = await fetch('http://127.0.0.1:4000/ml/intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const { result } = await response.json();
  return result;
}

// Example: Python integration
import requests

def analyze_sentiment(text):
    response = requests.post(
        'http://127.0.0.1:4000/ml/sentiment',
        json={'text': text}
    )
    return response.json()['result']
```

### Option 2: Direct Package Import (Recommended for Node.js)

Import the AI Agent package directly for best performance.

```typescript
import { MLInferenceClient } from '@vayva/ai-agent';

const ml = new MLInferenceClient();

// Use any ML feature
const sentiment = await ml.analyzeSentiment(text);
const intent = await ml.classifyIntent(message);
const forecast = await ml.predictSales(data, days);
```

### Option 3: MerchantBrainService (Recommended for Backend)

Use the integrated service for database-connected operations.

```typescript
import { MerchantBrainService } from '@vayva/ai-agent';

// Sales forecasting with database data
const forecast = await MerchantBrainService.predictSales(storeId, 7);

// Sentiment analysis for store messages
const sentiment = await MerchantBrainService.analyzeSentiment(messages);

// Get product recommendations
const recommendations = await MerchantBrainService.getProductRecommendations(
  storeId,
  customerId
);
```

## Use Cases

### 1. Customer Support Chatbot

```typescript
import { MLInferenceClient } from '@vayva/ai-agent';

class ChatbotService {
  private ml = new MLInferenceClient();

  async handleMessage(message: string, customerId: string) {
    // Classify intent
    const { intent, confidence } = await this.ml.classifyIntent(message);
    
    // Analyze sentiment
    const sentiment = await this.ml.analyzeSentiment(message);
    
    // Route based on intent
    switch (intent) {
      case 'check_price':
        return this.handlePriceQuery(message);
      case 'check_availability':
        return this.handleStockQuery(message);
      case 'track_order':
        return this.handleOrderTracking(message);
      case 'complaint':
        if (sentiment.label === 'negative') {
          await this.escalateToHuman(customerId, message);
          return "I'm sorry to hear that. Let me connect you with a support agent.";
        }
        break;
      default:
        return this.handleGeneralQuery(message);
    }
  }
}
```

### 2. Sales Dashboard

```typescript
import { MerchantBrainService } from '@vayva/ai-agent';

async function getSalesInsights(storeId: string) {
  // Get 7-day forecast
  const forecast = await MerchantBrainService.predictSales(storeId, 7);
  
  // Detect anomalies
  const anomalies = await MerchantBrainService.detectSalesAnomalies(storeId, 30);
  
  return {
    forecast,
    anomalies: anomalies.anomalies,
    trend: forecast.forecast?.trend,
    confidence: forecast.forecast?.confidence
  };
}
```

### 3. Product Recommendations

```typescript
import { MerchantBrainService } from '@vayva/ai-agent';

async function getRecommendations(storeId: string, customerId: string) {
  const result = await MerchantBrainService.getProductRecommendations(
    storeId,
    customerId,
    5 // limit
  );
  
  if (result.ok && result.recommendations) {
    return result.recommendations.map(rec => ({
      product: rec.product,
      reason: rec.reason,
      score: rec.score
    }));
  }
  
  return [];
}
```

### 4. Price Optimization

```typescript
import { MerchantBrainService } from '@vayva/ai-agent';

async function optimizePricing(storeId: string, productId: string) {
  const result = await MerchantBrainService.suggestPriceOptimization(
    storeId,
    productId
  );
  
  if (result.ok) {
    return {
      currentPrice: result.currentPrice,
      suggestedPrice: result.suggestion.suggestedPrice,
      expectedImpact: result.suggestion.expectedImpact,
      reasoning: result.suggestion.reasoning
    };
  }
  
  return null;
}
```

### 5. Review Analysis

```typescript
import { MLInferenceClient } from '@vayva/ai-agent';

const ml = new MLInferenceClient();

async function analyzeReviews(reviews: string[]) {
  const sentiments = await Promise.all(
    reviews.map(review => ml.analyzeSentiment(review))
  );
  
  const summary = {
    total: reviews.length,
    positive: sentiments.filter(s => s.label === 'positive').length,
    negative: sentiments.filter(s => s.label === 'negative').length,
    neutral: sentiments.filter(s => s.label === 'neutral').length,
    averageScore: sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length
  };
  
  // Get trend using sentiment analyzer
  const trend = ml.getSentimentAnalyzer().analyzeTrend(sentiments);
  
  return { summary, trend };
}
```

## Integration Patterns

### Pattern 1: Real-time Analysis

For immediate response requirements:

```typescript
// In your API route
export async function POST(request: Request) {
  const { message } = await request.json();
  
  // Fast local ML - no external API calls
  const ml = new MLInferenceClient();
  const intent = await ml.classifyIntent(message);
  
  return Response.json({ intent });
}
```

### Pattern 2: Batch Processing

For background analysis:

```typescript
// In your worker job
import { Queue } from 'bullmq';

const mlQueue = new Queue('ml-processing');

// Add job
await mlQueue.add('analyze-reviews', {
  storeId,
  reviewIds
});

// Process job
mlQueue.process('analyze-reviews', async (job) => {
  const { storeId, reviewIds } = job.data;
  
  // Fetch reviews
  const reviews = await fetchReviews(reviewIds);
  
  // Analyze in batch
  const ml = new MLInferenceClient();
  const results = await Promise.all(
    reviews.map(r => ml.analyzeSentiment(r.content))
  );
  
  // Store results
  await storeSentimentResults(storeId, results);
});
```

### Pattern 3: Caching

For frequently accessed data:

```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedForecast(storeId: string) {
  const cacheKey = `forecast:${storeId}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Generate forecast
  const forecast = await MerchantBrainService.predictSales(storeId, 7);
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(forecast));
  
  return forecast;
}
```

## Error Handling

### HTTP API Errors

```typescript
async function safeMLCall<T>(
  endpoint: string,
  data: unknown
): Promise<T | null> {
  try {
    const response = await fetch(`http://127.0.0.1:4000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      console.error('ML API error:', await response.text());
      return null;
    }
    
    const result = await response.json();
    return result.result;
  } catch (error) {
    console.error('ML call failed:', error);
    return null;
  }
}
```

### Package Import Errors

```typescript
import { MLInferenceClient } from '@vayva/ai-agent';

const ml = new MLInferenceClient();

async function safeSentimentAnalysis(text: string) {
  try {
    return await ml.analyzeSentiment(text);
  } catch (error) {
    // Fallback to neutral
    console.error('Sentiment analysis failed:', error);
    return { score: 0, label: 'neutral', confidence: 0 };
  }
}
```

## Testing

### Unit Testing

```typescript
import { describe, it, expect } from 'vitest';
import { MLInferenceClient } from '@vayva/ai-agent';

describe('ML Features', () => {
  const ml = new MLInferenceClient();

  it('should analyze sentiment correctly', async () => {
    const result = await ml.analyzeSentiment('I love this!');
    expect(result.label).toBe('positive');
    expect(result.score).toBeGreaterThan(0);
  });

  it('should classify intent correctly', async () => {
    const result = await ml.classifyIntent('How much does this cost?');
    expect(result.intent).toBe('check_price');
  });

  it('should detect anomalies', async () => {
    const data = [100, 102, 98, 105, 500, 101, 99];
    const result = await ml.detectAnomalies(data, 2);
    expect(result[4].isAnomaly).toBe(true);
  });
});
```

### Integration Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('AI Agent API', () => {
  const API_URL = 'http://127.0.0.1:4000';

  it('should return health status', async () => {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    expect(data.status).toBe('healthy');
    expect(data.ml.available).toBe(true);
  });

  it('should analyze sentiment via API', async () => {
    const response = await fetch(`${API_URL}/ml/sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Great product!' })
    });
    
    const data = await response.json();
    expect(data.result.label).toBe('positive');
  });
});
```

## Performance Considerations

### Response Times

| Operation | Local | HTTP API |
|-----------|-------|----------|
| Sentiment | < 5ms | < 50ms |
| Intent | < 5ms | < 50ms |
| Forecast | < 20ms | < 100ms |
| Anomalies | < 5ms | < 50ms |

### Recommendations

1. **Use direct import** for Node.js services (fastest)
2. **Use HTTP API** for non-Node.js services
3. **Cache results** for repeated queries
4. **Batch operations** when possible
5. **Handle failures gracefully** with fallbacks

## Security

### API Key Management

```typescript
// Never expose AI Agent directly to internet
// Use reverse proxy with authentication

// Example: Next.js API route with auth
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Now safe to call AI Agent
  const result = await fetch('http://127.0.0.1:4000/ml/sentiment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  return result;
}
```

### Input Validation

```typescript
import { z } from 'zod';

const sentimentSchema = z.object({
  text: z.string().max(10000)
});

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validate input
  const result = sentimentSchema.safeParse(body);
  if (!result.success) {
    return new Response('Invalid input', { status: 400 });
  }
  
  // Process
  const ml = new MLInferenceClient();
  const sentiment = await ml.analyzeSentiment(result.data.text);
  
  return Response.json({ sentiment });
}
```

## Troubleshooting

### Common Issues

**Issue:** Connection refused to AI Agent
```bash
# Check if service is running
systemctl status vayva-ai-agent

# Check port
curl http://127.0.0.1:4000/health
```

**Issue:** Slow responses
```typescript
// Use caching
const cache = new Map();

async function cachedSentiment(text: string) {
  if (cache.has(text)) {
    return cache.get(text);
  }
  
  const result = await ml.analyzeSentiment(text);
  cache.set(text, result);
  
  // Clear cache periodically
  setTimeout(() => cache.delete(text), 60000);
  
  return result;
}
```

**Issue:** High memory usage
```typescript
// Reuse ML client instance
const ml = new MLInferenceClient(); // Create once

// Don't create new instances per request
// Bad: const ml = new MLInferenceClient() in each handler
// Good: const ml = new MLInferenceClient() at module level
```

## Related Documentation

- [AI Agent Overview](README.md)
- [API Reference](api-reference.md)
- [Deployment Guide](deployment.md)

---

**Questions?** Check the troubleshooting section or contact the platform team.
