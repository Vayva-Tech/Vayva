import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DashboardService } from '../src/services/platform/dashboard.service';
import { prisma } from '@vayva/db';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let testStoreId: string;

  beforeEach(async () => {
    dashboardService = new DashboardService(prisma);
    
    // Create test store
    const user = await prisma.user.create({
      data: {
        email: `test_dashboard_${Date.now()}@example.com`,
        passwordHash: 'hashed_password',
      },
    });

    const store = await prisma.store.create({
      data: {
        name: `Test Dashboard Store ${Date.now()}`,
        ownerId: user.id,
        industrySlug: 'retail',
        onboardingCompleted: true,
        isLive: false,
        plan: 'standard',
      },
    });

    testStoreId = store.id;
  });

  afterEach(async () => {
    // Cleanup test data
    await prisma.order.deleteMany({ where: { storeId: testStoreId } });
    await prisma.customer.deleteMany({ where: { storeId: testStoreId } });
    await prisma.product.deleteMany({ where: { storeId: testStoreId } });
    await prisma.store.deleteMany({ id: testStoreId });
    await prisma.user.deleteMany({ 
      where: { email: { contains: 'test_dashboard_' } } 
    });
  });

  describe('getAggregateData', () => {
    it('should return complete dashboard data structure', async () => {
      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('kpis');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('alerts');
      expect(result).toHaveProperty('suggestedActions');
    });

    it('should calculate revenue KPI correctly', async () => {
      // Create test orders
      await prisma.order.createMany({
        data: [
          {
            storeId: testStoreId,
            customerId: (await prisma.customer.create({
              data: { storeId: testStoreId, name: 'Test Customer', email: 'test@example.com' }
            })).id,
            total: 1000,
            paymentStatus: 'SUCCESS',
            status: 'COMPLETED',
            createdAt: new Date(),
          },
          {
            storeId: testStoreId,
            customerId: (await prisma.customer.create({
              data: { storeId: testStoreId, name: 'Test Customer 2', email: 'test2@example.com' }
            })).id,
            total: 500,
            paymentStatus: 'SUCCESS',
            status: 'COMPLETED',
            createdAt: new Date(),
          },
        ],
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.kpis.revenue.value).toBe(1500);
      expect(result.kpis.orders.count).toBe(2);
    });

    it('should exclude failed payments from revenue', async () => {
      const customer = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'Test Customer', email: 'test@example.com' }
      });

      await prisma.order.create({
        data: {
          storeId: testStoreId,
          customerId: customer.id,
          total: 1000,
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
          createdAt: new Date(),
        },
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.kpis.revenue.value).toBe(0);
    });

    it('should handle stores with no data gracefully', async () => {
      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.kpis.revenue.value).toBe(0);
      expect(result.kpis.orders.count).toBe(0);
      expect(result.kpis.customers.count).toBe(0);
    });

    it('should use cache for repeated calls', async () => {
      // First call (cache miss)
      const start1 = Date.now();
      await dashboardService.getAggregateData(testStoreId, 'month');
      const duration1 = Date.now() - start1;

      // Second call (cache hit)
      const start2 = Date.now();
      await dashboardService.getAggregateData(testStoreId, 'month');
      const duration2 = Date.now() - start2;

      // Cache hit should be significantly faster
      expect(duration2).toBeLessThan(duration1);
    });
  });

  describe('Industry-Specific Logic', () => {
    it('should include booking metrics for beauty industry', async () => {
      // Update store to beauty industry
      await prisma.store.update({
        where: { id: testStoreId },
        data: { industrySlug: 'beauty' },
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      // Beauty industry should have booking-related KPIs
      expect(result.kpis).toHaveProperty('bookingsCount');
    });

    it('should include inventory metrics for retail industry', async () => {
      // Create test products
      await prisma.product.createMany({
        data: [
          {
            storeId: testStoreId,
            title: 'Product 1',
            price: 100,
            inventory: 5, // Low stock
          },
          {
            storeId: testStoreId,
            title: 'Product 2',
            price: 200,
            inventory: 50, // Normal stock
          },
        ],
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      // Retail should have inventory valuation
      expect(result.kpis.inventoryValue).toBeGreaterThan(0);
      expect(result.kpis.lowStockCount).toBe(1); // Only Product 1 is low stock
    });
  });

  describe('KPI Calculations - Advanced', () => {
    it('should calculate period-over-period revenue comparison', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const customer1 = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'Customer 1', email: 'c1@test.com' },
      });
      const customer2 = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'Customer 2', email: 'c2@test.com' },
      });

      // Current period orders (last 30 days)
      await prisma.order.create({
        data: {
          storeId: testStoreId,
          customerId: customer1.id,
          total: 2000,
          paymentStatus: 'SUCCESS',
          createdAt: now,
        },
      });

      // Previous period orders (30-60 days ago)
      await prisma.order.create({
        data: {
          storeId: testStoreId,
          customerId: customer2.id,
          total: 1500,
          paymentStatus: 'SUCCESS',
          createdAt: sixtyDaysAgo,
        },
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.kpis.revenue.value).toBe(2000);
      expect(result.kpis.revenue.previousValue).toBe(1500);
      expect(result.kpis.revenue.change).toBeGreaterThan(30); // ~33% increase
    });

    it('should calculate average order value correctly', async () => {
      const customer = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'Test Customer', email: 'test@example.com' },
      });

      await prisma.order.createMany({
        data: [
          { storeId: testStoreId, customerId: customer.id, total: 100, paymentStatus: 'SUCCESS', createdAt: new Date() },
          { storeId: testStoreId, customerId: customer.id, total: 200, paymentStatus: 'SUCCESS', createdAt: new Date() },
          { storeId: testStoreId, customerId: customer.id, total: 300, paymentStatus: 'SUCCESS', createdAt: new Date() },
        ],
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.kpis.averageOrderValue).toBeCloseTo(200, 0); // (100+200+300)/3 = 200
    });

    it('should track refund rate accurately', async () => {
      const customer = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'Test Customer', email: 'test@example.com' },
      });

      await prisma.order.createMany({
        data: [
          { storeId: testStoreId, customerId: customer.id, total: 100, paymentStatus: 'SUCCESS', status: 'COMPLETED', createdAt: new Date() },
          { storeId: testStoreId, customerId: customer.id, total: 100, paymentStatus: 'SUCCESS', status: 'REFUNDED', createdAt: new Date() },
          { storeId: testStoreId, customerId: customer.id, total: 100, paymentStatus: 'SUCCESS', status: 'COMPLETED', createdAt: new Date() },
        ],
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.kpis.refundRate).toBeCloseTo(33.33, 1); // 1 out of 3 orders refunded
    });
  });

  describe('Metrics Module', () => {
    it('should return today metrics only', async () => {
      const customer = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'Test Customer', email: 'test@example.com' },
      });

      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      // Order today
      await prisma.order.create({
        data: {
          storeId: testStoreId,
          customerId: customer.id,
          total: 500,
          paymentStatus: 'SUCCESS',
          createdAt: today,
        },
      });

      // Order yesterday (should not count in today's metrics)
      await prisma.order.create({
        data: {
          storeId: testStoreId,
          customerId: customer.id,
          total: 300,
          paymentStatus: 'SUCCESS',
          createdAt: yesterday,
        },
      });

      const metrics = await dashboardService.getMetrics(testStoreId);

      expect(metrics.metrics.revenue.value).toBe(500); // Only today's order
    });

    it('should count pending orders correctly', async () => {
      const customer = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'Test Customer', email: 'test@example.com' },
      });

      await prisma.order.createMany({
        data: [
          { storeId: testStoreId, customerId: customer.id, total: 100, paymentStatus: 'PENDING', status: 'PENDING', createdAt: new Date() },
          { storeId: testStoreId, customerId: customer.id, total: 200, paymentStatus: 'PENDING', status: 'PENDING', createdAt: new Date() },
          { storeId: testStoreId, customerId: customer.id, total: 300, paymentStatus: 'SUCCESS', status: 'COMPLETED', createdAt: new Date() },
        ],
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.metrics.orders.value).toBe(2); // Only pending orders
    });
  });

  describe('Alerts System', () => {
    it('should trigger low stock alert when inventory is below threshold', async () => {
      await prisma.product.createMany({
        data: [
          { storeId: testStoreId, title: 'Low Stock Item', price: 50, inventory: 3 },
          { storeId: testStoreId, title: 'Normal Stock Item', price: 100, inventory: 50 },
        ],
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.alerts).toBeDefined();
      expect(Array.isArray(result.alerts)).toBe(true);
      // Should have at least one alert for low stock
      const lowStockAlert = result.alerts.find((a: any) => 
        a.title?.toLowerCase().includes('stock') || a.message?.toLowerCase().includes('stock')
      );
      expect(lowStockAlert).toBeDefined();
    });

    it('should order alerts by severity (critical first)', async () => {
      // Create multiple low stock products to trigger critical alert
      await prisma.product.createMany({
        data: Array.from({ length: 10 }).map(() => ({
          storeId: testStoreId,
          title: `Product ${Date.now()}`,
          price: 50,
          inventory: 1, // Critical low stock
        })),
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      if (result.alerts && result.alerts.length > 1) {
        const severityOrder = ['critical', 'warning', 'info'];
        const firstAlertSeverity = result.alerts[0].severity;
        const lastAlertSeverity = result.alerts[result.alerts.length - 1].severity;
        
        expect(severityOrder.indexOf(firstAlertSeverity)).toBeLessThanOrEqual(
          severityOrder.indexOf(lastAlertSeverity)
        );
      }
    });
  });

  describe('Activity Feed', () => {
    it('should return recent orders in activity feed', async () => {
      const customer = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'Test Customer', email: 'test@example.com' },
      });

      await prisma.order.createMany({
        data: Array.from({ length: 5 }).map((_, i) => ({
          storeId: testStoreId,
          customerId: customer.id,
          total: 100 + i * 50,
          paymentStatus: 'SUCCESS',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        })),
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.recentActivity).toBeDefined();
      expect(Array.isArray(result.recentActivity)).toBe(true);
      expect(result.recentActivity.length).toBeGreaterThan(0);
    });

    it('should respect limit parameter for activity feed', async () => {
      const customer = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'Test Customer', email: 'test@example.com' },
      });

      await prisma.order.createMany({
        data: Array.from({ length: 20 }).map((_, i) => ({
          storeId: testStoreId,
          customerId: customer.id,
          total: 100,
          paymentStatus: 'SUCCESS',
          createdAt: new Date(),
        })),
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      // Should limit results (default limit is typically 10)
      expect(result.recentActivity.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Customer Insights', () => {
    it('should distinguish new vs returning customers', async () => {
      const customer1 = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'New Customer', email: 'new@test.com' },
      });
      const customer2 = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'Returning Customer', email: 'return@test.com' },
      });

      // New customer - 1 order
      await prisma.order.create({
        data: { storeId: testStoreId, customerId: customer1.id, total: 100, paymentStatus: 'SUCCESS', createdAt: new Date() },
      });

      // Returning customer - 3 orders
      await prisma.order.createMany({
        data: [
          { storeId: testStoreId, customerId: customer2.id, total: 100, paymentStatus: 'SUCCESS', createdAt: new Date() },
          { storeId: testStoreId, customerId: customer2.id, total: 150, paymentStatus: 'SUCCESS', createdAt: new Date() },
          { storeId: testStoreId, customerId: customer2.id, total: 200, paymentStatus: 'SUCCESS', createdAt: new Date() },
        ],
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.customerInsights).toBeDefined();
      expect(result.customerInsights.newCustomers).toBe(1);
      expect(result.customerInsights.returningCustomers).toBe(1);
    });

    it('should identify top customers by spend', async () => {
      const customers = await Promise.all([
        prisma.customer.create({ data: { storeId: testStoreId, name: 'Big Spender', email: 'big@test.com' } }),
        prisma.customer.create({ data: { storeId: testStoreId, name: 'Regular', email: 'reg@test.com' } }),
      ]);

      await prisma.order.create({
        data: { storeId: testStoreId, customerId: customers[0].id, total: 1000, paymentStatus: 'SUCCESS', createdAt: new Date() },
      });
      await prisma.order.create({
        data: { storeId: testStoreId, customerId: customers[1].id, total: 100, paymentStatus: 'SUCCESS', createdAt: new Date() },
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.customerInsights.topCustomers).toBeDefined();
      expect(Array.isArray(result.customerInsights.topCustomers)).toBe(true);
      if (result.customerInsights.topCustomers.length > 0) {
        expect(result.customerInsights.topCustomers[0].name).toBe('Big Spender');
      }
    });
  });

  describe('Earnings & Financials', () => {
    it('should calculate gross earnings', async () => {
      const customer = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'Test Customer', email: 'test@example.com' },
      });

      await prisma.order.createMany({
        data: [
          { storeId: testStoreId, customerId: customer.id, total: 500, paymentStatus: 'SUCCESS', createdAt: new Date() },
          { storeId: testStoreId, customerId: customer.id, total: 300, paymentStatus: 'SUCCESS', createdAt: new Date() },
        ],
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.earnings).toBeDefined();
      expect(result.earnings.gross).toBe(800);
    });

    it('should deduct refunds from net earnings', async () => {
      const customer = await prisma.customer.create({
        data: { storeId: testStoreId, name: 'Test Customer', email: 'test@example.com' },
      });

      await prisma.order.createMany({
        data: [
          { storeId: testStoreId, customerId: customer.id, total: 500, paymentStatus: 'SUCCESS', status: 'COMPLETED', createdAt: new Date() },
          { storeId: testStoreId, customerId: customer.id, total: 200, paymentStatus: 'SUCCESS', status: 'REFUNDED', createdAt: new Date() },
        ],
      });

      const result = await dashboardService.getAggregateData(testStoreId, 'month');

      expect(result.earnings.gross).toBe(700);
      expect(result.earnings.net).toBe(500); // 700 - 200 refund
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent store gracefully', async () => {
      await expect(dashboardService.getAggregateData('non-existent-store', 'month'))
        .rejects.toThrow();
    });

    it('should handle invalid date range', async () => {
      await expect(dashboardService.getAggregateData(testStoreId, 'invalid-range' as any))
        .rejects.toThrow();
    });

    it('should handle database connection errors', async () => {
      // Create service with invalid connection
      const badService = new DashboardService(null as any);
      
      await expect(badService.getAggregateData(testStoreId, 'month'))
        .rejects.toThrow();
    });
  });
});
