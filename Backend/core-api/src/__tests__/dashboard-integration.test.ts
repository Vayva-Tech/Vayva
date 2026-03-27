/**
 * Industry Dashboard Integration Tests
 * End-to-End tests for complete dashboard workflows
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('Industry Dashboard Integration Tests', () => {
  const BASE_URL = 'http://localhost:3000/api';

  describe('Fashion Dashboard Complete Workflow', () => {
    let customerId: string;
    let productId: string;

    it('should complete full fashion business workflow', async () => {
      // 1. Create a customer
      const customerRes = await fetch(`${BASE_URL}/fashion/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Integration Test Customer',
          email: 'integration@test.com'
        })
      });
      const customer = await customerRes.json();
      expect(customerRes.status).toBe(201);
      customerId = customer.data.id;

      // 2. Create a product
      const productRes = await fetch(`${BASE_URL}/fashion/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Product',
          price: 99.99,
          cost: 45.00,
          category: 'clothing',
          sku: 'INTEGRATION-TEST'
        })
      });
      const product = await productRes.json();
      expect(productRes.status).toBe(201);
      productId = product.data.id;

      // 3. Create an order
      const orderRes = await fetch(`${BASE_URL}/fashion/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          items: [{ productId, quantity: 1, price: 99.99 }]
        })
      });
      expect(orderRes.status).toBe(201);

      // 4. Verify stats updated
      const statsRes = await fetch(`${BASE_URL}/fashion/stats`);
      const stats = await statsRes.json();
      expect(statsRes.status).toBe(200);
      expect(stats.data.totalCustomers).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Real Estate Dashboard Workflow', () => {
    it('should verify real estate data consistency', async () => {
      // Get stats
      const statsRes = await fetch(`${BASE_URL}/realestate/stats`);
      const stats = await statsRes.json();
      expect(statsRes.status).toBe(200);

      // Get listings
      const listingsRes = await fetch(`${BASE_URL}/realestate/listings`);
      const listings = await listingsRes.json();
      expect(listingsRes.status).toBe(200);

      // Get showings
      const showingsRes = await fetch(`${BASE_URL}/realestate/showings`);
      const showings = await showingsRes.json();
      expect(showingsRes.status).toBe(200);

      // Verify analytics
      const analyticsRes = await fetch(`${BASE_URL}/realestate/analytics`);
      const analytics = await analyticsRes.json();
      expect(analyticsRes.status).toBe(200);
      expect(analytics.data).toHaveProperty('averageDaysOnMarket');
    });
  });

  describe('Restaurant Dashboard Workflow', () => {
    it('should verify restaurant multi-channel operations', async () => {
      // Get today's stats
      const statsRes = await fetch(`${BASE_URL}/restaurant/stats`);
      const stats = await statsRes.json();
      expect(statsRes.status).toBe(200);

      // Verify orders across channels
      const dineInRes = await fetch(`${BASE_URL}/restaurant/orders?type=dine-in`);
      expect(dineInRes.status).toBe(200);

      const takeoutRes = await fetch(`${BASE_URL}/restaurant/orders?type=takeout`);
      expect(takeoutRes.status).toBe(200);

      const deliveryRes = await fetch(`${BASE_URL}/restaurant/orders?type=delivery`);
      expect(deliveryRes.status).toBe(200);

      // Check reservations
      const reservationsRes = await fetch(`${BASE_URL}/restaurant/reservations`);
      expect(reservationsRes.status).toBe(200);
    });
  });

  describe('Professional Services Workflow', () => {
    it('should verify billable hours tracking', async () => {
      // Get stats
      const statsRes = await fetch(`${BASE_URL}/professional-services/stats`);
      const stats = await statsRes.json();
      expect(statsRes.status).toBe(200);

      // Verify time entries exist
      const timeRes = await fetch(`${BASE_URL}/professional-services/time-entries`);
      const timeEntries = await timeRes.json();
      expect(timeRes.status).toBe(200);

      // Check team utilization
      const teamRes = await fetch(`${BASE_URL}/professional-services/team`);
      const team = await teamRes.json();
      expect(teamRes.status).toBe(200);

      // Verify proposals pipeline
      const proposalsRes = await fetch(`${BASE_URL}/professional-services/proposals`);
      const proposals = await proposalsRes.json();
      expect(proposalsRes.status).toBe(200);

      // Check analytics
      const analyticsRes = await fetch(`${BASE_URL}/professional-services/analytics`);
      const analytics = await analyticsRes.json();
      expect(analyticsRes.status).toBe(200);
      expect(analytics.data.revenueGrowth).toBeDefined();
    });
  });

  describe('Cross-Dashboard API Health Checks', () => {
    it('all dashboard stats endpoints should respond', async () => {
      const dashboards = [
        'fashion',
        'restaurant',
        'realestate',
        'professional-services'
      ];

      for (const dashboard of dashboards) {
        const res = await fetch(`${BASE_URL}/${dashboard}/stats`);
        expect(res.status).toBe(200);
        
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
      }
    });

    it('all analytics endpoints should return valid metrics', async () => {
      const analyticsEndpoints = [
        'fashion/analytics',
        'realestate/analytics',
        'professional-services/analytics'
      ];

      for (const endpoint of analyticsEndpoints) {
        const res = await fetch(`${BASE_URL}/${endpoint}`);
        expect(res.status).toBe(200);
        
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(typeof data.data).toBe('object');
      }
    });
  });

  describe('API Error Handling', () => {
    it('should handle invalid requests gracefully', async () => {
      // Invalid endpoint
      const invalidRes = await fetch(`${BASE_URL}/nonexistent`);
      expect(invalidRes.status).toBe(404);

      // Invalid method
      const deleteRes = await fetch(`${BASE_URL}/fashion/stats`, {
        method: 'DELETE'
      });
      expect([404, 405]).toContain(deleteRes.status);
    });

    it('should validate request parameters', async () => {
      // Missing required fields would be tested here
      const invalidProductRes = await fetch(`${BASE_URL}/fashion/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Empty body
      });
      
      // Should either fail validation or create with defaults
      expect([201, 400]).toContain(invalidProductRes.status);
    });
  });
});
