# ⚙️ BACKEND ENGINEER - API INFRASTRUCTURE & DATA INTEGRITY
**CRISIS MODE - FINAL SPRINT** | **DEADLINE: 24 HOURS** | **P0: BLOCKING REVENUE**

---

## 📋 YOUR MISSION

You are responsible for **API RELIABILITY**, **DATA AGGREGATION**, and **THIRD-PARTY INTEGRATIONS**. The UI/UX designer is making dashboards beautiful, but they're USELESS without data.

**YOUR JOB:** Make sure every API endpoint responds in <500ms with accurate data.

---

## 🔍 CURRENT STATE AUDIT

### EXISTING API ENDPOINTS:

```typescript
// Dashboard Data Aggregation
GET /api/dashboard/aggregate?range=month        // ✅ Works but slow (2-3s)
GET /api/dashboard/pro-overview                 // ⚠️ Untested

// API Keys Management  
GET  /api/saas/api-keys                         // ✅ Built, untested
POST /api/saas/api-keys                         // ✅ Built, untested
DELETE /api/saas/api-keys/:id                   // ✅ Built, untested
POST /api/saas/api-keys/:id/rotate              // ✅ Built, needs grace period

// Industry-Specific APIs (need verification)
packages/industry-*/src/api/*.ts                // ❓ Unknown state
```

### PERFORMANCE ISSUES:

```
Current State:
- /api/dashboard/aggregate: 2000-3000ms response time ❌
- No caching → hits database on every request ❌
- Sequential queries → could be parallel ❌
- No rate limiting → vulnerable to abuse ❌

Target State:
- All endpoints respond in <500ms ✅
- Redis caching with 5min TTL ✅
- Parallel data fetching ✅
- Rate limiting enforced ✅
```

---

## 🎯 YOUR 5 CRITICAL TASKS

### TASK 1: DASHBOARD API OPTIMIZATION ⏰ (4 HOURS)

**FILE:** `Backend/core-api/src/app/api/dashboard/aggregate/route.ts`

#### CURRENT PROBLEM:
```typescript
// PSEUDOCODE - WHAT IT PROBABLY LOOKS LIKE NOW
async function GET(request) {
  const range = request.nextUrl.searchParams.get('range');
  
  // SEQUENTIAL - SLOW!
  const overviewData = await db.order.aggregate({...});     // 800ms
  const metricsData = await db.analytics.findMany({...});   // 600ms
  const customers = await db.customer.findMany({...});      // 700ms
  const inventory = await db.product.findMany({...});       // 900ms
  
  return Response.json({ overviewData, metricsData, ... });
  // TOTAL: 3000ms 😱
}
```

#### FIX - PARALLEL + CACHING:

```typescript
// Backend/core-api/src/app/api/dashboard/aggregate/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@vayva/prisma';
import { redis } from '@/lib/redis';
import { getSessionUser } from '@/lib/session.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const range = request.nextUrl.searchParams.get('range') || 'month';
    const cacheKey = `dashboard:${user.merchantId}:${range}`;

    // TRY CACHE FIRST
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('[DASHBOARD] Cache hit:', cacheKey);
      return new Response(JSON.stringify(cached), {
        headers: { 'X-Cache': 'HIT', 'X-Response-Time': '5ms' }
      });
    }

    console.log('[DASHBOARD] Cache miss, fetching from DB:', cacheKey);
    const startTime = Date.now();

    // PARALLEL FETCH - THIS IS THE KEY!
    const [
      overviewData,
      metricsData,
      customerInsightsData,
      inventoryAlertsData,
      todosAlertsData,
      recentPrimaryData,
      activityData
    ] = await Promise.all([
      // 1. Overview (revenue, orders, customers)
      prisma.order.aggregate({
        where: {
          merchantId: user.merchantId,
          createdAt: getDateRange(range),
        },
        select: {
          _count: true,
          total: { sum: true },
        }
      }),

      // 2. Metrics (conversion rate, AOV, etc.)
      prisma.analytics.findFirst({
        where: {
          merchantId: user.merchantId,
          date: getDateRange(range),
        },
        select: {
          conversionRate: true,
          averageOrderValue: true,
          customerLifetimeValue: true,
        }
      }),

      // 3. Customer Insights
      prisma.customer.groupBy({
        by: ['status'],
        where: { merchantId: user.merchantId },
        _count: true,
      }),

      // 4. Inventory Alerts
      prisma.product.findMany({
        where: {
          merchantId: user.merchantId,
          OR: [
            { stockQuantity: { lte: 5 } },
            { stockQuantity: { equals: 0 } },
          ],
        },
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          lowStockThreshold: true,
        }
      }),

      // 5. Todos & Alerts
      prisma.task.findMany({
        where: {
          merchantId: user.merchantId,
          completed: false,
          dueDate: { gte: new Date() },
        },
        orderBy: { priority: 'desc' },
        take: 10,
      }),

      // 6. Recent Orders/Bookings/etc.
      prisma.order.findMany({
        where: { merchantId: user.merchantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: true },
      }),

      // 7. Activity Feed
      prisma.activityLog.findMany({
        where: { merchantId: user.merchantId },
        orderBy: { timestamp: 'desc' },
        take: 20,
      }),
    ]);

    const responseData = {
      success: true,
      data: {
        overviewData,
        metricsData,
        customerInsightsData,
        inventoryAlertsData,
        todosAlertsData,
        recentPrimaryData,
        activityData,
      },
      meta: {
        range,
        fetchedAt: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      }
    };

    // CACHE FOR 5 MINUTES
    await redis.setex(cacheKey, 300, responseData);

    const responseTime = Date.now() - startTime;
    console.log(`[DASHBOARD] Fetched in ${responseTime}ms`);

    return new Response(JSON.stringify(responseData), {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${responseTime}ms`,
      }
    });

  } catch (error) {
    console.error('[DASHBOARD] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch dashboard data' }),
      { status: 500 }
    );
  }
}

// Helper function
function getDateRange(range: string) {
  const now = new Date();
  switch (range) {
    case 'today':
      return { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { gte: weekAgo };
    case 'month':
    default:
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { gte: monthAgo };
  }
}
```

#### DELIVERABLES:
- [ ] Implement parallel fetching with Promise.all()
- [ ] Add Redis caching (5min TTL)
- [ ] Add X-Response-Time header
- [ ] Test with 10 concurrent requests
- [ ] Verify response time <500ms

---

### TASK 2: API KEYS MANAGEMENT - COMPLETE TESTING ⏰ (4 HOURS)

**FILES:**
```
Backend/core-api/src/app/api/integrations/api-keys/
├── route.ts              (GET all, POST create)
├── [id]/route.ts         (GET one, PUT update, DELETE revoke)
└── [id]/rotate/route.ts  (POST rotate key)
```

#### STEP 1: TEST CREATE API KEY

**MANUAL TEST:**
```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva

# Get auth token first (from logged-in session)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Create API Key
curl -X POST http://localhost:3000/api/integrations/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Integration",
    "scopes": ["read:orders", "write:products", "read:analytics"],
    "rateLimitPerMinute": 100,
    "expiresInDays": 365
  }'
```

**EXPECTED RESPONSE:**
```json
{
  "success": true,
  "data": {
    "id": "key_abc123",
    "name": "Production Integration",
    "keyPrefix": "vayva_live_",
    "secretKey": "vayva_live_sk_abc123def456...",  // ← ONLY SHOWN ONCE!
    "scopes": ["read:orders", "write:products"],
    "rateLimitPerMinute": 100,
    "createdAt": "2025-01-15T10:30:00Z",
    "expiresAt": "2026-01-15T10:30:00Z"
  }
}
```

⚠️ **CRITICAL:** The `secretKey` must NEVER be shown again. Store it securely.

#### STEP 2: ADD GRACE PERIOD TO KEY ROTATION

**FILE:** `Backend/core-api/src/app/api/integrations/api-keys/[id]/rotate/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@vayva/prisma';
import { nanoid } from 'nanoid';
import { getSessionUser } from '@/lib/session.server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { gracePeriodDays = 24 } = body; // Default 24 hours

    // Find existing key
    const existingKey = await prisma.apiKey.findUnique({
      where: { id: params.id, merchantId: user.merchantId },
    });

    if (!existingKey) {
      return new Response(JSON.stringify({ error: 'Key not found' }), { status: 404 });
    }

    // GENERATE NEW KEY
    const newKeyId = `key_${nanoid()}`;
    const newKeySecret = `vayva_live_sk_${nanoid(32)}`;
    const newKeyHash = await hashApiKey(newKeySecret);

    // CREATE NEW KEY WITH GRACE PERIOD
    const newKey = await prisma.apiKey.create({
      data: {
        id: newKeyId,
        merchantId: user.merchantId,
        name: `${existingKey.name} (Rotated)`,
        keyPrefix: existingKey.keyPrefix,
        secretKeyHash: newKeyHash,
        scopes: existingKey.scopes,
        rateLimitPerMinute: existingKey.rateLimitPerMinute,
        
        // GRACE PERIOD LOGIC
        expiresAt: gracePeriodDays > 0 
          ? new Date(Date.now() + gracePeriodDays * 24 * 60 * 60 * 1000)
          : null,
        
        // Link to old key for audit trail
        rotatedFromKeyId: existingKey.id,
      },
    });

    // MARK OLD KEY AS EXPIRING SOON
    await prisma.apiKey.update({
      where: { id: existingKey.id },
      data: {
        expiresAt: new Date(Date.now() + gracePeriodDays * 24 * 60 * 60 * 1000),
        note: `Rotated on ${new Date().toISOString()}. New key ID: ${newKeyId}`,
      },
    });

    // LOG ROTATION FOR AUDIT
    await prisma.auditLog.create({
      data: {
        merchantId: user.merchantId,
        userId: user.id,
        action: 'API_KEY_ROTATED',
        details: {
          oldKeyId: existingKey.id,
          newKeyId: newKey.id,
          gracePeriodHours: gracePeriodDays,
        },
      },
    });

    // SEND NOTIFICATION EMAIL (use notification engine)
    await sendRotationNotification(user.email, {
      oldKeyId: existingKey.id,
      newKeyId: newKey.id,
      gracePeriodHours: gracePeriodDays,
      expiresAt: new Date(Date.now() + gracePeriodDays * 24 * 60 * 60 * 1000),
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: newKey.id,
        name: newKey.name,
        keyPrefix: newKey.keyPrefix,
        secretKey: newKeySecret, // Show ONCE
        expiresAt: newKey.expiresAt,
        oldKeyExpiresAt: new Date(Date.now() + gracePeriodDays * 24 * 60 * 60 * 1000),
      },
      warning: 'Store the secret key securely. It will not be shown again.',
    }));

  } catch (error) {
    console.error('[API KEY] Rotation failed:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to rotate API key' }),
      { status: 500 }
    );
  }
}

// Helper functions
async function hashApiKey(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sendRotationNotification(email: string, details: any) {
  // Use notification engine or email service
  await fetch('/api/notification/send', {
    method: 'POST',
    body: JSON.stringify({
      to: email,
      subject: 'API Key Rotated',
      template: 'api-key-rotated',
      data: details,
    }),
  });
}
```

#### DELIVERABLES:
- [ ] Test API key creation (Postman/curl)
- [ ] Implement grace period rotation
- [ ] Add audit logging
- [ ] Send email notifications on rotation
- [ ] Document in `/docs/api-keys.md`

---

### TASK 3: RATE LIMITING MIDDLEWARE ⏰ (3 HOURS)

**CREATE:** `Backend/core-api/src/middleware/rate-limiter.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

interface RateLimitConfig {
  free: number;      // requests per hour
  starter: number;
  pro: number;
  enterprise: number;
}

const RATE_LIMITS: RateLimitConfig = {
  free: 100,
  starter: 500,
  pro: 2000,
  enterprise: 10000,
};

export async function rateLimiter(
  request: NextRequest,
  planTier: 'free' | 'starter' | 'pro' | 'enterprise' = 'free'
) {
  const ip = request.ip ?? 'unknown';
  const limit = RATE_LIMITS[planTier];
  const windowMs = 60 * 60 * 1000; // 1 hour
  
  const key = `ratelimit:${ip}:${planTier}`;
  
  try {
    // Get current count
    const current = await redis.incr(key);
    
    if (current === 1) {
      // First request, set expiry
      await redis.pexpire(key, windowMs);
    }
    
    const remaining = Math.max(0, limit - current);
    const resetTime = Date.now() + windowMs;
    
    if (current > limit) {
      // RATE LIMITED
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(resetTime / 1000),
        }),
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString(),
            'Retry-After': Math.ceil(windowMs / 1000).toString(),
          },
        }
      );
    }
    
    // Allow request, add headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetTime.toString());
    
    return response;
    
  } catch (error) {
    console.error('[RATE LIMITER] Redis error:', error);
    // Fail open - allow request if Redis is down
    return NextResponse.next();
  }
}
```

**USE IN API ROUTES:**
```typescript
// In any API route that needs rate limiting
import { rateLimiter } from '@/middleware/rate-limiter';
import { getSessionUser } from '@/lib/session.server';

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  const planTier = user?.planTier || 'free';
  
  // Check rate limit
  const rateLimitResponse = await rateLimiter(request, planTier);
  if (rateLimitResponse.status === 429) {
    return rateLimitResponse;
  }
  
  // Continue with actual logic
  // ...
}
```

#### DELIVERABLES:
- [ ] Create rate-limiter middleware
- [ ] Add Redis integration
- [ ] Apply to all dashboard APIs
- [ ] Test with k6 load test (simulate 100 req/min)

---

### TASK 4: WEBHOOK SYSTEM FOR THIRD-PARTY INTEGRATIONS ⏰ (5 HOURS)

**CREATE FILES:**
```
Backend/core-api/src/app/api/webhooks/
├── route.ts                    # Webhook handler (generic)
├── stripe/route.ts             # Stripe payment webhooks
├── shopify/route.ts            # Shopify order webhooks
└── signature.ts                # Signature verification utilities
```

#### FILE 1: Webhook Signature Verification

**CREATE:** `Backend/core-api/src/lib/webhooks/signature.ts`

```typescript
import { WebhookSignatureError } from './errors';

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeSignature(
  payload: Buffer,
  signature: string | null,
  signingSecret: string
): boolean {
  if (!signature) {
    throw new WebhookSignatureError('Missing signature header');
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      signingSecret
    );
    return true;
  } catch (error) {
    console.error('[WEBHOOK] Signature verification failed:', error);
    throw new WebhookSignatureError('Invalid signature');
  }
}

/**
 * Verify generic HMAC signature
 */
export function verifyHmacSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    throw new WebhookSignatureError('Missing signature');
  }

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(payload).digest('hex');
  
  // Constant-time comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}
```

#### FILE 2: Stripe Webhook Handler

**CREATE:** `Backend/core-api/src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@vayva/prisma';
import { verifyStripeSignature } from '@/lib/webhooks/signature';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    // VERIFY SIGNATURE
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('[STRIPE WEBHOOK] Missing webhook secret');
      return new Response('Webhook secret not configured', { status: 500 });
    }
    
    verifyStripeSignature(
      Buffer.from(body),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const event = stripe.webhooks.constructEvent(
      Buffer.from(body),
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('[STRIPE WEBHOOK] Received event:', event.type);

    // HANDLE DIFFERENT EVENT TYPES
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
        
      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;
        
      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    console.error('[STRIPE WEBHOOK] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 400 }
    );
  }
}

// Event Handlers
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const merchantId = paymentIntent.metadata?.merchantId;
  const amount = paymentIntent.amount / 100; // Convert from cents
  
  if (!merchantId) {
    console.warn('[STRIPE] No merchant ID in metadata');
    return;
  }

  // Record payment in database
  await prisma.payment.create({
    data: {
      merchantId,
      stripePaymentIntentId: paymentIntent.id,
      amount,
      currency: paymentIntent.currency,
      status: 'succeeded',
      paidAt: new Date(paymentIntent.created * 1000),
    },
  });

  // Update merchant balance
  await prisma.merchant.update({
    where: { id: merchantId },
    data: {
      balance: { increment: amount },
    },
  });

  console.log(`[STRIPE] Payment recorded: ${merchantId} - ${amount}`);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const merchantId = paymentIntent.metadata?.merchantId;
  
  if (!merchantId) return;

  // Log failure
  await prisma.payment.create({
    data: {
      merchantId,
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      status: 'failed',
      failureMessage: paymentIntent.last_payment_error?.message,
    },
  });

  // Notify merchant
  await notifyMerchant(merchantId, 'payment_failed', {
    amount: paymentIntent.amount / 100,
    reason: paymentIntent.last_payment_error?.message,
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const merchantId = subscription.metadata?.merchantId;
  if (!merchantId) return;

  const planTier = subscription.items.data[0]?.plan.metadata?.tier || 'free';
  
  await prisma.merchant.update({
    where: { id: merchantId },
    data: {
      plan: planTier,
      subscriptionStatus: subscription.status,
      subscriptionCancelAt: subscription.cancel_at 
        ? new Date(subscription.cancel_at * 1000) 
        : null,
    },
  });

  console.log(`[STRIPE] Subscription updated: ${merchantId} - ${planTier}`);
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === 'string' 
    ? charge.payment_intent 
    : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!payment) return;

  // Record refund
  await prisma.refund.create({
    data: {
      paymentId: payment.id,
      amount: charge.amount_refunded / 100,
      reason: charge.description || 'Refund requested',
      status: 'completed',
      refundedAt: new Date(),
    },
  });

  // Deduct from merchant balance
  await prisma.merchant.update({
    where: { id: payment.merchantId },
    data: {
      balance: { decrement: charge.amount_refunded / 100 },
    },
  });
}

async function notifyMerchant(merchantId: string, type: string, data: any) {
  // Use notification engine
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notification/send`, {
    method: 'POST',
    body: JSON.stringify({
      merchantId,
      type,
      data,
    }),
  });
}
```

#### FILE 3: Shopify Webhook Handler

**CREATE:** `Backend/core-api/src/app/api/webhooks/shopify/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@vayva/prisma';
import { verifyHmacSignature } from '@/lib/webhooks/signature';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
    const topic = request.headers.get('X-Shopify-Topic');
    
    if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
      console.error('[SHOPIFY] Missing webhook secret');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    // Verify signature
    verifyHmacSignature(
      body,
      hmacHeader,
      process.env.SHOPIFY_WEBHOOK_SECRET
    );

    const payload = JSON.parse(body);
    console.log(`[SHOPIFY] Received topic: ${topic}`);

    // Handle different topics
    switch (topic) {
      case 'orders/create':
        await handleOrderCreated(payload);
        break;
        
      case 'orders/update':
        await handleOrderUpdated(payload);
        break;
        
      case 'orders/delete':
        await handleOrderDeleted(payload);
        break;
        
      case 'products/create':
      case 'products/update':
        await handleProductUpdate(payload);
        break;
        
      default:
        console.log(`[SHOPIFY] Unhandled topic: ${topic}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    console.error('[SHOPIFY WEBHOOK] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 400 }
    );
  }
}

async function handleOrderCreated(order: any) {
  const merchantId = order.merchant_id?.toString();
  if (!merchantId) return;

  // Sync order to Vayva database
  await prisma.order.upsert({
    where: { externalId: `shopify_${order.id}` },
    create: {
      externalId: `shopify_${order.id}`,
      merchantId,
      customerId: order.customer?.id?.toString(),
      total: parseFloat(order.total_price),
      status: mapShopifyStatus(order.financial_status),
      items: order.line_items?.map((item: any) => ({
        productId: item.product_id?.toString(),
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
      createdAt: new Date(order.created_at),
    },
    update: {
      total: parseFloat(order.total_price),
      status: mapShopifyStatus(order.financial_status),
    },
  });

  console.log(`[SHOPIFY] Order synced: ${order.id}`);
}

async function handleProductUpdate(product: any) {
  const merchantId = product.merchant_id?.toString();
  if (!merchantId) return;

  await prisma.product.upsert({
    where: { externalId: `shopify_${product.id}` },
    create: {
      externalId: `shopify_${product.id}`,
      merchantId,
      name: product.title,
      description: product.body_html,
      price: parseFloat(product.variants?.[0]?.price || '0'),
      stockQuantity: product.variants?.[0]?.inventory_quantity || 0,
      images: product.images?.map((img: any) => img.src) || [],
    },
    update: {
      name: product.title,
      price: parseFloat(product.variants?.[0]?.price || '0'),
      stockQuantity: product.variants?.[0]?.inventory_quantity || 0,
    },
  });

  console.log(`[SHOPIFY] Product synced: ${product.id}`);
}

function mapShopifyStatus(status: string): string {
  const mapping: Record<string, string> = {
    'pending': 'pending',
    'authorized': 'approved',
    'partially_paid': 'partial',
    'paid': 'completed',
    'partially_refunded': 'refunded',
    'refunded': 'refunded',
    'voided': 'cancelled',
  };
  return mapping[status] || 'pending';
}
```

#### DELIVERABLES:
- [ ] Create webhook signature verification utilities
- [ ] Implement Stripe webhook handler (all event types)
- [ ] Implement Shopify webhook handler (orders/products)
- [ ] Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Test with Shopify webhook test requests

---

### TASK 5: INDUSTRY API ENDPOINTS VERIFICATION ⏰ (4 HOURS)

**AUDIT ALL INDUSTRY PACKAGES:**

Check each industry package has working API endpoints:

```bash
# Check what API files exist
find /Users/fredrick/Documents/Vayva-Tech/vayva/packages/industry-* -name "*.ts" -path "*/api/*" | head -20
```

**FOR EACH INDUSTRY PACKAGE:**

Verify these endpoints exist and work:

#### Example: Restaurant Industry
```typescript
// packages/industry-restaurant/src/api/occupancy/route.ts
GET /api/restaurant/:id/occupancy     // Current occupancy rate
GET /api/restaurant/:id/reservations  // Today's reservations
GET /api/restaurant/:id/kitchen/tickets // Active kitchen tickets
```

#### Example: Retail Industry
```typescript
// packages/industry-retail/src/api/inventory/route.ts
GET /api/retail/:id/inventory/low-stock  // Low stock alerts
GET /api/retail/:id/sales/today          // Today's sales
GET /api/retail/:id/products/top         // Top selling products
```

#### CREATE MISSING ENDPOINTS:

If an industry package lacks API routes, create them:

```typescript
// TEMPLATE: packages/industry-XXX/src/api/overview/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@vayva/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const merchantId = params.id;
  
  // Industry-specific metrics
  const metrics = await prisma.$queryRaw`
    SELECT 
      COUNT(*) as total_orders,
      SUM(total) as revenue,
      AVG(conversion_rate) as conversion_rate
    FROM orders
    WHERE merchant_id = ${merchantId}
    AND created_at >= NOW() - INTERVAL '30 days'
  `;

  return Response.json({
    success: true,
    data: { metrics },
  });
}
```

#### DELIVERABLES:
- [ ] Audit all 24 industry packages
- [ ] List missing API endpoints
- [ ] Create basic overview endpoint for each industry
- [ ] Test each endpoint with Postman

---

## ✅ DELIVERABLES CHECKLIST

**MUST COMPLETE IN 24 HOURS:**

### Phase 1: Dashboard API Optimization (Hours 0-4)
- [ ] Implement Promise.all() parallel fetching
- [ ] Add Redis caching (5min TTL)
- [ ] Add response time headers
- [ ] Test with 10 concurrent requests
- [ ] Verify <500ms response time

### Phase 2: API Keys Testing (Hours 4-8)
- [ ] Manual test: Create API key (curl/Postman)
- [ ] Implement grace period rotation
- [ ] Add audit logging
- [ ] Email notifications on rotation
- [ ] Document in `/docs/api-keys.md`

### Phase 3: Rate Limiting (Hours 8-11)
- [ ] Create rate-limiter middleware
- [ ] Integrate with Redis
- [ ] Apply to dashboard APIs
- [ ] Load test with k6 (100 req/min)

### Phase 4: Webhooks System (Hours 11-16)
- [ ] Create signature verification utils
- [ ] Implement Stripe webhook handler
- [ ] Implement Shopify webhook handler
- [ ] Test with Stripe CLI
- [ ] Test with Shopify test webhooks

### Phase 5: Industry APIs (Hours 16-20)
- [ ] Audit all 24 industry packages
- [ ] Create missing overview endpoints
- [ ] Test each endpoint
- [ ] Document in `/docs/industry-apis.md`

---

## 🧪 TESTING REQUIREMENTS

**BEFORE SUBMITTING, TEST:**

1. **Performance**
   ```bash
   # Install autocannon for load testing
   npm install -g autocannon
   
   # Test dashboard API
   autocannon -c 10 -d 30 http://localhost:3000/api/dashboard/aggregate
   
   # Should show:
   # - Avg response time < 500ms
   # - No 5xx errors
   # - 99th percentile < 1s
   ```

2. **API Keys**
   ```bash
   # Create key
   curl -X POST http://localhost:3000/api/saas/api-keys \
     -H "Authorization: Bearer TOKEN" \
     -d '{"name":"Test","scopes":["read"]}'
   
   # Rotate key
   curl -X POST http://localhost:3000/api/saas/api-keys/KEY_ID/rotate \
     -H "Authorization: Bearer TOKEN" \
     -d '{"gracePeriodDays":1}'
   ```

3. **Rate Limiting**
   ```bash
   # Rapid fire 150 requests (should get rate limited after 100)
   for i in {1..150}; do
     curl http://localhost:3000/api/dashboard/aggregate &
   done
   
   # Check headers
   curl -i http://localhost:3000/api/dashboard/aggregate
   # Should see: X-RateLimit-Remaining: 0
   ```

4. **Webhooks**
   ```bash
   # Stripe CLI
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   
   # Trigger test event
   stripe trigger payment_intent.succeeded
   
   # Check logs for handling
   ```

---

## 📞 COMMUNICATION

**UPDATE EVERY 4 HOURS:**
1. Post API test results in Slack #backend-channel
2. Include response time metrics
3. List any blockers

**WHEN STUCK:**
- Tag @TechLead immediately
- Don't spend >30 mins on one problem
- Ask in #backend-help

---

## 🎯 SUCCESS CRITERIA

**YOU WIN WHEN:**

✅ Dashboard API responds in <500ms (tested with autocannon)

✅ API keys can be created, rotated, revoked (all tested)

✅ Rate limiting works (requests blocked after limit)

✅ Stripe webhooks process payments correctly

✅ Shopify webhooks sync orders/products

✅ All 24 industries have basic API endpoints

✅ Zero 5xx errors in production logs

---

**REMEMBER:** The boss is watching. If APIs fail during demo, we look incompetent. MAKE IT ROCK SOLID. 🚀

**GOOD LUCK, ENGINEER! BUILD IT FAST. BUILD IT RELIABLE.**
