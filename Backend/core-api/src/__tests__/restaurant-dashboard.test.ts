/**
 * Restaurant Dashboard API Tests
 * Comprehensive test suite for restaurant industry endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const BASE_URL = 'http://localhost:3000/api/restaurant';

describe('Restaurant Dashboard APIs', () => {
  describe('GET /api/restaurant/stats', () => {
    it('should return restaurant dashboard statistics', async () => {
      const response = await fetch(`${BASE_URL}/stats`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalRevenue');
      expect(data.data).toHaveProperty('todayOrders');
      expect(data.data).toHaveProperty('pendingReservations');
      expect(data.data).toHaveProperty('averageTicket');
      expect(data.data).toHaveProperty('foodCostPercentage');
      expect(data.data).toHaveProperty('laborCostPercentage');
    });
  });

  describe('GET /api/restaurant/menu-items', () => {
    it('should return menu items list', async () => {
      const response = await fetch(`${BASE_URL}/menu-items`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await fetch(`${BASE_URL}/menu-items?category=appetizers`);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        expect(data.data[0].category).toBe('appetizers');
      }
    });
  });

  describe('GET /api/restaurant/orders', () => {
    it('should return orders with type filtering', async () => {
      const response = await fetch(`${BASE_URL}/orders?type=dine-in`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      if (data.data.length > 0) {
        expect(data.data[0].type).toBe('dine-in');
      }
    });

    it('should filter by status', async () => {
      const response = await fetch(`${BASE_URL}/orders?status=pending`);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        expect(data.data[0].status).toBe('pending');
      }
    });
  });

  describe('GET /api/restaurant/reservations', () => {
    it('should return reservations list', async () => {
      const response = await fetch(`${BASE_URL}/reservations`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter by date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${BASE_URL}/reservations?date=${today}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should only return reservations for that date
    });
  });

  describe('GET /api/restaurant/inventory', () => {
    it('should return inventory with low stock alerts', async () => {
      const response = await fetch(`${BASE_URL}/inventory?low-stock=true`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // All items should be below minimum level
    });
  });

  describe('GET /api/restaurant/analytics', () => {
    it('should return business analytics', async () => {
      const response = await fetch(`${BASE_URL}/analytics`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('revenueGrowth');
      expect(data.data).toHaveProperty('popularItems');
      expect(data.data).toHaveProperty('tableTurnoverRate');
    });
  });
});
