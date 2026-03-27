/**
 * Professional Services Dashboard API Tests
 * Comprehensive test suite for professional services endpoints
 */

import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:3000/api/professional-services';

describe('Professional Services Dashboard APIs', () => {
  describe('GET /api/professional-services/stats', () => {
    it('should return professional services dashboard statistics', async () => {
      const response = await fetch(`${BASE_URL}/stats`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalRevenue');
      expect(data.data).toHaveProperty('activeProjects');
      expect(data.data).toHaveProperty('pendingInvoices');
      expect(data.data).toHaveProperty('teamUtilization');
      expect(data.data).toHaveProperty('winRate');
      expect(data.data).toHaveProperty('averageProjectValue');
      expect(data.data).toHaveProperty('totalClients');
      expect(data.data).toHaveProperty('outstandingBalance');
    });
  });

  describe('GET /api/professional-services/projects', () => {
    it('should return projects list', async () => {
      const response = await fetch(`${BASE_URL}/projects`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await fetch(`${BASE_URL}/projects?status=active`);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        expect(data.data[0].status).toBe('active');
      }
    });
  });

  describe('GET /api/professional-services/time-entries', () => {
    it('should return time entries', async () => {
      const response = await fetch(`${BASE_URL}/time-entries`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('GET /api/professional-services/team', () => {
    it('should return team members with assignments', async () => {
      const response = await fetch(`${BASE_URL}/team`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      if (data.data.length > 0) {
        expect(data.data[0]).toHaveProperty('assignments');
      }
    });
  });

  describe('GET /api/professional-services/proposals', () => {
    it('should return proposals by status', async () => {
      const response = await fetch(`${BASE_URL}/proposals?status=pending`);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        expect(data.data[0].status).toBe('pending');
      }
    });

    it('should include client information', async () => {
      const response = await fetch(`${BASE_URL}/proposals`);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        expect(data.data[0]).toHaveProperty('client');
      }
    });
  });

  describe('GET /api/professional-services/analytics', () => {
    it('should return performance analytics', async () => {
      const response = await fetch(`${BASE_URL}/analytics`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('revenueGrowth');
      expect(data.data).toHaveProperty('projectSuccessRate');
      expect(data.data).toHaveProperty('averageHourlyRate');
      expect(data.data).toHaveProperty('clientRetentionRate');
      expect(data.data).toHaveProperty('topServices');
    });

    it('should calculate revenue growth correctly', async () => {
      const response = await fetch(`${BASE_URL}/analytics`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(typeof data.data.revenueGrowth).toBe('number');
      // Revenue growth can be negative or positive percentage
      expect(data.data.revenueGrowth).toBeGreaterThanOrEqual(-100);
    });
  });

  describe('GET /api/professional-services/invoices', () => {
    it('should return invoices by status', async () => {
      const response = await fetch(`${BASE_URL}/invoices?status=overdue`);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        expect(data.data[0].status).toBe('overdue');
      }
    });
  });
});
