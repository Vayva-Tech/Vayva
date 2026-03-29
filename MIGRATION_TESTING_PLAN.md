# 🧪 Core-API to Fastify Migration - Comprehensive Testing Plan

**Date:** March 28, 2026  
**Status:** Ready for Execution  
**Scope:** All migrated services (~17,200 lines, 65+ services)

---

## 🎯 **Testing Objectives**

1. ✅ Verify all migrated services function correctly
2. ✅ Ensure zero data loss in business logic
3. ✅ Validate API endpoint responses
4. ✅ Measure performance improvements
5. ✅ Identify any regression issues
6. ✅ Build confidence for production deployment

---

## 📊 **Test Categories**

### **1. Unit Tests** (Priority: HIGH)
Test individual service functions in isolation

### **2. Integration Tests** (Priority: CRITICAL)
Test service interactions and database operations

### **3. API Endpoint Tests** (Priority: CRITICAL)
Test all fastify-server HTTP endpoints

### **4. Performance Tests** (Priority: MEDIUM)
Load testing and benchmark comparisons

### **5. End-to-End Tests** (Priority: HIGH)
Full user journey validation

---

## 🧪 **Phase 1: Dashboard Services Testing** (CRITICAL)

### **Dashboard Service (`dashboard.service.ts` - 1,196 lines)**

#### **Functions to Test:**
```typescript
// Primary aggregation endpoint
- [ ] getAggregateData(storeId, range)

// KPI calculations
- [ ] getKpisInternal(storeId, hasBookings, hasInventory, dateRange)
- [ ] getMetricsInternal(storeId)
- [ ] getOverviewInternal(storeId)

// Alerts and Actions
- [ ] getSuggestedActionsInternal(storeId, definition, state)
- [ ] getAlertsInternal(storeId, definition, metrics)

// Activity Feeds
- [ ] getRecentActivityInternal(storeId, limit)
- [ ] getRecentOrdersInternal(storeId, limit)
- [ ] getRecentBookingsInternal(storeId, limit)

// Inventory
- [ ] getInventoryAlertsInternal(storeId, threshold)
- [ ] getLowStockProducts(storeId)

// Customer Analytics
- [ ] getCustomerInsightsInternal(storeId, daysAgo)
- [ ] getTopCustomers(storeId, limit)

// Financial
- [ ] getEarningsInternal(storeId, period)
- [ ] getRevenueBreakdown(storeId)
```

#### **Test Cases per Function:**

**Example: `getAggregateData()`**
```typescript
describe('getAggregateData', () => {
  test('should return complete dashboard data for retail store', async () => {
    const result = await dashboardService.getAggregateData(
      'store_123',
      'month'
    );
    
    expect(result).toHaveProperty('kpis');
    expect(result.kpis).toHaveProperty('revenue');
    expect(result.kpis.revenue).toHaveProperty('value');
    expect(result.kpis.revenue).toHaveProperty('change');
  });

  test('should handle store with bookings (beauty industry)', async () => {
    const result = await dashboardService.getAggregateData(
      'store_beauty_456',
      'week'
    );
    
    expect(result.kpis.bookingsCount).toBeDefined();
    expect(result.kpis.bookingConversionRate).toBeDefined();
  });

  test('should handle store with inventory (retail)', async () => {
    const result = await dashboardService.getAggregateData(
      'store_retail_789',
      'today'
    );
    
    expect(result.kpis.inventoryValue).toBeDefined();
    expect(result.kpis.lowStockCount).toBeDefined();
  });

  test('should use cache for repeated calls within TTL', async () => {
    const start = Date.now();
    await dashboardService.getAggregateData('store_123', 'month');
    const firstCallTime = Date.now() - start;
    
    const start2 = Date.now();
    await dashboardService.getAggregateData('store_123', 'month');
    const secondCallTime = Date.now() - start2;
    
    expect(secondCallTime).toBeLessThan(firstCallTime);
    expect(secondCallTime).toBeLessThan(100); // Cache hit should be <100ms
  });

  test('should invalidate cache when data changes', async () => {
    await dashboardService.getAggregateData('store_123', 'month');
    await dashboardService.invalidateCache('store_123');
    
    // Next call should bypass cache
    const start = Date.now();
    await dashboardService.getAggregateData('store_123', 'month');
    const duration = Date.now() - start;
    
    expect(duration).toBeGreaterThan(100); // Cache miss should be slower
  });
});
```

#### **KPI Calculation Tests:**

**Example: Revenue Tracking**
```typescript
describe('Revenue KPI Calculations', () => {
  test('should calculate current period revenue correctly', async () => {
    // Create test orders
    await createTestOrders({
      storeId: 'store_123',
      total: 1000,
      paymentStatus: 'SUCCESS',
      createdAt: new Date() // Current period
    });

    const kpis = await dashboardService.getKpis('store_123', 'month');
    
    expect(kpis.revenue.value).toBe(1000);
  });

  test('should calculate previous period revenue for comparison', async () => {
    // Create orders from 30-60 days ago
    await createTestOrders({
      storeId: 'store_123',
      total: 800,
      paymentStatus: 'SUCCESS',
      createdAt: subDays(new Date(), 45) // 45 days ago
    });

    const kpis = await dashboardService.getKpis('store_123', 'month');
    
    expect(kpis.revenue.previousValue).toBe(800);
  });

  test('should calculate revenue change percentage correctly', async () => {
    // Current: $1000, Previous: $800
    // Expected change: +25%
    const kpis = await dashboardService.getKpis('store_123', 'month');
    
    expect(kpis.revenue.change).toBeCloseTo(25, 1);
  });

  test('should handle edge case: no previous period data', async () => {
    const kpis = await dashboardService.getKpis('new_store', 'month');
    
    expect(kpis.revenue.change).toBe(0); // No change if no baseline
  });

  test('should exclude failed payments from revenue', async () => {
    await createTestOrders({
      storeId: 'store_123',
      total: 500,
      paymentStatus: 'FAILED'
    });

    const kpis = await dashboardService.getKpis('store_123', 'month');
    
    expect(kpis.revenue.value).not.toInclude(500);
  });
});
```

#### **Industry-Specific Tests:**

```typescript
describe('Industry-Specific Dashboard Logic', () => {
  test('beauty industry should include booking metrics', async () => {
    const beautyStore = await createBeautyStore();
    await createTestBookings({ storeId: beautyStore.id, count: 10 });

    const dashboard = await dashboardService.getAggregateData(beautyStore.id);
    
    expect(dashboard.kpis).toHaveProperty('bookingsCount');
    expect(dashboard.kpis.bookingsCount.value).toBe(10);
    expect(dashboard.kpis).toHaveProperty('bookingConversionRate');
  });

  test('restaurant industry should include reservation metrics', async () => {
    const restaurantStore = await createRestaurantStore();
    await createTestReservations({ storeId: restaurantStore.id, count: 5 });

    const dashboard = await dashboardService.getAggregateData(restaurantStore.id);
    
    expect(dashboard.kpis).toHaveProperty('reservationsCount');
    expect(dashboard.kpis.reservationsCount.value).toBe(5);
  });

  test('retail industry should include inventory metrics', async () => {
    const retailStore = await createRetailStore();
    await createTestProducts({ storeId: retailStore.id, count: 20, lowStock: 5 });

    const dashboard = await dashboardService.getAggregateData(retailStore.id);
    
    expect(dashboard.kpis).toHaveProperty('inventoryValue');
    expect(dashboard.kpis.lowStockCount.value).toBe(5);
  });
});
```

---

## 🧪 **Phase 2: Email Automation Testing**

### **Email Service (`email-automation.service.ts` - 412 lines)**

#### **Functions to Test:**
```typescript
- [ ] sendClientReport(clientEmail, reportData)
- [ ] sendMilestoneNotification(clientEmail, milestoneData)
- [ ] sendInvoiceReminder(clientEmail, invoiceData)
- [ ] generateReportHTML(reportData)
- [ ] generateReportText(reportData)
- [ ] sendWithRetry(type, sendFn, config)
- [ ] calculateExponentialDelay(attempt, config)
- [ ] logFailedEmail(type, error)
```

#### **Test Cases:**

```typescript
describe('Email Automation Service', () => {
  beforeEach(() => {
    // Mock Resend API
    vi.mock('resend');
  });

  test('should send client report successfully', async () => {
    const mockSend = vi.fn().mockResolvedValue({ id: 'email_123' });
    
    const result = await sendClientReport('client@example.com', {
      clientName: 'John Doe',
      projectName: 'Website Redesign',
      period: 'Week 12',
      metrics: {
        revenue: 5000,
        tasksCompleted: 12
      },
      highlights: ['Launched homepage'],
      upcomingMilestones: [{ name: 'About page', dueDate: '2026-04-01' }]
    });

    expect(result.success).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: 'client@example.com',
      subject: expect.stringContaining('Weekly Report')
    }));
  });

  test('should retry failed email with exponential backoff', async () => {
    let attempts = 0;
    const mockSend = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) throw new Error('Temporary failure');
      return { id: 'email_456' };
    });

    const result = await sendWithRetry('report', mockSend);

    expect(result.success).toBe(true);
    expect(attempts).toBe(3); // Should retry until success
  });

  test('should log failed email after max retries', async () => {
    const mockSend = vi.fn().mockRejectedValue(new Error('Permanent failure'));
    
    const result = await sendWithRetry('report', mockSend, {
      maxRetries: 3
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Permanent failure');
    // Verify logging occurred
  });

  test('should generate HTML report with all sections', () => {
    const html = generateReportHTML({
      clientName: 'Jane Smith',
      projectName: 'Mobile App',
      period: 'March 2026',
      metrics: { revenue: 10000, profitMargin: 25 },
      highlights: ['Feature complete'],
      upcomingMilestones: []
    });

    expect(html).toContain('Weekly Progress Report');
    expect(html).toContain('$10.0K'); // Revenue formatting
    expect(html).toContain('25%'); // Profit margin
    expect(html).toContain('Feature complete');
  });

  test('should generate plain text report', () => {
    const text = generateReportText({
      clientName: 'Bob Johnson',
      projectName: 'SEO Campaign',
      period: 'Q1 2026',
      metrics: { hoursWorked: 40, tasksCompleted: 8 },
      highlights: [],
      upcomingMilestones: []
    });

    expect(text).toContain('WEEKLY PROGRESS REPORT');
    expect(text).toContain('Hours Worked: 40h');
    expect(text).toContain('Tasks Completed: 8');
  });
});
```

---

## 🧪 **Phase 3: Integration Tests**

### **Critical User Journeys:**

#### **Journey 1: New Merchant Onboarding → First Sale**
```typescript
describe('Merchant Journey: Signup to First Sale', () => {
  test('complete onboarding flow and record first order', async () => {
    // 1. Create merchant account
    const merchant = await createMerchant({
      email: 'test@merchant.com',
      storeName: 'Test Store'
    });

    // 2. Complete onboarding steps
    await onboardingService.updateState(merchant.storeId, {
      step: 'business_info',
      data: { businessName: 'Test Store', industrySlug: 'retail' }
    });

    // 3. Add products
    await productService.create(merchant.storeId, {
      title: 'First Product',
      price: 99.99,
      inventory: 100
    });

    // 4. Create first order
    const order = await orderService.create(merchant.storeId, {
      customerId: 'customer_123',
      items: [{ productId: 'prod_1', quantity: 2 }],
      total: 199.98
    });

    // 5. Verify dashboard reflects new order
    const dashboard = await dashboardService.getAggregateData(merchant.storeId);
    
    expect(dashboard.kpis.orders.count).toBe(1);
    expect(dashboard.kpis.revenue.value).toBe(199.98);
  });
});
```

#### **Journey 2: Customer Places Order → Fulfillment**
```typescript
describe('Order Fulfillment Journey', () => {
  test('order creation through fulfillment completion', async () => {
    const order = await orderService.create(storeId, orderData);
    
    // Verify initial state
    expect(order.status).toBe('PENDING');
    
    // Process payment
    const payment = await paymentService.process(order.id, paymentDetails);
    expect(payment.status).toBe('SUCCESS');
    
    // Update order status
    await orderService.updateStatus(order.id, 'CONFIRMED');
    
    // Fulfill order
    await orderService.fulfill(order.id, { trackingNumber: 'TRACK123' });
    
    // Verify final state
    const updatedOrder = await orderService.getById(order.id);
    expect(updatedOrder.status).toBe('FULFILLED');
    expect(updatedOrder.fulfilledAt).toBeDefined();
  });
});
```

---

## 🧪 **Phase 4: API Endpoint Tests**

### **Dashboard Endpoints:**

```typescript
describe('GET /api/v1/platform/dashboard/aggregate', () => {
  test('should return 200 with complete dashboard data', async () => {
    const response = await request(fastifyServer)
      .get('/api/v1/platform/dashboard/aggregate')
      .query({ storeId: 'store_123', range: 'month' })
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('kpis');
    expect(response.body).toHaveProperty('metrics');
    expect(response.body).toHaveProperty('alerts');
    expect(response.body).toHaveProperty('suggestedActions');
  });

  test('should return 401 without authentication', async () => {
    const response = await request(fastifyServer)
      .get('/api/v1/platform/dashboard/aggregate')
      .query({ storeId: 'store_123' });

    expect(response.status).toBe(401);
  });

  test('should return 403 if user does not own store', async () => {
    const response = await request(fastifyServer)
      .get('/api/v1/platform/dashboard/aggregate')
      .query({ storeId: 'other_store_id' })
      .set('Authorization', 'Bearer user_token');

    expect(response.status).toBe(403);
  });
});

describe('GET /api/v1/platform/dashboard/kpis', () => {
  test('should return KPIs with correct structure', async () => {
    const response = await request(fastifyServer)
      .get('/api/v1/platform/dashboard/kpis')
      .query({ storeId: 'store_123', range: 'week' })
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(200);
    expect(response.body.kpis).toMatchObject({
      revenue: { value: expect.any(Number), change: expect.any(Number) },
      orders: { value: expect.any(Number), change: expect.any(Number) },
      customers: { value: expect.any(Number), change: expect.any(Number) }
    });
  });
});
```

---

## 🧪 **Phase 5: Performance Tests**

### **Load Testing Scenarios:**

```typescript
// Using k6 or artillery for load testing

// Scenario 1: Dashboard endpoint under load
export const dashboardLoadTest = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 req/s
    { duration: '1m', target: 50 },    // Ramp up to 50 req/s
    { duration: '2m', target: 50 },    // Stay at 50 req/s
    { duration: '30s', target: 100 },  // Spike to 100 req/s
    { duration: '1m', target: 0 }      // Ramp down
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests < 500ms
    http_req_failed: ['rate<0.01']     // Error rate < 1%
  }
};

// Scenario 2: Concurrent users accessing dashboards
export const concurrentUsersTest = {
  vus: 100,           // 100 concurrent users
  duration: '5m',
  exec: 'accessDashboard',
  
  thresholds: {
    http_req_duration: ['p(90)<300']
  }
};
```

### **Performance Benchmarks:**

| Endpoint | Baseline (core-api) | Target (fastify) | Actual | Status |
|----------|---------------------|------------------|--------|--------|
| `/dashboard/aggregate` | ~200ms | <100ms | TBD | ⏳ |
| `/dashboard/kpis` | ~150ms | <80ms | TBD | ⏳ |
| `/orders` | ~100ms | <50ms | TBD | ⏳ |
| `/customers` | ~120ms | <60ms | TBD | ⏳ |

---

## 📋 **Test Execution Checklist**

### **Pre-Test Setup:**
- [ ] Set up test database (separate from dev/prod)
- [ ] Seed test data (stores, products, customers, orders)
- [ ] Configure test environment variables
- [ ] Mock external services (Resend, Paystack)
- [ ] Install test dependencies (vitest, supertest, k6)

### **Unit Tests:**
- [ ] Dashboard service (all 14 functions)
- [ ] Email automation service (all 9 functions)
- [ ] Industry-specific logic (7 industries)
- [ ] Utility functions (caching, formatting)

### **Integration Tests:**
- [ ] Database operations
- [ ] Transaction handling
- [ ] Cache invalidation
- [ ] Cross-service communication

### **API Tests:**
- [ ] All dashboard endpoints
- [ ] Authentication/authorization
- [ ] Error handling
- [ ] Input validation

### **Performance Tests:**
- [ ] Load testing (50 req/s)
- [ ] Stress testing (100+ req/s)
- [ ] Endurance testing (1 hour sustained)
- [ ] Spike testing (sudden traffic increase)

### **Post-Test Activities:**
- [ ] Document any failures or regressions
- [ ] Compare performance metrics vs baseline
- [ ] Create bug reports for issues found
- [ ] Update documentation with known issues
- [ ] Prepare test summary report

---

## 🛠️ **Test Infrastructure Setup**

### **Required Dependencies:**
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "supertest": "^6.3.0",
    "k6": "^0.45.0",
    "@types/supertest": "^2.0.0"
  }
}
```

### **Test Database Configuration:**
```bash
# Use separate test database
TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/vayva_test"

# Run migrations on test DB
pnpm prisma migrate deploy --schema=prisma/schema.prisma
```

### **CI/CD Integration:**
```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: vayva_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm test:api
```

---

## 📊 **Success Criteria**

### **Coverage Targets:**
- **Unit Tests:** >80% code coverage
- **Integration Tests:** 100% of critical paths
- **API Tests:** 100% of public endpoints
- **Performance Tests:** All thresholds met

### **Quality Gates:**
- Zero critical bugs
- <5 minor issues
- All performance targets met
- No data loss detected
- 100% backward compatibility

---

## 🚀 **Next Steps After Testing**

1. **If All Tests Pass:**
   - Proceed to production deployment preparation
   - Update monitoring dashboards
   - Create deployment runbook

2. **If Issues Found:**
   - Prioritize by severity
   - Fix critical issues immediately
   - Re-test after fixes
   - Document lessons learned

---

**Ready to execute testing phase!** 🎯

Shall I:
1. Start writing unit tests for dashboard service?
2. Set up test infrastructure first?
3. Begin with API endpoint tests?
4. Or focus on a specific service area?
