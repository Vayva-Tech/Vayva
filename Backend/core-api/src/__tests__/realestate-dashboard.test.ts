/**
 * Real Estate Dashboard API Tests
 * Comprehensive test suite for real estate industry endpoints
 */

import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:3000/api/realestate';

describe('Real Estate Dashboard APIs', () => {
  describe('GET /api/realestate/stats', () => {
    it('should return real estate dashboard statistics', async () => {
      const response = await fetch(`${BASE_URL}/stats`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalRevenue');
      expect(data.data).toHaveProperty('activeListings');
      expect(data.data).toHaveProperty('pendingDeals');
      expect(data.data).toHaveProperty('closedThisMonth');
      expect(data.data).toHaveProperty('averageSalePrice');
      expect(data.data).toHaveProperty('totalProperties');
      expect(data.data).toHaveProperty('activeClients');
      expect(data.data).toHaveProperty('agentCount');
    });
  });

  describe('GET /api/realestate/properties', () => {
    it('should return properties list', async () => {
      const response = await fetch(`${BASE_URL}/properties`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter by property type', async () => {
      const response = await fetch(`${BASE_URL}/properties?type=residential`);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        expect(data.data[0].type).toBe('residential');
      }
    });
  });

  describe('GET /api/realestate/listings', () => {
    it('should return active listings', async () => {
      const response = await fetch(`${BASE_URL}/listings?status=active`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      if (data.data.length > 0) {
        expect(data.data[0].status).toBe('active');
      }
    });
  });

  describe('GET /api/realestate/showings', () => {
    it('should return upcoming showings', async () => {
      const response = await fetch(`${BASE_URL}/showings?upcoming=true`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should include property and client details', async () => {
      const response = await fetch(`${BASE_URL}/showings`);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        expect(data.data[0]).toHaveProperty('property');
        expect(data.data[0]).toHaveProperty('client');
        expect(data.data[0]).toHaveProperty('agent');
      }
    });
  });

  describe('GET /api/realestate/contracts', () => {
    it('should return contracts by status', async () => {
      const response = await fetch(`${BASE_URL}/contracts?status=accepted`);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        expect(data.data[0].status).toBe('accepted');
      }
    });
  });

  describe('GET /api/realestate/analytics', () => {
    it('should return market analytics', async () => {
      const response = await fetch(`${BASE_URL}/analytics`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('averageDaysOnMarket');
      expect(data.data).toHaveProperty('saleToListRatio');
      expect(data.data).toHaveProperty('inventoryLevel');
      expect(data.data).toHaveProperty('medianSalePrice');
      expect(data.data).toHaveProperty('marketTrends');
    });

    it('should provide area-specific trends', async () => {
      const response = await fetch(`${BASE_URL}/analytics`);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.data.marketTrends && data.data.marketTrends.length > 0) {
        expect(data.data.marketTrends[0]).toHaveProperty('area');
        expect(data.data.marketTrends[0]).toHaveProperty('trend');
        expect(data.data.marketTrends[0]).toHaveProperty('change');
      }
    });
  });
});
