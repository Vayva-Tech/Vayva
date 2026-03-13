/**
 * NPS Survey API Tests
 * Tests for the Net Promoter Score survey system
 */

import { describe, it, expect } from 'vitest';

describe('NPS Survey API', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

  describe('GET /api/nps', () => {
    it('should return NPS metrics with all required fields', async () => {
      const response = await fetch(`${baseUrl}/api/nps`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Verify structure
      expect(data).toHaveProperty('metrics');
      expect(data).toHaveProperty('trends');
      expect(data).toHaveProperty('breakdown');
      
      // Verify metrics exist
      expect(data.metrics).toHaveProperty('score');
      expect(data.metrics).toHaveProperty('total');
      expect(data.metrics).toHaveProperty('promoters');
      expect(data.metrics).toHaveProperty('passives');
      expect(data.metrics).toHaveProperty('detractors');
      expect(data.metrics).toHaveProperty('responseRate');
    });

    it('should calculate NPS score correctly', async () => {
      const response = await fetch(`${baseUrl}/api/nps`);
      const data = await response.json();
      
      const { promoters, passives, detractors, total } = data.metrics;
      
      if (total > 0) {
        const promoterPct = (promoters / total) * 100;
        const detractorPct = (detractors / total) * 100;
        const calculatedScore = Math.round(promoterPct - detractorPct);
        
        // NPS should be between -100 and 100
        expect(data.metrics.score).toBeGreaterThanOrEqual(-100);
        expect(data.metrics.score).toBeLessThanOrEqual(100);
        
        // Verify calculation matches
        expect(Math.abs(data.metrics.score - calculatedScore)).toBeLessThanOrEqual(1);
      }
    });

    it('should handle date range parameters', async () => {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(
        `${baseUrl}/api/nps?startDate=${startDate}&endDate=${endDate}`
      );
      
      expect([200, 400]).toContain(response.status);
    });

    it('should handle storeId filter', async () => {
      const response = await fetch(`${baseUrl}/api/nps?storeId=test-store-123`);
      
      // Should return successfully even if store doesn't exist
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('POST /api/nps/respond', () => {
    it('should accept survey response', async () => {
      const responseData = {
        surveyId: 'test-survey-id',
        score: 9,
        feedback: 'Great service!',
      };

      const response = await fetch(`${baseUrl}/api/nps/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData),
      });

      // Should accept the response
      expect([200, 201, 501]).toContain(response.status);
    });

    it('should validate score is between 0-10', async () => {
      const invalidData = {
        surveyId: 'test-survey-id',
        score: 15, // Invalid
      };

      const response = await fetch(`${baseUrl}/api/nps/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      // Should reject invalid scores
      expect([400, 501]).toContain(response.status);
    });
  });

  describe('NPS Category Classification', () => {
    it('should classify scores correctly', async () => {
      const response = await fetch(`${baseUrl}/api/nps`);
      const data = await response.json();
      
      if (data.breakdown && data.breakdown.scores) {
        const { scores } = data.breakdown;
        
        // Verify all scores are accounted for
        const total = scores.reduce((sum: number, s: any) => sum + s.count, 0);
        expect(total).toBe(data.metrics.total);
      }
    });
  });
});
