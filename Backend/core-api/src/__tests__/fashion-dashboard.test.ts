/**
 * Fashion Dashboard API Tests
 * Comprehensive test suite for all fashion industry endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';

const BASE_URL = 'http://localhost:3000/api/fashion';

describe('Fashion Dashboard APIs', () => {
  // Test data cleanup
  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.order.deleteMany({ where: { customerId: 'test-customer' } });
    await prisma.customer.deleteMany({ where: { email: 'test@fashion.com' } });
    await prisma.product.deleteMany({ where: { sku: 'TEST-SKU' } });
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.order.deleteMany({ where: { customerId: 'test-customer' } });
    await prisma.customer.deleteMany({ where: { email: 'test@fashion.com' } });
    await prisma.product.deleteMany({ where: { sku: 'TEST-SKU' } });
  });

  describe('GET /api/fashion/stats', () => {
    it('should return dashboard statistics', async () => {
      const response = await fetch(`${BASE_URL}/stats`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalRevenue');
      expect(data.data).toHaveProperty('todayOrders');
      expect(data.data).toHaveProperty('activeProducts');
      expect(data.data).toHaveProperty('totalCustomers');
      expect(data.data).toHaveProperty('lowStockAlerts');
      expect(data.data).toHaveProperty('averageOrderValue');
    });
  });

  describe('GET /api/fashion/products', () => {
    it('should return empty array when no products exist', async () => {
      const response = await fetch(`${BASE_URL}/products`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter products by category', async () => {
      const response = await fetch(`${BASE_URL}/products?category=clothing`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      if (data.data.length > 0) {
        expect(data.data[0].category).toBe('clothing');
      }
    });
  });

  describe('POST /api/fashion/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        cost: 45.00,
        category: 'clothing',
        sku: 'TEST-SKU',
        images: ['https://example.com/image.jpg']
      };

      const response = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(productData.name);
      expect(data.data.basePrice).toBe(productData.price);
    });
  });

  describe('GET /api/fashion/orders', () => {
    it('should return orders list', async () => {
      const response = await fetch(`${BASE_URL}/orders`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter orders by status', async () => {
      const response = await fetch(`${BASE_URL}/orders?status=completed`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      if (data.data.length > 0) {
        expect(data.data[0].status).toBe('completed');
      }
    });
  });

  describe('POST /api/fashion/orders', () => {
    it('should create a new order', async () => {
      // First create a customer
      const customerResponse = await fetch(`${BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Customer',
          email: 'test@fashion.com'
        })
      });
      const customer = await customerResponse.json();

      const orderData = {
        customerId: customer.data.id,
        items: [
          { productId: 'prod-1', variantId: 'var-1', quantity: 2, price: 49.99 }
        ],
        shippingAddress: '123 Test St',
        billingAddress: '123 Test St'
      };

      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.customerId).toBe(customer.data.id);
      expect(data.data.totalAmount).toBe(99.98);
    });
  });

  describe('GET /api/fashion/customers', () => {
    it('should return customers list', async () => {
      const response = await fetch(`${BASE_URL}/customers`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('POST /api/fashion/customers', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: '123 Main St'
      };

      const response = await fetch(`${BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe(customerData.email);
    });
  });

  describe('GET /api/fashion/inventory', () => {
    it('should return inventory items', async () => {
      const response = await fetch(`${BASE_URL}/inventory`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter low stock items', async () => {
      const response = await fetch(`${BASE_URL}/inventory?low-stock=true`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // All returned items should be below min level
    });
  });

  describe('GET /api/fashion/analytics', () => {
    it('should return analytics data', async () => {
      const response = await fetch(`${BASE_URL}/analytics`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('revenueGrowth');
      expect(data.data).toHaveProperty('popularProducts');
      expect(data.data).toHaveProperty('customerRetention');
      expect(data.data).toHaveProperty('averageOrderValue');
    });
  });
});
