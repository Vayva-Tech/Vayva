# VAYVA V2: COMPLETE SaaS TRANSFORMATION PLAN

## Executive Summary

This document outlines the comprehensive transformation of Vayva from a WhatsApp commerce tool into a **professional, enterprise-grade SaaS platform** that competes with international solutions while maintaining local market advantages.

**Current State:** Feature-rich commerce platform with solid foundations  
**Target State:** Enterprise-ready SaaS with world-class onboarding, billing, analytics, and reliability  
**Timeline:** 12 months to full maturity  
**Investment:** High engineering focus on observability, billing, and customer success

---

## PART 1: CRITICAL SAAS GAPS TO ADDRESS

### 1.1 Observability & Monitoring (CRITICAL)

#### Current State
- Structured logging with categories
- Redis-based rate limiting
- Comments in code: "In the future, this is where Sentry.captureException goes"
- No centralized error tracking
- No distributed tracing
- No APM (Application Performance Monitoring)

#### V2 Implementation

**Sentry Integration (Week 1-2)**
```typescript
// packages/monitoring/src/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  beforeSend: (event) => {
    // Redact PII
    return sanitizeEvent(event);
  },
});

// Automatic error capture in API routes
export function withErrorTracking(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { route: req.url, merchantId: req.merchantId },
        extra: { body: req.body, params: req.params },
      });
      throw error;
    }
  };
}
```

**Datadog APM Integration (Week 3-4)**
- Distributed tracing across all services
- Custom business metrics (orders, revenue, AI usage)
- SLO tracking and alerting
- Service dependency mapping
- Database query performance monitoring

**Custom Metrics Dashboard**
```typescript
// packages/metrics/src/business.ts
export const businessMetrics = {
  // Core SaaS metrics
  mrr: new Gauge('vayva_mrr_naira'),
  arr: new Gauge('vayva_arr_naira'),
  trialConversions: new Counter('vayva_trial_conversions'),
  churnRate: new Gauge('vayva_churn_rate'),
  
  // Usage metrics
  ordersProcessed: new Counter('vayva_orders_total'),
  aiTokensUsed: new Counter('vayva_ai_tokens_total'),
  whatsappConversations: new Counter('vayva_whatsapp_conversations'),
  
  // Health metrics
  apiLatency: new Histogram('vayva_api_latency_ms'),
  errorRate: new Gauge('vayva_error_rate'),
  dbConnectionPool: new Gauge('vayva_db_pool_usage'),
};
```

---

### 1.2 Testing & Quality (CRITICAL)

#### Current State
- Only 5 of 32 packages have tests
- 1,212 TODO/FIXME markers in codebase
- ~5% test coverage
- Minimal E2E tests

#### V2 Implementation

**Test Coverage Enforcement**
```yaml
# .github/workflows/test.yml
- name: Test Coverage
  run: |
    npm run test:coverage
    npx codecov
    
- name: Coverage Gate
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "Coverage $COVERAGE% is below 80% threshold"
      exit 1
    fi
```

**E2E Test Expansion (50+ Critical Paths)**
```typescript
// e2e/tests/critical-paths.spec.ts
describe('Critical Business Flows', () => {
  test('Merchant onboarding → first sale', async () => {
    // Complete signup flow
    // Configure store
    // Add product
    // Receive order via WhatsApp
    // Verify order in dashboard
  });
  
  test('Customer purchase → delivery', async () => {
    // Browse storefront
    // Add to cart
    // Checkout with Paystack
    // Merchant receives notification
    // Update delivery status
    // Customer receives tracking
  });
  
  test('AI agent handles complete conversation', async () => {
    // Send WhatsApp message
    // AI captures intent
    // Generate order
    // Process payment
    // Confirm delivery
  });
  
  // 47 more critical path tests...
});
```

**Load Testing with k6**
```javascript
// load-tests/api-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '10m', target: 1000 },
    { duration: '5m', target: 2000 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.post(`${__ENV.API_URL}/orders`, {
    productId: 'test-product',
    quantity: 1,
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

---

### 1.3 Infrastructure & DevOps (CRITICAL)

#### Current State
- Single VPS deployment
- Manual deployment scripts
- No container orchestration
- No infrastructure-as-code

#### V2 Implementation

**Terraform Infrastructure**
```hcl
# infra/terraform/main.tf
module "vayva_production" {
  source = "./modules/vayva-platform"
  
  environment = "production"
  region = "af-south-1"  # AWS Cape Town
  
  # Compute
  ecs_cluster = {
    instance_type = "c6g.2xlarge"
    min_size = 3
    max_size = 20
    desired_capacity = 5
  }
  
  # Database
  rds = {
    instance_class = "db.r6g.xlarge"
    multi_az = true
    read_replicas = 2
  }
  
  # Cache
  elasticache = {
    node_type = "cache.r6g.large"
    num_cache_nodes = 3
  }
  
  # CDN
  cloudfront = {
    enabled = true
    price_class = "PriceClass_All"
  }
}
```

**Kubernetes Deployment**
```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vayva-api
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: api
        image: vayva/api:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Blue-Green Deployment**
```typescript
// packages/deployment/src/blue-green.ts
export async function deployBlueGreen(newVersion: string) {
  // Deploy to green environment
  await deployToEnvironment('green', newVersion);
  
  // Run smoke tests
  const testsPass = await runSmokeTests('green');
  if (!testsPass) {
    await rollback('green');
    throw new Error('Smoke tests failed');
  }
  
  // Gradually shift traffic
  await shiftTraffic('green', 10);
  await sleep(300000); // 5 minutes
  
  // Monitor error rates
  const errorRate = await getErrorRate('green');
  if (errorRate > 0.01) {
    await shiftTraffic('blue', 100);
    throw new Error('Error rate too high');
  }
  
  // Complete cutover
  await shiftTraffic('green', 100);
  await updateEnvironment('blue', newVersion);
}
```

---

### 1.4 Security Hardening (CRITICAL)

#### Current State
- Basic authentication
- Rate limiting
- Tenant isolation
- No automated security scanning

#### V2 Implementation

**Snyk Integration**
```yaml
# .github/workflows/security.yml
- name: Snyk Security Scan
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
    
- name: Container Scan
  uses: snyk/actions/docker@master
  with:
    image: vayva/api:latest
    args: --severity-threshold=high
```

**SonarQube Code Quality**
```yaml
- name: SonarQube Scan
  uses: sonarqube-quality-gate-action@master
  with:
    scanMetadataFileReport: .scannerwork/report-task.txt
  timeout-minutes: 5
```

**Security Headers**
```typescript
// middleware/security.ts
export const securityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://api.vayva.ng;",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};
```

**Secrets Management (HashiCorp Vault)**
```typescript
// packages/secrets/src/vault.ts
import { VaultClient } from '@hashicorp/vault-client';

export const vault = new VaultClient({
  address: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

export async function getSecret(path: string): Promise<string> {
  const { data } = await vault.read(path);
  return data.data.value;
}

// Usage
const paystackKey = await getSecret('secret/payments/paystack');
```

---

## PART 2: ADVANCED BILLING & REVENUE OPERATIONS

### 2.1 Usage-Based Billing System

#### Implementation

```typescript
// packages/billing/src/usage.ts
export class UsageBilling {
  async recordUsage(params: {
    merchantId: string;
    metric: 'ai_tokens' | 'whatsapp_messages' | 'storage_gb' | 'bandwidth_gb';
    quantity: number;
    timestamp: Date;
  }) {
    // Record to time-series database
    await timeseriesDB.writePoint({
      measurement: 'usage',
      tags: {
        merchantId: params.merchantId,
        metric: params.metric,
      },
      fields: {
        quantity: params.quantity,
      },
      timestamp: params.timestamp,
    });
    
    // Check if approaching limit
    await this.checkUsageThresholds(params);
  }
  
  async calculateBill(merchantId: string, billingPeriod: DateRange): Promise<Invoice> {
    const usage = await this.aggregateUsage(merchantId, billingPeriod);
    const plan = await this.getPlan(merchantId);
    
    let total = plan.basePrice;
    const lineItems: LineItem[] = [];
    
    // AI Tokens
    if (usage.aiTokens > plan.includedAiTokens) {
      const overage = usage.aiTokens - plan.includedAiTokens;
      const cost = overage * 0.0001; // ₦0.0001 per token
      lineItems.push({
        description: `AI Tokens Overage (${overage.toLocaleString()} tokens)`,
        amount: cost,
      });
      total += cost;
    }
    
    // WhatsApp Messages
    if (usage.whatsappMessages > plan.includedWhatsAppMessages) {
      const overage = usage.whatsappMessages - plan.includedWhatsAppMessages;
      const cost = overage * 2.9; // ₦2.90 per message
      lineItems.push({
        description: `WhatsApp Messages Overage (${overage.toLocaleString()} messages)`,
        amount: cost,
      });
      total += cost;
    }
    
    // Storage
    if (usage.storageGB > plan.includedStorageGB) {
      const overage = usage.storageGB - plan.includedStorageGB;
      const cost = overage * 500; // ₦500 per GB
      lineItems.push({
        description: `Storage Overage (${overage} GB)`,
        amount: cost,
      });
      total += cost;
    }
    
    return {
      merchantId,
      period: billingPeriod,
      lineItems,
      subtotal: total,
      tax: total * 0.075, // 7.5% VAT
      total: total * 1.075,
      dueDate: addDays(billingPeriod.end, 7),
    };
  }
}
```

**Metered Billing UI**
```typescript
// Frontend component for usage dashboard
export function UsageDashboard() {
  const { usage, limits, projected } = useUsageData();
  
  return (
    <div className="space-y-6">
      <UsageProgress 
        label="AI Tokens"
        used={usage.aiTokens}
        limit={limits.aiTokens}
        projected={projected.aiTokens}
        unit="tokens"
      />
      <UsageProgress 
        label="WhatsApp Messages"
        used={usage.whatsappMessages}
        limit={limits.whatsappMessages}
        projected={projected.whatsappMessages}
        unit="messages"
      />
      <UsageProgress 
        label="Storage"
        used={usage.storageGB}
        limit={limits.storageGB}
        projected={projected.storageGB}
        unit="GB"
      />
      
      {projected.exceedsLimit && (
        <Alert variant="warning">
          Projected to exceed plan limits. 
          <Button variant="link">Upgrade now</Button>
        </Alert>
      )}
    </div>
  );
}
```

---

### 2.2 Dunning Management

```typescript
// packages/billing/src/dunning.ts
export class DunningManager {
  private retrySchedule = [
    { days: 0, action: 'immediate_notify' },
    { days: 3, action: 'retry_payment' },
    { days: 7, action: 'retry_payment' },
    { days: 14, action: 'retry_payment' },
    { days: 21, action: 'final_notice' },
    { days: 30, action: 'suspend_account' },
  ];
  
  async handleFailedPayment(payment: FailedPayment) {
    const attempt = await this.getRetryAttempt(payment.subscriptionId);
    const schedule = this.retrySchedule[attempt];
    
    switch (schedule.action) {
      case 'immediate_notify':
        await this.sendDunningEmail(payment, 'payment_failed');
        await this.scheduleRetry(payment, schedule.days);
        break;
        
      case 'retry_payment':
        const result = await this.retryPayment(payment);
        if (result.success) {
          await this.sendRecoveryEmail(payment);
        } else {
          await this.sendDunningEmail(payment, 'payment_failed_again');
          await this.scheduleRetry(payment, schedule.days);
        }
        break;
        
      case 'final_notice':
        await this.sendDunningEmail(payment, 'final_notice');
        await this.scheduleRetry(payment, schedule.days);
        break;
        
      case 'suspend_account':
        await this.suspendSubscription(payment.subscriptionId);
        await this.sendDunningEmail(payment, 'account_suspended');
        break;
    }
  }
  
  async retryPayment(payment: FailedPayment): Promise<RetryResult> {
    // Smart retry logic based on failure type
    const strategy = this.getRetryStrategy(payment.failureCode);
    
    // Retry at optimal time (6-9 AM customer local time)
    const customerTimezone = await this.getCustomerTimezone(payment.merchantId);
    const optimalTime = this.calculateOptimalRetryTime(customerTimezone);
    
    await this.scheduleRetryAt(payment, optimalTime);
    
    return this.executeRetry(payment, strategy);
  }
}
```

---

### 2.3 Revenue Recognition (ASC 606)

```typescript
// packages/billing/src/revenue-recognition.ts
export class RevenueRecognition {
  async recognizeRevenue(invoice: Invoice) {
    // ASC 606 Step 1: Identify contract
    const contract = await this.identifyContract(invoice.merchantId);
    
    // ASC 606 Step 2: Identify performance obligations
    const obligations = this.identifyPerformanceObligations(invoice);
    
    // ASC 606 Step 3: Determine transaction price
    const transactionPrice = invoice.total;
    
    // ASC 606 Step 4: Allocate price to obligations
    const allocatedPrice = this.allocatePrice(obligations, transactionPrice);
    
    // ASC 606 Step 5: Recognize revenue as obligations satisfied
    for (const obligation of obligations) {
      if (obligation.type === 'subscription') {
        // Recognize ratably over subscription period
        await this.scheduleRevenueRecognition({
          obligation,
          amount: allocatedPrice[obligation.id],
          startDate: invoice.period.start,
          endDate: invoice.period.end,
          recognitionType: 'ratable',
        });
      } else if (obligation.type === 'one_time') {
        // Recognize immediately when service delivered
        await this.recordRevenue({
          obligation,
          amount: allocatedPrice[obligation.id],
          recognizedDate: new Date(),
        });
      }
    }
  }
  
  async generateRevenueReport(period: DateRange): Promise<RevenueReport> {
    return {
      recognizedRevenue: await this.calculateRecognizedRevenue(period),
      deferredRevenue: await this.calculateDeferredRevenue(period),
      unbilledRevenue: await this.calculateUnbilledRevenue(period),
      byProduct: await this.breakdownByProduct(period),
      byRegion: await this.breakdownByRegion(period),
    };
  }
}
```

---

## PART 3: CUSTOMER SUCCESS PLATFORM

### 3.1 Customer Health Scoring

```typescript
// packages/customer-success/src/health-score.ts
export class HealthScoreEngine {
  async calculateHealthScore(merchantId: string): Promise<HealthScore> {
    const [
      productUsage,
      sentiment,
      businessData,
      relationship,
    ] = await Promise.all([
      this.getProductUsageMetrics(merchantId),
      this.getSentimentMetrics(merchantId),
      this.getBusinessMetrics(merchantId),
      this.getRelationshipMetrics(merchantId),
    ]);
    
    const score = 
      productUsage.score * 0.35 +
      sentiment.score * 0.25 +
      businessData.score * 0.25 +
      relationship.score * 0.15;
    
    const factors = [
      ...productUsage.factors,
      ...sentiment.factors,
      ...businessData.factors,
      ...relationship.factors,
    ];
    
    const trend = await this.calculateTrend(merchantId, score);
    
    return {
      merchantId,
      score: Math.round(score),
      grade: this.getGrade(score),
      factors,
      trend,
      lastUpdated: new Date(),
    };
  }
  
  private async getProductUsageMetrics(merchantId: string) {
    const metrics = await analytics.getMerchantMetrics(merchantId, {
      days: 30,
    });
    
    const factors: HealthFactor[] = [];
    let score = 100;
    
    // Feature adoption
    const featureAdoption = metrics.featuresUsed / metrics.featuresAvailable;
    if (featureAdoption < 0.3) {
      score -= 20;
      factors.push({
        type: 'negative',
        category: 'feature_adoption',
        description: `Only using ${Math.round(featureAdoption * 100)}% of available features`,
        recommendation: 'Schedule feature training session',
      });
    }
    
    // Usage frequency
    const daysActive = metrics.daysActiveLast30;
    if (daysActive < 10) {
      score -= 25;
      factors.push({
        type: 'negative',
        category: 'engagement',
        description: `Only active ${daysActive} days in last 30`,
        recommendation: 'Reach out to understand blockers',
      });
    }
    
    // Order volume trend
    const orderTrend = metrics.orderGrowthRate;
    if (orderTrend < -0.2) {
      score -= 15;
      factors.push({
        type: 'negative',
        category: 'business_health',
        description: `Order volume down ${Math.abs(orderTrend * 100)}%`,
        recommendation: 'Offer business consultation',
      });
    }
    
    return { score: Math.max(0, score), factors };
  }
}
```

**Health Score Dashboard**
```typescript
export function HealthScoreDashboard() {
  const { merchants } = useHealthScores();
  
  const segments = {
    healthy: merchants.filter(m => m.score >= 70),
    atRisk: merchants.filter(m => m.score >= 50 && m.score < 70),
    critical: merchants.filter(m => m.score < 50),
  };
  
  return (
    <div className="grid grid-cols-3 gap-6">
      <HealthCard 
        title="Healthy"
        count={segments.healthy.length}
        color="green"
        merchants={segments.healthy}
      />
      <HealthCard 
        title="At Risk"
        count={segments.atRisk.length}
        color="yellow"
        merchants={segments.atRisk}
        actionRequired
      />
      <HealthCard 
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

---

### 3.2 Automated Playbooks

```typescript
// packages/customer-success/src/playbooks.ts
export const playbooks: Record<string, Playbook> = {
  trial_expiring: {
    name: 'Trial Expiration',
    trigger: {
      type: 'time',
      condition: 'trial_ends_in_3_days',
    },
    actions: [
      {
        type: 'email',
        template: 'trial_expiring_soon',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'Call trial customer',
        description: 'Offer help and discuss upgrade',
        delay: 24 * 60 * 60 * 1000, // 24 hours
      },
      {
        type: 'email',
        template: 'trial_final_day',
        delay: 48 * 60 * 60 * 1000, // 48 hours
      },
    ],
  },
  
  low_feature_adoption: {
    name: 'Low Feature Adoption',
    trigger: {
      type: 'metric',
      condition: 'features_used < 30%',
      duration: '7_days',
    },
    actions: [
      {
        type: 'email',
        template: 'feature_discovery',
        delay: 0,
      },
      {
        type: 'in_app',
        message: 'Discover features that can help you sell more',
        cta: 'View Features',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'Schedule feature training',
        delay: 3 * 24 * 60 * 60 * 1000,
      },
    ],
  },
  
  churn_risk: {
    name: 'Churn Risk Detected',
    trigger: {
      type: 'health_score',
      condition: 'score < 50',
    },
    actions: [
      {
        type: 'slack',
        channel: '#churn-alerts',
        message: '🚨 High churn risk detected',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'URGENT: Churn risk intervention',
        priority: 'high',
        delay: 0,
      },
      {
        type: 'email',
        template: 'executive_outreach',
        from: 'founder@vayva.ng',
        delay: 24 * 60 * 60 * 1000,
      },
    ],
  },
  
  expansion_opportunity: {
    name: 'Expansion Opportunity',
    trigger: {
      type: 'metric',
      condition: 'usage > 80% of plan limit',
    },
    actions: [
      {
        type: 'email',
        template: 'upgrade_recommendation',
        delay: 0,
      },
      {
        type: 'in_app',
        message: 'You\'re approaching your plan limit',
        cta: 'View Plans',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'account_manager',
        title: 'Proactive upsell conversation',
        delay: 2 * 24 * 60 * 60 * 1000,
      },
    ],
  },
};
```

---

### 3.3 NPS/CSAT System

```typescript
// packages/customer-success/src/nps.ts
export class NpsSystem {
  async sendNpsSurvey(merchantId: string) {
    const merchant = await this.getMerchant(merchantId);
    
    // Don't survey too frequently
    const lastSurvey = await this.getLastSurvey(merchantId);
    if (lastSurvey && daysSince(lastSurvey) < 90) {
      return;
    }
    
    await email.send({
      to: merchant.ownerEmail,
      template: 'nps_survey',
      data: {
        surveyLink: `${process.env.APP_URL}/nps?token=${this.generateToken(merchantId)}`,
      },
    });
    
    await this.recordSurveySent(merchantId);
  }
  
  async recordResponse(merchantId: string, score: number, feedback?: string) {
    await db.npsResponses.create({
      merchantId,
      score,
      feedback,
      respondedAt: new Date(),
    });
    
    // Trigger follow-up based on score
    if (score <= 6) {
      // Detractor - immediate follow-up
      await this.triggerPlaybook('detractor_follow_up', merchantId);
    } else if (score >= 9) {
      // Promoter - ask for review/referral
      await this.triggerPlaybook('promoter_advocacy', merchantId);
    }
    
    // Update health score
    await healthScoreEngine.recalculate(merchantId);
  }
  
  async getNpsReport(period: DateRange): Promise<NpsReport> {
    const responses = await db.npsResponses.findMany({
      where: {
        respondedAt: {
          gte: period.start,
          lte: period.end,
        },
      },
    });
    
    const promoters = responses.filter(r => r.score >= 9).length;
    const passives = responses.filter(r => r.score >= 7 && r.score <= 8).length;
    const detractors = responses.filter(r => r.score <= 6).length;
    const total = responses.length;
    
    return {
      npsScore: ((promoters - detractors) / total) * 100,
      responseRate: total / await this.getSurveySentCount(period),
      promoters,
      passives,
      detractors,
      feedbackThemes: await this.analyzeFeedbackThemes(responses),
      trend: await this.calculateNpsTrend(period),
    };
  }
}
```

---

## PART 4: INTEGRATION ECOSYSTEM

### 4.1 API Key Management

```typescript
// packages/api-keys/src/manager.ts
export class ApiKeyManager {
  async createApiKey(params: {
    merchantId: string;
    name: string;
    permissions: Permission[];
    ipRestrictions?: string[];
    expiresAt?: Date;
  }): Promise<ApiKey> {
    const key = this.generateSecureKey();
    const hashedKey = await bcrypt.hash(key, 10);
    
    const apiKey = await db.apiKeys.create({
      merchantId: params.merchantId,
      name: params.name,
      keyPrefix: key.slice(0, 8),
      keyHash: hashedKey,
      permissions: params.permissions,
      ipRestrictions: params.ipRestrictions,
      expiresAt: params.expiresAt,
      lastUsedAt: null,
    });
    
    // Return full key only once
    return {
      ...apiKey,
      key: `${apiKey.id}.${key}`,
    };
  }
  
  async validateApiKey(key: string): Promise<ApiKeyValidation> {
    const [id, secret] = key.split('.');
    
    const apiKey = await db.apiKeys.findUnique({
      where: { id },
    });
    
    if (!apiKey || apiKey.revokedAt) {
      return { valid: false, reason: 'invalid_key' };
    }
    
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false, reason: 'expired' };
    }
    
    const valid = await bcrypt.compare(secret, apiKey.keyHash);
    if (!valid) {
      return { valid: false, reason: 'invalid_key' };
    }
    
    // Update last used
    await db.apiKeys.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
    
    return {
      valid: true,
      merchantId: apiKey.merchantId,
      permissions: apiKey.permissions,
    };
  }
  
  async rotateApiKey(keyId: string): Promise<ApiKey> {
    const oldKey = await db.apiKeys.findUnique({
      where: { id: keyId },
    });
    
    // Create new key
    const newKey = await this.createApiKey({
      merchantId: oldKey.merchantId,
      name: oldKey.name,
      permissions: oldKey.permissions,
    });
    
    // Schedule old key expiration (30 days grace period)
    await db.apiKeys.update({
      where: { id: keyId },
      data: { expiresAt: addDays(new Date(), 30) },
    });
    
    return newKey;
  }
}
```

---

### 4.2 OAuth Provider Implementation

```typescript
// packages/oauth/src/provider.ts
export class VayvaOAuthProvider {
  async authorize(params: {
    clientId: string;
    redirectUri: string;
    scope: string[];
    state: string;
    responseType: 'code' | 'token';
  }): Promise<AuthorizationResponse> {
    // Validate client
    const client = await this.validateClient(params.clientId, params.redirectUri);
    if (!client) {
      throw new OAuthError('invalid_client');
    }
    
    // Show consent screen
    return {
      type: 'consent_required',
      scopes: params.scope,
      appName: client.name,
      appLogo: client.logo,
    };
  }
  
  async approveAuthorization(
    merchantId: string,
    params: AuthorizationRequest
  ): Promise<AuthorizationCode> {
    const code = this.generateCode();
    
    await db.authorizationCodes.create({
      code,
      merchantId,
      clientId: params.clientId,
      scope: params.scope,
      expiresAt: addMinutes(new Date(), 10),
    });
    
    return {
      code,
      state: params.state,
      redirectUri: params.redirectUri,
    };
  }
  
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const authCode = await db.authorizationCodes.findUnique({
      where: { code },
    });
    
    if (!authCode || authCode.expiresAt < new Date()) {
      throw new OAuthError('invalid_grant');
    }
    
    // Generate tokens
    const accessToken = this.generateToken({
      merchantId: authCode.merchantId,
      scope: authCode.scope,
      type: 'access',
    });
    
    const refreshToken = this.generateToken({
      merchantId: authCode.merchantId,
      type: 'refresh',
    });
    
    // Mark code as used
    await db.authorizationCodes.delete({
      where: { code },
    });
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: authCode.scope.join(' '),
    };
  }
}
```

---

### 4.3 Zapier Integration

```typescript
// packages/integrations/src/zapier/triggers.ts
export const zapierTriggers = {
  new_order: {
    key: 'new_order',
    noun: 'Order',
    display: {
      label: 'New Order',
      description: 'Triggers when a new order is received.',
    },
    operation: {
      type: 'hook',
      performSubscribe: async (z, bundle) => {
        const webhook = await createWebhook({
          merchantId: bundle.authData.merchantId,
          url: bundle.targetUrl,
          events: ['order.created'],
        });
        return { webhookId: webhook.id };
      },
      performUnsubscribe: async (z, bundle) => {
        await deleteWebhook(bundle.subscribeData.webhookId);
      },
      perform: async (z, bundle) => {
        return [bundle.cleanedRequest];
      },
      sample: {
        id: 'ord_123',
        orderNumber: 'VA-2026-001',
        customer: {
          name: 'John Doe',
          phone: '+2348012345678',
        },
        items: [
          { name: 'Product A', quantity: 2, price: 5000 },
        ],
        total: 10000,
        status: 'pending',
        createdAt: '2026-03-10T10:00:00Z',
      },
    },
  },
  
  order_status_changed: {
    key: 'order_status_changed',
    noun: 'Order',
    display: {
      label: 'Order Status Changed',
      description: 'Triggers when an order status changes.',
    },
    operation: {
      type: 'hook',
      performSubscribe: async (z, bundle) => {
        const webhook = await createWebhook({
          merchantId: bundle.authData.merchantId,
          url: bundle.targetUrl,
          events: ['order.status_updated'],
        });
        return { webhookId: webhook.id };
      },
      performUnsubscribe: async (z, bundle) => {
        await deleteWebhook(bundle.subscribeData.webhookId);
      },
      perform: async (z, bundle) => {
        return [bundle.cleanedRequest];
      },
    },
  },
};

export const zapierActions = {
  create_product: {
    key: 'create_product',
    noun: 'Product',
    display: {
      label: 'Create Product',
      description: 'Creates a new product in your Vayva store.',
    },
    operation: {
      inputFields: [
        { key: 'name', required: true, label: 'Product Name' },
        { key: 'price', required: true, type: 'number', label: 'Price' },
        { key: 'description', type: 'text', label: 'Description' },
        { key: 'category', label: 'Category' },
        { key: 'inventory', type: 'integer', label: 'Initial Inventory' },
      ],
      perform: async (z, bundle) => {
        const product = await createProduct({
          merchantId: bundle.authData.merchantId,
          ...bundle.inputData,
        });
        return product;
      },
    },
  },
  
  update_order_status: {
    key: 'update_order_status',
    noun: 'Order',
    display: {
      label: 'Update Order Status',
      description: 'Updates the status of an existing order.',
    },
    operation: {
      inputFields: [
        { key: 'orderId', required: true, label: 'Order ID' },
        { 
          key: 'status', 
          required: true, 
          choices: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
          label: 'New Status',
        },
        { key: 'note', type: 'text', label: 'Note (optional)' },
      ],
      perform: async (z, bundle) => {
        const order = await updateOrderStatus({
          merchantId: bundle.authData.merchantId,
          ...bundle.inputData,
        });
        return order;
      },
    },
  },
};
```

---

## PART 5: COMPLIANCE & SECURITY

### 5.1 SOC 2 Compliance Framework

```typescript
// packages/compliance/src/soc2/controls.ts
export const soc2Controls: Record<string, Control> = {
  // CC6.1 - Logical access controls
  'CC6.1': {
    description: 'Logical access security measures are implemented',
    tests: [
      {
        name: 'User authentication required',
        test: async () => {
          const publicEndpoints = await findPublicEndpoints();
          return publicEndpoints.length === 0;
        },
      },
      {
        name: 'MFA enforced for admin access',
        test: async () => {
          const admins = await getAdminUsers();
          return admins.every(u => u.mfaEnabled);
        },
      },
    ],
  },
  
  // CC6.2 - Access removal
  'CC6.2': {
    description: 'Access is removed upon termination',
    tests: [
      {
        name: 'Terminated user access revoked within 24h',
        test: async () => {
          const terminations = await getRecentTerminations(30);
          return terminations.every(t => {
            const accessRevoked = t.accessRevokedAt;
            const hoursToRevoke = differenceInHours(accessRevoked, t.terminatedAt);
            return hoursToRevoke <= 24;
          });
        },
      },
    ],
  },
  
  // CC7.2 - System monitoring
  'CC7.2': {
    description: 'System monitoring is implemented',
    tests: [
      {
        name: 'Security events logged',
        test: async () => {
          const logs = await getSecurityLogs(7);
          return logs.length > 0 && logs.every(l => l.timestamp && l.eventType);
        },
      },
      {
        name: 'Alerts configured for anomalies',
        test: async () => {
          const alerts = await getConfiguredAlerts();
          return alerts.some(a => a.type === 'security');
        },
      },
    ],
  },
  
  // A1.1 - System availability
  'A1.1': {
    description: 'System availability is maintained',
    tests: [
      {
        name: 'Uptime meets 99.9% SLA',
        test: async () => {
          const uptime = await calculateUptime(30);
          return uptime >= 99.9;
        },
      },
      {
        name: 'Backup recovery tested monthly',
        test: async () => {
          const lastTest = await getLastBackupTest();
          return differenceInDays(new Date(), lastTest) <= 30;
        },
      },
    ],
  },
};

export async function runSoc2Audit(): Promise<AuditReport> {
  const results: ControlResult[] = [];
  
  for (const [controlId, control] of Object.entries(soc2Controls)) {
    const testResults = await Promise.all(
      control.tests.map(async (test) => ({
        name: test.name,
        passed: await test.test(),
      }))
    );
    
    results.push({
      controlId,
      description: control.description,
      tests: testResults,
      status: testResults.every(t => t.passed) ? 'pass' : 'fail',
    });
  }
  
  return {
    date: new Date(),
    overallStatus: results.every(r => r.status === 'pass') ? 'pass' : 'fail',
    results,
  };
}
```

---

### 5.2 GDPR Automation

```typescript
// packages/compliance/src/gdpr/automation.ts
export class GdprAutomation {
  // Right to Access
  async handleAccessRequest(merchantId: string): Promise<DataExport> {
    const [
      profile,
      orders,
      customers,
      products,
      activityLogs,
      communications,
    ] = await Promise.all([
      this.getProfileData(merchantId),
      this.getOrderData(merchantId),
      this.getCustomerData(merchantId),
      this.getProductData(merchantId),
      this.getActivityLogs(merchantId),
      this.getCommunications(merchantId),
    ]);
    
    const exportPackage = {
      merchantId,
      exportedAt: new Date(),
      data: {
        profile,
        orders,
        customers,
        products,
        activityLogs,
        communications,
      },
    };
    
    // Generate downloadable package
    const downloadUrl = await this.createExportPackage(exportPackage);
    
    // Send to merchant
    await email.send({
      to: profile.email,
      template: 'gdpr_data_export',
      data: { downloadUrl, expiresAt: addDays(new Date(), 30) },
    });
    
    return exportPackage;
  }
  
  // Right to Deletion
  async handleDeletionRequest(merchantId: string): Promise<DeletionReport> {
    // Anonymize instead of delete for financial records
    const anonymizedId = `deleted_${uuid()}`;
    
    await db.$transaction([
      // Anonymize profile
      db.merchants.update({
        where: { id: merchantId },
        data: {
          name: 'Deleted Merchant',
          email: `${anonymizedId}@deleted.vayva.ng`,
          phone: null,
          deletedAt: new Date(),
          anonymizedId,
        },
      }),
      
      // Delete PII from customers
      db.customers.updateMany({
        where: { merchantId },
        data: {
          name: 'Deleted Customer',
          phone: null,
          email: null,
          address: null,
        },
      }),
      
      // Delete communications
      db.communications.deleteMany({
        where: { merchantId },
      }),
      
      // Keep orders for accounting but anonymize
      db.orders.updateMany({
        where: { merchantId },
        data: {
          customerName: 'Deleted Customer',
          customerPhone: null,
          customerEmail: null,
          deliveryAddress: null,
        },
      }),
    ]);
    
    return {
      merchantId: anonymizedId,
      deletedAt: new Date(),
      retentionDate: addYears(new Date(), 7), // Financial records kept 7 years
    };
  }
  
  // Consent Management
  async recordConsent(merchantId: string, consentType: string, granted: boolean) {
    await db.consentRecords.create({
      merchantId,
      consentType,
      granted,
      timestamp: new Date(),
      ipAddress: await this.getClientIp(),
      userAgent: await this.getUserAgent(),
    });
  }
  
  async getConsentStatus(merchantId: string): Promise<ConsentStatus> {
    const records = await db.consentRecords.findMany({
      where: { merchantId },
      orderBy: { timestamp: 'desc' },
    });
    
    return {
      marketing: records.find(r => r.consentType === 'marketing')?.granted ?? false,
      analytics: records.find(r => r.consentType === 'analytics')?.granted ?? false,
      thirdParty: records.find(r => r.consentType === 'third_party')?.granted ?? false,
      lastUpdated: records[0]?.timestamp,
    };
  }
}
```

---

## PART 6: ANALYTICS & BUSINESS INTELLIGENCE

### 6.1 Embedded Analytics Platform

```typescript
// packages/analytics/src/embedded/index.ts
export class EmbeddedAnalytics {
  async generateDashboard(params: {
    merchantId: string;
    dashboardType: 'overview' | 'sales' | 'customers' | 'products' | 'marketing';
    dateRange: DateRange;
  }): Promise<Dashboard> {
    const widgets = await this.getWidgetsForType(params.dashboardType);
    
    const data = await Promise.all(
      widgets.map(async (widget) => ({
        ...widget,
        data: await this.fetchWidgetData(widget, params),
      }))
    );
    
    return {
      id: generateId(),
      type: params.dashboardType,
      dateRange: params.dateRange,
      widgets: data,
      generatedAt: new Date(),
    };
  }
  
  private async fetchWidgetData(
    widget: Widget,
    params: { merchantId: string; dateRange: DateRange }
  ): Promise<WidgetData> {
    switch (widget.type) {
      case 'revenue_chart':
        return this.getRevenueChart(params);
      case 'order_funnel':
        return this.getOrderFunnel(params);
      case 'top_products':
        return this.getTopProducts(params);
      case 'customer_segments':
        return this.getCustomerSegments(params);
      case 'conversion_rates':
        return this.getConversionRates(params);
      default:
        return null;
    }
  }
  
  private async getRevenueChart(params: { merchantId: string; dateRange: DateRange }) {
    const orders = await db.orders.findMany({
      where: {
        merchantId: params.merchantId,
        createdAt: {
          gte: params.dateRange.start,
          lte: params.dateRange.end,
        },
        status: { not: 'cancelled' },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });
    
    // Group by day
    const grouped = groupBy(orders, (o) => format(o.createdAt, 'yyyy-MM-dd'));
    
    return Object.entries(grouped).map(([date, dayOrders]) => ({
      date,
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length,
    }));
  }
}
```

**Customer-Facing Analytics Components**
```typescript
// Frontend components for merchant analytics
export function MerchantAnalyticsDashboard() {
  const { dashboard, dateRange, setDateRange } = useDashboard();
  
  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Store Analytics"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={dashboard.metrics.revenue}
          change={dashboard.metrics.revenueChange}
          chart={dashboard.charts.revenue}
        />
        <MetricCard
          title="Orders"
          value={dashboard.metrics.orders}
          change={dashboard.metrics.ordersChange}
        />
        <MetricCard
          title="Customers"
          value={dashboard.metrics.customers}
          change={dashboard.metrics.customersChange}
        />
        <MetricCard
          title="Conversion Rate"
          value={dashboard.metrics.conversionRate}
          change={dashboard.metrics.conversionChange}
          format="percentage"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <RevenueChart data={dashboard.charts.revenueOverTime} />
        <TopProductsTable products={dashboard.tables.topProducts} />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <CustomerSegmentsChart segments={dashboard.charts.customerSegments} />
        <OrderFunnel funnel={dashboard.funnels.orderConversion} />
      </div>
    </div>
  );
}
```

---

### 6.2 Real-Time Analytics

```typescript
// packages/analytics/src/realtime/index.ts
export class RealtimeAnalytics {
  private eventStream: EventEmitter;
  
  constructor() {
    this.eventStream = new EventEmitter();
    this.initializeKafkaConsumer();
  }
  
  private async initializeKafkaConsumer() {
    const consumer = kafka.consumer({ groupId: 'realtime-analytics' });
    
    await consumer.subscribe({
      topics: ['orders', 'pageviews', 'events'],
      fromBeginning: false,
    });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        
        // Process in real-time
        await this.processEvent(event);
        
        // Broadcast to connected clients
        this.eventStream.emit(event.merchantId, event);
      },
    });
  }
  
  async processEvent(event: AnalyticsEvent) {
    // Update real-time counters
    await redis.incr(`realtime:${event.merchantId}:${event.type}:${format(new Date(), 'HH:mm')}`);
    
    // Update merchant's live dashboard
    await this.updateLiveMetrics(event.merchantId, event);
    
    // Check for anomaly detection
    await this.checkAnomalies(event);
  }
  
  async getLiveMetrics(merchantId: string): Promise<LiveMetrics> {
    const now = new Date();
    const fiveMinutesAgo = subMinutes(now, 5);
    
    const [
      activeVisitors,
      ordersLast5Min,
      revenueLast5Min,
    ] = await Promise.all([
      this.getActiveVisitors(merchantId),
      this.getOrdersInRange(merchantId, fiveMinutesAgo, now),
      this.getRevenueInRange(merchantId, fiveMinutesAgo, now),
    ]);
    
    return {
      activeVisitors,
      ordersLast5Min,
      revenueLast5Min,
      conversionRate: ordersLast5Min / activeVisitors,
      lastUpdated: now,
    };
  }
  
  // WebSocket handler for live updates
  async handleWebSocketConnection(ws: WebSocket, merchantId: string) {
    // Send initial data
    const metrics = await this.getLiveMetrics(merchantId);
    ws.send(JSON.stringify({ type: 'initial', data: metrics }));
    
    // Subscribe to updates
    const listener = (event: AnalyticsEvent) => {
      ws.send(JSON.stringify({ type: 'update', data: event }));
    };
    
    this.eventStream.on(merchantId, listener);
    
    ws.on('close', () => {
      this.eventStream.off(merchantId, listener);
    });
  }
}
```

---

## PART 7: IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Months 1-2)
**Focus: Observability, Security, Testing**

| Week | Deliverable | Impact |
|------|-------------|--------|
| 1-2 | Sentry integration | Error visibility |
| 2-3 | Datadog APM | Performance monitoring |
| 3-4 | Security scanning (Snyk, SonarQube) | Vulnerability detection |
| 4-6 | Test coverage to 50% | Quality assurance |
| 6-8 | Infrastructure-as-code (Terraform) | Reliable deployments |

### Phase 2: Billing & Revenue (Months 3-4)
**Focus: Usage-based billing, dunning, revenue recognition**

| Week | Deliverable | Impact |
|------|-------------|--------|
| 9-10 | Usage tracking infrastructure | Metered billing ready |
| 10-12 | Usage-based billing UI | Customer transparency |
| 12-14 | Dunning management | Revenue recovery |
| 14-16 | Revenue recognition engine | Accounting compliance |

### Phase 3: Customer Success (Months 5-6)
**Focus: Health scores, playbooks, NPS**

| Week | Deliverable | Impact |
|------|-------------|--------|
| 17-18 | Health score engine | Churn prediction |
| 18-20 | Automated playbooks | Proactive engagement |
| 20-22 | NPS/CSAT system | Customer feedback |
| 22-24 | CSM dashboard | Success management |

### Phase 4: Integration Ecosystem (Months 7-8)
**Focus: API keys, OAuth, Zapier**

| Week | Deliverable | Impact |
|------|-------------|--------|
| 25-26 | API key management | Developer access |
| 26-28 | OAuth provider | Third-party apps |
| 28-30 | Zapier integration | Workflow automation |
| 30-32 | Webhook dashboard | Integration visibility |

### Phase 5: Compliance & Enterprise (Months 9-10)
**Focus: SOC 2, GDPR, SSO**

| Week | Deliverable | Impact |
|------|-------------|--------|
| 33-34 | SOC 2 controls | Enterprise trust |
| 34-36 | GDPR automation | EU compliance |
| 36-38 | SAML/SSO support | Enterprise sales |
| 38-40 | Audit logging | Compliance evidence |

### Phase 6: Analytics & Scale (Months 11-12)
**Focus: Embedded analytics, real-time, performance**

| Week | Deliverable | Impact |
|------|-------------|--------|
| 41-42 | Embedded analytics | Customer insights |
| 42-44 | Real-time analytics | Live dashboards |
| 44-46 | Performance optimization | Scale readiness |
| 46-48 | Multi-region deployment | Global availability |

---

## PART 8: SUCCESS METRICS

### Technical Metrics
| Metric | Current | Target (12 mo) |
|--------|---------|----------------|
| Test Coverage | ~5% | 80%+ |
| Uptime | Unknown | 99.9% |
| API Response Time | Unknown | p95 < 200ms |
| Error Rate | Unknown | < 0.1% |
| Deployment Frequency | Manual | 10+/day |
| Lead Time for Changes | Weeks | < 1 day |
| MTTR | Unknown | < 1 hour |

### Business Metrics
| Metric | Current | Target (12 mo) |
|--------|---------|----------------|
| Trial Conversion | Unknown | 25%+ |
| Monthly Churn | Unknown | < 5% |
| NPS Score | Unknown | 50+ |
| Time to Value | Unknown | < 10 min |
| Expansion Revenue | 0% | 20% of ARR |
| Gross Revenue Retention | Unknown | 100%+ |
| Net Revenue Retention | Unknown | 120%+ |

---

## CONCLUSION

This v2 plan transforms Vayva from a feature-rich commerce tool into a **world-class SaaS platform** capable of:

1. **Enterprise Sales**: SOC 2, SSO, advanced security
2. **Usage-Based Pricing**: Metered billing for AI, WhatsApp, storage
3. **Customer Success**: Health scoring, automated playbooks, NPS
4. **Integration Ecosystem**: API keys, OAuth, Zapier, webhooks
5. **Global Scale**: Multi-region, high availability, real-time analytics

**Total Investment**: 12 months of focused engineering  
**Expected Outcome**: Enterprise-ready platform with 9+/10 SaaS maturity  
**Competitive Position**: Best-in-class for African commerce + global SaaS standards

---

*Document Version: 1.0*  
*Last Updated: March 10, 2026*  
*Owner: Engineering & Product Leadership*
