# VAYVA V2: IMPROVED UPGRADE PLAN
## Based on Actual Codebase Architecture

**Date:** March 10, 2026  
**Status:** Building on existing foundation - NOT replacing  
**Philosophy:** Enhance what works, fill gaps, maintain architecture

---

## CURRENT ARCHITECTURE AUDIT

### What Vayva Has (Solid Foundation)

#### 1. Infrastructure (VPS-Based)
```
VPS 1 (App): 163.245.209.202
├── Evolution API (WhatsApp Gateway) :8080
├── XTTS v2 (Text-to-Speech) :5000
├── Redis (BullMQ Message Broker)
└── Docker Compose orchestration

VPS 2 (DB): 163.245.209.203:5432
└── PostgreSQL 16 (Production Database)
```

**Deployment:**
- Vercel for frontend apps (merchant-admin, marketing, ops-console, storefront)
- VPS Docker Compose for backend services
- Manual deployment scripts with health checks
- Backup system for Evolution API instances

#### 2. WhatsApp Integration (Evolution API)
**Current Implementation:**
- Self-hosted Evolution API on VPS
- Official Vayva number: +234 810 769 2393
- Instance name: `vayva-official`
- OTP delivery via WhatsApp (working)
- Inbound/outbound message workers (BullMQ)
- Media message support (images, voice)

**Features:**
- Send text messages with typing indicator
- QR code pairing for merchants
- Base64 media retrieval
- Instance management (create, connect)

#### 3. Database Architecture (Prisma)
**275+ models including:**
- Core commerce (Product, Order, Customer, Cart)
- Financial (Payment, Subscription, Wallet, Ledger)
- AI/ML (AiUsageEvent, AiUsageDaily, MerchantAiProfile)
- Messaging (Conversation, Message, Contact)
- Compliance (AuditLog, KycRecord, AbuseRule)
- Analytics (AnalyticsDailySales, AnalyticsDailyPayments)
- Support (SupportTicket, InternalNote)

#### 4. AI System
**Models Supported:**
- Groq (primary for fast inference)
- OpenAI (GPT models)
- OpenRouter (Mistral, NVIDIA)
- XTTS v2 (self-hosted TTS on VPS)

**Features:**
- WhatsApp AI agent with tone customization
- Sales intent detection
- Product recommendation
- Usage metering and cost tracking
- AI subscription plans (STARTER, GROWTH, PRO)

#### 5. Autopilot System
**35 rules across 19 industries:**
- Inventory (dead stock, low stock, overstock)
- Pricing (slow mover discounts, flash sales)
- Marketing (product descriptions, social content)
- Engagement (dormant customers, VIP rewards)
- Operations (prep time, no-shows, slot filling)
- Content (blog ideas, SEO optimization)
- Financial (revenue trends, expense anomalies)

#### 6. Authentication & Security
- WhatsApp OTP (primary method)
- Email OTP via Resend (fallback)
- JWT session management
- Rate limiting (10 attempts/hour)
- Abuse detection (IP/fingerprint tracking)
- KYC levels (0-3 with increasing limits)
- Audit logging (comprehensive)

#### 7. Payments (Paystack)
- Transaction processing
- Wallet system
- Payout management
- KYC integration (YouVerify)
- Dispute handling
- Multiple payment methods (card, transfer, USSD, mobile money)

#### 8. Delivery (Kwik + Others)
- Kwik Delivery integration
- Auto-dispatch configuration
- Live tracking
- Multi-provider support (Kwik, Gokada, Manual)
- Shipment status workflow

#### 9. Frontend Applications
- **merchant-admin**: Main dashboard (Next.js 15)
- **storefront**: Customer-facing stores (Next.js 15)
- **marketing**: Public website (Next.js 15)
- **ops-console**: Internal tools (Next.js 15)
- **mobile**: React Native (Expo)

#### 10. Background Workers (BullMQ)
- whatsapp-inbound
- whatsapp-outbound
- payments-webhooks
- delivery-tracking
- agent-actions
- reconciliation
- cart-recovery
- thumbnail-generation

---

## GAPS IDENTIFIED (Improvement Opportunities)

### Critical Gaps

#### 1. Observability (Missing)
**Current:** Structured logging only  
**Gap:** No centralized error tracking, APM, or metrics  
**Impact:** Debugging is difficult, performance issues invisible

#### 2. Testing (Severely Lacking)
**Current:** ~5% coverage, 1,212 TODOs  
**Gap:** No comprehensive test suite  
**Impact:** Regression risk, deployment anxiety

#### 3. API Documentation (Missing)
**Current:** No OpenAPI/Swagger  
**Gap:** 430+ routes undocumented  
**Impact:** Integration difficulty, developer friction

#### 4. Real-Time Features (Limited)
**Current:** Basic WebSocket not fully utilized  
**Gap:** No real-time dashboards, live notifications  
**Impact:** Stale data, poor UX

#### 5. Advanced Analytics (Basic)
**Current:** Daily aggregated stats  
**Gap:** No cohort analysis, funnel tracking, predictive analytics  
**Impact:** Limited business insights

### Significant Gaps

#### 6. Customer Success Automation
**Current:** Health score model exists but not fully utilized  
**Gap:** No automated playbooks, NPS system  
**Impact:** Reactive support, churn prevention missing

#### 7. Integration Ecosystem
**Current:** Basic webhooks  
**Gap:** No Zapier, Make.com, API key management  
**Impact:** Limited extensibility

#### 8. Advanced Billing
**Current:** Simple tiered pricing  
**Gap:** No usage-based billing, dunning management  
**Impact:** Revenue leakage, no metered AI billing

#### 9. Multi-Region (None)
**Current:** Single VPS in one location  
**Gap:** No data residency, global CDN  
**Impact:** Latency for international users

#### 10. Compliance Automation
**Current:** Manual GDPR processes  
**Gap:** No automated data export/deletion  
**Impact:** Regulatory risk

---

## V2 IMPROVEMENT PLAN

### Phase 1: Foundation Hardening (Weeks 1-4)

#### 1.1 Observability Stack (Enhance, Don't Replace)

**Sentry Integration**
```typescript
// Add to existing error handling - packages/monitoring/src/sentry.ts
import * as Sentry from '@sentry/nextjs';

// Initialize in existing app bootstrap
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend: (event) => sanitizeEvent(event), // Redact PII
});

// Wrap existing API handlers
export const withSentry = (handler: Function) => async (req, res) => {
  try {
    return await handler(req, res);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: req.url, merchantId: req.merchantId },
    });
    throw error;
  }
};
```

**Custom Metrics (Build on existing analytics)**
```typescript
// Extend existing AnalyticsDaily* models
// Add real-time metrics endpoint using existing Redis

export async function recordMetric(name: string, value: number, tags?: Record<string, string>) {
  await redis.publish('metrics', JSON.stringify({
    name,
    value,
    tags,
    timestamp: Date.now(),
  }));
}

// Metrics to track:
// - API latency (p50, p95, p99)
// - WhatsApp message delivery rate
// - AI token usage per merchant
// - Order conversion funnel
// - Payment success rate
```

**Health Check Dashboard (Extend ops-console)**
```typescript
// Add to existing ops-console
// Use existing HealthScore model

export async function getSystemHealth() {
  return {
    database: await checkDatabaseHealth(),
    redis: await checkRedisHealth(),
    evolutionApi: await checkEvolutionApiHealth(),
    paystack: await checkPaystackHealth(),
    kwik: await checkKwikHealth(),
    xtts: await checkXTTSHealth(),
  };
}
```

#### 1.2 Testing Infrastructure (New)

**Unit Test Coverage**
```yaml
# .github/workflows/test.yml
- name: Test Coverage
  run: |
    npm run test:coverage
    npx codecov
    
- name: Coverage Gate
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 60" | bc -l) )); then
      echo "Coverage $COVERAGE% is below 60% threshold"
      exit 1
    fi
```

**Critical Path E2E Tests**
```typescript
// e2e/critical-paths.spec.ts
// Test what matters most

describe('Critical Business Flows', () => {
  test('Complete order flow: WhatsApp → Payment → Delivery', async () => {
    // 1. Customer sends WhatsApp message
    // 2. AI captures order
    // 3. Customer pays via Paystack
    // 4. Merchant dispatches via Kwik
    // 5. Customer receives tracking updates
  });
  
  test('Merchant onboarding → First AI sale', async () => {
    // 1. Sign up with WhatsApp OTP
    // 2. Connect WhatsApp via Evolution API
    // 3. Add product
    // 4. AI handles customer inquiry
    // 5. Order created automatically
  });
  
  test('Autopilot suggests action → Merchant approves → Executed', async () => {
    // 1. Low stock detected
    // 2. Autopilot generates alert
    // 3. Merchant approves in dashboard
    // 4. Action executed
  });
});
```

#### 1.3 API Documentation (New)

**OpenAPI Generation**
```typescript
// Use existing Zod schemas to generate OpenAPI
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

// Extend existing route handlers with OpenAPI metadata
export const createOrderRoute = {
  method: 'POST',
  path: '/orders',
  request: {
    body: {
      content: {
        'application/json': { schema: CreateOrderSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Order created',
      content: {
        'application/json': { schema: OrderSchema },
      },
    },
  },
};
```

**Developer Portal (Extend marketing site)**
```
/v2/developer
├── API Reference (Swagger UI)
├── Webhooks Documentation
├── SDK Downloads
├── Postman Collection
└── Changelog
```

---

### Phase 2: Real-Time & Analytics (Weeks 5-8)

#### 2.1 Real-Time Dashboard (Extend merchant-admin)

**Live Metrics WebSocket**
```typescript
// Extend existing WebSocket infrastructure
// Use existing Redis pub/sub

export class LiveDashboard {
  async subscribe(merchantId: string, ws: WebSocket) {
    // Subscribe to merchant's channel
    const subscriber = redis.duplicate();
    await subscriber.subscribe(`merchant:${merchantId}:events`);
    
    subscriber.on('message', (channel, message) => {
      ws.send(message);
    });
    
    // Send initial data
    ws.send(JSON.stringify({
      type: 'initial',
      data: await this.getCurrentMetrics(merchantId),
    }));
  }
  
  async publishEvent(merchantId: string, event: DashboardEvent) {
    await redis.publish(
      `merchant:${merchantId}:events`,
      JSON.stringify(event)
    );
  }
}

// Events to publish:
// - New order received
// - Payment completed
// - Delivery status updated
// - AI conversation started/completed
// - Inventory threshold crossed
```

**Live Components (Add to merchant-admin)**
```typescript
// Real-time order notifications
export function LiveOrderFeed() {
  const { orders } = useLiveOrders(); // WebSocket hook
  
  return (
    <div className="live-feed">
      {orders.map(order => (
        <OrderNotification 
          key={order.id}
          order={order}
          isNew={order.receivedAt > Date.now() - 5000}
        />
      ))}
    </div>
  );
}

// Real-time AI conversation monitor
export function LiveAIConversations() {
  const { conversations } = useLiveConversations();
  
  return (
    <div className="ai-monitor">
      <MetricCard 
        title="Active Conversations"
        value={conversations.activeCount}
        trend={conversations.trend}
      />
      <ConversationList conversations={conversations.list} />
    </div>
  );
}
```

#### 2.2 Advanced Analytics (Extend existing analytics)

**Cohort Analysis (New table)**
```prisma
// Add to schema.prisma
model CohortAnalysis {
  id              String   @id @default(uuid())
  storeId         String
  cohortMonth     DateTime @db.Date
  metricType      String   // retention, revenue, orders
  week0           Float    // 100% baseline
  week1           Float?
  week2           Float?
  // ... week 12
  createdAt       DateTime @default(now())
  
  @@unique([storeId, cohortMonth, metricType])
  @@index([storeId])
}
```

**Funnel Analysis (New)**
```typescript
// packages/analytics/src/funnel.ts
export class FunnelAnalyzer {
  async trackFunnel(merchantId: string, funnelType: string, steps: FunnelStep[]) {
    // Track conversion at each step
    // Store in AnalyticsFunnel table
  }
  
  async getFunnelReport(merchantId: string, funnelType: string): Promise<FunnelReport> {
    // Calculate drop-off at each step
    // Identify biggest friction points
    return {
      steps: [
        { name: 'Product View', users: 1000, conversion: 100 },
        { name: 'Add to Cart', users: 300, conversion: 30 },
        { name: 'Checkout', users: 150, conversion: 50 },
        { name: 'Payment', users: 120, conversion: 80 },
      ],
      biggestDropOff: 'Product View → Add to Cart',
      recommendations: ['Add AI product recommendations', 'Enable BNPL'],
    };
  }
}
```

**Predictive Analytics (Extend AI system)**
```typescript
// Use existing AI infrastructure
export class PredictiveAnalytics {
  async predictChurnRisk(merchantId: string): Promise<ChurnRisk> {
    const features = await this.extractFeatures(merchantId);
    
    // Use Groq for lightweight prediction
    const prediction = await groq.chat.completions.create({
      model: 'llama-3.1-8b',
      messages: [{
        role: 'system',
        content: `Predict churn risk (0-100) based on:
          - Days since last login: ${features.daysSinceLogin}
          - Order trend: ${features.orderTrend}
          - Support tickets: ${features.supportTickets}
          - AI usage: ${features.aiUsage}
          
          Return JSON: { riskScore: number, factors: string[], recommendation: string }`
      }],
    });
    
    return JSON.parse(prediction.choices[0].message.content);
  }
  
  async predictInventoryNeeds(merchantId: string): Promise<InventoryForecast> {
    // Time series forecasting using existing sales data
    // Extend AnalyticsDailySales model
  }
}
```

---

### Phase 3: Customer Success Platform (Weeks 9-12)

#### 3.1 Health Score Activation (Use existing model)

**Current:** HealthScore model exists  
**Gap:** Not calculated or used  
**Fix:** Implement scoring algorithm

```typescript
// packages/customer-success/src/health-score.ts
export class HealthScoreCalculator {
  async calculate(merchantId: string): Promise<HealthScore> {
    const metrics = await this.gatherMetrics(merchantId);
    
    let score = 100;
    const factors: HealthFactor[] = [];
    
    // Product usage (35%)
    if (metrics.featureAdoption < 0.3) {
      score -= 20;
      factors.push({
        type: 'negative',
        description: `Using only ${Math.round(metrics.featureAdoption * 100)}% of features`,
        recommendation: 'Schedule feature training',
      });
    }
    
    // Engagement (25%)
    if (metrics.daysSinceLogin > 7) {
      score -= 25;
      factors.push({
        type: 'negative',
        description: `Last login ${metrics.daysSinceLogin} days ago`,
        recommendation: 'Send re-engagement campaign',
      });
    }
    
    // Business health (25%)
    if (metrics.orderGrowth < -0.2) {
      score -= 15;
      factors.push({
        type: 'negative',
        description: `Order volume down ${Math.abs(metrics.orderGrowth * 100)}%`,
        recommendation: 'Offer business consultation',
      });
    }
    
    // Save to existing HealthScore model
    await prisma.healthScore.create({
      data: {
        storeId: merchantId,
        score: Math.max(0, score),
        factors,
        calculatedAt: new Date(),
      },
    });
    
    return { score, factors };
  }
}
```

**Health Dashboard (Add to ops-console)**
```typescript
export function MerchantHealthDashboard() {
  const { segments } = useMerchantHealth();
  
  return (
    <div className="health-dashboard">
      <HealthSegment 
        title="Healthy"
        count={segments.healthy.length}
        color="green"
        merchants={segments.healthy}
      />
      <HealthSegment 
        title="At Risk"
        count={segments.atRisk.length}
        color="yellow"
        merchants={segments.atRisk}
        actionRequired
      />
      <HealthSegment 
        title="Critical"
        count={segments.critical.length}
        color="red"
        merchants={segments.critical}
        actionRequired
        urgent
      />
    </div>
  );
}
```

#### 3.2 Automated Playbooks (Extend autopilot system)

**Current:** 35 autopilot rules  
**Gap:** No automated execution  
**Fix:** Add playbook automation layer

```typescript
// packages/customer-success/src/playbooks.ts
export const playbooks: Record<string, Playbook> = {
  trial_expiring: {
    trigger: { type: 'time', condition: 'trial_ends_in_3_days' },
    actions: [
      { type: 'email', template: 'trial_expiring', delay: 0 },
      { type: 'task', assignee: 'csm', title: 'Call trial customer', delay: 24 * 60 * 60 * 1000 },
      { type: 'email', template: 'trial_final_day', delay: 48 * 60 * 60 * 1000 },
    ],
  },
  
  low_health_score: {
    trigger: { type: 'health_score', condition: 'score < 50' },
    actions: [
      { type: 'slack', channel: '#churn-alerts', message: 'High churn risk detected' },
      { type: 'task', assignee: 'csm', title: 'URGENT: Churn intervention', priority: 'high' },
      { type: 'email', template: 'executive_outreach', from: 'founder@vayva.ng', delay: 24 * 60 * 60 * 1000 },
    ],
  },
  
  feature_adoption_low: {
    trigger: { type: 'metric', condition: 'features_used < 30%', duration: '7_days' },
    actions: [
      { type: 'email', template: 'feature_discovery' },
      { type: 'in_app', message: 'Discover features that can help you sell more' },
      { type: 'task', assignee: 'csm', title: 'Schedule feature training', delay: 3 * 24 * 60 * 60 * 1000 },
    ],
  },
};

// Execute via existing BullMQ worker
export async function executePlaybook(playbookId: string, merchantId: string) {
  const playbook = playbooks[playbookId];
  
  for (const action of playbook.actions) {
    await queuePlaybookAction(playbookId, merchantId, action);
  }
}
```

#### 3.3 NPS System (New)

```typescript
// packages/customer-success/src/nps.ts
export class NpsSystem {
  async sendSurvey(merchantId: string) {
    const merchant = await prisma.store.findUnique({
      where: { id: merchantId },
      include: { owner: true },
    });
    
    // Don't survey too frequently
    const lastSurvey = await this.getLastSurvey(merchantId);
    if (lastSurvey && daysSince(lastSurvey) < 90) return;
    
    // Send via WhatsApp using existing Evolution API
    await WhatsappManager.sendMessage(
      'vayva-official',
      merchant.owner.phone,
      `Hi ${merchant.owner.firstName}!\n\nHow likely are you to recommend Vayva to a friend?\n\nReply with a number 0-10\n\n0 = Not likely\n10 = Very likely`,
    );
    
    await this.recordSurveySent(merchantId);
  }
  
  async recordResponse(merchantId: string, score: number) {
    await prisma.npsResponse.create({
      data: {
        storeId: merchantId,
        score,
        respondedAt: new Date(),
      },
    });
    
    // Trigger follow-up
    if (score <= 6) {
      await executePlaybook('detractor_follow_up', merchantId);
    } else if (score >= 9) {
      await executePlaybook('promoter_advocacy', merchantId);
    }
  }
}
```

---

### Phase 4: Integration Ecosystem (Weeks 13-16)

#### 4.1 API Key Management (Extend existing ApiKey model)

**Current:** ApiKey model exists with basic fields  
**Gap:** No management UI, rotation, granular permissions  
**Fix:** Extend existing model

```typescript
// Extend existing ApiKey model in schema
model ApiKey {
  // Existing fields...
  
  // New fields
  scopes     String[] // ['orders:read', 'products:write', 'customers:read']
  rateLimit  Int      @default(1000) // requests per hour
  ipAllowlist String[]
  lastUsedAt DateTime?
  expiresAt  DateTime?
  
  // Add scope enum
}

// Management UI (Add to merchant-admin)
export function ApiKeyManagement() {
  const { apiKeys } = useApiKeys();
  
  return (
    <div className="api-keys">
      <Button onClick={createApiKey}>Generate New Key</Button>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Scopes</TableCell>
            <TableCell>Last Used</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {apiKeys.map(key => (
            <TableRow key={key.id}>
              <TableCell>{key.name}</TableCell>
              <TableCell>{key.scopes.join(', ')}</TableCell>
              <TableCell>{key.lastUsedAt || 'Never'}</TableCell>
              <TableCell>
                <Button onClick={() => rotateKey(key.id)}>Rotate</Button>
                <Button onClick={() => revokeKey(key.id)} variant="danger">Revoke</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

#### 4.2 Zapier Integration (New)

```typescript
// packages/integrations/src/zapier/index.ts
export const zapierIntegration = {
  triggers: {
    new_order: {
      key: 'new_order',
      noun: 'Order',
      display: { label: 'New Order', description: 'Triggers when a new order is received.' },
      operation: {
        type: 'hook',
        performSubscribe: async (z, bundle) => {
          const webhook = await createWebhook({
            merchantId: bundle.authData.merchantId,
            url: bundle.targetUrl,
            events: ['order.created'],
            provider: 'zapier',
          });
          return { webhookId: webhook.id };
        },
        performUnsubscribe: async (z, bundle) => {
          await deleteWebhook(bundle.subscribeData.webhookId);
        },
      },
    },
  },
  
  actions: {
    create_product: {
      key: 'create_product',
      noun: 'Product',
      display: { label: 'Create Product', description: 'Creates a new product.' },
      operation: {
        inputFields: [
          { key: 'name', required: true, label: 'Product Name' },
          { key: 'price', required: true, type: 'number', label: 'Price' },
          { key: 'description', type: 'text', label: 'Description' },
        ],
        perform: async (z, bundle) => {
          return await createProduct({
            merchantId: bundle.authData.merchantId,
            ...bundle.inputData,
          });
        },
      },
    },
  },
};
```

#### 4.3 Webhook Management (Extend existing webhook system)

```typescript
// Extend existing webhook infrastructure
export class WebhookManager {
  async createWebhook(params: {
    merchantId: string;
    url: string;
    events: string[];
    secret?: string;
  }) {
    const webhook = await prisma.webhook.create({
      data: {
        storeId: params.merchantId,
        url: params.url,
        events: params.events,
        secret: params.secret || generateSecret(),
        status: 'active',
      },
    });
    
    return webhook;
  }
  
  async deliverWebhook(webhookId: string, event: string, payload: any) {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });
    
    if (!webhook || webhook.status !== 'active') return;
    
    // Sign payload
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vayva-Signature': signature,
          'X-Vayva-Event': event,
        },
        body: JSON.stringify(payload),
      });
      
      // Log delivery attempt
      await prisma.webhookDelivery.create({
        data: {
          webhookId,
          event,
          status: response.ok ? 'success' : 'failed',
          statusCode: response.status,
          responseBody: await response.text(),
        },
      });
    } catch (error) {
      // Retry with exponential backoff
      await queueWebhookRetry(webhookId, event, payload);
    }
  }
}

// Webhook Dashboard (Add to merchant-admin)
export function WebhookDashboard() {
  const { webhooks } = useWebhooks();
  
  return (
    <div className="webhook-dashboard">
      <Button onClick={() => setShowCreateModal(true)}>Add Webhook</Button>
      
      {webhooks.map(webhook => (
        <WebhookCard key={webhook.id} webhook={webhook}>
          <WebhookEvents events={webhook.events} />
          <WebhookDeliveryStats webhookId={webhook.id} />
          <WebhookTestButton webhook={webhook} />
        </WebhookCard>
      ))}
    </div>
  );
}
```

---

### Phase 5: Advanced Billing (Weeks 17-20)

#### 5.1 Usage-Based Billing (Extend existing AI billing)

**Current:** AI usage tracked in AiUsageEvent  
**Gap:** No automated billing for overages  
**Fix:** Extend existing billing system

```typescript
// packages/billing/src/usage.ts
export class UsageBilling {
  async recordUsage(params: {
    merchantId: string;
    metric: 'ai_tokens' | 'whatsapp_messages' | 'storage_gb';
    quantity: number;
  }) {
    // Record to existing AiUsageEvent or new UsageEvent table
    await prisma.usageEvent.create({
      data: {
        storeId: params.merchantId,
        metric: params.metric,
        quantity: params.quantity,
        timestamp: new Date(),
      },
    });
    
    // Check if approaching limit
    await this.checkUsageThresholds(params);
  }
  
  async calculateMonthlyBill(merchantId: string): Promise<Invoice> {
    const subscription = await prisma.merchantAiSubscription.findUnique({
      where: { storeId: merchantId },
      include: { plan: true },
    });
    
    const usage = await this.getMonthlyUsage(merchantId);
    const plan = subscription.plan;
    
    let total = plan.basePrice;
    const lineItems = [];
    
    // AI Tokens
    if (usage.tokens > plan.monthlyTokenLimit) {
      const overage = usage.tokens - plan.monthlyTokenLimit;
      const cost = overage * 0.0001; // ₦0.0001 per token
      lineItems.push({ description: `AI Tokens Overage`, amount: cost });
      total += cost;
    }
    
    // WhatsApp Messages
    if (usage.messages > plan.monthlyMessageLimit) {
      const overage = usage.messages - plan.monthlyMessageLimit;
      const cost = overage * 2.9; // ₦2.90 per message
      lineItems.push({ description: `WhatsApp Messages Overage`, amount: cost });
      total += cost;
    }
    
    return { merchantId, lineItems, total };
  }
}

// Usage Dashboard (Add to merchant-admin)
export function UsageDashboard() {
  const { usage, limits, projected } = useUsageData();
  
  return (
    <div className="usage-dashboard">
      <UsageProgress 
        label="AI Tokens"
        used={usage.tokens}
        limit={limits.tokens}
        projected={projected.tokens}
      />
      <UsageProgress 
        label="WhatsApp Messages"
        used={usage.messages}
        limit={limits.messages}
        projected={projected.messages}
      />
      
      {projected.exceedsLimit && (
        <Alert variant="warning">
          Projected to exceed plan limits by end of month.
          <Button variant="link" href="/settings/billing/upgrade">Upgrade now</Button>
        </Alert>
      )}
    </div>
  );
}
```

#### 5.2 Dunning Management (New)

```typescript
// packages/billing/src/dunning.ts
export class DunningManager {
  private retrySchedule = [
    { days: 0, action: 'notify' },
    { days: 3, action: 'retry' },
    { days: 7, action: 'retry' },
    { days: 14, action: 'retry' },
    { days: 21, action: 'final_notice' },
    { days: 30, action: 'suspend' },
  ];
  
  async handleFailedPayment(payment: FailedPayment) {
    const attempt = await this.getRetryAttempt(payment.subscriptionId);
    const schedule = this.retrySchedule[attempt];
    
    switch (schedule.action) {
      case 'notify':
        await this.sendDunningWhatsApp(payment, 'payment_failed');
        break;
      case 'retry':
        const result = await this.retryPayment(payment);
        if (!result.success) {
          await this.sendDunningWhatsApp(payment, 'payment_failed_again');
        }
        break;
      case 'final_notice':
        await this.sendDunningWhatsApp(payment, 'final_notice');
        break;
      case 'suspend':
        await this.suspendSubscription(payment.subscriptionId);
        await this.sendDunningWhatsApp(payment, 'account_suspended');
        break;
    }
  }
  
  async sendDunningWhatsApp(payment: FailedPayment, template: string) {
    const merchant = await prisma.store.findUnique({
      where: { id: payment.merchantId },
      include: { owner: true },
    });
    
    const messages = {
      payment_failed: `Hi ${merchant.owner.firstName}. Your Vayva subscription payment of ₦${payment.amount} failed. Please update your payment method: ${payment.updateUrl}`,
      payment_failed_again: `Hi ${merchant.owner.firstName}. We tried to process your payment again but it failed. Please update your card to avoid service interruption.`,
      final_notice: `URGENT: Your Vayva account will be suspended in 7 days due to non-payment. Please update your payment method immediately.`,
      account_suspended: `Your Vayva account has been suspended due to non-payment. Update your payment method to restore service.`,
    };
    
    await WhatsappManager.sendMessage(
      'vayva-official',
      merchant.owner.phone,
      messages[template],
    );
  }
}
```

---

### Phase 6: Compliance & Scale (Weeks 21-24)

#### 6.1 GDPR Automation (Extend existing AccountDeletionRequest)

**Current:** AccountDeletionRequest model exists  
**Gap:** Manual process, no data export  
**Fix:** Automate existing workflow

```typescript
// packages/compliance/src/gdpr.ts
export class GdprAutomation {
  async handleDataExportRequest(merchantId: string) {
    const merchant = await prisma.store.findUnique({
      where: { id: merchantId },
      include: {
        owner: true,
        products: true,
        orders: { include: { items: true } },
        customers: true,
        conversations: { include: { messages: true } },
      },
    });
    
    const exportPackage = {
      merchantId,
      exportedAt: new Date(),
      profile: {
        name: merchant.name,
        email: merchant.owner.email,
        phone: merchant.owner.phone,
        createdAt: merchant.createdAt,
      },
      products: merchant.products.map(p => ({
        name: p.name,
        price: p.price,
        createdAt: p.createdAt,
      })),
      orders: merchant.orders.map(o => ({
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
      customers: merchant.customers.map(c => ({
        name: c.name,
        phone: c.phone,
        email: c.email,
      })),
      conversations: merchant.conversations.map(c => ({
        customerPhone: c.customerPhone,
        messageCount: c.messages.length,
      })),
    };
    
    // Generate downloadable package
    const json = JSON.stringify(exportPackage, null, 2);
    const downloadUrl = await uploadToStorage(json, `exports/${merchantId}.json`);
    
    // Send via WhatsApp
    await WhatsappManager.sendMessage(
      'vayva-official',
      merchant.owner.phone,
      `Hi ${merchant.owner.firstName}. Your data export is ready. Download it here: ${downloadUrl}\n\nThis link expires in 30 days.`,
    );
    
    return exportPackage;
  }
  
  async handleDeletionRequest(merchantId: string) {
    // Use existing AccountDeletionRequest model
    const deletionRequest = await prisma.accountDeletionRequest.create({
      data: {
        storeId: merchantId,
        requestedByUserId: merchant.ownerId,
        status: 'SCHEDULED',
        scheduledFor: addDays(new Date(), 30), // 30-day grace period
      },
    });
    
    // Schedule deletion job
    await queueDeletionJob(merchantId, deletionRequest.scheduledFor);
    
    return deletionRequest;
  }
  
  async executeDeletion(merchantId: string) {
    // Anonymize instead of delete for financial records
    const anonymizedId = `deleted_${uuid()}`;
    
    await prisma.$transaction([
      // Anonymize merchant
      prisma.store.update({
        where: { id: merchantId },
        data: {
          name: 'Deleted Merchant',
          deletedAt: new Date(),
        },
      }),
      
      // Anonymize customers
      prisma.customer.updateMany({
        where: { storeId: merchantId },
        data: {
          name: 'Deleted Customer',
          phone: null,
          email: null,
        },
      }),
      
      // Delete conversations
      prisma.conversation.deleteMany({
        where: { storeId: merchantId },
      }),
      
      // Keep orders for accounting but anonymize
      prisma.order.updateMany({
        where: { storeId: merchantId },
        data: {
          customerName: 'Deleted Customer',
          customerPhone: null,
          deliveryAddress: null,
        },
      }),
    ]);
  }
}
```

#### 6.2 CDN & Performance (Extend existing Vercel setup)

**Current:** Vercel for frontend  
**Gap:** No image optimization, no global CDN for API  
**Fix:** Add Cloudflare in front

```typescript
// Cloudflare configuration (wrangler.toml)
name = "vayva-api"
main = "src/index.ts"
compatibility_date = "2026-03-10"

[env.production]
routes = [
  { pattern = "api.vayva.ng/*", zone_name = "vayva.ng" }
]

# Cache configuration
cache_ttl = 300 # 5 minutes for API responses

# Image optimization
[images]
binding = "IMAGES"
```

**Image Optimization (Add to storefront)**
```typescript
// Use Cloudflare Images or existing Sharp
export function OptimizedImage({ src, alt, width, height }) {
  const optimizedSrc = `https://images.vayva.ng/cdn-cgi/image/width=${width},quality=80/${src}`;
  
  return (
    <img 
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}
```

---

## IMPLEMENTATION PRIORITIES

### Must-Have (Month 1)
1. ✅ Sentry integration (2 days)
2. ✅ Health check dashboard (3 days)
3. ✅ API documentation (5 days)
4. ✅ Critical path E2E tests (5 days)

### Should-Have (Month 2)
5. Real-time dashboard (1 week)
6. Health score activation (1 week)
7. Webhook management UI (1 week)

### Nice-to-Have (Month 3)
8. Zapier integration (2 weeks)
9. Usage-based billing (2 weeks)
10. NPS system (1 week)

### Future (Month 4+)
11. Advanced analytics (cohorts, funnels)
12. Dunning management
13. GDPR automation
14. Multi-region deployment

---

## TECHNICAL DECISIONS

### Keep (What's Working)
- ✅ Evolution API for WhatsApp
- ✅ VPS-based infrastructure
- ✅ Prisma + PostgreSQL
- ✅ BullMQ for workers
- ✅ Next.js frontend architecture
- ✅ Paystack for payments
- ✅ Kwik for delivery

### Enhance (Build On)
- 🔧 Add Sentry to existing error handling
- 🔧 Extend existing analytics models
- 🔧 Use existing HealthScore model
- 🔧 Build on existing ApiKey model
- 🔧 Extend autopilot with playbooks

### Add (New Capabilities)
- ➕ Real-time WebSocket layer
- ➕ OpenAPI documentation
- ➕ E2E testing framework
- ➕ Webhook management UI
- ➕ Zapier integration
- ➕ Usage-based billing
- ➕ Dunning management

### Avoid (Don't Change)
- ❌ Don't replace Evolution API with WhatsApp Business API
- ❌ Don't add SMS (WhatsApp OTP works)
- ❌ Don't replace VPS with Kubernetes (yet)
- ❌ Don't replace Prisma with another ORM
- ❌ Don't change authentication flow

---

## SUCCESS METRICS

### Technical
- Test coverage: 5% → 60%
- API documentation: 0% → 100%
- Error tracking: Manual → Automated
- Deployment frequency: Weekly → Daily

### Business
- Trial conversion: Unknown → 25%
- Churn rate: Unknown → < 5%
- NPS score: Unknown → 50+
- Integration adoption: 0 → 20% of merchants

---

## CONCLUSION

This plan **builds on Vayva's existing strengths**:
- Solid WhatsApp integration via Evolution API
- Comprehensive database schema
- Working AI system
- Functional payment & delivery

While **filling critical gaps**:
- Observability and monitoring
- Testing and documentation
- Real-time features
- Customer success automation
- Integration ecosystem

**Estimated Timeline:** 4-6 months for full implementation  
**Team Size:** 3-4 engineers  
**Risk Level:** Low (incremental improvements, not rewrites)
