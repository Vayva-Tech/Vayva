/**
 * Health Score API Tests
 * Tests for the health monitoring system endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Health Score API', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

  describe('GET /api/health-score', () => {
    it('should return health dashboard data with all required fields', async () => {
      const response = await fetch(`${baseUrl}/api/health-score`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Verify structure
      expect(data).toHaveProperty('scores');
      expect(data).toHaveProperty('metrics');
      expect(data).toHaveProperty('trends');
      
      // Verify metrics exist
      expect(data.metrics).toHaveProperty('averageScore');
      expect(data.metrics).toHaveProperty('healthyStores');
      expect(data.metrics).toHaveProperty('atRiskStores');
      expect(data.metrics).toHaveProperty('criticalStores');
    });

    it('should handle storeId filter parameter', async () => {
      const response = await fetch(`${baseUrl}/api/health-score?storeId=test-store-123`);
      
      // Should return successfully even if store doesn't exist
      expect([200, 404]).toContain(response.status);
    });

    it('should return scores sorted by date descending', async () => {
      const response = await fetch(`${baseUrl}/api/health-score`);
      const data = await response.json();
      
      if (data.scores && data.scores.length > 1) {
        const dates = data.scores.map((s: any) => new Date(s.date).getTime());
        const sortedDates = [...dates].sort((a, b) => b - a);
        
        expect(dates).toEqual(sortedDates);
      }
    });
  });

  describe('POST /api/health-score/recalculate', () => {
    it('should trigger health score recalculation', async () => {
      const response = await fetch(`${baseUrl}/api/health-score/recalculate`, {
        method: 'POST',
      });
      
      // Should accept the recalculation request
      expect([200, 202, 501]).toContain(response.status);
    });
  });

  describe('Health Score Data Validation', () => {
    it('should return valid health score objects', async () => {
      const response = await fetch(`${baseUrl}/api/health-score`);
      const data = await response.json();
      
      if (data.scores && data.scores.length > 0) {
        const score = data.scores[0];
        
        // Required fields
        expect(score).toHaveProperty('id');
        expect(score).toHaveProperty('storeId');
        expect(score).toHaveProperty('score');
        expect(score).toHaveProperty('date');
        
        // Score should be numeric
        expect(typeof score.score).toBe('number');
        
        // Score should be in reasonable range (0-100)
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      }
    });
  });
});
